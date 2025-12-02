import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'
import { emitToUser } from '@/lib/socket'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request)
        requireAuth(user)

        const { receiverId, content, sendAsSMS } = await request.json()

        if (!receiverId || !content) {
            return NextResponse.json(
                { error: 'Receiver ID and content are required' },
                { status: 400 }
            )
        }

        // Get receiver's details
        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                phoneVerified: true,
                smsEnabled: true,
                smsOptIn: true
            }
        })

        if (!receiver) {
            return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
        }

        // Find or create conversation between these two users
        let conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId: user.id } } },
                    { participants: { some: { userId: receiverId } } }
                ]
            },
            include: {
                participants: true
            }
        })

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participants: {
                        create: [
                            { userId: user.id },
                            { userId: receiverId }
                        ]
                    }
                },
                include: {
                    participants: true
                }
            })
        }

        // Determine delivery method
        let deliveryMethod: 'IN_APP' | 'SMS' | 'BOTH' = 'IN_APP'
        let smsSid = null
        let smsStatus = null
        let smsError = null

        // Send SMS if requested and receiver has SMS enabled
        if (
            sendAsSMS &&
            receiver.phone &&
            receiver.phoneVerified &&
            receiver.smsEnabled &&
            receiver.smsOptIn
        ) {
            try {
                if (
                    !process.env.TWILIO_ACCOUNT_SID ||
                    !process.env.TWILIO_AUTH_TOKEN ||
                    !process.env.TWILIO_PHONE_NUMBER
                ) {
                    throw new Error('Twilio credentials not configured')
                }

                const client = twilio(
                    process.env.TWILIO_ACCOUNT_SID,
                    process.env.TWILIO_AUTH_TOKEN
                )

                const smsMessage = await client.messages.create({
                    body: `${user.firstName}: ${content}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: receiver.phone,
                    statusCallback: `${process.env.NEXTAUTH_URL}/api/webhooks/twilio/sms-status`
                })

                smsSid = smsMessage.sid
                smsStatus = smsMessage.status
                deliveryMethod = 'BOTH'
            } catch (error: any) {
                console.error('SMS sending failed:', error)
                smsError = error.message
                // Still save message as in-app only
            }
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: user.id,
                receiverId,
                content,
                deliveryMethod,
                smsSid,
                smsStatus,
                smsError
            },
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, avatar: true }
                },
                receiver: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        })

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() }
        })

        // Emit via Socket.IO for real-time in-app notification
        try {
            emitToUser(receiverId, 'new_message', {
                ...message,
                conversationId: conversation.id
            })
        } catch (error) {
            console.error('Socket.IO emit error:', error)
            // Continue even if real-time fails
        }

        return NextResponse.json({
            ...message,
            conversationId: conversation.id
        })
    } catch (error: any) {
        console.error('Send message error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to send message' },
            { status: 500 }
        )
    }
}

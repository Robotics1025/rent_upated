import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'
import { emitToUser } from '@/lib/socket'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request)
        requireAuth(user)

        const { receiverId, callType, phoneNumber } = await request.json()

        if (!receiverId || !callType) {
            return NextResponse.json(
                { error: 'Receiver ID and call type are required' },
                { status: 400 }
            )
        }

        const call = await prisma.call.create({
            data: {
                callerId: user.id,
                receiverId,
                callType,
                phoneNumber,
                status: 'INITIATED'
            },
            include: {
                caller: {
                    select: { id: true, firstName: true, lastName: true, avatar: true }
                },
                receiver: {
                    select: { id: true, firstName: true, lastName: true, phone: true }
                }
            }
        })

        if (callType === 'PHONE' && phoneNumber) {
            // Twilio PSTN call
            if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
                const client = twilio(
                    process.env.TWILIO_ACCOUNT_SID,
                    process.env.TWILIO_AUTH_TOKEN
                )

                const twilioCall = await client.calls.create({
                    from: process.env.TWILIO_PHONE_NUMBER!,
                    to: phoneNumber,
                    url: `${process.env.NEXTAUTH_URL}/api/calls/twiml/${call.id}`
                })

                await prisma.call.update({
                    where: { id: call.id },
                    data: { twilioSid: twilioCall.sid, status: 'RINGING' }
                })
            }
        } else {
            // WebRTC call via Twilio Video (Voice or Video)
            if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
                const client = twilio(
                    process.env.TWILIO_ACCOUNT_SID,
                    process.env.TWILIO_AUTH_TOKEN
                )

                const room = await client.video.v1.rooms.create({
                    uniqueName: `call-${call.id}`,
                    type: 'peer-to-peer',
                    maxParticipants: 2
                })

                await prisma.call.update({
                    where: { id: call.id },
                    data: {
                        twilioRoomName: room.uniqueName,
                        status: 'RINGING',
                        startedAt: new Date()
                    }
                })
            }

            // Notify receiver via Socket.IO
            try {
                emitToUser(receiverId, 'incoming_call', call)
            } catch (error) {
                console.error('Socket.IO emit error:', error)
            }
        }

        return NextResponse.json(call)
    } catch (error: any) {
        console.error('Initiate call error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to initiate call' },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const user = await getAuthUser(request)
        requireAuth(user)

        const { conversationId } = await params

        // Verify user is participant
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                conversationId,
                userId: user.id
            }
        })

        if (!participant) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                receiverId: user.id,
                isRead: false
            },
            data: { isRead: true }
        })

        // Update last read timestamp
        await prisma.conversationParticipant.updateMany({
            where: {
                conversationId,
                userId: user.id
            },
            data: { lastReadAt: new Date() }
        })

        return NextResponse.json(messages)
    } catch (error: any) {
        console.error('Get messages error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch messages' },
            { status: 500 }
        )
    }
}

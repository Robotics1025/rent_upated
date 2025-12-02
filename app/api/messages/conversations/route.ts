import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request)
        requireAuth(user)

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId: user.id }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                                role: true,
                                phone: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        })

        // Add unread count and format response
        const formattedConversations = conversations.map(conv => {
            // Get the other participant
            const otherParticipant = conv.participants.find(p => p.userId !== user.id)

            return {
                id: conv.id,
                otherUser: otherParticipant?.user,
                lastMessage: conv.messages[0] || null,
                updatedAt: conv.updatedAt,
                createdAt: conv.createdAt
            }
        })

        return NextResponse.json(formattedConversations)
    } catch (error: any) {
        console.error('Get conversations error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch conversations' },
            { status: 500 }
        )
    }
}

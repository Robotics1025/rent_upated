import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request)
        requireAuth(user)

        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q') || ''

        if (!query || query.length < 2) {
            return NextResponse.json([])
        }

        // Search users by name, email, or phone
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        id: { not: user.id } // Exclude current user
                    },
                    {
                        status: 'ACTIVE' // Only active users
                    },
                    {
                        OR: [
                            { firstName: { contains: query, mode: 'insensitive' } },
                            { lastName: { contains: query, mode: 'insensitive' } },
                            { email: { contains: query, mode: 'insensitive' } },
                            { phone: { contains: query } }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                phoneVerified: true,
                avatar: true,
                role: true
            },
            take: 10
        })

        return NextResponse.json(users)
    } catch (error: any) {
        console.error('User search error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to search users' },
            { status: 500 }
        )
    }
}

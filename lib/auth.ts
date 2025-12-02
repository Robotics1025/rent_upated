import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface AuthUser {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'MEMBER'
    status: string
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null
        }

        const token = authHeader.substring(7)

        // Find session and user
        const session = await prisma.session.findUnique({
            where: { token },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        status: true,
                    }
                }
            }
        })

        if (!session) {
            return null
        }

        // Check if session is expired
        if (session.expiresAt < new Date()) {
            // Delete expired session
            await prisma.session.delete({ where: { id: session.id } })
            return null
        }

        // Check if user is active
        if (session.user.status !== 'ACTIVE') {
            return null
        }

        // Update last active timestamp
        await prisma.session.update({
            where: { id: session.id },
            data: { lastActiveAt: new Date() }
        })

        return session.user as AuthUser
    } catch (error) {
        console.error('Auth error:', error)
        return null
    }
}

export function requireAuth(user: AuthUser | null): AuthUser {
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user
}

export function requireRole(user: AuthUser | null, roles: string[]): AuthUser {
    const authedUser = requireAuth(user)
    if (!roles.includes(authedUser.role)) {
        throw new Error('Forbidden')
    }
    return authedUser
}

export async function canAccessProperty(userId: string, propertyId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    })

    if (!user) return false

    // Admins can access all properties
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        return true
    }

    // Managers can only access assigned properties
    if (user.role === 'MANAGER') {
        const assignment = await prisma.adminAssignment.findFirst({
            where: {
                adminId: userId,
                propertyId: propertyId
            }
        })
        return !!assignment
    }

    return false
}

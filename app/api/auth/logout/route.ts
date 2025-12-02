import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Missing or invalid authorization token' },
                { status: 401 }
            )
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        // Find and invalidate session
        const session = await prisma.session.findUnique({
            where: { token },
            include: { user: true }
        })

        if (!session) {
            return NextResponse.json(
                { error: 'Invalid session' },
                { status: 401 }
            )
        }

        // Delete the session
        await prisma.session.delete({
            where: { id: session.id }
        })

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                action: 'LOGOUT',
                entityType: 'User',
                entityId: session.userId,
                metadata: {
                    sessionId: session.id,
                },
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        })

    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { error: 'Failed to logout' },
            { status: 500 }
        )
    }
}

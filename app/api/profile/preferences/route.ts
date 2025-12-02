import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// For storing user preferences, we'll add a JSON field to the User model
// or create a separate UserPreferences table. For now, we'll use a simple approach

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Return default preferences (in production, fetch from database)
        const preferences = {
            notifications: {
                email: true,
                sms: false,
                push: true,
                bookingAlerts: true,
                paymentAlerts: true,
                systemUpdates: false,
            },
            system: {
                language: 'en',
                timezone: 'Africa/Kampala',
                currency: 'UGX',
            }
        }

        return NextResponse.json(preferences)
    } catch (error) {
        console.error('Error fetching preferences:', error)
        return NextResponse.json(
            { error: 'Failed to fetch preferences' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // In production, save to UserPreferences table or User JSON field
        // For now, just acknowledge the update

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'UPDATE',
                entityType: 'UserPreferences',
                entityId: session.user.id,
                metadata: {
                    preferences: body,
                    updatedAt: new Date(),
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Preferences updated successfully'
        })
    } catch (error) {
        console.error('Error updating preferences:', error)
        return NextResponse.json(
            { error: 'Failed to update preferences' },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// Test endpoint to create a notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create a test notification
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SYSTEM_ALERT',
        channel: 'IN_APP',
        status: 'UNREAD',
        title: 'Test Notification 🔔',
        message: 'This is a test notification to verify the system is working correctly.',
        data: { test: true, timestamp: new Date().toISOString() },
      },
    })

    return NextResponse.json({ 
      success: true, 
      notification,
      message: 'Test notification created successfully'
    })
  } catch (error) {
    console.error('Error creating test notification:', error)
    return NextResponse.json(
      { error: 'Failed to create test notification', details: error },
      { status: 500 }
    )
  }
}

// Get all notifications for current user (debug)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        session: session,
        hasUser: !!session?.user,
        hasUserId: !!session?.user?.id
      }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      count: notifications.length,
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role,
      notifications
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: String(error) },
      { status: 500 }
    )
  }
}

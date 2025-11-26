import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Create a test notification for the manager
    const notification = await prisma.notification.create({
      data: {
        userId: 'cmig91q020001zwpnq3i81gt6', // Your user ID
        type: 'SYSTEM_ALERT',
        channel: 'IN_APP',
        status: 'UNREAD',
        title: 'Welcome! Notifications Working! 🎉',
        message: 'This is a test notification to confirm your notification system is working perfectly. You should see this in your notification bell.',
        data: { 
          test: true, 
          timestamp: new Date().toISOString(),
          message: 'Notifications are now connected to the database and working!'
        },
      },
    })

    return NextResponse.json({ 
      success: true, 
      notification,
      message: 'Test notification created! Check your notification bell.'
    })
  } catch (error) {
    console.error('Error creating test notification:', error)
    return NextResponse.json(
      { error: 'Failed to create test notification', details: String(error) },
      { status: 500 }
    )
  }
}

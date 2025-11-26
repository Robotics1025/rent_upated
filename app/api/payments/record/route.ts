import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { notifyPaymentReceived } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        transactionId,
        tenantId: body.tenantId,
        bookingId: body.bookingId || null,
        amount: body.amount,
        currency: 'UGX',
        purpose: body.purpose,
        method: body.method,
        status: 'SUCCESS',
        description: body.description,
        paidAt: new Date(),
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        booking: {
          select: {
            bookingNumber: true,
            unit: {
              select: {
                unitCode: true,
              },
            },
          },
        },
      },
    })

    // Create payment history
    await prisma.paymentHistory.create({
      data: {
        paymentId: payment.id,
        eventType: 'SUCCESS',
        status: 'SUCCESS',
        metadata: {
          recordedBy: session.user.id,
          recordedAt: new Date(),
        },
      },
    })

    // Send notification to tenant
    await notifyPaymentReceived(body.tenantId, body.amount, transactionId)

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    )
  }
}

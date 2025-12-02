import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { notifyPaymentReceived, notifyPaymentRecordedForManager } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.tenantId || !body.amount || !body.purpose || !body.method) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, amount, purpose, method' },
        { status: 400 }
      )
    }

    // Validate payment purpose (use correct enum values)
    const validPurposes = ['BOOKING_DEPOSIT', 'MONTHLY_RENT', 'SECURITY_DEPOSIT', 'UTILITIES', 'MAINTENANCE_FEE', 'LATE_FEE', 'REFUND', 'OTHER']
    const purpose = body.purpose || body.paymentPurpose

    if (!validPurposes.includes(purpose)) {
      return NextResponse.json(
        { error: `Invalid purpose. Must be one of: ${validPurposes.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        transactionId,
        tenantId: body.tenantId,
        bookingId: body.bookingId || null,
        amount: body.amount,
        currency: body.currency || 'UGX',
        purpose,
        method: body.method || body.paymentMethod,
        status: 'SUCCESS',
        description: body.description,
        paymentMonth: body.paymentMonth || null,
        paidAt: body.paymentDate ? new Date(body.paymentDate) : new Date(),
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

    // Send notification to manager (if recorded by a user)
    if (session.user.id) {
      const tenantName = `${payment.tenant.firstName} ${payment.tenant.lastName}`
      // We need to import this function first, I'll add the import in a separate block if needed or assume it's available if I update imports.
      // Actually, I need to update imports first.
      // Wait, I can do it in one go if I'm careful, but replace_file_content is for contiguous blocks.
      // I'll just add the call here and update imports in another step or use multi_replace if I was smart, but I'll do it sequentially.
      // actually, I can just use the imported function if I add the import.
      // Let's just add the call here.
      await notifyPaymentRecordedForManager(session.user.id, body.amount, tenantName, transactionId)
    }

    // Auto-update unit status and create tenancy if needed
    if (body.bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: body.bookingId },
        include: {
          unit: true,
          tenancy: true,
        },
      })

      if (booking && booking.unit) {
        // Only create tenancy if booking is CONFIRMED
        if (booking.status !== 'CONFIRMED') {
          return NextResponse.json(
            { error: 'Cannot process payment for unconfirmed booking' },
            { status: 400 }
          )
        }

        // Check if this is the first payment
        const paymentCount = await prisma.payment.count({
          where: { bookingId: body.bookingId },
        })

        // If first payment and no tenancy exists, create one
        if (paymentCount === 1 && !booking.tenancy) {
          const isDeposit = purpose === 'BOOKING_DEPOSIT' || purpose === 'SECURITY_DEPOSIT'
          // Generate a unique tenancy number
          const tenancyNumber = `TNY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          await prisma.tenancy.create({
            data: {
              tenantId: body.tenantId,
              unitId: booking.unitId,
              bookingId: booking.id,
              startDate: booking.checkInDate || new Date(),
              status: 'ACTIVE',
              monthlyRent: booking.unit.price,
              depositPaid: isDeposit ? body.amount : 0,
              tenancyNumber,
            },
          })

          // Update unit to occupied
          await prisma.unit.update({
            where: { id: booking.unitId },
            data: { status: 'OCCUPIED' },
          })

          // Notify tenant
          await prisma.notification.create({
            data: {
              userId: body.tenantId,
              type: 'SYSTEM_ALERT',
              title: 'Unit Occupied',
              message: `Your unit ${booking.unit.unitCode} is now marked as occupied. Welcome!`,
              relatedType: 'UNIT',
              status: 'UNREAD',
            },
          })
        } else if (paymentCount >= 1 && booking.unit.status !== 'OCCUPIED') {
          // Ensure unit is marked as occupied if payments are being made
          await prisma.unit.update({
            where: { id: booking.unitId },
            data: { status: 'OCCUPIED' },
          })
        }
      }
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'
import { notifyBookingConfirmed } from '@/lib/notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    requireAuth(user)

    const { id } = await params
    const body = await request.json()

    // Find booking to check authorization
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        unit: {
          include: { property: true }
        }
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check authorization
    const isAdmin = user!.role === 'ADMIN' || user!.role === 'SUPER_ADMIN'
    const isManager = user!.role === 'MANAGER' && await prisma.adminAssignment.findFirst({
      where: {
        adminId: user!.id,
        propertyId: existingBooking.unit.propertyId
      }
    })
    const isOwner = existingBooking.tenantId === user!.id

    if (!isAdmin && !isManager && !isOwner) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update this booking' },
        { status: 403 }
      )
    }

    // Validate status change
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updateData: any = {}

    if (body.status) {
      updateData.status = body.status

      if (body.status === 'CONFIRMED') {
        updateData.confirmedAt = new Date()
        // Update unit status to BOOKED when confirmed
        await prisma.unit.update({
          where: { id: existingBooking.unitId },
          data: { status: 'BOOKED' }
        })
      } else if (body.status === 'CANCELLED') {
        updateData.cancelledAt = new Date()
        updateData.cancellationReason = body.cancellationReason

        // Return unit to AVAILABLE if cancelled
        await prisma.unit.update({
          where: { id: existingBooking.unitId },
          data: { status: 'AVAILABLE' }
        })
      }
    }

    if (body.adminNotes !== undefined) {
      updateData.adminNotes = body.adminNotes
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        unit: {
          select: {
            unitCode: true,
            property: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'UPDATE',
        entityType: 'Booking',
        entityId: id,
        oldValue: { status: existingBooking.status },
        newValue: { status: booking.status },
        metadata: {
          changes: updateData,
          updatedBy: `${user!.firstName} ${user!.lastName}`,
        }
      }
    })

    // Send notification if status changed to CONFIRMED
    if (body.status === 'CONFIRMED') {
      await notifyBookingConfirmed(
        booking.tenantId,
        booking.bookingNumber,
        booking.unit.unitCode
      )
    }

    return NextResponse.json(booking)
  } catch (error: any) {
    console.error('Error updating booking:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: body.status,
        confirmedAt: body.status === 'CONFIRMED' ? new Date() : undefined,
        cancelledAt: body.status === 'CANCELLED' ? new Date() : undefined,
        cancellationReason: body.cancellationReason,
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

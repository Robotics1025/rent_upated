import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user

    // Build where clause based on user role
    const where: any = {}

    if (user.role === 'MANAGER') {
      // Managers can see payments for their assigned properties
      const assignments = await prisma.adminAssignment.findMany({
        where: { adminId: user.id },
        select: { propertyId: true }
      })
      const propertyIds = assignments.map(a => a.propertyId)

      where.OR = [
        // Payments explicitly linked to a booking in managed properties
        {
          booking: {
            unit: {
              propertyId: { in: propertyIds }
            }
          }
        },
        // General payments (no booking) from tenants who have bookings in managed properties
        {
          bookingId: null,
          tenant: {
            bookings: {
              some: {
                unit: {
                  propertyId: { in: propertyIds }
                }
              }
            }
          }
        },
        // Payments recorded by the current manager
        {
          history: {
            some: {
              metadata: {
                path: ['recordedBy'],
                equals: user.id
              }
            }
          }
        }
      ]
    }
    // ADMIN and SUPER_ADMIN see all payments (no filter)

    const payments = await prisma.payment.findMany({
      where,
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error: any) {
    console.error('Error fetching payments:', error)

    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

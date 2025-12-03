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
      // Managers can see bookings for their assigned properties
      const assignments = await prisma.adminAssignment.findMany({
        where: { adminId: user.id },
        select: { propertyId: true }
      })
      const propertyIds = assignments.map(a => a.propertyId)

      where.unit = {
        propertyId: { in: propertyIds }
      }
    }
    // ADMIN and SUPER_ADMIN see all bookings (no filter)

    // Add query param filters
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const status = searchParams.get('status')

    if (tenantId) {
      where.tenantId = tenantId
    }

    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        unit: {
          select: {
            unitCode: true,
            property: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bookings)
  } catch (error: any) {
    console.error('Error fetching bookings:', error)

    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

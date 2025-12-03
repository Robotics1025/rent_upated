import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const userRole = session.user.role

    let properties, totalUnits, tenants, revenue, occupancyRate, recentBookings, recentPayments

    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      // --- ADMIN VIEW: FETCH ALL DATA ---

      // Properties count
      properties = await prisma.property.count()

      // Units count and occupancy
      const allUnits = await prisma.unit.findMany({
        select: { status: true },
      })
      totalUnits = allUnits.length
      const occupiedUnits = allUnits.filter(u => u.status === 'OCCUPIED').length
      occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

      // Active tenants count
      tenants = await prisma.tenancy.count({
        where: { status: 'ACTIVE' },
      })

      // Monthly revenue (ALL successful payments this month)
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)

      const payments = await prisma.payment.findMany({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: currentMonth },
        },
        select: { amount: true },
      })
      revenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)

      // Recent Bookings (ALL)
      recentBookings = await prisma.booking.findMany({
        include: {
          tenant: { select: { firstName: true, lastName: true } },
          unit: { select: { unitCode: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })

      // Recent Payments (ALL)
      recentPayments = await prisma.payment.findMany({
        include: {
          tenant: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })

    } else {
      // --- MANAGER VIEW: FETCH SCOPED DATA ---

      // Get manager's assigned properties
      const assignments = await prisma.adminAssignment.findMany({
        where: { adminId: userId },
        select: { propertyId: true },
      })
      const propertyIds = assignments.map(a => a.propertyId)

      // Properties count
      properties = await prisma.property.count({
        where: { id: { in: propertyIds } },
      })

      // Units count and occupancy
      const units = await prisma.unit.findMany({
        where: { propertyId: { in: propertyIds } },
        select: { status: true },
      })
      totalUnits = units.length
      const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length
      occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

      // Active tenants count
      tenants = await prisma.tenancy.count({
        where: {
          unit: { propertyId: { in: propertyIds } },
          status: 'ACTIVE',
        },
      })

      // Calculate monthly revenue
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)

      // Get all tenant IDs from tenancies AND bookings in managed properties
      const [tenancyList, bookingList] = await Promise.all([
        prisma.tenancy.findMany({
          where: { unit: { propertyId: { in: propertyIds } } },
          select: { tenantId: true },
        }),
        prisma.booking.findMany({
          where: { unit: { propertyId: { in: propertyIds } } },
          select: { tenantId: true },
        }),
      ])

      const tenantIds = [...new Set([
        ...tenancyList.map(t => t.tenantId),
        ...bookingList.map(b => b.tenantId)
      ])]

      // Get payments from those tenants for current month OR orphan payments (bookingId: null)
      // Note: Including orphan payments allows managers to see payments they recorded that aren't linked to a booking yet.
      const scopedPayments = await prisma.payment.findMany({
        where: {
          OR: [
            { tenantId: { in: tenantIds } },
            { bookingId: null } // Include orphan payments for managers too
          ],
          status: 'SUCCESS',
          createdAt: { gte: currentMonth },
        },
        select: { amount: true },
      })
      revenue = scopedPayments.reduce((sum, p) => sum + Number(p.amount), 0)

      // Recent Bookings
      recentBookings = await prisma.booking.findMany({
        where: {
          unit: { propertyId: { in: propertyIds } },
        },
        include: {
          tenant: { select: { firstName: true, lastName: true } },
          unit: { select: { unitCode: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })

      // Recent Payments
      recentPayments = await prisma.payment.findMany({
        where: {
          OR: [
            { tenantId: { in: tenantIds } },
            { bookingId: null } // Include orphan payments
          ],
        },
        include: {
          tenant: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })
    }

    return NextResponse.json({
      properties,
      units: totalUnits,
      tenants,
      revenue,
      occupancyRate,
      recentBookings,
      recentPayments,
    })
  } catch (error) {
    console.error('Error fetching manager stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manager stats' },
      { status: 500 }
    )
  }
}

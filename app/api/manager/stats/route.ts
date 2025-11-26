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

    // Get manager's assigned properties
    const assignments = await prisma.adminAssignment.findMany({
      where: { adminId: userId },
      select: { propertyId: true },
    })

    const propertyIds = assignments.map(a => a.propertyId)

    // Get properties count
    const properties = await prisma.property.count({
      where: { id: { in: propertyIds } },
    })

    // Get units count and occupancy
    const units = await prisma.unit.findMany({
      where: { propertyId: { in: propertyIds } },
      select: { status: true },
    })

    const totalUnits = units.length
    const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

    // Get active tenants count
    const tenants = await prisma.tenancy.count({
      where: {
        unit: { propertyId: { in: propertyIds } },
        status: 'ACTIVE',
      },
    })

    // Calculate monthly revenue
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const payments = await prisma.payment.findMany({
      where: {
        booking: {
          unit: { propertyId: { in: propertyIds } },
        },
        status: 'SUCCESS',
        createdAt: { gte: currentMonth },
      },
      select: { amount: true },
    })

    const revenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: {
        unit: { propertyId: { in: propertyIds } },
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        unit: {
          select: {
            unitCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      where: {
        booking: {
          unit: { propertyId: { in: propertyIds } },
        },
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

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

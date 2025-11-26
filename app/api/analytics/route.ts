import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get assigned properties
    const adminAssignments = await prisma.adminAssignment.findMany({
      where: { adminId: userId },
      select: { propertyId: true },
    })

    const propertyIds = adminAssignments.map(a => a.propertyId)

    // Get payments for last 6 months with property filter
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const payments = await prisma.payment.findMany({
      where: {
        paidAt: {
          gte: sixMonthsAgo,
        },
        booking: {
          unit: {
            propertyId: {
              in: propertyIds,
            },
          },
        },
      },
      include: {
        booking: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
        tenant: true,
      },
      orderBy: {
        paidAt: 'asc',
      },
    })

    // Group payments by month for revenue trend
    const monthlyRevenue: { [key: string]: number } = {}
    payments.forEach(payment => {
      if (payment.paidAt) {
        const monthKey = payment.paidAt.toISOString().substring(0, 7) // YYYY-MM
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + payment.amount
      }
    })

    // Group payments by property
    const revenueByProperty: { [key: string]: { name: string; amount: number } } = {}
    payments.forEach(payment => {
      if (payment.booking?.unit?.property) {
        const propertyId = payment.booking.unit.property.id
        const propertyName = payment.booking.unit.property.name
        
        if (!revenueByProperty[propertyId]) {
          revenueByProperty[propertyId] = { name: propertyName, amount: 0 }
        }
        revenueByProperty[propertyId].amount += payment.amount
      }
    })

    // Group payments by method
    const paymentMethods: { [key: string]: number } = {}
    payments.forEach(payment => {
      paymentMethods[payment.method] = (paymentMethods[payment.method] || 0) + payment.amount
    })

    // Get occupancy statistics
    const units = await prisma.unit.findMany({
      where: {
        propertyId: {
          in: propertyIds,
        },
      },
      select: {
        id: true,
        status: true,
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const occupancyByProperty: { [key: string]: { name: string; occupied: number; total: number } } = {}
    units.forEach(unit => {
      const propertyId = unit.property.id
      const propertyName = unit.property.name

      if (!occupancyByProperty[propertyId]) {
        occupancyByProperty[propertyId] = { name: propertyName, occupied: 0, total: 0 }
      }
      occupancyByProperty[propertyId].total += 1
      if (unit.status === 'OCCUPIED') {
        occupancyByProperty[propertyId].occupied += 1
      }
    })

    // Get top tenants by payment amount
    const tenantPayments: { [key: string]: { name: string; email: string; amount: number } } = {}
    payments.forEach(payment => {
      if (payment.tenant) {
        const tenantId = payment.tenant.id
        const tenantName = `${payment.tenant.firstName} ${payment.tenant.lastName}`
        const tenantEmail = payment.tenant.email

        if (!tenantPayments[tenantId]) {
          tenantPayments[tenantId] = { name: tenantName, email: tenantEmail, amount: 0 }
        }
        tenantPayments[tenantId].amount += payment.amount
      }
    })

    const topTenants = Object.values(tenantPayments)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)

    return NextResponse.json({
      monthlyRevenue,
      revenueByProperty: Object.values(revenueByProperty),
      paymentMethods,
      occupancyByProperty: Object.values(occupancyByProperty),
      topTenants,
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      totalTransactions: payments.length,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

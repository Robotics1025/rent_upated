import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// Create manual occupancy (tenancy)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: unitId } = await params
    const body = await request.json()

    const { tenantId, startDate, endDate, monthlyRent, depositPaid } = body

    // Validate required fields
    if (!tenantId || !startDate || !monthlyRent) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, startDate, monthlyRent' },
        { status: 400 }
      )
    }

    // Check if unit exists
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: { property: true },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    // Check if there's already an active tenancy for this unit
    const existingTenancy = await prisma.tenancy.findFirst({
      where: {
        unitId,
        status: 'ACTIVE',
      },
    })

    if (existingTenancy) {
      return NextResponse.json(
        { error: 'Unit already has an active tenancy' },
        { status: 400 }
      )
    }

    // Generate tenancy number
    const tenancyNumber = `TN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create a manual listing first
    const listing = await prisma.listing.create({
      data: {
        unitId,
        title: `${unit.name || unit.unitCode} - Manual Listing`,
        description: 'Auto-generated listing for manual tenancy',
        status: 'PUBLISHED',
        visibility: 'PRIVATE',
        publishedAt: new Date(),
      },
    })

    // Create a manual booking
    const bookingNumber = `BK-MANUAL-${Date.now()}`
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        listingId: listing.id,
        unitId,
        tenantId,
        bookingType: 'LONG_TERM',
        status: 'CONFIRMED',
        checkInDate: new Date(startDate),
        checkOutDate: endDate ? new Date(endDate) : null,
        totalAmount: monthlyRent,
        depositAmount: depositPaid || 0,
        confirmedAt: new Date(),
      },
    })

    // Create tenancy
    const tenancy = await prisma.tenancy.create({
      data: {
        tenancyNumber,
        bookingId: booking.id,
        unitId,
        tenantId,
        status: 'ACTIVE',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        monthlyRent,
        depositPaid: depositPaid || 0,
        activatedAt: new Date(),
      },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    // Update unit status to OCCUPIED
    await prisma.unit.update({
      where: { id: unitId },
      data: { status: 'OCCUPIED' },
    })

    // Send notification to tenant
    await prisma.notification.create({
      data: {
        userId: tenantId,
        type: 'SYSTEM_ALERT',
        channel: 'IN_APP',
        status: 'UNREAD',
        title: 'Tenancy Activated 🏠',
        message: `Your tenancy for unit ${unit.unitCode} at ${unit.property.name} is now active.`,
        data: { tenancyNumber, unitCode: unit.unitCode, propertyName: unit.property.name },
      },
    })

    // Send notification to the user who created the occupancy
    if (session.user.id !== tenantId) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'SYSTEM_ALERT',
          channel: 'IN_APP',
          status: 'UNREAD',
          title: 'Occupancy Recorded ✅',
          message: `Unit ${unit.unitCode} is now occupied by ${tenancy.tenant.firstName} ${tenancy.tenant.lastName}.`,
          data: { tenancyNumber, unitCode: unit.unitCode, propertyName: unit.property.name },
        },
      })
    }

    return NextResponse.json(tenancy)
  } catch (error) {
    console.error('Error creating occupancy:', error)
    return NextResponse.json(
      { error: 'Failed to create occupancy' },
      { status: 500 }
    )
  }
}

// End occupancy (terminate tenancy)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: unitId } = await params
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason') || 'Manually terminated'

    // Find active tenancy
    const tenancy = await prisma.tenancy.findFirst({
      where: {
        unitId,
        status: 'ACTIVE',
      },
      include: {
        tenant: true,
        unit: {
          include: { property: true },
        },
      },
    })

    if (!tenancy) {
      return NextResponse.json(
        { error: 'No active tenancy found for this unit' },
        { status: 404 }
      )
    }

    // Update tenancy status
    await prisma.tenancy.update({
      where: { id: tenancy.id },
      data: {
        status: 'TERMINATED',
        terminatedAt: new Date(),
        terminationReason: reason,
      },
    })

    // Update unit status to AVAILABLE
    await prisma.unit.update({
      where: { id: unitId },
      data: { status: 'AVAILABLE' },
    })

    // Send notification to tenant
    await prisma.notification.create({
      data: {
        userId: tenancy.tenantId,
        type: 'SYSTEM_ALERT',
        channel: 'IN_APP',
        status: 'UNREAD',
        title: 'Tenancy Terminated 🚪',
        message: `Your tenancy for unit ${tenancy.unit.unitCode} at ${tenancy.unit.property.name} has been terminated.`,
        data: { 
          tenancyNumber: tenancy.tenancyNumber, 
          unitCode: tenancy.unit.unitCode, 
          reason 
        },
      },
    })

    // Send notification to the user who terminated the occupancy
    if (session.user.id !== tenancy.tenantId) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'SYSTEM_ALERT',
          channel: 'IN_APP',
          status: 'UNREAD',
          title: 'Tenancy Terminated ✅',
          message: `Tenancy for unit ${tenancy.unit.unitCode} has been terminated.`,
          data: { 
            tenancyNumber: tenancy.tenancyNumber, 
            unitCode: tenancy.unit.unitCode, 
            tenantName: `${tenancy.tenant.firstName} ${tenancy.tenant.lastName}`
          },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error terminating occupancy:', error)
    return NextResponse.json(
      { error: 'Failed to terminate occupancy' },
      { status: 500 }
    )
  }
}

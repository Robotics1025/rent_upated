import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { notifyUnitAdded } from '@/lib/notifications'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        property: true,
        files: {
          where: { category: 'UNIT_IMAGE' },
        },
        tenancies: {
          where: { status: 'ACTIVE' },
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
            booking: {
              select: {
                id: true,
                payments: {
                  where: { purpose: 'MONTHLY_RENT' },
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error fetching unit:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unit' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get unit details before deletion for notification
    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            adminAssignments: true,
          },
        },
      },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    // Delete the unit
    await prisma.unit.delete({
      where: { id },
    })

    // Send notification to the user who deleted the unit
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SYSTEM_ALERT',
        channel: 'IN_APP',
        status: 'UNREAD',
        title: 'Unit Deleted Successfully 🗑️',
        message: `Unit ${unit.unitCode} has been deleted from ${unit.property.name}.`,
        data: { unitCode: unit.unitCode, propertyName: unit.property.name },
      },
    })

    // Send notifications to assigned managers
    if (unit.property.adminAssignments) {
      for (const assignment of unit.property.adminAssignments) {
        await prisma.notification.create({
          data: {
            userId: assignment.adminId,
            type: 'SYSTEM_ALERT',
            channel: 'IN_APP',
            status: 'UNREAD',
            title: 'Unit Deleted 🗑️',
            message: `Unit ${unit.unitCode} has been deleted from ${unit.property.name}.`,
            data: { unitCode: unit.unitCode, propertyName: unit.property.name },
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting unit:', error)
    return NextResponse.json(
      { error: 'Failed to delete unit' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        unitCode: body.unitCode,
        name: body.name,
        description: body.description,
        price: body.price,
        currency: body.currency,
        deposit: body.deposit,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        squareMeters: body.squareMeters,
        floor: body.floor,
        isFurnished: body.isFurnished,
        hasBalcony: body.hasBalcony,
        hasWifi: body.hasWifi,
        hasAC: body.hasAC,
        hasPet: body.hasPet,
        hasParking: body.hasParking,
        amenities: body.amenities,
        status: body.status,
      },
      include: {
        property: {
          include: {
            adminAssignments: true,
          },
        },
        files: true,
      },
    })

    // Send notification to the user who updated the unit
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SYSTEM_ALERT',
        channel: 'IN_APP',
        status: 'UNREAD',
        title: 'Unit Updated Successfully ✅',
        message: `Unit ${unit.unitCode} in ${unit.property.name} has been updated.`,
        data: { unitCode: unit.unitCode, propertyName: unit.property.name },
      },
    })

    // Send notifications to assigned managers
    if (unit.property.adminAssignments) {
      for (const assignment of unit.property.adminAssignments) {
        await notifyUnitAdded(assignment.adminId, unit.unitCode, unit.property.name)
      }
    }

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error updating unit:', error)
    return NextResponse.json(
      { error: 'Failed to update unit' },
      { status: 500 }
    )
  }
}

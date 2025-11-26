import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      include: {
        property: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        files: {
          where: { category: 'UNIT_IMAGE' },
          select: {
            id: true,
            fileUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(units)
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const unit = await prisma.unit.create({
      data: {
        propertyId: body.propertyId,
        unitCode: body.unitCode,
        name: body.name,
        description: body.description,
        price: body.price,
        currency: body.currency || 'UGX',
        deposit: body.deposit,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        squareMeters: body.squareMeters,
        floor: body.floor,
        isFurnished: body.isFurnished ?? false,
        hasBalcony: body.hasBalcony ?? false,
        hasWifi: body.hasWifi ?? false,
        hasAC: body.hasAC ?? false,
        hasPet: body.hasPet ?? false,
        hasParking: body.hasParking ?? false,
        amenities: body.amenities,
        status: body.status || 'AVAILABLE',
      },
      include: {
        property: true,
      },
    })

    // Get all members and managers to notify them
    const usersToNotify = await prisma.user.findMany({
      where: { 
        role: { in: ['MEMBER', 'MANAGER'] }
      },
      select: { id: true },
    })

    // Send notification to all members and managers (each gets their own notification record)
    const notificationPromises = usersToNotify.map((user) =>
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM_ALERT',
          channel: 'IN_APP',
          status: 'UNREAD',
          title: 'New Unit Available! 🏠',
          message: `Unit ${unit.unitCode} at ${unit.property.name} is now available. ${unit.bedrooms}BR, ${unit.bathrooms}BA - ${unit.price.toLocaleString()} UGX/month`,
          data: { 
            unitId: unit.id,
            unitCode: unit.unitCode,
            propertyName: unit.property.name,
            price: unit.price,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms
          },
        },
      })
    )

    // Send notification to the creator (separate record)
    if (session?.user?.id && !usersToNotify.find(u => u.id === session.user.id)) {
      notificationPromises.push(
        prisma.notification.create({
          data: {
            userId: session.user.id,
            type: 'SYSTEM_ALERT',
            channel: 'IN_APP',
            status: 'UNREAD',
            title: 'Unit Created Successfully ✅',
            message: `Unit ${unit.unitCode} has been created and ${usersToNotify.length} users have been notified.`,
            data: { 
              unitId: unit.id,
              unitCode: unit.unitCode,
              usersNotified: usersToNotify.length
            },
          },
        })
      )
    }

    await Promise.all(notificationPromises)

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json(
      { error: 'Failed to create unit' },
      { status: 500 }
    )
  }
}

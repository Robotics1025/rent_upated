import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/properties - Get all properties
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const propertyType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    if (city) {
      where.city = city
    }

    if (propertyType) {
      where.propertyType = propertyType
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        units: {
          select: {
            id: true,
            unitCode: true,
            price: true,
            bedrooms: true,
            bathrooms: true,
            status: true,
          },
        },
        files: {
          where: { category: 'PROPERTY_IMAGE' },
          select: {
            id: true,
            fileUrl: true,
            category: true,
          },
        },
        _count: {
          select: { units: true },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

// POST /api/properties - Create a new property
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const property = await prisma.property.create({
      data: {
        name: body.name,
        description: body.description,
        propertyType: body.propertyType,
        tenancyType: body.tenancyType,
        ownerName: body.ownerName,
        ownerType: body.ownerType,
        ownerContact: body.ownerContact,
        ownerEmail: body.ownerEmail,
        ownerPhone: body.ownerPhone,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        district: body.district,
        region: body.region,
        postalCode: body.postalCode,
        country: body.country || 'Uganda',
        latitude: body.latitude,
        longitude: body.longitude,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
      },
      include: {
        units: true,
      },
    })

    // Auto-assign property to the creator if they're a manager
    if (session?.user?.id && session.user.role === 'MANAGER') {
      await prisma.adminAssignment.create({
        data: {
          adminId: session.user.id,
          propertyId: property.id,
          role: 'Property Manager',
          assignedBy: session.user.id,
        },
      })
    }

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
          title: 'New Property Available! 🏢',
          message: `${property.name} in ${property.city} is now available for booking. Check it out!`,
          data: { 
            propertyId: property.id,
            propertyName: property.name,
            city: property.city,
            propertyType: property.propertyType
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
            title: 'Property Created Successfully ✅',
            message: `${property.name} has been created and ${usersToNotify.length} users have been notified.`,
            data: { 
              propertyId: property.id,
              propertyName: property.name,
              usersNotified: usersToNotify.length
            },
          },
        })
      )
    }

    await Promise.all(notificationPromises)

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}
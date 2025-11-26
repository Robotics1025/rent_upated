import { NextRequest, NextResponse } from 'next/server'
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

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}
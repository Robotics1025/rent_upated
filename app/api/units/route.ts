import { NextRequest, NextResponse } from 'next/server'
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

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json(
      { error: 'Failed to create unit' },
      { status: 500 }
    )
  }
}

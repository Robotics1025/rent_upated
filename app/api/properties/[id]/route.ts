import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete the property (cascades to units and files)
    await prisma.property.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        units: {
          include: {
            files: {
              where: { category: 'UNIT_IMAGE' },
            },
          },
        },
        files: {
          where: { category: 'PROPERTY_IMAGE' },
        },
      },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const property = await prisma.property.update({
      where: { id },
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
        registrationNumber: body.registrationNumber,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        district: body.district,
        region: body.region,
        postalCode: body.postalCode,
        country: body.country,
        latitude: body.latitude,
        longitude: body.longitude,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
      },
      include: {
        units: true,
        files: true,
      },
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

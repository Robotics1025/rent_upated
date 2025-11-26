import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const { id } = await params

    await prisma.unit.delete({
      where: { id },
    })

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
        property: true,
        files: true,
      },
    })

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error updating unit:', error)
    return NextResponse.json(
      { error: 'Failed to update unit' },
      { status: 500 }
    )
  }
}

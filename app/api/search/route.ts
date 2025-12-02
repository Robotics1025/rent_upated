import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')
        const type = searchParams.get('type') // 'properties', 'units', 'all'

        if (!query || query.trim().length < 2) {
            return NextResponse.json({
                properties: [],
                units: [],
                message: 'Search query must be at least 2 characters'
            })
        }

        const searchQuery = query.trim().toLowerCase()

        let properties: any[] = []
        let units: any[] = []

        // Search properties if type is 'properties' or 'all'
        if (!type || type === 'all' || type === 'properties') {
            properties = await prisma.property.findMany({
                where: {
                    AND: [
                        { isActive: true },
                        {
                            OR: [
                                { name: { contains: searchQuery, mode: 'insensitive' } },
                                { description: { contains: searchQuery, mode: 'insensitive' } },
                                { city: { contains: searchQuery, mode: 'insensitive' } },
                                { region: { contains: searchQuery, mode: 'insensitive' } },
                                { district: { contains: searchQuery, mode: 'insensitive' } },
                                { addressLine1: { contains: searchQuery, mode: 'insensitive' } },
                            ]
                        }
                    ]
                },
                include: {
                    _count: {
                        select: { units: true }
                    },
                    files: {
                        where: { category: 'PROPERTY_IMAGE' },
                        take: 1,
                        select: {
                            fileUrl: true
                        }
                    },
                    units: {
                        where: { status: 'AVAILABLE' },
                        take: 1,
                        select: {
                            price: true,
                            bedrooms: true,
                            bathrooms: true,
                        }
                    }
                },
                take: 10
            })
        }

        // Search units if type is 'units' or 'all'
        if (!type || type === 'all' || type === 'units') {
            units = await prisma.unit.findMany({
                where: {
                    AND: [
                        {
                            OR: [
                                { status: 'AVAILABLE' },
                                { status: 'BOOKED' }
                            ]
                        },
                        {
                            OR: [
                                { unitCode: { contains: searchQuery, mode: 'insensitive' } },
                                { name: { contains: searchQuery, mode: 'insensitive' } },
                                { description: { contains: searchQuery, mode: 'insensitive' } },
                                {
                                    property: {
                                        OR: [
                                            { name: { contains: searchQuery, mode: 'insensitive' } },
                                            { city: { contains: searchQuery, mode: 'insensitive' } },
                                            { region: { contains: searchQuery, mode: 'insensitive' } },
                                        ]
                                    }
                                },
                            ]
                        }
                    ]
                },
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            region: true,
                        }
                    },
                    files: {
                        where: { category: 'UNIT_IMAGE' },
                        take: 1,
                        select: {
                            fileUrl: true
                        }
                    }
                },
                take: 10
            })
        }

        return NextResponse.json({
            properties,
            units,
            totalResults: properties.length + units.length
        })
    } catch (error) {
        console.error('Error searching:', error)
        return NextResponse.json(
            { error: 'Failed to perform search' },
            { status: 500 }
        )
    }
}

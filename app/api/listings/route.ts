import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireRole } from '@/lib/auth'

// GET /api/listings - Public endpoint to browse marketplace
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const city = searchParams.get('city')
        const propertyType = searchParams.get('propertyType')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')
        const bedrooms = searchParams.get('bedrooms')
        const furnished = searchParams.get('furnished')
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = parseInt(searchParams.get('offset') || '0')

        const where: any = {
            status: 'PUBLISHED',
            unit: {
                status: { in: ['AVAILABLE', 'BOOKED'] }
            }
        }

        // Build filter conditions
        if (city) {
            where.unit = { ...where.unit, property: { city } }
        }

        if (propertyType) {
            where.unit = { ...where.unit, property: { propertyType } }
        }

        if (minPrice || maxPrice) {
            where.unit = {
                ...where.unit,
                price: {}
            }
            if (minPrice) where.unit.price.gte = parseFloat(minPrice)
            if (maxPrice) where.unit.price.lte = parseFloat(maxPrice)
        }

        if (bedrooms) {
            where.unit = { ...where.unit, bedrooms: parseInt(bedrooms) }
        }

        if (furnished === 'true') {
            where.unit = { ...where.unit, isFurnished: true }
        }

        const listings = await prisma.listing.findMany({
            where,
            include: {
                unit: {
                    include: {
                        property: {
                            select: {
                                id: true,
                                name: true,
                                city: true,
                                region: true,
                                district: true,
                                propertyType: true,
                            }
                        },
                        files: {
                            where: { category: 'UNIT_IMAGE' },
                            take: 5,
                            select: {
                                id: true,
                                fileUrl: true,
                            }
                        }
                    }
                }
            },
            orderBy: [
                { isPromoted: 'desc' },
                { createdAt: 'desc' }
            ],
            take: limit,
            skip: offset,
        })

        // Increment view count for listings (do this async, don't wait)
        const listingIds = listings.map(l => l.id)
        if (listingIds.length > 0) {
            prisma.listing.updateMany({
                where: { id: { in: listingIds } },
                data: { viewCount: { increment: 1 } }
            }).catch(err => console.error('Failed to update view count:', err))
        }

        return NextResponse.json({
            listings,
            total: listings.length,
            hasMore: listings.length === limit
        })
    } catch (error) {
        console.error('Error fetching listings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch listings' },
            { status: 500 }
        )
    }
}

// POST /api/listings - Create new listing (admin/manager only)
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request)
        requireRole(user, ['ADMIN', 'SUPER_ADMIN', 'MANAGER'])

        const body = await request.json()
        const {
            unitId,
            title,
            description,
            highlights,
            customPrice,
            customDeposit,
            availableFrom,
            availableTo,
            minimumStay,
            maximumStay,
            visibility,
            isPromoted,
        } = body

        // Validate required fields
        if (!unitId || !title || !description) {
            return NextResponse.json(
                { error: 'Missing required fields: unitId, title, description' },
                { status: 400 }
            )
        }

        // Check if unit exists
        const unit = await prisma.unit.findUnique({
            where: { id: unitId },
            include: { property: true }
        })

        if (!unit) {
            return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
        }

        // For managers, verify they have access to this property
        if (user!.role === 'MANAGER') {
            const hasAccess = await prisma.adminAssignment.findFirst({
                where: {
                    adminId: user!.id,
                    propertyId: unit.propertyId
                }
            })

            if (!hasAccess) {
                return NextResponse.json(
                    { error: 'You do not have permission to create listings for this property' },
                    { status: 403 }
                )
            }
        }

        // Create listing
        const listing = await prisma.listing.create({
            data: {
                unitId,
                title,
                description,
                highlights,
                customPrice,
                customDeposit,
                availableFrom: availableFrom ? new Date(availableFrom) : null,
                availableTo: availableTo ? new Date(availableTo) : null,
                minimumStay,
                maximumStay,
                status: 'DRAFT', // Start as draft, publish explicitly
                visibility: visibility || 'PUBLIC',
                isPromoted: isPromoted || false,
            },
            include: {
                unit: {
                    include: {
                        property: true
                    }
                }
            }
        })

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user!.id,
                action: 'CREATE',
                entityType: 'Listing',
                entityId: listing.id,
                metadata: {
                    unitId,
                    title,
                    propertyName: unit.property.name,
                }
            }
        })

        return NextResponse.json(listing, { status: 201 })
    } catch (error: any) {
        console.error('Error creating listing:', error)

        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }

        return NextResponse.json(
            { error: 'Failed to create listing' },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireRole } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                unit: {
                    include: {
                        property: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                propertyType: true,
                                addressLine1: true,
                                addressLine2: true,
                                city: true,
                                region: true,
                                district: true,
                                latitude: true,
                                longitude: true,
                            }
                        },
                        files: {
                            where: { category: 'UNIT_IMAGE' },
                            select: {
                                id: true,
                                fileUrl: true,
                                description: true,
                            }
                        }
                    }
                }
            }
        })

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
        }

        // Increment view count
        await prisma.listing.update({
            where: { id },
            data: { viewCount: { increment: 1 } }
        })

        return NextResponse.json(listing)
    } catch (error) {
        console.error('Error fetching listing:', error)
        return NextResponse.json(
            { error: 'Failed to fetch listing' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(request)
        requireRole(user, ['ADMIN', 'SUPER_ADMIN', 'MANAGER'])

        const { id } = await params
        const body = await request.json()

        // Get existing listing
        const existingListing = await prisma.listing.findUnique({
            where: { id },
            include: {
                unit: { include: { property: true } }
            }
        })

        if (!existingListing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
        }

        // For managers, verify access
        if (user!.role === 'MANAGER') {
            const hasAccess = await prisma.adminAssignment.findFirst({
                where: {
                    adminId: user!.id,
                    propertyId: existingListing.unit.propertyId
                }
            })

            if (!hasAccess) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
        }

        // Update listing
        const listing = await prisma.listing.update({
            where: { id },
            data: {
                ...body,
                publishedAt: body.status === 'PUBLISHED' && !existingListing.publishedAt
                    ? new Date()
                    : existingListing.publishedAt,
            },
            include: {
                unit: {
                    include: { property: true }
                }
            }
        })

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user!.id,
                action: 'UPDATE',
                entityType: 'Listing',
                entityId: id,
                oldValue: { status: existingListing.status },
                newValue: { status: listing.status },
            }
        })

        return NextResponse.json(listing)
    } catch (error: any) {
        console.error('Error updating listing:', error)

        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }

        return NextResponse.json(
            { error: 'Failed to update listing' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(request)
        requireRole(user, ['ADMIN', 'SUPER_ADMIN', 'MANAGER'])

        const { id } = await params

        // Get existing listing
        const existingListing = await prisma.listing.findUnique({
            where: { id },
            include: {
                unit: { include: { property: true } }
            }
        })

        if (!existingListing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
        }

        // For managers, verify access
        if (user!.role === 'MANAGER') {
            const hasAccess = await prisma.adminAssignment.findFirst({
                where: {
                    adminId: user!.id,
                    propertyId: existingListing.unit.propertyId
                }
            })

            if (!hasAccess) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
        }

        // Delete listing
        await prisma.listing.delete({
            where: { id }
        })

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user!.id,
                action: 'DELETE',
                entityType: 'Listing',
                entityId: id,
            }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting listing:', error)

        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }

        return NextResponse.json(
            { error: 'Failed to delete listing' },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'
import { notifyNewBooking } from '@/lib/notifications'

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request)
        requireAuth(user)

        const body = await request.json()
        const {
            listingId,
            checkInDate,
            checkOutDate,
            numberOfGuests,
            specialRequests
        } = body

        // Validate required fields
        if (!listingId || !checkInDate) {
            return NextResponse.json(
                { error: 'Missing required fields: listingId, checkInDate' },
                { status: 400 }
            )
        }

        // Validate dates
        const checkIn = new Date(checkInDate)
        const checkOut = checkOutDate ? new Date(checkOutDate) : null

        if (isNaN(checkIn.getTime())) {
            return NextResponse.json(
                { error: 'Invalid checkInDate' },
                { status: 400 }
            )
        }

        if (checkOut && checkOut <= checkIn) {
            return NextResponse.json(
                { error: 'checkOutDate must be after checkInDate' },
                { status: 400 }
            )
        }

        // Fetch listing with unit details
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                unit: {
                    include: {
                        property: true
                    }
                }
            }
        })

        if (!listing) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            )
        }

        if (listing.status !== 'PUBLISHED') {
            return NextResponse.json(
                { error: 'Listing is not available for booking' },
                { status: 400 }
            )
        }

        if (listing.unit.status !== 'AVAILABLE') {
            return NextResponse.json(
                { error: 'Unit is not available' },
                { status: 400 }
            )
        }

        // Calculate total amount
        const price = listing.customPrice || listing.unit.price
        let totalAmount = price

        // If checkout date provided, calculate based on duration
        if (checkOut) {
            const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
            totalAmount = price.mul(days)
        }

        const depositAmount = listing.customDeposit || listing.unit.deposit || price.mul(0.5)

        // Generate booking number
        const bookingNumber = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                bookingNumber,
                listingId,
                unitId: listing.unitId,
                tenantId: user!.id,
                bookingType: checkOut ? 'SHORT_TERM' : 'LONG_TERM',
                status: 'PENDING',
                checkInDate: checkIn,
                checkOutDate: checkOut,
                totalAmount,
                depositAmount,
                numberOfGuests,
                specialRequests,
            },
            include: {
                listing: true,
                unit: {
                    include: {
                        property: true
                    }
                },
                tenant: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                }
            }
        })

        // Update unit status to BOOKED
        await prisma.unit.update({
            where: { id: listing.unitId },
            data: { status: 'BOOKED' }
        })

        // Notify tenant
        await prisma.notification.create({
            data: {
                userId: user!.id,
                type: 'BOOKING_CONFIRMATION',
                channel: 'IN_APP',
                status: 'UNREAD',
                title: 'Booking Created! 🎉',
                message: `Your booking ${bookingNumber} for ${listing.unit.unitCode} has been created and is pending confirmation.`,
                data: {
                    bookingId: booking.id,
                    bookingNumber,
                    unitCode: listing.unit.unitCode,
                    propertyName: listing.unit.property.name,
                }
            }
        })

        // Notify admins and assigned managers
        const admins = await prisma.user.findMany({
            where: {
                OR: [
                    { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
                    {
                        role: 'MANAGER',
                        adminAssignments: {
                            some: { propertyId: listing.unit.propertyId }
                        }
                    }
                ]
            },
            select: { id: true }
        })

        const tenantName = `${booking.tenant.firstName} ${booking.tenant.lastName}`
        for (const admin of admins) {
            await notifyNewBooking(admin.id, bookingNumber, tenantName)
        }

        return NextResponse.json(booking, { status: 201 })
    } catch (error: any) {
        console.error('Error creating booking:', error)

        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json(
            { error: 'Failed to create booking' },
            { status: 500 }
        )
    }
}

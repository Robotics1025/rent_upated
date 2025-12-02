import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request)

        const payments = await prisma.payment.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                tenant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                booking: {
                    select: {
                        bookingNumber: true,
                    },
                },
            }
        })
        return NextResponse.json({
            user: user ? { id: user.id, role: user.role, email: user.email } : 'No User',
            count: payments.length,
            payments
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
    }
}

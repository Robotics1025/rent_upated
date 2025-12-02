import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'
import { verificationCodes } from '../verify/route'

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request)
        requireAuth(user)

        const { code } = await request.json()

        if (!code) {
            return NextResponse.json({ error: 'Verification code is required' }, { status: 400 })
        }

        const storedData = verificationCodes.get(user.id)

        if (!storedData) {
            return NextResponse.json({ error: 'No verification code found' }, { status: 400 })
        }

        if (Date.now() > storedData.expiresAt) {
            verificationCodes.delete(user.id)
            return NextResponse.json({ error: 'Verification code expired' }, { status: 400 })
        }

        if (storedData.code !== code) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
        }

        // Verify phone and enable SMS
        await prisma.user.update({
            where: { id: user.id },
            data: {
                phoneVerified: true,
                smsEnabled: true
            }
        })

        // Clean up
        verificationCodes.delete(user.id)

        return NextResponse.json({ message: 'Phone verified successfully' })
    } catch (error: any) {
        console.error('Phone confirmation error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to confirm phone' },
            { status: 500 }
        )
    }
}

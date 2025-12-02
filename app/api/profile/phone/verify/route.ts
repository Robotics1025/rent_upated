import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'
import twilio from 'twilio'

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>()

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request)
        requireAuth(user)

        const { phone } = await request.json()

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

        // Store code
        verificationCodes.set(user.id, { code, expiresAt })

        // Send SMS
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            const client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            )

            await client.messages.create({
                body: `Your verification code is: ${code}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            })
        } else {
            // Development mode - log code
            console.log(`Verification code for ${phone}: ${code}`)
        }

        // Update user's phone (but don't verify yet)
        await prisma.user.update({
            where: { id: user.id },
            data: { phone, phoneVerified: false }
        })

        return NextResponse.json({ message: 'Verification code sent' })
    } catch (error: any) {
        console.error('Phone verification error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to send verification code' },
            { status: 500 }
        )
    }
}

// Export for use in confirm endpoint
export { verificationCodes }

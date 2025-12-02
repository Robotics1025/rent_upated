import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { MessageSid, MessageStatus, ErrorCode } = body

        if (!MessageSid) {
            return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
        }

        // Update message status in database
        await prisma.message.updateMany({
            where: { smsSid: MessageSid },
            data: {
                smsStatus: MessageStatus,
                smsError: ErrorCode ? `Error code: ${ErrorCode}` : null
            }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Twilio webhook error:', error)
        return NextResponse.json(
            { error: error.message || 'Webhook processing failed' },
            { status: 500 }
        )
    }
}

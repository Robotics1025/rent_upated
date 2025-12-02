import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, requireAuth } from '@/lib/auth'
import twilio from 'twilio'

const AccessToken = twilio.jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request)
        requireAuth(user)

        const { roomName } = await request.json()

        if (!roomName) {
            return NextResponse.json({ error: 'Room name is required' }, { status: 400 })
        }

        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_API_KEY || !process.env.TWILIO_API_SECRET) {
            return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 })
        }

        // Create access token
        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET,
            { identity: user.id }
        )

        // Create video grant
        const videoGrant = new VideoGrant({
            room: roomName
        })

        token.addGrant(videoGrant)

        return NextResponse.json({
            token: token.toJwt(),
            identity: user.id,
            roomName
        })
    } catch (error: any) {
        console.error('Generate token error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate token' },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { calculateTenantBalance } from '@/lib/finance'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const balanceData = await calculateTenantBalance(id)
        return NextResponse.json(balanceData)
    } catch (error) {
        console.error('Error fetching tenant balance:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tenant balance' },
            { status: 500 }
        )
    }
}

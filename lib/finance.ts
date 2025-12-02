import { prisma } from '@/lib/prisma'

export async function calculateTenantBalance(tenantId: string) {
    // 1. Get active tenancy
    const tenancy = await prisma.tenancy.findFirst({
        where: {
            tenantId,
            status: 'ACTIVE',
        },
        include: {
            unit: {
                include: {
                    property: true
                }
            },
        },
    })

    if (!tenancy) {
        return {
            totalDue: 0,
            totalPaid: 0,
            balance: 0,
            monthsPaid: 0,
            monthsOverdue: 0,
            monthlyRent: 0,
            currency: 'UGX',
            status: 'NO_ACTIVE_TENANCY',
            tenancyDetails: null
        }
    }

    // 2. Calculate months active
    const startDate = new Date(tenancy.startDate)
    const currentDate = new Date()

    // Calculate difference in months
    let monthsActive = (currentDate.getFullYear() - startDate.getFullYear()) * 12
    monthsActive -= startDate.getMonth()
    monthsActive += currentDate.getMonth()

    // If start day is after current day, subtract one month (unless it's the same month)
    if (currentDate.getDate() < startDate.getDate()) {
        monthsActive--
    }

    // Ensure at least 1 month if active
    monthsActive = Math.max(1, monthsActive + 1) // +1 to include current month as due

    // 3. Calculate Total Due
    const monthlyRent = Number(tenancy.monthlyRent)
    const totalDue = monthsActive * monthlyRent

    // 4. Calculate Total Paid
    const payments = await prisma.payment.findMany({
        where: {
            tenantId,
            purpose: 'MONTHLY_RENT',
            status: 'SUCCESS',
            // Only count payments made after tenancy start (or related to this tenancy)
            // For simplicity in this model, we sum all rent payments for this tenant
            // In a more complex model, we'd link payments to specific tenancies
        },
    })

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)

    // 5. Calculate Balance
    const balance = totalDue - totalPaid
    const monthsPaid = Math.floor(totalPaid / monthlyRent)
    const monthsOverdue = Math.max(0, monthsActive - monthsPaid)

    return {
        totalDue,
        totalPaid,
        balance,
        monthsPaid,
        monthsOverdue,
        monthlyRent,
        currency: tenancy.currency,
        status: balance > 0 ? 'OVERDUE' : 'PAID',
        tenancyDetails: {
            startDate: tenancy.startDate,
            unitCode: tenancy.unit.unitCode,
            propertyName: tenancy.unit.property.name,
            monthsActive
        }
    }
}

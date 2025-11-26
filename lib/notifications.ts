import { prisma } from '@/lib/prisma'

interface CreateNotificationParams {
  userId: string
  type: 'BOOKING_CONFIRMATION' | 'PAYMENT_RECEIPT' | 'RENT_REMINDER' | 'SYSTEM_ALERT' | 'ADMIN_UPDATE' | 'MAINTENANCE_NOTICE' | 'MESSAGE' | 'OTHER'
  title: string
  message: string
  data?: any
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        channel: 'IN_APP',
        status: 'UNREAD',
        title: params.title,
        message: params.message,
        data: params.data || {},
      },
    })

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

export async function notifyBookingConfirmed(tenantId: string, bookingNumber: string, unitCode: string) {
  return createNotification({
    userId: tenantId,
    type: 'BOOKING_CONFIRMATION',
    title: 'Booking Confirmed! 🎉',
    message: `Your booking ${bookingNumber} for unit ${unitCode} has been confirmed.`,
    data: { bookingNumber, unitCode },
  })
}

export async function notifyPaymentReceived(tenantId: string, amount: number, transactionId: string) {
  return createNotification({
    userId: tenantId,
    type: 'PAYMENT_RECEIPT',
    title: 'Payment Received 💰',
    message: `Your payment of ${amount.toLocaleString()} UGX has been successfully received. Transaction ID: ${transactionId}`,
    data: { amount, transactionId },
  })
}

export async function notifyRentDue(tenantId: string, amount: number, dueDate: Date) {
  return createNotification({
    userId: tenantId,
    type: 'RENT_REMINDER',
    title: 'Rent Due Reminder 🔔',
    message: `Your rent of ${amount.toLocaleString()} UGX is due on ${dueDate.toLocaleDateString()}. Please make payment on time.`,
    data: { amount, dueDate },
  })
}

export async function notifyNewBooking(managerId: string, bookingNumber: string, tenantName: string) {
  return createNotification({
    userId: managerId,
    type: 'ADMIN_UPDATE',
    title: 'New Booking Received 📅',
    message: `${tenantName} has created a new booking ${bookingNumber}. Please review and confirm.`,
    data: { bookingNumber, tenantName },
  })
}

export async function notifyPropertyAdded(managerId: string, propertyName: string) {
  return createNotification({
    userId: managerId,
    type: 'SYSTEM_ALERT',
    title: 'Property Added Successfully ✅',
    message: `Property "${propertyName}" has been added to your portfolio.`,
    data: { propertyName },
  })
}

export async function notifyUnitAdded(managerId: string, unitCode: string, propertyName: string) {
  return createNotification({
    userId: managerId,
    type: 'SYSTEM_ALERT',
    title: 'Unit Added Successfully ✅',
    message: `Unit ${unitCode} has been added to ${propertyName}.`,
    data: { unitCode, propertyName },
  })
}

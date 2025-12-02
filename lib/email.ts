import sgMail from '@sendgrid/mail'
import twilio from 'twilio'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null

interface EmailOptions {
    to: string
    subject: string
    html: string
    text?: string
}

interface SMSOptions {
    to: string
    body: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        if (!process.env.SENDGRID_API_KEY) {
            console.warn('SendGrid not configured, skipping email')
            return false
        }

        const msg = {
            to: options.to,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@eazyrent.com',
            subject: options.subject,
            text: options.text || '',
            html: options.html,
        }

        await sgMail.send(msg)
        console.log(`Email sent to ${options.to}: ${options.subject}`)
        return true
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}

export async function sendSMS(options: SMSOptions): Promise<boolean> {
    try {
        if (!twilioClient) {
            console.warn('Twilio not configured, skipping SMS')
            return false
        }

        await twilioClient.messages.create({
            body: options.body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: options.to,
        })

        console.log(`SMS sent to ${options.to}`)
        return true
    } catch (error) {
        console.error('Error sending SMS:', error)
        return false
    }
}

// Email Templates
export function getWelcomeEmailHTML(firstName: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .button { display: inline-block; padding: 12px 30px; background: #059669; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Welcome to EazyRent!</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Thank you for joining EazyRent - Uganda's premier property rental platform!</p>
          <p>You can now:</p>
          <ul>
            <li>Browse thousands of available properties</li>
            <li>Book your perfect home instantly</li>
            <li>Manage payments securely</li>
            <li>Track your bookings and tenancies</li>
          </ul>
          <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The EazyRent Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} EazyRent. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getBookingConfirmationEmailHTML(
    firstName: string,
    bookingNumber: string,
    unitCode: string,
    propertyName: string,
    checkInDate: Date,
    amount: number
): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 30px; background: #059669; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Great news! Your booking has been confirmed.</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span><strong>Booking Number:</strong></span>
              <span>${bookingNumber}</span>
            </div>
            <div class="detail-row">
              <span><strong>Property:</strong></span>
              <span>${propertyName}</span>
            </div>
            <div class="detail-row">
              <span><strong>Unit:</strong></span>
              <span>${unitCode}</span>
            </div>
            <div class="detail-row">
              <span><strong>Check-in Date:</strong></span>
              <span>${checkInDate.toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span><strong>Total Amount:</strong></span>
              <span>${amount.toLocaleString()} UGX</span>
            </div>
          </div>
          
          <a href="${process.env.NEXTAUTH_URL}/dashboard/bookings" class="button">View Booking</a>
          
          <p>Please proceed with payment to complete your booking.</p>
          <p>Best regards,<br>The EazyRent Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} EazyRent. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getPaymentReceiptEmailHTML(
    firstName: string,
    transactionId: string,
    amount: number,
    purpose: string,
    date: Date
): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .receipt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #d1d5db; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .total { font-size: 24px; font-weight: bold; color: #059669; padding-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Payment Received!</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Thank you! Your payment has been successfully processed.</p>
          
          <div class="receipt">
            <h3>Payment Receipt</h3>
            <div class="detail-row">
              <span><strong>Transaction ID:</strong></span>
              <span>${transactionId}</span>
            </div>
            <div class="detail-row">
              <span><strong>Purpose:</strong></span>
              <span>${purpose}</span>
            </div>
            <div class="detail-row">
              <span><strong>Date:</strong></span>
              <span>${date.toLocaleString()}</span>
            </div>
            <div class="detail-row total">
              <span>Amount Paid:</span>
              <span>${amount.toLocaleString()} UGX</span>
            </div>
          </div>
          
          <p style="font-size: 12px; color: #6b7280;">Please keep this receipt for your records.</p>
          <p>Best regards,<br>The EazyRent Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} EazyRent. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getRentReminderEmailHTML(
    firstName: string,
    amount: number,
    dueDate: Date,
    daysUntilDue: number
): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; padding: 12px 30px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Rent Payment Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>This is a friendly reminder that your rent payment is due soon.</p>
          
          <div class="alert-box">
            <h3 style="margin-top: 0;">Payment Due in ${daysUntilDue} ${daysUntilDue === 1 ? 'Day' : 'Days'}</h3>
            <p style="font-size: 18px; margin: 10px 0;"><strong>Amount Due:</strong> ${amount.toLocaleString()} UGX</p>
            <p style="margin: 10px 0;"><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
          </div>
          
          <p>Please make sure to submit your payment before the due date to avoid late fees.</p>
          
          <a href="${process.env.NEXTAUTH_URL}/dashboard/payments" class="button">Make Payment</a>
          
          <p>If you've already paid, please disregard this message.</p>
          <p>Best regards,<br>The EazyRent Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} EazyRent. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Printer, CheckCircle } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'

interface Payment {
  id: string
  transactionId: string
  amount: number
  currency: string
  method: string
  purpose: string
  paymentMonth: string | null
  paidAt: string
  status: string
  description: string | null
  tenant: {
    firstName: string
    lastName: string
    email: string
    phone: string | null
    nationalId: string | null
  }
  booking: {
    bookingNumber: string
    unit: {
      unitCode: string
      name: string | null
      property: {
        name: string
        city: string
        addressLine1: string
        addressLine2: string | null
        postalCode: string | null
      }
    }
  } | null
}

export default function ReceiptPage() {
  const params = useParams()
  const router = useRouter()
  const paymentId = params.id as string
  const componentRef = useRef<HTMLDivElement>(null)

  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayment()
  }, [paymentId])

  const fetchPayment = async () => {
    try {
      const res = await fetch(`/api/payments/${paymentId}/receipt`)
      if (!res.ok) throw new Error('Failed to fetch receipt')
      
      const data = await res.json()
      setPayment(data)
    } catch (error) {
      console.error('Error fetching receipt:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Receipt not found</p>
          <button onClick={() => router.back()} className="text-emerald-600 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatMonth = (monthString: string | null) => {
    if (!monthString) return 'N/A'
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Receipt */}
        <div ref={componentRef} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8 border-b border-gray-200 pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-gray-900">Payment Receipt</h1>
            </div>
            <p className="text-gray-600">Official Payment Confirmation</p>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Receipt Details</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Receipt Number</p>
                  <p className="font-mono font-semibold text-gray-900">{payment.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Date</p>
                  <p className="text-gray-900">{formatDate(payment.paidAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="text-gray-900">{payment.method}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Tenant Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-gray-900">{payment.tenant.firstName} {payment.tenant.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-900">{payment.tenant.email}</p>
                </div>
                {payment.tenant.phone && (
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-gray-900">{payment.tenant.phone}</p>
                  </div>
                )}
                {payment.tenant.nationalId && (
                  <div>
                    <p className="text-xs text-gray-500">National ID</p>
                    <p className="text-gray-900">{payment.tenant.nationalId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Property Details */}
          {payment.booking && (
            <div className="mb-8 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Property Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Property</p>
                  <p className="text-gray-900">{payment.booking.unit.property.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Unit</p>
                  <p className="text-gray-900">{payment.booking.unit.name || payment.booking.unit.unitCode}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-gray-900">
                    {payment.booking.unit.property.addressLine1}
                    {payment.booking.unit.property.addressLine2 && `, ${payment.booking.unit.property.addressLine2}`}
                    , {payment.booking.unit.property.city}
                    {payment.booking.unit.property.postalCode && ` ${payment.booking.unit.property.postalCode}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="bg-emerald-50 rounded-lg p-6 mb-8">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">Payment Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Purpose</span>
                <span className="font-semibold text-gray-900">{payment.purpose}</span>
              </div>
              {payment.paymentMonth && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Month</span>
                  <span className="font-semibold text-gray-900">{formatMonth(payment.paymentMonth)}</span>
                </div>
              )}
              {payment.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description</span>
                  <span className="font-semibold text-gray-900">{payment.description}</span>
                </div>
              )}
              <div className="border-t border-emerald-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Total Amount Paid</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {payment.amount.toLocaleString()} {payment.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200">
            <p>This is an official payment receipt.</p>
            <p className="mt-1">For any inquiries, please contact our support team.</p>
            <p className="mt-4 text-xs">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

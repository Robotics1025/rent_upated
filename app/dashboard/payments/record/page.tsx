'use client'

import { useState, useEffect, useRef } from 'react'
import { DollarSign, ArrowLeft, Printer, Download, CheckCircle, Building2, Calendar, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useReactToPrint } from 'react-to-print'
import { toast } from 'sonner'

export default function RecordPaymentPage() {
  const router = useRouter()
  const receiptRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [receipt, setReceipt] = useState<any>(null)
  const [balanceData, setBalanceData] = useState<any>(null)
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])

  const [formData, setFormData] = useState({
    tenantId: '',
    bookingId: '',
    amount: '',
    purpose: 'MONTHLY_RENT',
    method: 'CASH',
    description: '',
  })

  // Generate next 12 months for selection
  const upcomingMonths = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() + i)
    return {
      value: d.toISOString().slice(0, 7), // YYYY-MM
      label: d.toLocaleDateString('default', { month: 'long', year: 'numeric' })
    }
  })

  useEffect(() => {
    fetchTenants()
  }, [])

  useEffect(() => {
    if (formData.tenantId) {
      fetchTenantBookings(formData.tenantId)
      fetchTenantBalance(formData.tenantId)
    } else {
      setBalanceData(null)
      setSelectedMonths([])
    }
  }, [formData.tenantId])

  // Auto-calculate amount when months change
  useEffect(() => {
    if (balanceData?.monthlyRent && selectedMonths.length > 0 && formData.purpose === 'MONTHLY_RENT') {
      const totalAmount = selectedMonths.length * balanceData.monthlyRent
      setFormData(prev => ({ ...prev, amount: totalAmount.toString() }))
    }
  }, [selectedMonths, balanceData, formData.purpose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation for rent payments
    if (formData.purpose === 'MONTHLY_RENT' && selectedMonths.length === 0) {
      toast.error('Please select at least one billing month for rent payment')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/payments/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          paymentMonth: selectedMonths.length > 0 ? selectedMonths.join(', ') : formData.paymentMonth,
        }),
      })

      if (!res.ok) throw new Error('Failed to record payment')

      const payment = await res.json()

      // Re-fetch balance to get updated figures for receipt
      const balanceRes = await fetch(`/api/tenants/${formData.tenantId}/balance`)
      const updatedBalance = await balanceRes.json()

      setReceipt({ ...payment, balanceData: updatedBalance })
      toast.success('Payment recorded successfully! Receipt generated.')
    } catch (error) {
      console.error('Error recording payment:', error)
      toast.error('Failed to record payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  })

  if (receipt) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center gap-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
          <div>
            <h2 className="text-xl font-semibold text-green-900">Payment Recorded Successfully!</h2>
            <p className="text-green-700 mt-1">Transaction ID: {receipt.transactionId}</p>
          </div>
        </div>

        {/* Receipt */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8" ref={receiptRef}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-600">EazyRent</h1>
            <p className="text-gray-600 mt-2">Payment Receipt</p>
          </div>

          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Receipt Number</p>
                <p className="font-semibold text-gray-900">{receipt.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">{new Date(receipt.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold text-gray-900">{receipt.method.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-green-600">{receipt.status}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Received From:</h3>
            <p className="text-gray-700">{receipt.tenant?.firstName} {receipt.tenant?.lastName}</p>
            <p className="text-gray-600 text-sm">{receipt.tenant?.email}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Details:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Purpose:</span>
                <span className="font-medium text-gray-900">{receipt.purpose.replace('_', ' ')}</span>
              </div>
              {receipt.paymentMonth && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Billing Month(s):</span>
                  <span className="font-medium text-gray-900">{receipt.paymentMonth}</span>
                </div>
              )}
              {receipt.description && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Description:</span>
                  <span className="text-gray-900">{receipt.description}</span>
                </div>
              )}
              {receipt.booking && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Booking:</span>
                  <span className="text-gray-900">{receipt.booking.bookingNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Balance Details on Receipt */}
          {receipt.balanceData && (
            <div className="mb-6 border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Account Summary:</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Due (To Date)</p>
                  <p className="font-medium">{Number(receipt.balanceData.totalDue).toLocaleString()} {receipt.currency}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Paid</p>
                  <p className="font-medium text-green-600">{Number(receipt.balanceData.totalPaid).toLocaleString()} {receipt.currency}</p>
                </div>
                <div>
                  <p className="text-gray-500">Remaining Balance</p>
                  <p className={`font-bold ${receipt.balanceData.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Number(receipt.balanceData.balance).toLocaleString()} {receipt.currency}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-emerald-50 p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount Paid:</span>
              <span className="text-3xl font-bold text-emerald-600">
                {Number(receipt.amount).toLocaleString()} {receipt.currency}
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>Thank you for your payment!</p>
            <p className="mt-1">This is an official receipt from EazyRent Property Management</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Printer className="w-5 h-5" />
            Print Receipt
          </button>
          <button
            onClick={() => {
              setReceipt(null)
              setFormData({ ...formData, amount: '', description: '' })
              setSelectedMonths([])
              // Refresh balance for next payment
              if (formData.tenantId) fetchTenantBalance(formData.tenantId)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            Record Another Payment
          </button>
          <button
            onClick={() => router.push('/dashboard/payments')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View All Payments
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-gray-600 mt-1">Record a new payment and generate receipt</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Tenant *
            </label>
            <select
              name="tenantId"
              value={formData.tenantId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Choose a tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.firstName} {tenant.lastName} - {tenant.email}
                </option>
              ))}
            </select>
          </div>

          {/* Property & Balance Display */}
          {balanceData && (
            <div className="space-y-4">
              {/* Property Details Card */}
              {balanceData.tenancyDetails && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Property Details</h3>
                    <p className="text-blue-800 font-medium mt-1">
                      {balanceData.tenancyDetails.propertyName || 'Unknown Property'}
                    </p>
                    <p className="text-sm text-blue-600">
                      Unit: {balanceData.tenancyDetails.unitCode}
                    </p>
                  </div>
                </div>
              )}

              {/* Balance Card */}
              <div className={`p-4 rounded-lg border ${balanceData.balance > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-semibold ${balanceData.balance > 0 ? 'text-red-800' : 'text-green-800'}`}>
                      Current Balance: {Number(balanceData.balance).toLocaleString()} {balanceData.currency}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Monthly Rent: {Number(balanceData.monthlyRent).toLocaleString()} {balanceData.currency}
                    </p>
                    <p className="text-sm text-gray-600">
                      Months Active: {balanceData.tenancyDetails?.monthsActive || 0} | Paid: {balanceData.monthsPaid}
                    </p>
                  </div>
                  {balanceData.balance > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      {balanceData.monthsOverdue} Months Overdue
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {formData.tenantId && bookings.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Booking (Optional)
              </label>
              <select
                name="bookingId"
                value={formData.bookingId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">No booking</option>
                {bookings.map((booking: any) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.bookingNumber} - {booking.unit.unitCode}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (UGX) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {selectedMonths.length > 0 && balanceData?.monthlyRent && (
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                  {selectedMonths.length} months × {Number(balanceData.monthlyRent).toLocaleString()} = {Number(selectedMonths.length * balanceData.monthlyRent).toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Purpose *
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="MONTHLY_RENT">Monthly Rent</option>
                <option value="SECURITY_DEPOSIT">Security Deposit</option>
                <option value="BOOKING_DEPOSIT">Booking Deposit</option>
                <option value="UTILITIES">Utilities</option>
                <option value="MAINTENANCE_FEE">Maintenance Fee</option>
                <option value="LATE_FEE">Late Fee</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Multi-Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Months (Select multiple)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {upcomingMonths.map((month) => (
                <button
                  key={month.value}
                  type="button"
                  onClick={() => toggleMonth(month.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${selectedMonths.includes(month.value)
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200'
                    }`}
                >
                  {month.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {selectedMonths.length > 0 ? selectedMonths.join(', ') : 'None'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="CASH">Cash</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description / Notes
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Add any additional details here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                Recording...
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5" />
                Record Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

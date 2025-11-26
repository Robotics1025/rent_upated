'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { DollarSign, Search, Filter, Download, CheckCircle, XCircle, Clock, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface Payment {
  id: string
  transactionId: string
  amount: number
  currency: string
  purpose: string
  method: string
  status: string
  paidAt: string | null
  tenant: {
    firstName: string
    lastName: string
    email: string
  }
  booking: {
    bookingNumber: string
  } | null
  createdAt: string
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface Booking {
  id: string
  bookingNumber: string
  unit: {
    unitCode: string
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedTenant, setSelectedTenant] = useState('')
  const [paymentForm, setPaymentForm] = useState({
    tenantId: '',
    bookingId: '',
    amount: '',
    paymentMonth: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    purpose: 'RENT',
  })

  useEffect(() => {
    fetchPayments()
    fetchTenants()
  }, [])

  useEffect(() => {
    if (selectedTenant) {
      fetchBookings(selectedTenant)
    }
  }, [selectedTenant])

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments')
      const data = await res.json()
      setPayments(data)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants')
      const data = await res.json()
      setTenants(data)
    } catch (error) {
      console.error('Error fetching tenants:', error)
    }
  }

  const fetchBookings = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/bookings?tenantId=${tenantId}`)
      const data = await res.json()
      setBookings(data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/payments/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      })

      if (!res.ok) throw new Error('Failed to record payment')

      toast.success('Payment recorded successfully!')
      setShowPaymentDialog(false)
      setPaymentForm({
        tenantId: '',
        bookingId: '',
        amount: '',
        paymentMonth: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        purpose: 'RENT',
      })
      setSelectedTenant('')
      fetchPayments()
    } catch (error) {
      console.error('Error recording payment:', error)
      toast.error('Failed to record payment')
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPaymentForm(prev => ({ ...prev, [name]: value }))
    
    if (name === 'tenantId') {
      setSelectedTenant(value)
      setPaymentForm(prev => ({ ...prev, bookingId: '' }))
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const statusColors: any = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SUCCESS: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-purple-100 text-purple-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
  }

  const totalRevenue = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-1">Track and manage all transactions</p>
          </div>
          <button
            onClick={() => setShowPaymentDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalRevenue.toLocaleString()} UGX
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {payments.filter(p => p.status === 'SUCCESS').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {payments.filter(p => p.status === 'FAILED').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading payments...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Transaction ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tenant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Purpose</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{payment.transactionId}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{payment.tenant.firstName} {payment.tenant.lastName}</p>
                          <p className="text-sm text-gray-500">{payment.tenant.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{payment.purpose.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4 text-gray-900">{payment.method.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {Number(payment.amount).toLocaleString()} {payment.currency}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[payment.status]}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manual Payment Dialog */}
        {showPaymentDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Record Manual Payment</h2>
                  <button
                    onClick={() => setShowPaymentDialog(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Tenant *
                    </label>
                    <select
                      name="tenantId"
                      value={paymentForm.tenantId}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Choose a tenant...</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.firstName} {tenant.lastName} - {tenant.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTenant && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Booking (Optional)
                      </label>
                      <select
                        name="bookingId"
                        value={paymentForm.bookingId}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">No booking (general payment)</option>
                        {bookings.map((booking) => (
                          <option key={booking.id} value={booking.id}>
                            {booking.bookingNumber} - {booking.unit.unitCode}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Purpose *
                    </label>
                    <select
                      name="purpose"
                      value={paymentForm.purpose}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="RENT">Monthly Rent</option>
                      <option value="DEPOSIT">Security Deposit</option>
                      <option value="UTILITIES">Utilities</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (UGX) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={paymentForm.amount}
                      onChange={handleFormChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Month (Optional)
                    </label>
                    <input
                      type="month"
                      name="paymentMonth"
                      value={paymentForm.paymentMonth}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      name="paymentDate"
                      value={paymentForm.paymentDate}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      name="paymentMethod"
                      value={paymentForm.paymentMethod}
                      onChange={handleFormChange}
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
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

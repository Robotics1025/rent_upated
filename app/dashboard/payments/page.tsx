'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Search, Filter, Download, CheckCircle, XCircle, Clock, Plus, X, ArrowUpRight, ArrowDownRight, CreditCard, Wallet } from 'lucide-react'
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

import RecordPaymentModal from './components/RecordPaymentModal'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments', { cache: 'no-store' })
      const data = await res.json()
      console.log('Fetched payments:', data)
      setPayments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false)
    fetchPayments()
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const statusStyles: any = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-100',
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    FAILED: 'bg-red-50 text-red-700 border-red-100',
    REFUNDED: 'bg-purple-50 text-purple-700 border-purple-100',
    CANCELLED: 'bg-gray-50 text-gray-700 border-gray-100',
  }

  const totalRevenue = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
            </div>
            <p className="text-gray-300 text-lg max-w-xl">
              Monitor revenue streams, track transactions, and manage financial health with real-time insights.
            </p>
          </div>
          <button
            onClick={() => setShowPaymentDialog(true)}
            className="group flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all duration-300 shadow-lg shadow-emerald-900/20 font-semibold"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +12.5%
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-gray-500">UGX</span></h3>
        </div>

        <div className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
              Last 30 days
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500">Successful Transactions</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{payments.filter(p => p.status === 'SUCCESS').length}</h3>
        </div>

        <div className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              Action Needed
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500">Pending Payments</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').length}</h3>
        </div>

        <div className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
              Attention
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500">Failed Transactions</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{payments.filter(p => p.status === 'FAILED').length}</h3>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by transaction ID or tenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm appearance-none cursor-pointer text-gray-700 font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
              <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors shadow-sm">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Loading transactions...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No payments found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="group hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-sm text-gray-600">{payment.transactionId.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                          {payment.tenant.firstName[0]}{payment.tenant.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{payment.tenant.firstName} {payment.tenant.lastName}</p>
                          <p className="text-xs text-gray-500">{payment.tenant.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 capitalize">{payment.purpose.toLowerCase().replace('_', ' ')}</span>
                        <span className="text-xs text-gray-500 capitalize">{payment.method.toLowerCase().replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">
                        {Number(payment.amount).toLocaleString()}
                        <span className="text-xs font-normal text-gray-500 ml-1">{payment.currency}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[payment.status] || 'bg-gray-100 text-gray-800'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

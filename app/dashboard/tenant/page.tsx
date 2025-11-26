'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Home, Calendar, DollarSign, FileText, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface TenantStats {
  activeBookings: number
  totalPayments: number
  pendingPayments: number
  recentBookings: any[]
  recentPayments: any[]
}

export default function TenantDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<TenantStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchTenantStats()
    }
  }, [session])

  const fetchTenantStats = async () => {
    try {
      // Fetch tenant bookings
      const bookingsRes = await fetch(`/api/bookings?tenantId=${session?.user?.id}`)
      const bookings = await bookingsRes.json()

      // Fetch tenant payments
      const paymentsRes = await fetch(`/api/payments?tenantId=${session?.user?.id}`)
      const payments = await paymentsRes.json()

      const activeBookings = bookings.filter((b: any) => b.status === 'CONFIRMED').length
      const totalPayments = payments.length
      const pendingPayments = payments.filter((p: any) => p.status === 'PENDING').length

      setStats({
        activeBookings,
        totalPayments,
        pendingPayments,
        recentBookings: bookings.slice(0, 5),
        recentPayments: payments.slice(0, 5),
      })
    } catch (error) {
      console.error('Error fetching tenant stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">Here's an overview of your rentals and payments</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.activeBookings || 0}</p>
                <p className="text-sm text-emerald-600 mt-1">Current rentals</p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Home className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalPayments || 0}</p>
                <p className="text-sm text-blue-600 mt-1">All time</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.pendingPayments || 0}</p>
                <p className="text-sm text-orange-600 mt-1">Action needed</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Bookings</h2>
              <Link href="/dashboard/bookings" className="text-sm text-emerald-600 hover:text-emerald-700">
                View All
              </Link>
            </div>
            <div className="p-6">
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.unit?.unitCode}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No bookings yet</p>
                  <Link href="/properties" className="text-emerald-600 hover:text-emerald-700 text-sm mt-2 inline-block">
                    Browse available properties
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
              <Link href="/dashboard/payments" className="text-sm text-emerald-600 hover:text-emerald-700">
                View All
              </Link>
            </div>
            <div className="p-6">
              {stats?.recentPayments && stats.recentPayments.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentPayments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{payment.purpose?.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{payment.amount?.toLocaleString()} UGX</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 
                          payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No payment history</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/properties"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-center"
            >
              <Home className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-700">Browse Properties</p>
            </Link>
            
            <Link
              href="/dashboard/bookings"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-700">My Bookings</p>
            </Link>
            
            <Link
              href="/dashboard/payments"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
            >
              <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-700">Payment History</p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

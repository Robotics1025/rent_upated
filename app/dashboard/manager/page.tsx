'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Building2, Home, DollarSign, Users, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

interface ManagerStats {
  properties: number
  units: number
  tenants: number
  revenue: number
  occupancyRate: number
  recentBookings: any[]
  recentPayments: any[]
}

export default function ManagerDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<ManagerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchManagerStats()
    }
  }, [session])

  const fetchManagerStats = async () => {
    try {
      const res = await fetch('/api/manager/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching manager stats:', error)
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
          <p className="text-gray-600 mt-1">Here's what's happening with your properties today</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Properties</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.properties || 0}</p>
                <p className="text-sm text-emerald-600 mt-1">Active</p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Units</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.units || 0}</p>
                <p className="text-sm text-blue-600 mt-1">{stats?.occupancyRate || 0}% Occupied</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Home className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tenants</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.tenants || 0}</p>
                <p className="text-sm text-purple-600 mt-1">Current</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {(stats?.revenue || 0).toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +12.5%
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <Link href="/dashboard/bookings" className="text-sm text-emerald-600 hover:text-emerald-700">
                View All
              </Link>
            </div>
            <div className="p-6">
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentBookings.slice(0, 5).map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.tenant?.firstName} {booking.tenant?.lastName}</p>
                          <p className="text-sm text-gray-500">{booking.unit?.unitCode}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No recent bookings</p>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
              <Link href="/dashboard/payments" className="text-sm text-emerald-600 hover:text-emerald-700">
                View All
              </Link>
            </div>
            <div className="p-6">
              {stats?.recentPayments && stats.recentPayments.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentPayments.slice(0, 5).map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{payment.tenant?.firstName} {payment.tenant?.lastName}</p>
                          <p className="text-sm text-gray-500">{payment.purpose?.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{payment.amount?.toLocaleString()} UGX</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No recent payments</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/properties/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-center"
            >
              <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-700">Add Property</p>
            </Link>
            
            <Link
              href="/dashboard/units/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Home className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-700">Add Unit</p>
            </Link>
            
            <Link
              href="/dashboard/payments/record"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
            >
              <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-700">Record Payment</p>
            </Link>
            
            <Link
              href="/dashboard/bookings"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
            >
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-700">View Bookings</p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

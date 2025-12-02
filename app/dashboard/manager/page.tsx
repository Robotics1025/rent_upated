'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Building2, Home, DollarSign, Users, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'
import MicrochipLoader from '@/app/components/MicrochipLoader'
import { toast } from 'sonner'

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
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<ManagerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !session?.user?.id) {
      setLoading(false)
      return
    }

    fetchManagerStats()
  }, [session, status])

  const fetchManagerStats = async () => {
    try {
      const res = await fetch('/api/manager/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching manager stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <MicrochipLoader text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Premium Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {session?.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-emerald-100 mt-2 text-lg">Here's what's happening with your properties today</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">My Properties</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-emerald-600 transition-colors">{stats?.properties || 0}</p>
              <p className="text-sm text-emerald-600 mt-1 font-medium">Active</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Units</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">{stats?.units || 0}</p>
              <p className="text-sm text-blue-600 mt-1 font-medium">{stats?.occupancyRate || 0}% Occupied</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <Home className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Tenants</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-purple-600 transition-colors">{stats?.tenants || 0}</p>
              <p className="text-sm text-purple-600 mt-1 font-medium">Current</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-green-600 transition-colors">
                {(stats?.revenue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1 font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12.5%
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
            <Link href="/dashboard/bookings" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
              View All
            </Link>
          </div>
          <div className="p-6">
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBookings.slice(0, 5).map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{booking.tenant?.firstName} {booking.tenant?.lastName}</p>
                        <p className="text-sm text-gray-500 font-medium">{booking.unit?.unitCode}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent bookings</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Recent Payments</h2>
            <Link href="/dashboard/payments" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
              View All
            </Link>
          </div>
          <div className="p-6">
            {stats?.recentPayments && stats.recentPayments.length > 0 ? (
              <div className="space-y-4">
                {stats.recentPayments.slice(0, 5).map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{payment.tenant?.firstName} {payment.tenant?.lastName}</p>
                        <p className="text-sm text-gray-500 font-medium">{payment.purpose?.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{payment.amount?.toLocaleString()} UGX</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent payments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/dashboard/properties/new"
            className="group p-6 border border-gray-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gray-50 hover:bg-white"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Add Property</p>
            <p className="text-sm text-gray-500 mt-1">Register a new property</p>
          </Link>

          <Link
            href="/dashboard/units/new"
            className="group p-6 border border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gray-50 hover:bg-white"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Add Unit</p>
            <p className="text-sm text-gray-500 mt-1">Create a new unit</p>
          </Link>

          <Link
            href="/dashboard/payments/record"
            className="group p-6 border border-gray-200 rounded-2xl hover:border-green-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gray-50 hover:bg-white"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">Record Payment</p>
            <p className="text-sm text-gray-500 mt-1">Log a new transaction</p>
          </Link>

          <Link
            href="/dashboard/bookings"
            className="group p-6 border border-gray-200 rounded-2xl hover:border-purple-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gray-50 hover:bg-white"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">View Bookings</p>
            <p className="text-sm text-gray-500 mt-1">Manage reservations</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

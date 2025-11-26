'use client'

import DashboardLayout from '@/app/components/DashboardLayout'
import { Building2, Users, FileText, DollarSign, TrendingUp, TrendingDown, Home, Calendar } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Properties', value: '24', change: '+12%', icon: Building2, trend: 'up' },
    { name: 'Total Units', value: '156', change: '+8%', icon: Home, trend: 'up' },
    { name: 'Active Bookings', value: '89', change: '-3%', icon: FileText, trend: 'down' },
    { name: 'Monthly Revenue', value: 'UGX 45M', change: '+18%', icon: DollarSign, trend: 'up' },
  ]

  const recentBookings = [
    { id: '1', tenant: 'John Doe', property: 'Downtown Apartments', unit: 'A-101', date: '2025-11-20', status: 'confirmed' },
    { id: '2', tenant: 'Jane Smith', property: 'Garden Villas', unit: 'B-205', date: '2025-11-19', status: 'pending' },
    { id: '3', tenant: 'Mike Johnson', property: 'Downtown Apartments', unit: 'A-203', date: '2025-11-18', status: 'confirmed' },
    { id: '4', tenant: 'Sarah Williams', property: 'Garden Villas', unit: 'B-104', date: '2025-11-17', status: 'confirmed' },
  ]

  return (
    <DashboardLayout userRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your properties.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <stat.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
            <p className="text-sm text-gray-600 mt-1">Latest booking requests and confirmations</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{booking.tenant}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.property}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {booking.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-emerald-600 hover:text-emerald-700 font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 text-center">
            <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
              View all bookings →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <Building2 className="h-10 w-10 mb-4 opacity-80" />
            <h3 className="text-lg font-semibold mb-2">View Properties</h3>
            <p className="text-emerald-100 text-sm mb-4">Manage all properties and units</p>
            <button 
              onClick={() => window.location.href = '/dashboard/properties'}
              className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition"
            >
              View Properties
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <Home className="h-10 w-10 mb-4 opacity-80" />
            <h3 className="text-lg font-semibold mb-2">View Units</h3>
            <p className="text-blue-100 text-sm mb-4">Manage all rentable units</p>
            <button 
              onClick={() => window.location.href = '/dashboard/units'}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              View Units
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <Users className="h-10 w-10 mb-4 opacity-80" />
            <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
            <p className="text-purple-100 text-sm mb-4">View and manage all users</p>
            <button 
              onClick={() => window.location.href = '/dashboard/users'}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition"
            >
              View Users
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

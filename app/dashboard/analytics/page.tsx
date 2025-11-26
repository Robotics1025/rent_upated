'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, Calendar, Download, Building2, Users } from 'lucide-react'

interface AnalyticsData {
  monthlyRevenue: { [key: string]: number }
  revenueByProperty: { name: string; amount: number }[]
  paymentMethods: { [key: string]: number }
  occupancyByProperty: { name: string; occupied: number; total: number }[]
  topTenants: { name: string; email: string; amount: number }[]
  totalRevenue: number
  totalTransactions: number
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics')
      if (!res.ok) throw new Error('Failed to fetch analytics')
      
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMonthlyData = () => {
    if (!analytics) return []
    
    return Object.entries(analytics.monthlyRevenue)
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  const formatPaymentMethodsData = () => {
    if (!analytics) return []
    
    return Object.entries(analytics.paymentMethods).map(([method, amount]) => ({
      name: method.replace('_', ' '),
      value: amount,
    }))
  }

  const formatOccupancyData = () => {
    if (!analytics) return []
    
    return analytics.occupancyByProperty.map(item => ({
      name: item.name,
      occupied: item.occupied,
      available: item.total - item.occupied,
      rate: ((item.occupied / item.total) * 100).toFixed(1),
    }))
  }

  const downloadReport = () => {
    if (!analytics) return

    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: analytics.totalRevenue,
        totalTransactions: analytics.totalTransactions,
      },
      monthlyRevenue: analytics.monthlyRevenue,
      revenueByProperty: analytics.revenueByProperty,
      paymentMethods: analytics.paymentMethods,
      occupancyByProperty: analytics.occupancyByProperty,
      topTenants: analytics.topTenants,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load analytics</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-1">Performance metrics and insights</p>
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Revenue (6 Months)</p>
                <p className="text-3xl font-bold mt-2">{analytics.totalRevenue.toLocaleString()} UGX</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Transactions</p>
                <p className="text-3xl font-bold mt-2">{analytics.totalTransactions}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Revenue Trend (Last 6 Months)</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} UGX`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Property */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Revenue by Property</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.revenueByProperty}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} UGX`} />
                <Legend />
                <Bar dataKey="amount" fill="#3b82f6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formatPaymentMethodsData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formatPaymentMethodsData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} UGX`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Occupancy by Property</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatOccupancyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="occupied" stackId="a" fill="#10b981" name="Occupied" />
              <Bar dataKey="available" stackId="a" fill="#e5e7eb" name="Available" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Tenants */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Top Tenants by Payment Amount</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tenant Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Paid</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topTenants.map((tenant, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">#{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{tenant.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{tenant.email}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-emerald-600 text-right">
                      {tenant.amount.toLocaleString()} UGX
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

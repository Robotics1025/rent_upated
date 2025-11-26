'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Home, Plus, Search, Filter, Edit, Trash2, Eye, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Unit {
  id: string
  unitCode: string
  name: string
  price: number
  currency: string
  bedrooms: number
  bathrooms: number
  status: string
  property: {
    id: string
    name: string
    city: string
  }
  files: { fileUrl: string }[]
}

export default function UnitsPage() {
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      const res = await fetch('/api/units')
      const data = await res.json()
      setUnits(data)
    } catch (error) {
      console.error('Error fetching units:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this unit?')) return
    
    try {
      const res = await fetch(`/api/units/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Unit deleted successfully!')
        fetchUnits()
      } else {
        toast.error('Failed to delete unit')
      }
    } catch (error) {
      console.error('Error deleting unit:', error)
      toast.error('Error deleting unit')
    }
  }

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.property.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || unit.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const statusColors: any = {
    AVAILABLE: 'bg-green-100 text-green-700',
    BOOKED: 'bg-blue-100 text-blue-700',
    OCCUPIED: 'bg-purple-100 text-purple-700',
    MAINTENANCE: 'bg-yellow-100 text-yellow-700',
    UNAVAILABLE: 'bg-gray-100 text-gray-700',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Units</h1>
            <p className="text-gray-600 mt-1">Manage property units and rooms</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/units/new')}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Unit
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{units.length}</p>
              </div>
              <Home className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {units.filter(u => u.status === 'AVAILABLE').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Booked</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {units.filter(u => u.status === 'BOOKED').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {units.filter(u => u.status === 'OCCUPIED').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {units.filter(u => u.status === 'MAINTENANCE').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
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
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="BOOKED">Booked</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading units...</p>
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No units found</p>
              <button
                onClick={() => router.push('/dashboard/units/new')}
                className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Add your first unit
              </button>
            </div>
          ) : (
            filteredUnits.map((unit) => (
              <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Unit Image */}
                <div className="relative h-48">
                  {unit.files.length > 0 ? (
                    <img
                      src={unit.files[0].fileUrl}
                      alt={unit.name || unit.unitCode}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Home className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${statusColors[unit.status]}`}>
                    {unit.status}
                  </span>
                </div>

                {/* Unit Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {unit.name || `Unit ${unit.unitCode}`}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{unit.property.name}</p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <span>{unit.bedrooms} beds</span>
                    <span>•</span>
                    <span>{unit.bathrooms} baths</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <span className="text-xl font-bold text-gray-900">
                        {unit.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">{unit.currency}/month</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/units/${unit.id}`)}
                      className="flex-1 px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/units/${unit.id}/edit`)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(unit.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

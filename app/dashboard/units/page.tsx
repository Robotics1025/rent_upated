'use client'

import { useState, useEffect } from 'react'
import { Home, Plus, Search, Filter, Edit, Trash2, Eye, DollarSign } from 'lucide-react'
import MicrochipLoader from '@/app/components/MicrochipLoader'
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
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Units</h1>
            <p className="text-emerald-100 mt-2 text-lg">Manage and monitor your property units</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/units/new')}
            className="group flex items-center gap-2 bg-white text-emerald-900 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <div className="bg-emerald-100 rounded-lg p-1 group-hover:bg-emerald-200 transition-colors">
              <Plus className="w-5 h-5 text-emerald-700" />
            </div>
            Add Unit
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Units</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-emerald-600 transition-colors">{units.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
              <Home className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Available</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-green-600 transition-colors">
                {units.filter(u => u.status === 'AVAILABLE').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Booked</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">
                {units.filter(u => u.status === 'BOOKED').length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Occupied</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-purple-600 transition-colors">
                {units.filter(u => u.status === 'OCCUPIED').length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Maintenance</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-yellow-600 transition-colors">
                {units.filter(u => u.status === 'MAINTENANCE').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search units by code, property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white appearance-none cursor-pointer min-w-[180px]"
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
      </div>

      {/* Premium Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <MicrochipLoader text="Loading your units..." />
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No units found</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              We couldn't find any units matching your search. Try adjusting your filters or add a new unit.
            </p>
            <button
              onClick={() => router.push('/dashboard/units/new')}
              className="mt-6 text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
            >
              Add your first unit
            </button>
          </div>
        ) : (
          filteredUnits.map((unit) => (
            <div key={unit.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* Unit Image */}
              <div className="relative h-56 overflow-hidden">
                {unit.files.length > 0 ? (
                  <img
                    src={unit.files[0].fileUrl}
                    alt={unit.name || unit.unitCode}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                    <Home className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <span className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${statusColors[unit.status]}`}>
                  {unit.status}
                </span>

                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => router.push(`/dashboard/units/${unit.id}/view`)}
                    className="w-full bg-white/90 backdrop-blur-sm text-gray-900 py-2 rounded-lg font-medium hover:bg-white transition-colors shadow-lg"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Unit Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {unit.name || `Unit ${unit.unitCode}`}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Home className="w-3 h-3" />
                      {unit.property.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      {unit.currency} {unit.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">/month</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-t border-gray-50 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="p-1.5 bg-gray-100 rounded-md">
                      <span className="font-bold text-gray-900">{unit.bedrooms}</span>
                    </div>
                    <span>Beds</span>
                  </div>
                  <div className="w-px h-8 bg-gray-100"></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="p-1.5 bg-gray-100 rounded-md">
                      <span className="font-bold text-gray-900">{unit.bathrooms}</span>
                    </div>
                    <span>Baths</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 pt-2">
                  <button
                    onClick={() => router.push(`/dashboard/units/${unit.id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium group/edit"
                  >
                    <Edit className="w-4 h-4 group-hover/edit:scale-110 transition-transform" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(unit.id)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium group/delete"
                  >
                    <Trash2 className="w-4 h-4 group-hover/delete:scale-110 transition-transform" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, Search, Filter, Edit, Trash2, Eye, MapPin, Home, Grid, List, TrendingUp } from 'lucide-react'
import MicrochipLoader from '@/app/components/MicrochipLoader'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Property {
  id: string
  name: string
  propertyType: string
  tenancyType: string
  ownerName: string
  addressLine1: string
  city: string
  region: string
  isActive: boolean
  units: { id: string }[]
  files: { fileUrl: string; category: string }[]
}

export default function PropertiesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Only managers and admins can access this page
  // (MEMBER role no longer has dashboard access)


  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties')
      const data = await res.json()
      setProperties(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property? This will also delete all units.')) return

    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Property deleted successfully!')
        fetchProperties()
      } else {
        toast.error('Failed to delete property')
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      toast.error('Error deleting property')
    }
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || property.propertyType === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Properties</h1>
              <p className="text-emerald-50">Manage and monitor your property portfolio</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/properties/new')}
              className="group flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Add Property
            </button>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards with Hover Effects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-gradient-to-br from-white to-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 mb-1">Total Properties</p>
              <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
              <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Portfolio</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-green-50 p-6 rounded-2xl shadow-sm border border-green-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-gray-900">
                {properties.filter(p => p.isActive).length}
              </p>
              <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Operating</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Home className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Units</p>
              <p className="text-3xl font-bold text-gray-900">
                {properties.reduce((sum, p) => sum + p.units.length, 0)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-blue-600 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Locations</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Inactive</p>
              <p className="text-3xl font-bold text-gray-900">
                {properties.filter(p => !p.isActive).length}
              </p>
              <div className="flex items-center gap-1 mt-2 text-gray-600 text-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>On Hold</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters with Modern Design */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
              >
                <option value="all">All Types</option>
                <option value="APARTMENT_BUILDING">Apartment Building</option>
                <option value="HOUSE">House</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="HOSTEL">Hostel</option>
                <option value="COMMERCIAL_BUILDING">Commercial Building</option>
                <option value="MIXED_USE">Mixed Use</option>
              </select>
            </div>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Display */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-20 text-center">
          <MicrochipLoader text="Loading your properties..." />
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-20 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600 mb-6">Start building your portfolio by adding your first property</p>
          <button
            onClick={() => router.push('/dashboard/properties/new')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Your First Property
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              {/* Property Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
                {property.files.find(f => f.category === 'PROPERTY_IMAGE') ? (
                  <img
                    src={property.files.find(f => f.category === 'PROPERTY_IMAGE')?.fileUrl}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-emerald-300" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${property.isActive
                    ? 'bg-green-500/90 text-white shadow-lg'
                    : 'bg-gray-500/90 text-white'
                    }`}>
                    {property.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>
                {/* Units Badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-emerald-600 rounded-full text-sm font-bold shadow-lg">
                    {property.units.length} Units
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  {property.name}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm">{property.city}, {property.region}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{property.propertyType.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Home className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">{property.tenancyType.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-3">Owner: <span className="font-semibold text-gray-700">{property.ownerName}</span></p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/properties/${property.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all duration-300 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
                      className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {property.files.find(f => f.category === 'PROPERTY_IMAGE') ? (
                          <img
                            src={property.files.find(f => f.category === 'PROPERTY_IMAGE')?.fileUrl}
                            alt={property.name}
                            className="w-14 h-14 rounded-xl object-cover shadow-md"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                            <Building2 className="w-7 h-7 text-emerald-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{property.name}</p>
                          <p className="text-sm text-gray-500">{property.tenancyType.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">
                        {property.propertyType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium">{property.city}, {property.region}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">{property.ownerName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-bold">
                        {property.units.length} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${property.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {property.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/properties/${property.id}`)}
                          className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-300 hover:scale-110"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Home, ArrowLeft, Building2, Users, DollarSign, Calendar, Edit, MapPin, Bed, Bath, Maximize, CheckCircle } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Unit {
  id: string
  unitCode: string
  name: string
  price: number
  deposit: number | null
  bedrooms: number | null
  bathrooms: number | null
  squareMeters: number | null
  floor: number | null
  isFurnished: boolean
  hasBalcony: boolean
  hasWifi: boolean
  hasAC: boolean
  hasPet: boolean
  hasParking: boolean
  description: string | null
  status: string
  property: {
    id: string
    name: string
    city: string
    addressLine1: string
  }
  files: { id: string, fileUrl: string }[]
  tenancies?: any[]
}

export default function ViewUnitPage() {
  const router = useRouter()
  const params = useParams()
  const unitId = params.id as string

  const [loading, setLoading] = useState(true)
  const [unit, setUnit] = useState<Unit | null>(null)

  useEffect(() => {
    if (unitId) {
      fetchUnit()
    }
  }, [unitId])

  const fetchUnit = async () => {
    try {
      const res = await fetch(`/api/units/${unitId}`)
      if (!res.ok) throw new Error('Failed to fetch unit')
      
      const data = await res.json()
      setUnit(data)
    } catch (error) {
      console.error('Error fetching unit:', error)
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

  if (!unit) {
    return null
  }

  const currentTenancy = unit.tenancies && unit.tenancies.length > 0 ? unit.tenancies[0] : null

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{unit.name || unit.unitCode}</h1>
              <p className="text-gray-600 mt-1">{unit.property.name}</p>
            </div>
          </div>
          <Link
            href={`/dashboard/units/${unitId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Unit
          </Link>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            unit.status === 'OCCUPIED' 
              ? 'bg-red-100 text-red-700' 
              : unit.status === 'AVAILABLE'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {unit.status}
          </span>
          <span className="text-sm text-gray-600">Unit Code: {unit.unitCode}</span>
        </div>

        {/* Images */}
        {unit.files.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {unit.files.map((file, index) => (
              <img
                key={file.id}
                src={file.fileUrl}
                alt={`Unit ${index + 1}`}
                className="w-full h-64 object-cover rounded-xl border border-gray-200"
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Property Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{unit.property.addressLine1}, {unit.property.city}</span>
                </div>
              </div>
            </div>

            {/* Unit Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {unit.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-emerald-600" />
                    <span className="text-gray-700">{unit.bedrooms} Bedrooms</span>
                  </div>
                )}
                {unit.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{unit.bathrooms} Bathrooms</span>
                  </div>
                )}
                {unit.squareMeters && (
                  <div className="flex items-center gap-2">
                    <Maximize className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">{unit.squareMeters} m²</span>
                  </div>
                )}
                {unit.floor && (
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-orange-600" />
                    <span className="text-gray-700">Floor {unit.floor}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {unit.isFurnished && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-gray-700">Furnished</span>
                  </div>
                )}
                {unit.hasBalcony && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-gray-700">Balcony</span>
                  </div>
                )}
                {unit.hasWifi && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-gray-700">WiFi</span>
                  </div>
                )}
                {unit.hasAC && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-gray-700">Air Conditioning</span>
                  </div>
                )}
                {unit.hasPet && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-gray-700">Pets Allowed</span>
                  </div>
                )}
                {unit.hasParking && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-gray-700">Parking</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {unit.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{unit.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Monthly Rent</p>
                  <p className="text-2xl font-bold text-emerald-600">{unit.price.toLocaleString()} UGX</p>
                </div>
                {unit.deposit && (
                  <div>
                    <p className="text-sm text-gray-600">Security Deposit</p>
                    <p className="text-lg font-semibold text-gray-900">{unit.deposit.toLocaleString()} UGX</p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Tenant */}
            {currentTenancy && (
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                <h2 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Current Tenant
                </h2>
                <div className="space-y-2">
                  <p className="font-medium text-emerald-900">
                    {currentTenancy.tenant.firstName} {currentTenancy.tenant.lastName}
                  </p>
                  <p className="text-sm text-emerald-700">{currentTenancy.tenant.email}</p>
                  {currentTenancy.tenant.phone && (
                    <p className="text-sm text-emerald-700">{currentTenancy.tenant.phone}</p>
                  )}
                  <div className="pt-2 border-t border-emerald-200">
                    <p className="text-xs text-emerald-600">Since: {new Date(currentTenancy.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

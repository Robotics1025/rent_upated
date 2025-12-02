'use client'

import { useState, useEffect } from 'react'
import { Home, ArrowLeft, Building2, Users, DollarSign, Calendar, Edit, MapPin, Bed, Bath, Maximize, CheckCircle, Wifi, Wind, Car, PawPrint, Sofa, Sparkles } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import MicrochipLoader from '@/app/components/MicrochipLoader'

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
  const [selectedImage, setSelectedImage] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (unitId) {
      fetchUnit()
    }
  }, [unitId])

  const fetchUnit = async () => {
    try {
      const res = await fetch(`/api/units/${unitId}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Unit not found')
        } else {
          setError('Failed to fetch unit')
        }
        return
      }

      const data = await res.json()
      setUnit(data)
    } catch (error) {
      console.error('Error fetching unit:', error)
      setError('An error occurred while loading the unit')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <MicrochipLoader text="Loading unit details..." />
      </div>
    )
  }

  if (error || !unit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {error || 'Unit Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The unit you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/dashboard/units')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Units
          </button>
        </div>
      </div>
    )
  }

  const currentTenancy = unit.tenancies && unit.tenancies.length > 0 ? unit.tenancies[0] : null

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{unit.name || unit.unitCode}</h1>
              <div className="flex items-center gap-3 text-emerald-50">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>{unit.property.name}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{unit.property.city}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm shadow-lg ${unit.status === 'OCCUPIED'
              ? 'bg-red-500/90 text-white'
              : unit.status === 'AVAILABLE'
                ? 'bg-green-500/90 text-white'
                : 'bg-yellow-500/90 text-white'
              }`}>
              {unit.status === 'OCCUPIED' ? '● Occupied' : unit.status === 'AVAILABLE' ? '● Available' : '○ ' + unit.status}
            </span>
            <Link
              href={`/dashboard/units/${unitId}/edit`}
              className="flex items-center gap-2 bg-white text-emerald-600 px-6 py-2.5 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold"
            >
              <Edit className="w-4 h-4" />
              Edit Unit
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Images Gallery */}
      {unit.files.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200">
            <img
              src={unit.files[selectedImage]?.fileUrl}
              alt={`Unit ${selectedImage + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Image counter */}
            <div className="absolute top-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-sm text-white rounded-xl font-semibold">
              {selectedImage + 1} / {unit.files.length}
            </div>
          </div>
          {unit.files.length > 1 && (
            <div className="p-4 bg-gray-50">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {unit.files.map((file, index) => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === index
                      ? 'border-emerald-500 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-emerald-300'
                      }`}
                  >
                    <img
                      src={file.fileUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pricing Card */}
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-sm border border-emerald-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Pricing</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-emerald-100">
                <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                <p className="text-3xl font-bold text-emerald-600">{unit.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">UGX / month</p>
              </div>
              {unit.deposit && (
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Security Deposit</p>
                  <p className="text-2xl font-bold text-gray-900">{unit.deposit.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">UGX</p>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Features</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {unit.bedrooms && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bed className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{unit.bedrooms}</p>
                    <p className="text-xs text-gray-600">Bedrooms</p>
                  </div>
                </div>
              )}
              {unit.bathrooms && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bath className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{unit.bathrooms}</p>
                    <p className="text-xs text-gray-600">Bathrooms</p>
                  </div>
                </div>
              )}
              {unit.squareMeters && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Maximize className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{unit.squareMeters}</p>
                    <p className="text-xs text-gray-600">m²</p>
                  </div>
                </div>
              )}
              {unit.floor && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{unit.floor}</p>
                    <p className="text-xs text-gray-600">Floor</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Amenities</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {unit.isFurnished && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <Sofa className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium text-gray-900">Furnished</span>
                </div>
              )}
              {unit.hasBalcony && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <Home className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Balcony</span>
                </div>
              )}
              {unit.hasWifi && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <Wifi className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">WiFi</span>
                </div>
              )}
              {unit.hasAC && (
                <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                  <Wind className="w-5 h-5 text-cyan-600" />
                  <span className="font-medium text-gray-900">Air Conditioning</span>
                </div>
              )}
              {unit.hasPet && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <PawPrint className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-900">Pets Allowed</span>
                </div>
              )}
              {unit.hasParking && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <Car className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Parking</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {unit.description && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{unit.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Property Details</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Property Name</p>
                <p className="font-bold text-gray-900">{unit.property.name}</p>
              </div>
              <div className="pt-3 border-t border-blue-100">
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                  <p className="font-medium text-gray-900">{unit.property.addressLine1}, {unit.property.city}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-blue-100">
                <p className="text-sm text-gray-600 mb-1">Unit Code</p>
                <p className="font-mono font-bold text-gray-900">{unit.unitCode}</p>
              </div>
            </div>
          </div>

          {/* Current Tenant */}
          {currentTenancy && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-lg font-bold text-emerald-900">Current Tenant</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-emerald-700 mb-1">Name</p>
                  <p className="font-bold text-emerald-900 text-lg">
                    {currentTenancy.tenant.firstName} {currentTenancy.tenant.lastName}
                  </p>
                </div>
                <div className="pt-3 border-t border-emerald-200">
                  <p className="text-sm text-emerald-700 mb-1">Contact</p>
                  <p className="text-sm text-emerald-800 font-medium">{currentTenancy.tenant.email}</p>
                  {currentTenancy.tenant.phone && (
                    <p className="text-sm text-emerald-800 font-medium mt-1">{currentTenancy.tenant.phone}</p>
                  )}
                </div>
                <div className="pt-3 border-t border-emerald-200">
                  <p className="text-sm text-emerald-700 mb-1">Move-in Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <p className="font-semibold text-emerald-900">
                      {new Date(currentTenancy.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

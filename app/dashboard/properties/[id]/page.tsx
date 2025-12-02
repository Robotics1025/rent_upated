'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, MapPin, User, Phone, Mail, Edit, Trash2, ArrowLeft, Home, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react'
import MicrochipLoader from '@/app/components/MicrochipLoader'
import { toast } from 'sonner'

interface Property {
    id: string
    name: string
    description: string
    propertyType: string
    tenancyType: string
    ownerName: string
    ownerEmail: string
    ownerPhone: string
    addressLine1: string
    city: string
    region: string
    isActive: boolean
    units: any[]
    files: { fileUrl: string; category: string }[]
    createdAt: string
}

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const [property, setProperty] = useState<Property | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProperty()
    }, [id])

    const fetchProperty = async () => {
        try {
            const res = await fetch(`/api/properties/${id}`)
            if (res.ok) {
                const data = await res.json()
                setProperty(data)
            } else {
                toast.error('Failed to fetch property details')
                router.push('/dashboard/properties')
            }
        } catch (error) {
            console.error('Error fetching property:', error)
            toast.error('Error loading property')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) return

        try {
            const res = await fetch(`/api/properties/${id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                toast.success('Property deleted successfully')
                router.push('/dashboard/properties')
            } else {
                toast.error('Failed to delete property')
            }
        } catch (error) {
            console.error('Error deleting property:', error)
            toast.error('Error deleting property')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <MicrochipLoader text="Loading property details..." />
            </div>
        )
    }

    if (!property) return null

    const activeUnits = property.units.filter(u => u.status === 'OCCUPIED').length
    const occupancyRate = property.units.length > 0 ? Math.round((activeUnits / property.units.length) * 100) : 0

    return (
        <div className="space-y-8">
            {/* Navigation */}
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-500 hover:text-emerald-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Properties
            </button>

            {/* Hero Section */}
            <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl group">
                {property.files.find(f => f.category === 'PROPERTY_IMAGE') ? (
                    <img
                        src={property.files.find(f => f.category === 'PROPERTY_IMAGE')?.fileUrl}
                        alt={property.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-teal-900 flex items-center justify-center">
                        <Building2 className="w-24 h-24 text-white/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${property.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                                    }`}>
                                    {property.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
                                    {property.propertyType.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">{property.name}</h1>
                            <div className="flex items-center gap-2 text-white/80">
                                <MapPin className="w-5 h-5" />
                                <span className="text-lg">{property.addressLine1}, {property.city}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push(`/dashboard/properties/${id}/edit`)}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                            >
                                <Edit className="w-5 h-5" />
                                Edit Property
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-6 py-3 bg-red-500/80 hover:bg-red-600/90 backdrop-blur-md text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Total Units</p>
                            <p className="text-3xl font-bold text-gray-900">{property.units.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Occupancy</p>
                            <p className="text-3xl font-bold text-emerald-600">{occupancyRate}%</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Tenancy</p>
                            <p className="text-lg font-bold text-gray-900 truncate" title={property.tenancyType}>
                                {property.tenancyType.split('_')[0]}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Created</p>
                            <p className="text-lg font-bold text-gray-900">
                                {new Date(property.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About this Property</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {property.description || 'No description provided for this property.'}
                        </p>
                    </div>

                    {/* Units List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Units</h2>
                            <button
                                onClick={() => router.push('/dashboard/units/new')}
                                className="text-sm text-emerald-600 font-semibold hover:underline"
                            >
                                + Add Unit
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {property.units.length > 0 ? (
                                property.units.map((unit: any) => (
                                    <div key={unit.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Home className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{unit.unitCode}</p>
                                                <p className="text-sm text-gray-500">{unit.bedrooms} Bed • {unit.bathrooms} Bath</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${unit.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                                    unit.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {unit.status}
                                            </span>
                                            <p className="font-bold text-gray-900">
                                                {parseInt(unit.price).toLocaleString()} {unit.currency}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No units added yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Owner Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Owner Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-semibold text-gray-900">{property.ownerName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-semibold text-gray-900 break-all">{property.ownerEmail || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-semibold text-gray-900">{property.ownerPhone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Map Placeholder */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
                        <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                            <MapPin className="w-8 h-8 text-gray-400 mb-2" />
                            <div className="absolute inset-0 bg-gray-200/50 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-500">Map View Coming Soon</span>
                            </div>
                        </div>
                        <p className="mt-4 text-gray-600 text-sm">
                            {property.addressLine1}<br />
                            {property.city}, {property.region}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

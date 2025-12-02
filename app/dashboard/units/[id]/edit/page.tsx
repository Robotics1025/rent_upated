'use client'

import { useState, useEffect } from 'react'
import { Home, ArrowLeft, Building2, Upload, X, Image as ImageIcon, Users, UserPlus, UserMinus, DollarSign, Calendar, Plus, CheckCircle2, AlertCircle } from 'lucide-react'
import MicrochipLoader from '@/app/components/MicrochipLoader'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'

interface Payment {
  id: string
  transactionId: string
  amount: number
  paymentMonth: string | null
  paidAt: string | null
  method: string
  status: string
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
}

interface Tenancy {
  id: string
  tenancyNumber: string
  status: string
  startDate: string
  endDate: string | null
  monthlyRent: number
  depositPaid: number
  tenant: Tenant
  booking?: {
    id: string
    payments: Payment[]
  }
}

interface Unit {
  id: string
  propertyId: string
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
  }
  files: { id: string, fileUrl: string }[]
  tenancies?: Tenancy[]
}

export default function EditUnitPage() {
  const router = useRouter()
  const params = useParams()
  const unitId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [unit, setUnit] = useState<Unit | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<{ id: string, fileUrl: string }[]>([])
  const [showOccupancyDialog, setShowOccupancyDialog] = useState(false)
  const [availableMembers, setAvailableMembers] = useState<Tenant[]>([])
  const [currentTenancy, setCurrentTenancy] = useState<Tenancy | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [rentPayments, setRentPayments] = useState<Payment[]>([])
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMonth: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
  })
  const [occupancyForm, setOccupancyForm] = useState({
    tenantId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    monthlyRent: '',
    depositPaid: '',
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0],
  })

  const [formData, setFormData] = useState({
    unitCode: '',
    name: '',
    price: '',
    deposit: '',
    bedrooms: '1',
    bathrooms: '1',
    squareMeters: '',
    floor: '',
    isFurnished: false,
    hasBalcony: false,
    hasWifi: false,
    hasAC: false,
    hasPet: false,
    hasParking: false,
    description: '',
  })

  useEffect(() => {
    if (unitId) {
      fetchUnit()
      fetchMembers()
    }
  }, [unitId])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/tenants')
      if (res.ok) {
        const data = await res.json()
        setAvailableMembers(data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const fetchUnit = async () => {
    try {
      const res = await fetch(`/api/units/${unitId}`)
      if (!res.ok) throw new Error('Failed to fetch unit')

      const data = await res.json()
      setUnit(data)
      setExistingImages(data.files || [])

      // Set current tenancy if exists
      if (data.tenancies && data.tenancies.length > 0) {
        setCurrentTenancy(data.tenancies[0])
        // Load payments if booking exists
        if (data.tenancies[0].booking) {
          setRentPayments(data.tenancies[0].booking.payments || [])
        }
      }

      // Populate form
      setFormData({
        unitCode: data.unitCode || '',
        name: data.name || '',
        price: data.price?.toString() || '',
        deposit: data.deposit?.toString() || '',
        bedrooms: data.bedrooms?.toString() || '1',
        bathrooms: data.bathrooms?.toString() || '1',
        squareMeters: data.squareMeters?.toString() || '',
        floor: data.floor?.toString() || '',
        isFurnished: data.isFurnished || false,
        hasBalcony: data.hasBalcony || false,
        hasWifi: data.hasWifi || false,
        hasAC: data.hasAC || false,
        hasPet: data.hasPet || false,
        hasParking: data.hasParking || false,
        description: data.description || '',
      })
    } catch (error) {
      console.error('Error fetching unit:', error)
      toast.error('Failed to load unit')
      router.push('/dashboard/units')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setImages(prev => [...prev, ...newFiles])

    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/files/${imageId}`, { method: 'DELETE' })
      if (res.ok) {
        setExistingImages(prev => prev.filter(img => img.id !== imageId))
        toast.success('Image removed')
      }
    } catch (error) {
      toast.error('Failed to remove image')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleOccupancyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setOccupancyForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPaymentForm(prev => ({ ...prev, [name]: value }))
  }

  const calculateBalance = () => {
    if (!currentTenancy) return { totalDue: 0, totalPaid: 0, balance: 0, monthsPaid: 0, depositPaid: 0 }

    const startDate = new Date(currentTenancy.startDate)
    const endDate = currentTenancy.endDate ? new Date(currentTenancy.endDate) : new Date()
    const today = new Date()
    const effectiveEndDate = endDate < today ? endDate : today

    // Calculate months between start and now/end
    const monthsDiff = (effectiveEndDate.getFullYear() - startDate.getFullYear()) * 12 +
      (effectiveEndDate.getMonth() - startDate.getMonth()) + 1
    const totalMonths = Math.max(1, monthsDiff)

    const totalDue = totalMonths * currentTenancy.monthlyRent
    const totalPaid = rentPayments.reduce((sum, payment) =>
      payment.status === 'SUCCESS' ? sum + payment.amount : sum, 0
    )
    const balance = totalDue - totalPaid - currentTenancy.depositPaid

    return {
      totalDue,
      totalPaid,
      balance,
      monthsPaid: rentPayments.filter(p => p.status === 'SUCCESS').length,
      totalMonths,
      depositPaid: currentTenancy.depositPaid || 0
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentTenancy) {
      toast.error('No active tenancy found')
      return
    }

    try {
      const res = await fetch('/api/payments/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: currentTenancy.booking?.id || null,
          tenantId: currentTenancy.tenant.id,
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          paymentPurpose: 'MONTHLY_RENT',
          paymentMonth: paymentForm.paymentMonth,
          paymentDate: paymentForm.paymentDate,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to record payment')
      }

      const payment = await res.json()
      setRentPayments(prev => [...prev, payment])
      setShowPaymentDialog(false)
      setPaymentForm({
        amount: '',
        paymentMonth: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
      })
      toast.success('Payment recorded successfully!')
      fetchUnit() // Refresh to get updated payments
    } catch (error: any) {
      console.error('Error recording payment:', error)
      toast.error(error.message || 'Failed to record payment')
    }
  }

  const handleAddOccupancy = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // 1. Create Tenancy
      const res = await fetch(`/api/units/${unitId}/occupancy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...occupancyForm,
          monthlyRent: parseFloat(occupancyForm.monthlyRent),
          depositPaid: occupancyForm.depositPaid ? parseFloat(occupancyForm.depositPaid) : 0,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to add occupancy')
      }

      const tenancy = await res.json()

      // 2. Record Initial Payment (Rent + Deposit)
      const initialRent = parseFloat(occupancyForm.monthlyRent)
      const deposit = occupancyForm.depositPaid ? parseFloat(occupancyForm.depositPaid) : 0

      // Record Rent
      if (initialRent > 0) {
        await fetch('/api/payments/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: tenancy.booking?.id,
            tenantId: occupancyForm.tenantId,
            amount: initialRent,
            paymentMethod: occupancyForm.paymentMethod,
            paymentPurpose: 'MONTHLY_RENT',
            paymentMonth: new Date().toISOString().slice(0, 7),
            paymentDate: occupancyForm.paymentDate,
          }),
        })
      }

      // Record Deposit
      if (deposit > 0) {
        await fetch('/api/payments/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: tenancy.booking?.id,
            tenantId: occupancyForm.tenantId,
            amount: deposit,
            paymentMethod: occupancyForm.paymentMethod,
            paymentPurpose: 'SECURITY_DEPOSIT',
            paymentMonth: new Date().toISOString().slice(0, 7),
            paymentDate: occupancyForm.paymentDate,
          }),
        })
      }

      setCurrentTenancy(tenancy)
      setShowOccupancyDialog(false)
      toast.success('Occupancy and initial payment recorded successfully!')
      fetchUnit() // Refresh unit data
    } catch (error: any) {
      console.error('Error adding occupancy:', error)
      toast.error(error.message || 'Failed to add occupancy')
    }
  }

  const handleRemoveOccupancy = async () => {
    if (!confirm('Are you sure you want to terminate this tenancy?')) return

    try {
      const res = await fetch(`/api/units/${unitId}/occupancy`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to terminate occupancy')
      }

      setCurrentTenancy(null)
      toast.success('Tenancy terminated successfully!')
      fetchUnit() // Refresh unit data
    } catch (error: any) {
      console.error('Error terminating occupancy:', error)
      toast.error(error.message || 'Failed to terminate occupancy')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/units/${unitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          deposit: formData.deposit ? parseFloat(formData.deposit) : null,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          squareMeters: formData.squareMeters ? parseFloat(formData.squareMeters) : null,
          floor: formData.floor ? parseInt(formData.floor) : null,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update unit')
      }

      // Upload new images if any
      if (images.length > 0) {
        const imageFormData = new FormData()
        imageFormData.append('unitId', unitId)
        images.forEach((image) => {
          imageFormData.append('images', image)
        })

        const uploadRes = await fetch('/api/units/upload', {
          method: 'POST',
          body: imageFormData,
        })

        if (!uploadRes.ok) {
          console.error('Failed to upload images')
          toast.warning('Unit updated but some images failed to upload')
        }
      }

      toast.success('Unit updated successfully!')
      router.push('/dashboard/units')
    } catch (error: any) {
      console.error('Error updating unit:', error)
      toast.error(error.message || 'Failed to update unit')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <MicrochipLoader text="Loading unit details..." />
      </div>
    )
  }

  if (!unit) {
    return null
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm group"
          >
            <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Unit</h1>
            <p className="text-emerald-100 mt-2 text-lg">Update unit information and manage occupancy</p>
          </div>
        </div>
      </div>

      {/* Property Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
          <Building2 className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{unit.property.name}</p>
          <p className="text-gray-500 flex items-center gap-1">
            <Home className="w-4 h-4" />
            {unit.property.city}
          </p>
        </div>
      </div>

      {/* Occupancy Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Occupancy Status
          </h2>
          {!currentTenancy && (
            <button
              type="button"
              onClick={() => setShowOccupancyDialog(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <UserPlus className="w-5 h-5" />
              New Tenancy & Payment
            </button>
          )}
        </div>

        <div className="p-6">
          {currentTenancy ? (
            <div className="space-y-6">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <span className="text-lg font-bold text-emerald-900">Currently Occupied</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveOccupancy}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    <UserMinus className="w-4 h-4" />
                    Terminate Tenancy
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Tenant</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {currentTenancy.tenant.firstName} {currentTenancy.tenant.lastName}
                    </p>
                    <p className="text-emerald-600 text-sm mt-1">{currentTenancy.tenant.email}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Lease Details</p>
                    <p className="font-bold text-gray-900">{new Date(currentTenancy.startDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Start Date</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Financials</p>
                    <p className="font-bold text-gray-900">{currentTenancy.monthlyRent.toLocaleString()} UGX</p>
                    <p className="text-xs text-gray-400 mt-1">Monthly Rent</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Unit is Available</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                This unit is currently vacant. Click "New Tenancy & Payment" to assign a tenant and record the initial payment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Tracking (only show if unit is occupied) */}
      {currentTenancy && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              Rent Payment Tracking
            </h2>
            <button
              type="button"
              onClick={() => setShowPaymentDialog(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="w-5 h-5" />
              Record Payment
            </button>
          </div>

          <div className="p-6">
            {/* Balance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <p className="text-sm font-medium text-blue-600 mb-2">Total Due</p>
                <p className="text-3xl font-bold text-blue-900">
                  {calculateBalance().totalDue.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 mt-2 font-medium bg-blue-100 inline-block px-2 py-1 rounded-lg">
                  {calculateBalance().totalMonths} months
                </p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <p className="text-sm font-medium text-emerald-600 mb-2">Total Paid</p>
                <p className="text-3xl font-bold text-emerald-900">
                  {calculateBalance().totalPaid.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 mt-2 font-medium bg-emerald-100 inline-block px-2 py-1 rounded-lg">
                  {calculateBalance().monthsPaid} payments
                </p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <p className="text-sm font-medium text-purple-600 mb-2">Deposit</p>
                <p className="text-3xl font-bold text-purple-900">
                  {calculateBalance().depositPaid.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 mt-2 font-medium bg-purple-100 inline-block px-2 py-1 rounded-lg">
                  Security Deposit
                </p>
              </div>

              <div className={`rounded-2xl p-6 border ${calculateBalance().balance > 0
                ? 'bg-red-50 border-red-100'
                : 'bg-gray-50 border-gray-200'
                }`}>
                <p className={`text-sm font-medium mb-2 ${calculateBalance().balance > 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                  Balance
                </p>
                <p className={`text-3xl font-bold ${calculateBalance().balance > 0 ? 'text-red-900' : 'text-gray-900'
                  }`}>
                  {calculateBalance().balance.toLocaleString()}
                </p>
                <p className={`text-xs mt-2 font-medium inline-block px-2 py-1 rounded-lg ${calculateBalance().balance > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {calculateBalance().balance > 0 ? 'Outstanding' : 'Settled'}
                </p>
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
              {rentPayments.length > 0 ? (
                <div className="space-y-3">
                  {rentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {payment.paymentMonth ?
                              new Date(payment.paymentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                              : 'Payment'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'} • {payment.method}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-emerald-600 text-lg">
                            +{payment.amount.toLocaleString()} UGX
                          </p>
                          <p className="text-xs text-gray-400 font-mono">{payment.transactionId}</p>
                        </div>
                        <button
                          onClick={() => router.push(`/dashboard/payments/${payment.id}/receipt`)}
                          className="px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                        >
                          Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No payments recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Dialog */}
      {showPaymentDialog && currentTenancy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Record Rent Payment</h2>
              <button
                onClick={() => setShowPaymentDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (UGX) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="amount"
                      value={paymentForm.amount}
                      onChange={handlePaymentChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder={currentTenancy.monthlyRent.toString()}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Month *
                  </label>
                  <input
                    type="month"
                    name="paymentMonth"
                    value={paymentForm.paymentMonth}
                    onChange={handlePaymentChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={paymentForm.paymentDate}
                    onChange={handlePaymentChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={paymentForm.paymentMethod}
                    onChange={handlePaymentChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="CASH">Cash</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentDialog(false)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Occupancy Dialog */}
      {showOccupancyDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">New Tenancy & Payment</h2>
                <p className="text-sm text-gray-500 mt-1">Assign tenant and record initial payment</p>
              </div>
              <button
                onClick={() => setShowOccupancyDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOccupancy} className="p-6">
              <div className="space-y-6">
                {/* Tenant Selection */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Tenant Details
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Tenant *
                    </label>
                    <select
                      name="tenantId"
                      value={occupancyForm.tenantId}
                      onChange={handleOccupancyChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                    >
                      <option value="">Choose a member...</option>
                      {availableMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.lastName} - {member.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lease Details */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Lease Terms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={occupancyForm.startDate}
                        onChange={handleOccupancyChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={occupancyForm.endDate}
                        onChange={handleOccupancyChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Rent (UGX) *
                      </label>
                      <input
                        type="number"
                        name="monthlyRent"
                        value={occupancyForm.monthlyRent}
                        onChange={handleOccupancyChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder={formData.price}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deposit Amount (UGX)
                      </label>
                      <input
                        type="number"
                        name="depositPaid"
                        value={occupancyForm.depositPaid}
                        onChange={handleOccupancyChange}
                        min="0"
                        step="0.01"
                        placeholder={formData.deposit || '0'}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Initial Payment */}
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <h3 className="text-sm font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Initial Payment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-900 mb-2">
                        Payment Method *
                      </label>
                      <select
                        name="paymentMethod"
                        value={occupancyForm.paymentMethod}
                        onChange={handleOccupancyChange}
                        required
                        className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                      >
                        <option value="CASH">Cash</option>
                        <option value="MOBILE_MONEY">Mobile Money</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="CREDIT_CARD">Credit Card</option>
                        <option value="DEBIT_CARD">Debit Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-900 mb-2">
                        Payment Date *
                      </label>
                      <input
                        type="date"
                        name="paymentDate"
                        value={occupancyForm.paymentDate}
                        onChange={handleOccupancyChange}
                        required
                        className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Total Due Now:</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {((parseFloat(occupancyForm.monthlyRent) || 0) + (parseFloat(occupancyForm.depositPaid) || 0)).toLocaleString()} UGX
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOccupancyDialog(false)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm & Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="space-y-8">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Code *
                </label>
                <input
                  type="text"
                  name="unitCode"
                  value={formData.unitCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Unit Images */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Unit Images</h2>
            <div className="space-y-4">
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Current Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((image) => (
                      <div key={image.id} className="relative group rounded-xl overflow-hidden shadow-sm">
                        <img
                          src={image.fileUrl}
                          alt="Unit"
                          className="w-full h-32 object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeExistingImage(image.id)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">New Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden shadow-sm">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-32 object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  id="unit-images"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <label htmlFor="unit-images" className="cursor-pointer w-full h-full block">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">Click to upload images</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
                </label>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Price (UGX) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Deposit (UGX)
                </label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor Number
                </label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Meters
                </label>
                <input
                  type="number"
                  name="squareMeters"
                  value={formData.squareMeters}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="isFurnished"
                  checked={formData.isFurnished}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-gray-700 font-medium">Furnished</span>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="hasBalcony"
                  checked={formData.hasBalcony}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-gray-700 font-medium">Balcony</span>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="hasWifi"
                  checked={formData.hasWifi}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-gray-700 font-medium">WiFi</span>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="hasAC"
                  checked={formData.hasAC}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-gray-700 font-medium">Air Conditioning</span>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="hasPet"
                  checked={formData.hasPet}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-gray-700 font-medium">Pets Allowed</span>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="hasParking"
                  checked={formData.hasParking}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-gray-700 font-medium">Parking</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="mt-8 flex items-center justify-end gap-4 pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 font-semibold"
          >
            {saving ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <Home className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

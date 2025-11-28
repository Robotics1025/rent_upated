'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Home, ArrowLeft, Building2, Upload, X, Image as ImageIcon, Users, UserPlus, UserMinus, DollarSign, Calendar, Plus } from 'lucide-react'
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
  const [existingImages, setExistingImages] = useState<{id: string, fileUrl: string}[]>([])
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
      setCurrentTenancy(tenancy)
      setShowOccupancyDialog(false)
      toast.success('Occupancy added successfully!')
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Unit</h1>
            <p className="text-gray-600 mt-1">Update unit information</p>
          </div>
        </div>

        {/* Property Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{unit.property.name}</p>
            <p className="text-sm text-gray-600">{unit.property.city}</p>
          </div>
        </div>

        {/* Occupancy Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Occupancy Status
            </h2>
            {!currentTenancy && (
              <button
                type="button"
                onClick={() => setShowOccupancyDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Mark as Occupied
              </button>
            )}
          </div>

          {currentTenancy ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-emerald-900">Currently Occupied</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveOccupancy}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <UserMinus className="w-4 h-4" />
                    Terminate
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Tenant</p>
                    <p className="font-medium text-gray-900">
                      {currentTenancy.tenant.firstName} {currentTenancy.tenant.lastName}
                    </p>
                    <p className="text-gray-600 text-xs">{currentTenancy.tenant.email}</p>
                    {currentTenancy.tenant.phone && (
                      <p className="text-gray-600 text-xs">{currentTenancy.tenant.phone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-600">Tenancy Number</p>
                    <p className="font-medium text-gray-900">{currentTenancy.tenancyNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Start Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(currentTenancy.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Rent</p>
                    <p className="font-medium text-gray-900">
                      {currentTenancy.monthlyRent.toLocaleString()} UGX
                    </p>
                  </div>
                  {currentTenancy.endDate && (
                    <div>
                      <p className="text-gray-600">End Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(currentTenancy.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Deposit Paid</p>
                    <p className="font-medium text-gray-900">
                      {currentTenancy.depositPaid.toLocaleString()} UGX
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">Unit is currently available</p>
              <p className="text-sm text-gray-500 mt-1">Click "Mark as Occupied" to assign a tenant</p>
            </div>
          )}
        </div>

        {/* Payment Tracking (only show if unit is occupied) */}
        {currentTenancy && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Rent Payment Tracking
              </h2>
              <button
                type="button"
                onClick={() => setShowPaymentDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Record Payment
              </button>
            </div>

            {/* Balance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Total Due</p>
                <p className="text-2xl font-bold text-blue-900">
                  {calculateBalance().totalDue.toLocaleString()} UGX
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {calculateBalance().totalMonths} months
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {calculateBalance().totalPaid.toLocaleString()} UGX
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  {calculateBalance().monthsPaid} payments
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-600 mb-1">Deposit</p>
                <p className="text-2xl font-bold text-purple-900">
                  {calculateBalance().depositPaid.toLocaleString()} UGX
                </p>
                <p className="text-xs text-purple-600 mt-1">Security deposit</p>
              </div>

              <div className={`border rounded-lg p-4 ${
                calculateBalance().balance > 0 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-sm mb-1 ${
                  calculateBalance().balance > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  Balance
                </p>
                <p className={`text-2xl font-bold ${
                  calculateBalance().balance > 0 ? 'text-red-900' : 'text-gray-900'
                }`}>
                  {calculateBalance().balance.toLocaleString()} UGX
                </p>
                <p className={`text-xs mt-1 ${
                  calculateBalance().balance > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {calculateBalance().balance > 0 ? 'Outstanding' : 'Settled'}
                </p>
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Payment History</h3>
              {rentPayments.length > 0 ? (
                <div className="space-y-2">
                  {rentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.paymentMonth ? 
                              new Date(payment.paymentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
                              : 'Payment'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'} • {payment.method}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600">
                            +{payment.amount.toLocaleString()} UGX
                          </p>
                          <p className="text-xs text-gray-500">{payment.transactionId}</p>
                        </div>
                        <button
                          onClick={() => router.push(`/dashboard/payments/${payment.id}/receipt`)}
                          className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                        >
                          View Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No payments recorded yet</p>
                  <p className="text-sm text-gray-500 mt-1">Click "Record Payment" to add rent payments</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Dialog */}
        {showPaymentDialog && currentTenancy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Record Rent Payment</h2>
                  <button
                    onClick={() => setShowPaymentDialog(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddPayment} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (UGX) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={paymentForm.amount}
                      onChange={handlePaymentChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder={currentTenancy.monthlyRent.toString()}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">e.g., January 2025, February 2025</p>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="CASH">Cash</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Occupancy Dialog */}
        {showOccupancyDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Mark Unit as Occupied</h2>
                  <button
                    onClick={() => setShowOccupancyDialog(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddOccupancy} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Tenant *
                    </label>
                    <select
                      name="tenantId"
                      value={occupancyForm.tenantId}
                      onChange={handleOccupancyChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Choose a member...</option>
                      {availableMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.lastName} - {member.email}
                        </option>
                      ))}
                    </select>
                  </div>

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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deposit Paid (UGX)
                      </label>
                      <input
                        type="number"
                        name="depositPaid"
                        value={occupancyForm.depositPaid}
                        onChange={handleOccupancyChange}
                        min="0"
                        step="0.01"
                        placeholder={formData.deposit || '0'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowOccupancyDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Occupancy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Unit Images */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Unit Images</h2>
              <div className="space-y-4">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current Images</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.fileUrl}
                            alt="Unit"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(image.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Previews */}
                {imagePreviews.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">New Images</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                  <input
                    type="file"
                    id="unit-images"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label htmlFor="unit-images" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload more images</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                  </label>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFurnished"
                    checked={formData.isFurnished}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Furnished</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasBalcony"
                    checked={formData.hasBalcony}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Balcony</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasWifi"
                    checked={formData.hasWifi}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">WiFi</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasAC"
                    checked={formData.hasAC}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Air Conditioning</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasPet"
                    checked={formData.hasPet}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Pets Allowed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasParking"
                    checked={formData.hasParking}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Parking</span>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
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
    </DashboardLayout>
  )
}

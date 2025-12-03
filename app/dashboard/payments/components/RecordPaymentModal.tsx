'use client'

import { useState, useEffect, useRef } from 'react'
import { DollarSign, Printer, CheckCircle, Building2, X } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { toast } from 'sonner'
import SuccessDialog from '@/app/components/SuccessDialog'

interface RecordPaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function RecordPaymentModal({ isOpen, onClose, onSuccess }: RecordPaymentModalProps) {
    const receiptRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(false)
    const [tenants, setTenants] = useState<any[]>([])
    const [bookings, setBookings] = useState<any[]>([])
    const [receipt, setReceipt] = useState<any>(null)
    const [balanceData, setBalanceData] = useState<any>(null)
    const [selectedMonths, setSelectedMonths] = useState<string[]>([])
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [successData, setSuccessData] = useState<any>(null)

    const [formData, setFormData] = useState({
        tenantId: '',
        bookingId: '',
        amount: '',
        purpose: 'MONTHLY_RENT',
        method: 'CASH',
        description: '',
        paymentMonth: '',
    })

    const upcomingMonths = Array.from({ length: 12 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() + i)
        return {
            value: d.toISOString().slice(0, 7),
            label: d.toLocaleDateString('default', { month: 'long', year: 'numeric' })
        }
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const toggleMonth = (month: string) => {
        setSelectedMonths(prev =>
            prev.includes(month)
                ? prev.filter(m => m !== month)
                : [...prev, month].sort()
        )
    }

    const fetchTenants = async () => {
        try {
            const res = await fetch('/api/tenants')
            if (res.ok) {
                const data = await res.json()
                setTenants(data)
            }
        } catch (error) {
            console.error('Error fetching tenants:', error)
            toast.error('Failed to load tenants')
        }
    }

    const fetchTenantBookings = async (tenantId: string) => {
        try {
            const res = await fetch(`/api/bookings?tenantId=${tenantId}&status=CONFIRMED`)
            if (res.ok) {
                const data = await res.json()
                setBookings(data)
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
        }
    }

    const fetchTenantBalance = async (tenantId: string) => {
        try {
            const res = await fetch(`/api/tenants/${tenantId}/balance`)
            if (res.ok) {
                const data = await res.json()
                setBalanceData(data)
            }
        } catch (error) {
            console.error('Error fetching balance:', error)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchTenants()
        }
    }, [isOpen])

    useEffect(() => {
        if (formData.tenantId) {
            fetchTenantBookings(formData.tenantId)
            fetchTenantBalance(formData.tenantId)
        } else {
            setBalanceData(null)
            setSelectedMonths([])
        }
    }, [formData.tenantId])

    useEffect(() => {
        if (balanceData?.monthlyRent && selectedMonths.length > 0 && formData.purpose === 'MONTHLY_RENT') {
            const totalAmount = selectedMonths.length * balanceData.monthlyRent
            setFormData(prev => ({ ...prev, amount: totalAmount.toString() }))
        }
    }, [selectedMonths, balanceData, formData.purpose])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (formData.purpose === 'MONTHLY_RENT' && selectedMonths.length === 0) {
            toast.error('Please select at least one billing month for rent payment')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/payments/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    paymentMonth: selectedMonths.length > 0 ? selectedMonths.join(', ') : formData.paymentMonth,
                }),
            })

            if (!res.ok) throw new Error('Failed to record payment')

            const payment = await res.json()
            const balanceRes = await fetch(`/api/tenants/${formData.tenantId}/balance`)
            const updatedBalance = await balanceRes.json()

            const receiptData = { ...payment, balanceData: updatedBalance }
            setReceipt(receiptData)
            setSuccessData({
                amount: formData.amount,
                transactionId: payment.transactionId,
                tenant: tenants.find(t => t.id === formData.tenantId)?.name || 'Unknown'
            })
            setShowSuccessDialog(true)
            toast.success('Payment recorded successfully!')
            onSuccess()
        } catch (error) {
            console.error('Error recording payment:', error)
            toast.error('Failed to record payment.')
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
    })

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-gray-900/50 to-emerald-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 p-6 sticky top-0 z-10">
                    <div className="absolute inset-0 bg-white/5"></div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <DollarSign className="w-7 h-7" />
                                Record Payment
                            </h2>
                            <p className="text-emerald-50 mt-1">Record transaction and generate receipt</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-white/20 rounded-xl transition-all text-white hover:rotate-90 duration-300"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto max-h-[calc(92vh-100px)]">
                    {receipt ? (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-green-900">Payment Recorded Successfully!</h2>
                                    <p className="text-green-700 mt-1 font-medium">Transaction ID: <span className="font-mono">{receipt.transactionId}</span></p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-10" ref={receiptRef}>
                                <div className="text-center mb-10">
                                    <div className="inline-block p-3 bg-emerald-50 rounded-2xl mb-4">
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">EazyRent</h1>
                                    </div>
                                    <p className="text-gray-600 text-lg font-medium">Payment Receipt</p>
                                </div>

                                <div className="border-t-2 border-b-2 border-gray-200 py-6 mb-6 bg-gray-50 rounded-xl px-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Receipt Number</p>
                                            <p className="font-bold text-gray-900 mt-1 font-mono">{receipt.transactionId}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date</p>
                                            <p className="font-bold text-gray-900 mt-1">{new Date(receipt.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Payment Method</p>
                                            <p className="font-bold text-gray-900 mt-1 capitalize">{receipt.method.replace('_', ' ')}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</p>
                                            <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">{receipt.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 bg-blue-50 rounded-xl p-6">
                                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Received From:</h3>
                                    <p className="text-gray-900 font-semibold text-lg">{receipt.tenant?.firstName} {receipt.tenant?.lastName}</p>
                                    <p className="text-gray-600 mt-1">{receipt.tenant?.email}</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Payment Details:</h3>
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                            <span className="text-gray-700 font-medium">Purpose:</span>
                                            <span className="font-bold text-gray-900 capitalize">{receipt.purpose.replace('_', ' ')}</span>
                                        </div>
                                        {receipt.paymentMonth && (
                                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                                <span className="text-gray-700 font-medium">Billing Month(s):</span>
                                                <span className="font-bold text-gray-900">{receipt.paymentMonth}</span>
                                            </div>
                                        )}
                                        {receipt.description && (
                                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                                <span className="text-gray-700 font-medium">Description:</span>
                                                <span className="text-gray-900">{receipt.description}</span>
                                            </div>
                                        )}
                                        {receipt.booking && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-700 font-medium">Booking:</span>
                                                <span className="text-gray-900 font-mono">{receipt.booking.bookingNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {receipt.balanceData && (
                                    <div className="mb-6 border-t-2 border-gray-200 pt-6">
                                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Account Summary:</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-blue-50 p-4 rounded-xl">
                                                <p className="text-gray-600 text-sm font-medium mb-1">Total Due</p>
                                                <p className="font-bold text-lg text-gray-900">{Number(receipt.balanceData.totalDue).toLocaleString()} {receipt.currency}</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-xl">
                                                <p className="text-gray-600 text-sm font-medium mb-1">Total Paid</p>
                                                <p className="font-bold text-lg text-green-600">{Number(receipt.balanceData.totalPaid).toLocaleString()} {receipt.currency}</p>
                                            </div>
                                            <div className={`p-4 rounded-xl ${receipt.balanceData.balance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                                                <p className="text-gray-600 text-sm font-medium mb-1">Balance</p>
                                                <p className={`font-bold text-lg ${receipt.balanceData.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {Number(receipt.balanceData.balance).toLocaleString()} {receipt.currency}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-2xl border-2 border-emerald-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-gray-900">Total Amount Paid:</span>
                                        <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                            {Number(receipt.amount).toLocaleString()} {receipt.currency}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-10 pt-6 border-t-2 border-gray-200 text-center">
                                    <p className="text-gray-600 font-medium">Thank you for your payment!</p>
                                    <p className="text-gray-500 mt-1 text-sm">Official receipt from EazyRent Property Management</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4 pt-4">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                                >
                                    <Printer className="w-5 h-5" />
                                    Print Receipt
                                </button>
                                <button
                                    onClick={() => {
                                        setReceipt(null)
                                        setFormData({ ...formData, amount: '', description: '' })
                                        setSelectedMonths([])
                                        if (formData.tenantId) fetchTenantBalance(formData.tenantId)
                                    }}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                                >
                                    <DollarSign className="w-5 h-5" />
                                    Record Another
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold hover:border-gray-400"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                    Select Tenant *
                                </label>
                                <select
                                    name="tenantId"
                                    value={formData.tenantId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white font-medium shadow-sm"
                                >
                                    <option value="">Choose a tenant...</option>
                                    {tenants.map((tenant) => (
                                        <option key={tenant.id} value={tenant.id}>
                                            {tenant.firstName} {tenant.lastName} - {tenant.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {balanceData && (
                                <div className="space-y-4">
                                    {balanceData.tenancyDetails && (
                                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                                            <div className="p-3 bg-blue-100 rounded-xl">
                                                <Building2 className="w-7 h-7 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-blue-900 text-lg">Property Details</h3>
                                                <p className="text-blue-800 font-semibold mt-1 text-lg">
                                                    {balanceData.tenancyDetails.propertyName || 'Unknown Property'}
                                                </p>
                                                <p className="text-sm text-blue-600 font-medium mt-1">
                                                    Unit: {balanceData.tenancyDetails.unitCode}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className={`p-6 rounded-2xl border-2 shadow-sm ${balanceData.balance > 0 ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className={`font-bold text-lg ${balanceData.balance > 0 ? 'text-red-800' : 'text-green-800'}`}>
                                                    Current Balance: {Number(balanceData.balance).toLocaleString()} {balanceData.currency}
                                                </h3>
                                                <p className="text-sm text-gray-700 mt-2 font-medium">
                                                    Monthly Rent: {Number(balanceData.monthlyRent).toLocaleString()} {balanceData.currency}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Months Active: {balanceData.tenancyDetails?.monthsActive || 0} | Paid: {balanceData.monthsPaid}
                                                </p>
                                            </div>
                                            {balanceData.balance > 0 && (
                                                <span className="px-3 py-2 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">
                                                    {balanceData.monthsOverdue} Months Overdue
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.tenantId && bookings.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                        Related Booking (Optional)
                                    </label>
                                    <select
                                        name="bookingId"
                                        value={formData.bookingId}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white font-medium shadow-sm"
                                    >
                                        <option value="">No booking</option>
                                        {bookings.map((booking: any) => (
                                            <option key={booking.id} value={booking.id}>
                                                {booking.bookingNumber} - {booking.unit.unitCode}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                        Amount (UGX) *
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold text-lg shadow-sm"
                                        placeholder="0.00"
                                    />
                                    {selectedMonths.length > 0 && balanceData?.monthlyRent && (
                                        <p className="text-sm text-emerald-600 mt-2 font-bold bg-emerald-50 px-3 py-2 rounded-lg">
                                            {selectedMonths.length} months × {Number(balanceData.monthlyRent).toLocaleString()} = {Number(selectedMonths.length * balanceData.monthlyRent).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                        Payment Purpose *
                                    </label>
                                    <select
                                        name="purpose"
                                        value={formData.purpose}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white font-medium shadow-sm"
                                    >
                                        <option value="MONTHLY_RENT">Monthly Rent</option>
                                        <option value="SECURITY_DEPOSIT">Security Deposit</option>
                                        <option value="BOOKING_DEPOSIT">Booking Deposit</option>
                                        <option value="UTILITIES">Utilities</option>
                                        <option value="MAINTENANCE_FEE">Maintenance Fee</option>
                                        <option value="LATE_FEE">Late Fee</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                                <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                                    Billing Months (Select multiple)
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {upcomingMonths.map((month) => (
                                        <button
                                            key={month.value}
                                            type="button"
                                            onClick={() => toggleMonth(month.value)}
                                            className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all shadow-sm ${selectedMonths.includes(month.value)
                                                ? 'bg-emerald-500 border-emerald-600 text-white ring-2 ring-emerald-300 scale-105'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                                                }`}
                                        >
                                            {month.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 mt-3 font-medium bg-white px-3 py-2 rounded-lg">
                                    Selected: {selectedMonths.length > 0 ? selectedMonths.join(', ') : 'None'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                    Payment Method *
                                </label>
                                <select
                                    name="method"
                                    value={formData.method}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white font-medium shadow-sm"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="MOBILE_MONEY">Mobile Money</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="CREDIT_CARD">Credit Card</option>
                                    <option value="DEBIT_CARD">Debit Card</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                    Description / Notes
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Add any additional details here..."
                                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none shadow-sm"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-6 border-t-2 border-gray-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold hover:border-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-10 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold text-lg"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                                            Recording...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-6 h-6" />
                                            Record Payment
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Success Dialog */}
            {successData && (
                <SuccessDialog
                    isOpen={showSuccessDialog}
                    onClose={() => {
                        setShowSuccessDialog(false)
                        setSuccessData(null)
                        // Reset form
                        setFormData({
                            tenantId: '',
                            bookingId: '',
                            amount: '',
                            purpose: 'MONTHLY_RENT',
                            method: 'CASH',
                            description: '',
                            paymentMonth: '',
                        })
                        setSelectedMonths([])
                        setReceipt(null)
                        onClose()
                    }}
                    title="Payment Recorded!"
                    message={`You successfully recorded a payment of ${Number(successData.amount).toLocaleString()} UGX for ${successData.tenant}. Transaction ID: ${successData.transactionId}`}
                    primaryAction={{
                        label: 'View Receipt',
                        onClick: () => {
                            setShowSuccessDialog(false)
                            // Keep receipt visible
                        }
                    }}
                    secondaryAction={{
                        label: 'Record Another Payment',
                        onClick: () => {
                            setShowSuccessDialog(false)
                            setSuccessData(null)
                            setFormData({
                                tenantId: '',
                                bookingId: '',
                                amount: '',
                                purpose: 'MONTHLY_RENT',
                                method: 'CASH',
                                description: '',
                                paymentMonth: '',
                            })
                            setSelectedMonths([])
                            setReceipt(null)
                        }
                    }}
                />
            )}
        </div>
    )
}

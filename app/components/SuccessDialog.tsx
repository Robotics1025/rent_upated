'use client'

import { Check, X } from 'lucide-react'
import { useEffect } from 'react'

interface SuccessDialogProps {
    isOpen: boolean
    onClose: () => void
    title: string
    message: string
    primaryAction?: {
        label: string
        onClick: () => void
    }
    secondaryAction?: {
        label: string
        onClick: () => void
    }
}

export default function SuccessDialog({
    isOpen,
    onClose,
    title,
    message,
    primaryAction,
    secondaryAction,
}: SuccessDialogProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 fade-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                            <Check className="w-10 h-10 text-emerald-600 stroke-[3]" />
                        </div>
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-gray-600 text-center mb-8 leading-relaxed">
                    {message}
                </p>

                {/* Actions */}
                <div className="space-y-3">
                    {primaryAction && (
                        <button
                            onClick={() => {
                                primaryAction.onClick()
                                onClose()
                            }}
                            className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {primaryAction.label}
                        </button>
                    )}

                    {secondaryAction && (
                        <button
                            onClick={() => {
                                secondaryAction.onClick()
                                onClose()
                            }}
                            className="w-full py-3.5 px-6 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            {secondaryAction.label}
                        </button>
                    )}

                    {!primaryAction && !secondaryAction && (
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 px-6 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

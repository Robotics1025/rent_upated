'use client'

import { useState } from 'react'
import { Phone, Video, PhoneOff, Mic, MicOff } from 'lucide-react'

export default function CallsPage() {
    const [inCall, setInCall] = useState(false)
    const [isMuted, setIsMuted] = useState(false)

    return (
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center bg-gray-50">
            <div className="text-center">
                {!inCall ? (
                    <>
                        <div className="mb-8">
                            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto flex items-center justify-center shadow-xl">
                                <Phone className="w-16 h-16 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Voice & Video Calls</h1>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Make voice and video calls to tenants, managers, and admins directly from the platform
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setInCall(true)}
                                className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold flex items-center gap-2 shadow-lg"
                            >
                                <Phone className="w-5 h-5" />
                                Voice Call
                            </button>
                            <button
                                onClick={() => setInCall(true)}
                                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold flex items-center gap-2 shadow-lg"
                            >
                                <Video className="w-5 h-5" />
                                Video Call
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-8">
                            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto flex items-center justify-center shadow-xl animate-pulse">
                                <Phone className="w-16 h-16 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Call in Progress</h1>
                        <p className="text-gray-600 mb-8">00:45</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-4 rounded-full transition shadow-lg ${isMuted
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                            </button>
                            <button
                                onClick={() => setInCall(false)}
                                className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-lg"
                            >
                                <PhoneOff className="w-6 h-6" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

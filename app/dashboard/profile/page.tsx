'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Camera, User, Mail, Phone, MapPin, Calendar, Edit, Shield, Settings } from 'lucide-react'
import Link from 'next/link'
import MicrochipLoader from '@/app/components/MicrochipLoader'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [uploading, setUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(session?.user?.avatar || '')

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            avatar: data.avatarUrl,
          },
        })
        toast.success('Profile picture updated successfully')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload profile picture')
    } finally {
      setUploading(false)
    }
  }

  if (!session) {
    return <MicrochipLoader text="Loading profile..." />
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Profile</h1>
            <p className="text-emerald-100 mt-2 text-lg">View and manage your personal information</p>
          </div>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all text-sm font-medium"
          >
            <Settings className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
            <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
            <div className="px-8 pb-8 text-center">
              <div className="relative inline-block -mt-16 mb-4">
                <div className="relative group">
                  {avatarPreview || session?.user?.avatar ? (
                    <img
                      src={avatarPreview || session?.user?.avatar}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-emerald-100 flex items-center justify-center shadow-md">
                      <User className="w-16 h-16 text-emerald-600" />
                    </div>
                  )}

                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                    <Camera className="w-8 h-8 text-white transform scale-90 group-hover:scale-100 transition-transform" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-sm">
                      <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">{session?.user?.name}</h2>
              <p className="text-gray-500 mt-1">{session?.user?.email}</p>

              <div className="mt-4 flex justify-center gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold tracking-wide uppercase">
                  {session?.user?.role?.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">Properties</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">Tenants</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Personal Information
              </h3>
              <Link href="/dashboard/settings" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium hover:underline">
                Edit
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                <p className="text-gray-900 font-medium mt-1 text-lg group-hover:text-emerald-700 transition-colors">{session?.user?.name}</p>
              </div>

              <div className="group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                <p className="text-gray-900 font-medium mt-1 text-lg group-hover:text-emerald-700 transition-colors">{session?.user?.email}</p>
              </div>

              <div className="group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
                <p className="text-gray-900 font-medium mt-1 text-lg group-hover:text-emerald-700 transition-colors">Not provided</p>
              </div>

              <div className="group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Member Since</label>
                <p className="text-gray-900 font-medium mt-1 text-lg group-hover:text-emerald-700 transition-colors">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Security & Login
              </h3>
              <Link href="/dashboard/settings" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Password</p>
                    <p className="text-sm text-gray-500">Last changed recently</p>
                  </div>
                </div>
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Secure</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Settings className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Two-Factor Auth</p>
                    <p className="text-sm text-gray-500">Not enabled</p>
                  </div>
                </div>
                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Disabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

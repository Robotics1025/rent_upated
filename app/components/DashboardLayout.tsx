'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Building2, LayoutDashboard, Home, Users, FileText, CreditCard, 
  Settings, LogOut, Menu, X, Bell, Search, ChevronDown, User
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: 'SUPER_ADMIN' | 'ADMIN' | 'TENANT'
}

export default function DashboardLayout({ children, userRole = 'ADMIN' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'TENANT'] },
    { name: 'Properties', href: '/dashboard/properties', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Units', href: '/dashboard/units', icon: Home, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Bookings', href: '/dashboard/bookings', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'TENANT'] },
    { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'TENANT'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN', 'TENANT'] },
  ]

  const filteredNavigation = navigation.filter(item => item.roles.includes(userRole))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-emerald-600">
            <Building2 className="h-7 w-7" />
            <span>EazyRent</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">{userRole.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Left: Menu + Search */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Your Profile
                    </Link>
                    <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Settings
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}

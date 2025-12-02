'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Building2, LayoutDashboard, Home, Users, FileText, CreditCard,
  Settings, LogOut, Menu, X, Search, ChevronDown, User, Camera, BarChart3, Command, MessageSquare, Phone
} from 'lucide-react'
import NotificationBell from './NotificationBell'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: string
}

interface SearchResult {
  properties: any[];
  units: any[];
  totalResults: number;
}

export default function DashboardLayout({ children, userRole: propUserRole }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const userRole = propUserRole || session?.user?.role || (isLoading ? null : 'MANAGER')
  const userAvatar = session?.user?.image || session?.user?.avatar
  const userName = session?.user?.name || `${session?.user?.firstName || ''} ${session?.user?.lastName || ''}`.trim() || 'User'
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearchModal(true)
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false)
        setShowResults(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery)
      } else {
        setSearchResults(null)
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const performSearch = async (query: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
        setShowResults(true)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchItemClick = () => {
    setShowResults(false)
    setSearchQuery("")
    setShowSearchModal(false)
  }

  // Each role gets their own dashboard route
  const getDashboardHref = () => {
    if (userRole === 'MANAGER') return '/dashboard/manager'
    return '/dashboard' // ADMIN and SUPER_ADMIN
  }

  const navigation = [
    { name: 'Dashboard', href: getDashboardHref(), icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { name: 'Properties', href: '/dashboard/properties', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { name: 'Units', href: '/dashboard/units', icon: Home, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { name: 'Bookings', href: '/dashboard/bookings', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
  ]

  const filteredNavigation = userRole ? navigation.filter(item => item.roles.includes(userRole as string)) : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Modal (Ctrl+K) */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-20">
          <div className="w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl" ref={searchRef}>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties, units..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 text-lg outline-none"
                />
              </div>
            </div>

            {/* Search Results in Modal */}
            <div className="max-h-96 overflow-y-auto">
              {isSearching && (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
              )}

              {!isSearching && searchResults && searchResults.totalResults === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <p>No results found</p>
                </div>
              )}

              {!isSearching && searchResults && searchResults.totalResults > 0 && (
                <div className="divide-y">
                  {/* Properties */}
                  {searchResults.properties.length > 0 && (
                    <div className="p-3">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Properties ({searchResults.properties.length})</h4>
                      {searchResults.properties.map((property: any) => (
                        <Link
                          key={property.id}
                          href="/dashboard/properties"
                          onClick={handleSearchItemClick}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                        >
                          <Building2 className="w-10 h-10 text-emerald-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{property.name}</p>
                            <p className="text-sm text-gray-500">{property.city}, {property.region}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Units */}
                  {searchResults.units.length > 0 && (
                    <div className="p-3">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Units ({searchResults.units.length})</h4>
                      {searchResults.units.map((unit: any) => (
                        <Link
                          key={unit.id}
                          href={`/dashboard/units/${unit.id}/view`}
                          onClick={handleSearchItemClick}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                        >
                          <Home className="w-10 h-10 text-blue-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{unit.unitCode}</p>
                            <p className="text-sm text-gray-500">{unit.property.city} • {Number(unit.price).toLocaleString()} UGX/mo</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${unit.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {unit.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive
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
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer relative group">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="h-6 w-6 text-emerald-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userRole?.replace('_', ' ')}</p>
                </>
              )}
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

              {/* Desktop Search */}
              <div className="hidden md:block">
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="flex items-center gap-2 px-4 py-2 w-80 border border-gray-300 rounded-lg text-left text-gray-500 hover:border-gray-400 transition"
                >
                  <Search className="h-5 w-5" />
                  <span>Search properties, units...</span>
                  <div className="ml-auto flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                    <Command className="h-3 w-3" />
                    <span>K</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-4">
              {/* Mobile Search Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <Search className="h-5 w-5" />
              </button>

              <NotificationBell />

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-emerald-600" />
                    </div>
                  )}
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
                    <Link href="/dashboard/notifications" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Notifications
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
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

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        {/* Call Button */}
        <Link
          href="/dashboard/calls"
          className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          title="Make a Call"
        >
          <Phone className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        </Link>

        {/* Messages Button */}
        <Link
          href="/dashboard/messages"
          className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          title="Messages"
        >
          <MessageSquare className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        </Link>
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

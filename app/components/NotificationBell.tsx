'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, Trash2, Calendar, DollarSign, AlertCircle, Megaphone, Wrench, MessageCircle, Pin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: string
  status: string
  title: string
  message: string
  readAt: string | null
  createdAt: string
  data?: any
}

export default function NotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [prevUnreadCount, setPrevUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)

        const newUnreadCount = data.filter((n: any) => n.status === 'UNREAD').length
        if (newUnreadCount > prevUnreadCount) {
          setIsShaking(true)
          setTimeout(() => setIsShaking(false), 1000)
          toast.info(`You have ${newUnreadCount - prevUnreadCount} new notification${newUnreadCount - prevUnreadCount > 1 ? 's' : ''}`)
        }
        setPrevUnreadCount(newUnreadCount)
      } else if (res.status === 401) {
        // User not authenticated, don't show error
        setNotifications([])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ' }),
      })

      if (res.ok) {
        setNotifications(notifications.map(n =>
          n.id === id ? { ...n, status: 'READ', readAt: new Date().toISOString() } : n
        ))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      await Promise.all(
        notifications
          .filter(n => n.status === 'UNREAD')
          .map(n => markAsRead(n.id))
      )
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark notifications as read')
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== id))
        toast.success('Notification deleted')
      }
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    setIsOpen(false)

    // Navigate based on notification type
    switch (notification.type) {
      case 'BOOKING_CONFIRMATION':
        router.push('/dashboard/bookings')
        break
      case 'PAYMENT_RECEIPT':
        router.push('/dashboard/payments')
        break
      case 'ADMIN_UPDATE':
        router.push('/dashboard')
        break
      default:
        router.push('/dashboard/notifications')
    }
  }

  const getNotificationIcon = (type: string) => {
    const iconConfig: any = {
      BOOKING_CONFIRMATION: { icon: Calendar, bg: 'bg-blue-100', color: 'text-blue-600' },
      PAYMENT_RECEIPT: { icon: DollarSign, bg: 'bg-emerald-100', color: 'text-emerald-600' },
      RENT_REMINDER: { icon: Bell, bg: 'bg-purple-100', color: 'text-purple-600' },
      SYSTEM_ALERT: { icon: AlertCircle, bg: 'bg-orange-100', color: 'text-orange-600' },
      ADMIN_UPDATE: { icon: Megaphone, bg: 'bg-indigo-100', color: 'text-indigo-600' },
      MAINTENANCE_NOTICE: { icon: Wrench, bg: 'bg-gray-100', color: 'text-gray-600' },
      MESSAGE: { icon: MessageCircle, bg: 'bg-pink-100', color: 'text-pink-600' },
      OTHER: { icon: Pin, bg: 'bg-gray-100', color: 'text-gray-600' },
    }
    return iconConfig[type] || { icon: Bell, bg: 'bg-gray-100', color: 'text-gray-600' }
  }

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${isShaking ? 'animate-shake' : ''}`}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Sidebar Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Sliding Panel from Right */}
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 font-medium">{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
                  <button
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold hover:underline disabled:opacity-50"
                  >
                    Mark all read
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                    <Bell className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">No notifications yet</p>
                  <p className="text-sm text-gray-500 mt-2">We'll notify you when something arrives</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-all cursor-pointer group ${notification.status === 'UNREAD' ? 'bg-emerald-50/50 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'
                        }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          {(() => {
                            const iconData = getNotificationIcon(notification.type)
                            const IconComponent = iconData.icon
                            return (
                              <div className={`p-2.5 rounded-xl ${iconData.bg} shadow-sm`}>
                                <IconComponent className={`w-5 h-5 ${iconData.color}`} />
                              </div>
                            )
                          })()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`text-sm font-medium text-gray-900 ${notification.status === 'UNREAD' ? 'font-bold' : ''
                              }`}>
                              {notification.title}
                            </p>
                            {notification.status === 'UNREAD' && (
                              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0 mt-1 animate-pulse" />
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>

                          <p className="text-xs text-gray-500 mt-2 font-medium">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex flex-col items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {notification.status === 'UNREAD' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/dashboard/notifications')
                  }}
                  className="w-full text-center text-sm text-white bg-emerald-600 hover:bg-emerald-700 font-semibold py-3 rounded-xl transition-colors shadow-sm hover:shadow-md"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

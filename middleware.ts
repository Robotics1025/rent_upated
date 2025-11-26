import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Protect dashboard routes
    if (path.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Redirect users to their role-specific dashboard
      if (path === '/dashboard') {
        if (token.role === 'MANAGER') {
          return NextResponse.redirect(new URL('/dashboard/manager', req.url))
        } else if (token.role === 'MEMBER') {
          return NextResponse.redirect(new URL('/dashboard/tenant', req.url))
        }
        // ADMIN and SUPER_ADMIN stay on /dashboard
      }

      // Protect role-specific dashboards
      if (path.startsWith('/dashboard/manager') && token.role !== 'MANAGER') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      if (path.startsWith('/dashboard/tenant')) {
        if (token.role !== 'MEMBER') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }

      // Admin-only routes
      const adminRoutes = ['/dashboard/users']
      if (adminRoutes.some(route => path.startsWith(route))) {
        if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
          const defaultPath = token.role === 'MANAGER' ? '/dashboard/manager' : '/dashboard/tenant'
          return NextResponse.redirect(new URL(defaultPath, req.url))
        }
      }

      // Manager and Admin routes (properties, units, bookings, payments)
      const managerRoutes = ['/dashboard/properties', '/dashboard/units', '/dashboard/bookings', '/dashboard/payments']
      if (managerRoutes.some(route => path.startsWith(route))) {
        if (token.role === 'MEMBER') {
          return NextResponse.redirect(new URL('/dashboard/tenant', req.url))
        }
        // ADMIN, SUPER_ADMIN, and MANAGER can access these routes
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*']
}

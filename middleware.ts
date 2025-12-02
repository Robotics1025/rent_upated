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

      // Block MEMBER role from accessing dashboard
      if (token.role === 'MEMBER') {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Redirect users to their role-specific dashboard
      if (path === '/dashboard') {
        if (token.role === 'MANAGER') {
          return NextResponse.redirect(new URL('/dashboard/manager', req.url))
        }
        // ADMIN and SUPER_ADMIN stay on /dashboard
      }

      // Protect role-specific dashboards
      if (path.startsWith('/dashboard/manager') && token.role !== 'MANAGER') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // Admin-only routes
      const adminRoutes = ['/dashboard/users']
      if (adminRoutes.some(route => path.startsWith(route))) {
        if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
          return NextResponse.redirect(new URL('/dashboard/manager', req.url))
        }
      }

      // Manager and Admin routes (properties, units, bookings, payments)
      // ADMIN, SUPER_ADMIN, and MANAGER can access these routes
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

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

      // Admin-only routes
      const adminRoutes = ['/dashboard/users']
      if (adminRoutes.some(route => path.startsWith(route))) {
        if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }

      // Manager and Admin routes (properties, units, bookings, payments)
      const managerRoutes = ['/dashboard/properties', '/dashboard/units', '/dashboard/bookings', '/dashboard/payments']
      if (managerRoutes.some(route => path.startsWith(route))) {
        if (token.role === 'TENANT' || token.role === 'MEMBER') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
        // ADMIN and SUPER_ADMIN can access all manager routes
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

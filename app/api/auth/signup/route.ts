import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, phone, password, role } = await req.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, password' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength (minimum 8 characters, at least one letter and one number)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    if (!hasLetter || !hasNumber) {
      return NextResponse.json(
        { error: 'Password must contain at least one letter and one number' },
        { status: 400 }
      )
    }

    // Validate phone format if provided
    if (phone && !/^\+?[0-9\s\-()]+$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Validate role if provided
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
    const userRole = role && validRoles.includes(role) ? role : 'MANAGER'

    // Only allow MANAGER registration (admins created by super admin, tenants use separate app)
    if (role && role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Only MANAGER registration is allowed. Admins must be created by super admin.' },
        { status: 403 }
      )
    }

    // Create user with PENDING_VERIFICATION status
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role: userRole,
        status: 'PENDING_VERIFICATION', // User must verify email first
      }
    })

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Store verification token (you would typically have a separate table for this)
    // For now, we'll auto-verify or you can implement email verification later

    // TODO: Send verification email with token
    // await sendVerificationEmail(user.email, verificationToken)

    // For development: auto-verify and create session
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'ACTIVE',
        emailVerified: new Date()
      }
    })

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiry

    // Get request metadata
    const userAgent = req.headers.get('user-agent') || undefined
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') || undefined

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
        userAgent,
        ipAddress,
        deviceInfo: userAgent,
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        metadata: {
          email: user.email,
          role: user.role,
        },
        ipAddress,
        userAgent,
      }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        status: 'ACTIVE' // Return updated status
      },
      token: sessionToken,
      expiresAt: expiresAt.toISOString(),
      message: 'Account created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

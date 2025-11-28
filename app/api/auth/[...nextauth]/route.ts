import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    role?: string
    avatar?: string
    firstName?: string
    lastName?: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      avatar?: string
      image?: string
      firstName?: string
      lastName?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    id?: string
    avatar?: string
    firstName?: string
    lastName?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || user.status !== 'ACTIVE') {
          throw new Error('Invalid credentials')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          avatar: user.avatar === null ? undefined : user.avatar,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Create new user from Google
            const nameParts = user.name?.split(' ') || ['User', '']
            await prisma.user.create({
              data: {
                email: user.email!,
                firstName: nameParts[0] || 'User',
                lastName: nameParts.slice(1).join(' ') || '',
                password: '', // Google users don't have password
                role: 'MEMBER',
                status: 'ACTIVE',
                emailVerified: new Date(),
              }
            })
          }
          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.avatar = user.avatar === null ? undefined : user.avatar
        token.firstName = user.firstName
        token.lastName = user.lastName
      } else if (account?.provider === "google" && token.email) {
        // Fetch user data from database for Google users
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, avatar: true, firstName: true, lastName: true }
        })
        if (dbUser) {
          token.role = dbUser.role
          token.id = dbUser.id
          token.avatar = dbUser.avatar === null ? undefined : dbUser.avatar
          token.firstName = dbUser.firstName
          token.lastName = dbUser.lastName
        }
      } else if (token.id && token.email) {
        // Refresh user data on each request to keep avatar updated
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { avatar: true, firstName: true, lastName: true, role: true }
        })
        if (dbUser) {
          token.avatar = dbUser.avatar === null ? undefined : dbUser.avatar
          token.firstName = dbUser.firstName
          token.lastName = dbUser.lastName
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.avatar = token.avatar as string
        session.user.image = token.avatar as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
      }
      return session
    },
    // Ensure NextAuth only redirects to allowed locations
    async redirect({ url, baseUrl }) {
      try {
        const allowedOrigins = [baseUrl, process.env.NEXTAUTH_URL].filter(Boolean) as string[]
        const target = new URL(url, baseUrl)
        if (allowedOrigins.includes(target.origin)) return url
      } catch {
        // fall back to baseUrl
      }
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

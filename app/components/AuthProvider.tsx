'use client'

import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }: { children: React.node }) {
  return <SessionProvider>{children}</SessionProvider>
}

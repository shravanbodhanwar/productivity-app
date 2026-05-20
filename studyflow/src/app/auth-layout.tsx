'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AppShell } from '@/components/workspace/AppShell'
import type { User } from '@supabase/supabase-js'

const getSpabaseClient = async () => {
  const { supabase } = await import('@/lib/supabase')
  return supabase
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [noSupabase, setNoSupabase] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        const supabase = await getSpabaseClient()

        if (!supabase) {
          if (isMounted) {
            setNoSupabase(true)
            setLoading(false)
          }
          return
        }

        const { data } = await supabase.auth.getSession()
        if (isMounted) setUser(data.session?.user ?? null)

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!isMounted) return
          setUser(session?.user ?? null)
        })

        if (isMounted) setLoading(false)
        return () => listener?.subscription.unsubscribe()
      } catch (error) {
        console.error('Auth init error:', error)
        if (isMounted) setLoading(false)
      }
    }

    initAuth()
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f7f6f3] text-[rgba(55,53,47,0.5)]">
        Loading…
      </div>
    )
  }

  if (pathname === '/auth') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    const supabase = await getSpabaseClient()
    if (supabase) {
      await supabase.auth.signOut()
      router.push('/auth')
    }
  }

  return (
    <AppShell
      userId={user?.id ?? null}
      userEmail={user?.email}
      onLogout={user ? handleLogout : undefined}
    >
      {children}
    </AppShell>
  )
}

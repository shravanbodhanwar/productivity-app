'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ Setup Required</h1>
          <p className="text-gray-600 mb-6">
            Please configure Supabase credentials in <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-xs mb-6 font-mono overflow-auto">
            <p className="font-bold mb-2">Required environment variables:</p>
            <pre className="whitespace-pre-wrap">{`NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
GEMINI_API_KEY=your_key`}</pre>
          </div>
          <p className="text-gray-600 mb-4">
            Then restart the dev server
          </p>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Get Supabase (Free) →
          </a>
        </div>
      </div>
    )
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase!.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
          },
        })
        if (error) throw error
        alert('Check your email to confirm your account!')
      } else {
        const { error } = await supabase!.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f6f3]">
      <div className="w-full max-w-md px-4">
        <div className="rounded-xl border border-[rgba(55,53,47,0.09)] bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-[#37352f] text-sm font-bold text-white">
              S
            </span>
            <h1 className="text-2xl font-bold text-[#37352f]">StudyFlow</h1>
          </div>
          <p className="mb-8 text-center text-sm text-[rgba(55,53,47,0.55)]">
            Sign in to sync your workspace across devices
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#37352f]">Email</label>
              <div className="flex items-center rounded-md border border-[rgba(55,53,47,0.12)] px-3 py-2 focus-within:border-[#2383e2]">
                <Mail className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#37352f]">Password</label>
              <div className="flex items-center rounded-md border border-[rgba(55,53,47,0.12)] px-3 py-2 focus-within:border-[#2383e2]">
                <Lock className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#37352f] py-2.5 text-sm font-medium text-white hover:bg-[#2f2d28] disabled:opacity-50"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-gray-600 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="font-medium text-[#2383e2] hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

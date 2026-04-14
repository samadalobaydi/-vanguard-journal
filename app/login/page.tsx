'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="font-bebas text-4xl tracking-widest text-gold">
            Vanguard
          </Link>
          <p className="mt-2 text-sm text-gray-500 tracking-widest uppercase">
            Discipline Journal
          </p>
        </div>

        {/* Card */}
        <div
          className="border border-white/[0.07] bg-dark p-8"
          style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
        >
          <h1 className="font-bebas text-3xl tracking-wider text-white mb-1">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Sign in to continue your discipline practice.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium tracking-widest uppercase text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-dark-2 border border-white/[0.08] text-white placeholder-gray-600 px-4 py-3 text-sm focus-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-widest uppercase text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-2 border border-white/[0.08] text-white placeholder-gray-600 px-4 py-3 text-sm focus-gold transition-colors"
              />
            </div>

            {error && (
              <div className="border border-red-900/50 bg-red-950/30 text-red-400 text-sm px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-black font-bold text-sm tracking-widest uppercase py-3.5 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          No account?{' '}
          <Link href="/signup" className="text-gold hover:text-gold-light transition-colors">
            Start your journey
          </Link>
        </p>
      </div>
    </div>
  )
}

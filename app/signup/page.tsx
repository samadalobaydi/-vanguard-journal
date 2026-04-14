'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If email confirmation is disabled in Supabase, session is returned immediately
    if (data.session) {
      router.push('/subscribe')
      router.refresh()
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="font-bebas text-5xl text-gold tracking-widest mb-4">
            Check Your Email
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            We've sent a confirmation link to <strong className="text-white">{email}</strong>.
            Click it to activate your account and begin your journey.
          </p>
          <Link
            href="/login"
            className="inline-block mt-8 text-sm text-gold tracking-widest uppercase hover:text-gold-light transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-4">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-bebas text-4xl tracking-widest text-gold">
            Vanguard
          </Link>
          <p className="mt-2 text-sm text-gray-500 tracking-widest uppercase">
            Discipline Journal
          </p>
        </div>

        <div
          className="border border-white/[0.07] bg-dark p-8"
          style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
        >
          <h1 className="font-bebas text-3xl tracking-wider text-white mb-1">
            Begin Your Journey
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Create your account. Discipline starts now.
          </p>

          <form onSubmit={handleSignup} className="space-y-5">
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
                placeholder="Minimum 8 characters"
                className="w-full bg-dark-2 border border-white/[0.08] text-white placeholder-gray-600 px-4 py-3 text-sm focus-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-widest uppercase text-gray-400 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-gold hover:text-gold-light transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

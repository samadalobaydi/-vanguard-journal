'use client'

import { useState } from 'react'
import Link from 'next/link'

const FEATURES = [
  { icon: '◆', text: 'Daily structured journal: morning intention, evening review, tomorrow\'s target' },
  { icon: '◈', text: 'Live discipline score — 0 to 100 — based on your daily follow-through' },
  { icon: '🔥', text: 'Streak tracking that compounds into identity-level accountability' },
  { icon: '◇', text: 'Weekly performance history with 14-day visual grid' },
  { icon: '⚡', text: 'Private Vanguard brotherhood community access' },
  { icon: '★', text: '30 / 60 / 90 / 365 day mastery milestones' },
]

export default function SubscribePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscribe() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Failed to create checkout session.')
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base flex flex-col">
      {/* Background */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(201,168,76,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bebas text-2xl tracking-widest text-gold">
          Vanguard
        </Link>
        <Link
          href="/login"
          className="text-xs tracking-widest uppercase text-gray-600 hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block border border-gold/30 text-gold text-xs tracking-widest uppercase px-4 py-1.5 mb-6">
              Discipline Journal App
            </span>
            <h1 className="font-bebas text-5xl sm:text-6xl tracking-wider text-white leading-none mb-4">
              Unlock Your
              <br />
              <span className="text-gold">Daily Arsenal</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
              One subscription. Every tool you need to hold yourself to the standard most men will
              never reach.
            </p>
          </div>

          {/* Pricing card */}
          <div
            className="border border-gold/20 relative"
            style={{ background: 'rgba(201,168,76,0.02)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold/40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold/40" />

            <div className="p-8 sm:p-10">
              {/* Price */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bebas text-6xl text-gold tracking-wider leading-none">£9.99</span>
                <span className="text-gray-500 text-sm tracking-widest uppercase">/ month</span>
              </div>
              <p className="text-xs text-gray-600 mb-8 tracking-wide">
                Cancel anytime. No contracts. No compromise.
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {FEATURES.map((f) => (
                  <li key={f.text} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-gold mt-0.5 flex-shrink-0">{f.icon}</span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <div className="border-t border-white/[0.06] mb-8" />

              {/* CTA */}
              {error && (
                <div className="border border-red-900/50 bg-red-950/30 text-red-400 text-sm px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-gold text-black font-bold text-sm tracking-widest uppercase py-4 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Redirecting to Checkout...' : 'Start for £9.99 / Month'}
              </button>

              <p className="text-center text-xs text-gray-700 mt-4 tracking-wide">
                🔒 Secure checkout via Stripe. 30-day money-back guarantee.
              </p>

              <p className="text-center text-sm text-gray-600 mt-5">
                Already have an account?{' '}
                <Link href="/login" className="text-gold hover:text-gold-light transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Social proof */}
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            {[
              { n: '14,000+', l: 'Members' },
              { n: '87%', l: '90-Day Streak Rate' },
              { n: '4.9★', l: 'Average Rating' },
            ].map((s) => (
              <div key={s.l} className="border border-white/[0.05] bg-dark py-4">
                <div className="font-bebas text-2xl text-gold tracking-wider">{s.n}</div>
                <div className="text-xs text-gray-600 tracking-wider uppercase mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

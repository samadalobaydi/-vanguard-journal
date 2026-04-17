'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Props {
  email: string
  streak: number
}

function BoltSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polyline points="9,1 5,7 9,7 5,13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function DashboardNav({ email, streak }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-base/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard">
          <img src="/vanguard-logo.png" alt="Vanguard" style={{ height: 80, width: 'auto', display: 'block' }} />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Streak badge */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5"
            style={{ border: '1px solid rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.06)' }}
          >
            <BoltSVG />
            <span
              style={{
                color: '#A855F7',
                fontSize: 16,
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {streak}
            </span>
            <span className="text-xs text-gray-500 tracking-widest uppercase leading-none">
              Day Streak
            </span>
          </div>

          {/* Email */}
          <span className="hidden md:block text-xs text-gray-600 truncate max-w-[180px]">
            {email}
          </span>

          {/* Manage subscription */}
          <button
            onClick={async () => {
              const res = await fetch('/api/stripe/portal', { method: 'POST' })
              const data = await res.json()
              if (data.url) window.location.href = data.url
            }}
            className="hidden sm:block text-xs tracking-widest uppercase text-gray-500 hover:text-white transition-colors"
          >
            Billing
          </button>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="text-xs tracking-widest uppercase text-gray-500 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}

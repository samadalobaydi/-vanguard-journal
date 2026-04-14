'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Props {
  email: string
  streak: number
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
        <Link href="/dashboard" className="font-bebas text-2xl tracking-widest text-gold">
          Vanguard
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Streak badge */}
          <div className="hidden sm:flex items-center gap-2 border border-gold/20 bg-gold-muted px-3 py-1.5">
            <span className="text-base leading-none">🔥</span>
            <span className="font-bebas text-gold text-lg tracking-wider leading-none">{streak}</span>
            <span className="text-xs text-gray-500 tracking-widest uppercase leading-none">Day Streak</span>
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
            className="hidden sm:block text-xs tracking-widest uppercase text-gray-500 hover:text-gold transition-colors"
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

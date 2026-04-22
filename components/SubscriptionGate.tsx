'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SubscriptionGate() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
      }}
    >
      {/* Logo */}
      <img
        src="/vanguard-logo.png"
        alt="Vanguard"
        style={{ height: 72, width: 'auto', mixBlendMode: 'screen', marginBottom: 32 }}
      />

      {/* Heading */}
      <p style={{
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '4px',
        textTransform: 'uppercase',
        margin: '0 0 16px',
        textAlign: 'center',
        fontFamily: 'inherit',
      }}>
        Activate Your Vanguard
      </p>

      {/* Subtext */}
      <p style={{
        color: '#A9A9A9',
        fontSize: 13,
        lineHeight: 1.8,
        maxWidth: 320,
        textAlign: 'center',
        margin: '0 0 40px',
        fontFamily: 'inherit',
      }}>
        You have signed the contract. Now fund the standard.
      </p>

      {/* CTA button */}
      <a
        href="/payment"
        style={{
          display: 'inline-block',
          border: '1px solid #A855F7',
          color: '#A855F7',
          background: 'transparent',
          fontSize: 12,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          padding: '14px 28px',
          textDecoration: 'none',
          fontFamily: 'inherit',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#A855F7'
          e.currentTarget.style.color = '#000000'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#A855F7'
        }}
      >
        [ Activate — £9.99/month ]
      </a>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        style={{
          marginTop: 32,
          background: 'none',
          border: 'none',
          color: '#333333',
          fontSize: 10,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#A9A9A9' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#333333' }}
      >
        Sign Out
      </button>
    </div>
  )
}

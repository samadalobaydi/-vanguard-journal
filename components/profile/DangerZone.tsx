'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DangerZone() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid rgba(127,29,29,0.4)',
        borderRadius: 16,
        padding: '24px 28px',
      }}
    >
      <p
        style={{
          color: '#555555',
          letterSpacing: '3px',
          fontSize: 10,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        Danger Zone
      </p>
      <p style={{ color: '#555555', fontSize: 12, marginBottom: 20 }}>
        Sign out of your account on this device.
      </p>
      <button
        onClick={handleSignOut}
        style={{
          background: 'transparent',
          color: '#fca5a5',
          border: '1px solid rgba(127,29,29,0.6)',
          padding: '10px 24px',
          fontSize: 10,
          letterSpacing: '3px',
          fontWeight: 600,
          textTransform: 'uppercase',
          cursor: 'pointer',
          borderRadius: 4,
          transition: 'background 0.2s, border-color 0.2s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(127,29,29,0.15)'
          e.currentTarget.style.borderColor = 'rgba(127,29,29,0.9)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'rgba(127,29,29,0.6)'
        }}
      >
        Sign Out
      </button>
    </div>
  )
}

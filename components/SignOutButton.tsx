'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.25)',
        fontSize: 9,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono), monospace',
        padding: '8px 0',
        minHeight: 48,
      }}
    >
      SIGN OUT
    </button>
  )
}

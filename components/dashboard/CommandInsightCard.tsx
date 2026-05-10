'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function CommandInsightCard() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('daily_commands')
        .select('standards')
        .eq('user_id', user.id)
        .eq('command_date', todayStr())
        .maybeSingle()

      const hasStandards = (data?.standards?.length ?? 0) > 0
      setShow(!hasStandards)
    }
    check()
  }, [])

  if (!show) return null

  function openModal() {
    window.dispatchEvent(new Event('vanguard:open-commit-modal'))
  }

  const SYS: React.CSSProperties = { fontFamily: 'system-ui, -apple-system, sans-serif' }

  return (
    <div style={{
      background: '#272727',
      border: '1px solid rgba(139,92,246,0.18)',
      borderRadius: 16,
      padding: '16px 18px',
      marginBottom: 12,
    }}>
      <p style={{
        color: '#666', fontSize: 10, fontWeight: 600,
        letterSpacing: '0.1em', marginBottom: 8,
        ...SYS,
      }}>
        COMMAND INSIGHT
      </p>
      <p style={{
        color: '#EDEDED', fontSize: 13, lineHeight: 1.55, marginBottom: 8,
        ...SYS,
      }}>
        Discipline improves when the day starts with fewer choices. Set 3 standards and execute them cleanly.
      </p>
      <p style={{ color: '#4A4A4A', fontSize: 11, marginBottom: 14, ...SYS }}>
        Recommended: 1 Resist + 2 Execute
      </p>
      <button
        onClick={openModal}
        style={{
          background: 'none', border: 'none',
          color: '#8B5CF6', fontSize: 12, fontWeight: 500,
          cursor: 'pointer', padding: 0,
          ...SYS,
        }}
      >
        Set Today&apos;s Standards →
      </button>
    </div>
  )
}

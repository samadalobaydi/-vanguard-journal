'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const SYS:  React.CSSProperties = { fontFamily: 'system-ui, -apple-system, sans-serif' }

const VIOLET = '#8B5CF6'
const GOLD   = '#C4A55A'
const TEXT   = '#EDEDED'
const MUTED  = '#888888'
const DARK   = '#1E1E22'

const CARD: React.CSSProperties = {
  background: '#272727',
  borderRadius: 16,
  padding: '20px',
  marginBottom: 12,
}

const TEXTAREA: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: DARK,
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 10,
  padding: '10px 12px',
  color: TEXT,
  fontSize: 13,
  outline: 'none',
  resize: 'none',
  lineHeight: 1.5,
  ...SYS,
}

const LABEL: React.CSSProperties = {
  color: MUTED,
  fontSize: 10,
  letterSpacing: '0.1em',
  marginBottom: 5,
  ...SYS,
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function EndOfDayReview() {
  const [showCard,     setShowCard]     = useState(false)
  const [submitted,    setSubmitted]    = useState(false)
  const [userId,       setUserId]       = useState<string | null>(null)
  const [heldText,     setHeldText]     = useState('')
  const [slippedText,  setSlippedText]  = useState('')
  const [tomorrowText, setTomorrowText] = useState('')
  const [saving,       setSaving]       = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      const today = todayStr()

      // Read today's standards — only proceed if standards exist
      const { data: cmd } = await supabase
        .from('daily_commands')
        .select('standards, is_complete')
        .eq('user_id', user.id)
        .eq('command_date', today)
        .maybeSingle()

      const hasStandards = Array.isArray(cmd?.standards) && cmd.standards.length > 0
      if (!hasStandards) return

      // Show if all done OR local time is at or after 8 PM
      const allDone   = cmd!.is_complete === true
      const pastEight = new Date().getHours() >= 20
      if (!allDone && !pastEight) return

      // Check for an existing review today
      const { data: review } = await supabase
        .from('daily_reviews')
        .select('held_text, slipped_text, tomorrow_text')
        .eq('user_id', user.id)
        .eq('review_date', today)
        .maybeSingle()

      if (review) {
        setHeldText(review.held_text ?? '')
        setSlippedText(review.slipped_text ?? '')
        setTomorrowText(review.tomorrow_text ?? '')
        setSubmitted(true)
      }

      setShowCard(true)
    }
    load()
  }, [])

  if (!showCard) return null

  async function handleSubmit() {
    if (!userId || saving) return
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase.from('daily_reviews').upsert({
        user_id:       userId,
        review_date:   todayStr(),
        held_text:     heldText,
        slipped_text:  slippedText,
        tomorrow_text: tomorrowText,
        updated_at:    new Date().toISOString(),
      }, { onConflict: 'user_id,review_date' })
      setSubmitted(true)
    } finally {
      setSaving(false)
    }
  }

  /* ── COMPLETED STATE ── */
  if (submitted) {
    return (
      <div style={{
        ...CARD,
        border: '1px solid rgba(196,165,90,0.2)',
        boxShadow: '0 0 20px rgba(196,165,90,0.05), 0 2px 12px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.5" stroke={GOLD} strokeWidth="1.5" />
            <path d="M8 12l3 3 5-5" stroke={GOLD} strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p style={{ color: GOLD, fontSize: 12, fontWeight: 600, margin: 0, letterSpacing: '0.05em', ...SYS }}>
            Record Closed
          </p>
        </div>
        <p style={{ color: TEXT, fontSize: 14, fontWeight: 600, marginBottom: 4, ...SYS }}>
          Today has been reviewed.
        </p>
        <p style={{ color: MUTED, fontSize: 11, fontStyle: 'italic', ...SYS }}>
          Return tomorrow and hold the standard again.
        </p>
      </div>
    )
  }

  /* ── REVIEW FORM ── */
  return (
    <div style={{
      ...CARD,
      border: '1px solid rgba(139,92,246,0.15)',
      boxShadow: '0 0 24px rgba(139,92,246,0.06), 0 2px 12px rgba(0,0,0,0.4)',
    }}>
      {/* Header */}
      <p style={{ color: TEXT, fontSize: 16, fontWeight: 700, marginBottom: 3, ...SYS }}>
        End of Day Review
      </p>
      <p style={{ color: MUTED, fontSize: 11, fontStyle: 'italic', marginBottom: 20, ...SYS }}>
        Close the day with honesty.
      </p>

      {/* Q1 */}
      <p style={LABEL}>WHAT DID YOU HOLD TODAY?</p>
      <textarea
        rows={2}
        value={heldText}
        onChange={e => setHeldText(e.target.value)}
        placeholder="What did you follow through on?"
        style={{ ...TEXTAREA, marginBottom: 14 }}
      />

      {/* Q2 */}
      <p style={LABEL}>WHERE DID YOU SLIP?</p>
      <textarea
        rows={2}
        value={slippedText}
        onChange={e => setSlippedText(e.target.value)}
        placeholder="Where did you fall short?"
        style={{ ...TEXTAREA, marginBottom: 14 }}
      />

      {/* Q3 */}
      <p style={LABEL}>WHAT CHANGES TOMORROW?</p>
      <textarea
        rows={2}
        value={tomorrowText}
        onChange={e => setTomorrowText(e.target.value)}
        placeholder="What needs to change tomorrow?"
        style={{ ...TEXTAREA, marginBottom: 20 }}
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        style={{
          width: '100%', height: 46,
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          border: 'none', borderRadius: 12,
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.6 : 1,
          boxShadow: saving ? 'none' : '0 4px 16px rgba(99,102,241,0.25)',
          ...SYS,
        }}
      >
        {saving ? 'Saving…' : "Close Today's Record"}
      </button>
    </div>
  )
}

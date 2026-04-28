'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Entry {
  id?: string
  morning_intention?: string | null
  evening_review?: string | null
  tomorrow_target?: string | null
}

interface Props {
  date: string
  initialEntry: Entry | null
  reEntryRequired: boolean
}

const FIELDS: { key: keyof Omit<Entry, 'id'>; label: string; placeholder: string }[] = [
  {
    key: 'morning_intention',
    label: 'Morning Intention',
    placeholder:
      'What is your single most important commitment today? Who do you choose to be in the next 24 hours?',
  },
  {
    key: 'evening_review',
    label: 'Evening Review',
    placeholder:
      'Did you honour your intention? Where did you hold the line — and where did you compromise?',
  },
  {
    key: 'tomorrow_target',
    label: "Tomorrow's Target",
    placeholder:
      'What three things will move the needle tomorrow? No more than three. Commit to them now.',
  },
]

export default function ReckoningCard({ date, initialEntry, reEntryRequired }: Props) {
  const router = useRouter()
  const [fields, setFields] = useState({
    morning_intention: initialEntry?.morning_intention ?? '',
    evening_review: initialEntry?.evening_review ?? '',
    tomorrow_target: initialEntry?.tomorrow_target ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setField(key: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const isFilled = (key: keyof typeof fields) => (fields[key] ?? '').trim().length > 0

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, ...fields }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save entry.')
      }
      setSaved(true)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #1a0533, #0d0020)',
        border: reEntryRequired
          ? '1px solid rgba(127,29,29,0.8)'
          : '1px solid rgba(168,85,247,0.2)',
        borderRadius: 16,
        padding: '20px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 9,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono), monospace',
          }}
        >
          60-Second Reckoning
        </p>
        {reEntryRequired && (
          <span
            style={{
              background: 'rgba(127,29,29,0.4)',
              color: '#fca5a5',
              padding: '3px 10px',
              borderRadius: 4,
              fontSize: 9,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              border: '1px solid rgba(127,29,29,0.6)',
              fontFamily: 'var(--font-mono), monospace',
            }}
          >
            Required
          </span>
        )}
      </div>

      {reEntryRequired && (
        <div
          style={{
            border: '1px solid rgba(127,29,29,0.6)',
            background: 'rgba(127,29,29,0.08)',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 20,
          }}
        >
          <p style={{ color: '#fca5a5', fontSize: 12, lineHeight: 1.65, fontFamily: 'var(--font-mono), monospace' }}>
            The standard slipped. Complete your reckoning entry to restore your streak.
          </p>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {FIELDS.map(({ key, label, placeholder }, idx) => {
            const filled = isFilled(key)
            const isLast = idx === FIELDS.length - 1
            return (
              <div key={key} style={{ display: 'flex', gap: 14 }}>
                {/* Dot + connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2, flexShrink: 0 }}>
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: '50%',
                      background: filled ? '#A855F7' : 'transparent',
                      border: filled ? '2px solid #A855F7' : '2px solid rgba(168,85,247,0.2)',
                      transition: 'all 0.35s ease',
                      flexShrink: 0,
                      boxShadow: filled ? '0 0 8px rgba(168,85,247,0.4)' : 'none',
                    }}
                  />
                  {!isLast && (
                    <div
                      style={{
                        width: 1,
                        flex: 1,
                        background: 'rgba(168,85,247,0.15)',
                        marginTop: 5,
                        marginBottom: 5,
                        minHeight: 14,
                      }}
                    />
                  )}
                </div>

                {/* Field */}
                <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
                  <label
                    style={{
                      display: 'block',
                      color: 'rgba(255,255,255,0.4)',
                      letterSpacing: '2px',
                      fontSize: 9,
                      textTransform: 'uppercase',
                      marginBottom: 8,
                      fontFamily: 'var(--font-mono), monospace',
                    }}
                  >
                    {label}
                  </label>
                  <textarea
                    value={fields[key] ?? ''}
                    onChange={(e) => setField(key, e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid',
                      borderColor: filled ? 'rgba(168,85,247,0.4)' : 'rgba(168,85,247,0.1)',
                      borderRadius: 8,
                      color: '#ffffff',
                      fontSize: 13,
                      lineHeight: 1.65,
                      padding: '12px 14px',
                      resize: 'none',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      fontFamily: 'var(--font-mono), monospace',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.6)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = filled ? 'rgba(168,85,247,0.4)' : 'rgba(168,85,247,0.1)' }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: 12, marginTop: 12, fontFamily: 'var(--font-mono), monospace' }}>{error}</p>
        )}

        <div
          style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid rgba(168,85,247,0.1)',
          }}
        >
          {saved && (
            <p
              style={{
                color: '#A855F7',
                fontSize: 10,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: 12,
                textAlign: 'center',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              Entry committed. The record stands.
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              minHeight: 52,
              background: saving || saved ? 'rgba(168,85,247,0.15)' : '#A855F7',
              color: saving || saved ? '#A855F7' : '#ffffff',
              border: '1px solid rgba(168,85,247,0.5)',
              borderRadius: 12,
              fontSize: 11,
              letterSpacing: '3px',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              fontFamily: 'var(--font-mono), monospace',
              boxShadow: saved ? 'none' : '0 0 20px rgba(168,85,247,0.25)',
            }}
          >
            {saving ? 'Saving...' : saved ? 'Update Entry' : 'Commit Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}

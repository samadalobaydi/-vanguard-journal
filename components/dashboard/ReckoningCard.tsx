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

  const isFilled = (key: keyof typeof fields) =>
    (fields[key] ?? '').trim().length > 0

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
        background: '#111111',
        border: reEntryRequired ? '1px solid rgba(127,29,29,0.8)' : '1px solid #1e1e1e',
        borderRadius: 16,
        padding: '24px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <p
          style={{
            color: '#555555',
            letterSpacing: '3px',
            fontSize: 10,
            textTransform: 'uppercase',
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
            }}
          >
            Reckoning Required
          </span>
        )}
      </div>

      {/* Re-entry warning */}
      {reEntryRequired && (
        <div
          style={{
            border: '1px solid rgba(127,29,29,0.6)',
            background: 'rgba(127,29,29,0.08)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
          }}
        >
          <p style={{ color: '#fca5a5', fontSize: 13, lineHeight: 1.65 }}>
            The standard slipped. The man doesn&apos;t. Complete your reckoning entry to restore
            your streak.
          </p>
        </div>
      )}

      {/* Fields */}
      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {FIELDS.map(({ key, label, placeholder }, idx) => {
            const filled = isFilled(key)
            const isLast = idx === FIELDS.length - 1
            return (
              <div key={key} style={{ display: 'flex', gap: 16 }}>
                {/* Dot + connector */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: 2,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: filled ? '#A855F7' : 'transparent',
                      border: filled ? '2px solid #A855F7' : '2px solid #1e1e1e',
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
                        background: '#1e1e1e',
                        marginTop: 6,
                        marginBottom: 6,
                        minHeight: 16,
                      }}
                    />
                  )}
                </div>

                {/* Field */}
                <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
                  <label
                    style={{
                      display: 'block',
                      color: '#A9A9A9',
                      letterSpacing: '2px',
                      fontSize: 9,
                      textTransform: 'uppercase',
                      marginBottom: 8,
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
                      background: '#0A0A0A',
                      border: '1px solid',
                      borderColor: filled ? 'rgba(168,85,247,0.3)' : '#1e1e1e',
                      borderRadius: 8,
                      color: '#ffffff',
                      fontSize: 13,
                      lineHeight: 1.65,
                      padding: '10px 14px',
                      resize: 'none',
                      outline: 'none',
                      transition: 'border-color 0.35s ease',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = filled
                        ? 'rgba(168,85,247,0.3)'
                        : '#1e1e1e'
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: 12, marginTop: 12 }}>{error}</p>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid #1e1e1e',
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: saved ? '#A855F7' : '#555555',
              letterSpacing: '1px',
              transition: 'color 0.3s',
            }}
          >
            {saved ? 'Entry committed. The record stands.' : 'Not yet committed.'}
          </p>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: '#A855F7',
              color: '#ffffff',
              border: 'none',
              padding: '11px 28px',
              fontSize: 10,
              letterSpacing: '3px',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1,
              borderRadius: 6,
              transition: 'opacity 0.2s, transform 0.1s',
              fontFamily: 'inherit',
            }}
          >
            {saving ? 'Saving...' : saved ? 'Update Entry' : 'Commit Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}

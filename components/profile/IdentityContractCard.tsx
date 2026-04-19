'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  initialStatement: string | null
}

export default function IdentityContractCard({ userId, initialStatement }: Props) {
  const [value, setValue] = useState(initialStatement ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [btnHover, setBtnHover] = useState(false)
  const MAX = 150

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const supabase = createClient()
      const { error: err } = await supabase
        .from('profiles')
        .update({ identity_statement: value.trim() || null })
        .eq('id', userId)
      if (err) throw new Error(err.message)
      setSaved(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #1e1e1e',
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
        Identity Contract
      </p>
      <p style={{ color: '#555555', fontSize: 12, lineHeight: 1.6, marginBottom: 20 }}>
        Define the man you are committed to being. This statement will appear at the top of every
        entry.
      </p>

      <form onSubmit={handleSave}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= MAX) {
                setValue(e.target.value)
                setSaved(false)
              }
            }}
            rows={4}
            placeholder="I am a man who holds the line. I do not negotiate with weakness..."
            style={{
              width: '100%',
              background: '#0A0A0A',
              border: '1px solid #1e1e1e',
              borderRadius: 2,
              color: '#ffffff',
              fontSize: 14,
              lineHeight: 1.65,
              padding: '12px 14px',
              paddingBottom: 28,
              resize: 'none',
              outline: 'none',
              fontFamily: 'var(--font-mono), monospace',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#1e1e1e')}
          />
          <span
            style={{
              position: 'absolute',
              bottom: 8,
              right: 12,
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 10,
              color: value.length >= MAX ? '#ef4444' : '#555555',
            }}
          >
            {value.length}/{MAX}
          </span>
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{error}</p>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 16,
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
            {saved ? 'Contract signed. Identity locked.' : ''}
          </p>
          <button
            type="submit"
            disabled={saving}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              background: '#A855F7',
              color: '#ffffff',
              border: '2px solid #A855F7',
              padding: '11px 28px',
              fontSize: 10,
              letterSpacing: '3px',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1,
              borderRadius: 4,
              transition: 'opacity 0.2s, box-shadow 0.25s ease',
              fontFamily: 'inherit',
              boxShadow: btnHover
                ? '0 0 25px rgba(168, 85, 247, 0.5)'
                : '0 0 12px rgba(168, 85, 247, 0.3)',
            }}
          >
            {saving ? 'Saving...' : saved ? 'Update Contract' : 'Sign The Contract'}
          </button>
        </div>
      </form>
    </div>
  )
}

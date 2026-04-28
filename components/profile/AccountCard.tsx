'use client'

import { useState } from 'react'

interface Props {
  email: string
  memberSince: string
}

export default function AccountCard({ email, memberSince }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleBilling() {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #120028, #080015)',
        border: '1px solid rgba(168,85,247,0.15)',
        borderRadius: 16,
        padding: '20px',
        overflow: 'hidden',
      }}
    >
      <p
        style={{
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '3px',
          fontSize: 9,
          textTransform: 'uppercase',
          marginBottom: 16,
          fontFamily: 'var(--font-mono), monospace',
        }}
      >
        Account
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Email */}
        <div>
          <p
            style={{
              color: '#555555',
              letterSpacing: '2px',
              fontSize: 9,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Email
          </p>
          <p
            style={{
              color: '#A9A9A9',
              fontSize: 13,
              fontFamily: 'var(--font-mono), monospace',
            }}
          >
            {email}
          </p>
        </div>

        {/* Member Since */}
        <div>
          <p
            style={{
              color: '#555555',
              letterSpacing: '2px',
              fontSize: 9,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Member Since
          </p>
          <p
            style={{
              color: '#A9A9A9',
              fontSize: 13,
              fontFamily: 'var(--font-mono), monospace',
            }}
          >
            {memberSince}
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(168,85,247,0.08)', paddingTop: 16 }}>
          <button
            onClick={handleBilling}
            disabled={loading}
            style={{
              width: '100%',
              minHeight: 52,
              background: 'rgba(168,85,247,0.08)',
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(168,85,247,0.2)',
              fontSize: 10,
              letterSpacing: '3px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              borderRadius: 12,
              fontFamily: 'var(--font-mono), monospace',
            }}
          >
            {loading ? 'Redirecting...' : 'Manage Billing'}
          </button>
        </div>
      </div>
    </div>
  )
}

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
          marginBottom: 20,
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
        <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 16 }}>
          <button
            onClick={handleBilling}
            disabled={loading}
            style={{
              background: 'transparent',
              color: '#A9A9A9',
              border: '1px solid #1e1e1e',
              padding: '10px 24px',
              fontSize: 10,
              letterSpacing: '3px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              borderRadius: 4,
              transition: 'border-color 0.2s, color 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#A855F7'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#1e1e1e'
              e.currentTarget.style.color = '#A9A9A9'
            }}
          >
            {loading ? 'Redirecting...' : 'Manage Billing'}
          </button>
        </div>
      </div>
    </div>
  )
}

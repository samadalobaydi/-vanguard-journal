'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PaymentPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleActivate() {
    setStatus('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/create-checkout-session', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Failed to create checkout session.')
      if (data.url) window.location.href = data.url
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred.')
      setStatus('error')
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div
      style={{
        background: '#000000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

        .activate-btn {
          width: 100%;
          background: transparent;
          border: 1px solid #A855F7;
          color: #A855F7;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 16px 24px;
          cursor: pointer;
          transition: box-shadow 0.3s, background 0.3s;
        }

        .activate-btn:hover:not(:disabled) {
          background: rgba(168,85,247,0.08);
          box-shadow: 0 0 24px rgba(168,85,247,0.4), inset 0 0 24px rgba(168,85,247,0.06);
        }

        .activate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .signout-btn {
          background: none;
          border: none;
          color: #333333;
          font-family: inherit;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
        }

        .signout-btn:hover {
          color: #A9A9A9;
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img
            src="/vanguard-logo.png"
            alt="Vanguard"
            style={{ height: 80, width: 'auto', display: 'inline-block', mixBlendMode: 'screen' }}
          />
        </div>

        {/* Title */}
        <p style={{
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '5px',
          textTransform: 'uppercase',
          textAlign: 'center',
          margin: '0 0 8px',
        }}>
          ACTIVATE FULL TERMINAL
        </p>

        {/* Subtitle */}
        <p style={{
          color: '#555555',
          fontSize: 10,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          textAlign: 'center',
          margin: '0 0 40px',
        }}>
          £9.99 / MONTH · CANCEL ANYTIME
        </p>

        {/* Specs card */}
        <div style={{
          border: '1px solid #1e1e1e',
          background: 'rgba(255,255,255,0.02)',
          padding: '24px 28px',
          marginBottom: 32,
        }}>
          <p style={{
            color: '#555555',
            fontSize: 10,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            margin: '0 0 20px',
          }}>
            [ Terminal Specifications ]
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Zero-Knowledge Privacy', detail: 'We cannot see your logs. Total data autonomy.' },
              { label: 'No External Tracking', detail: 'Zero advertisers. Zero data brokers.' },
              { label: 'Full Tactical Arsenal', detail: 'AI Auditor, 60-Second Reckonings, and Global Tribal Boards.' },
            ].map(({ label, detail }) => (
              <li key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: '#A855F7', fontSize: 10, marginTop: 2, flexShrink: 0 }}>▸</span>
                <span style={{ color: '#A9A9A9', fontSize: 12, lineHeight: 1.6 }}>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>{label}:</span>{' '}{detail}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Error */}
        {errorMsg && (
          <div style={{
            border: '1px solid rgba(127,29,29,0.6)',
            background: 'rgba(127,29,29,0.1)',
            color: '#fca5a5',
            fontSize: 11,
            letterSpacing: '1px',
            padding: '10px 14px',
            marginBottom: 16,
          }}>
            {errorMsg}
          </div>
        )}

        {/* CTA */}
        <button
          className="activate-btn"
          onClick={handleActivate}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? '[ CONNECTING TO STRIPE... ]' : '[ CONFIRM ACTIVATION ]'}
        </button>

        {/* Legal */}
        <p style={{
          color: '#333333',
          fontSize: 10,
          letterSpacing: '1px',
          textAlign: 'center',
          margin: '20px 0 32px',
          lineHeight: 1.7,
        }}>
          Encrypted by Stripe. We never store your card details.
        </p>

        {/* Sign out */}
        <div style={{ textAlign: 'center' }}>
          <button className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>

      </div>
    </div>
  )
}

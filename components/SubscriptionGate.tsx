'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onDismiss?: () => void
}

export default function SubscriptionGate({ onDismiss }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
        overflowY: 'auto',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

        .gate-btn {
          width: 100%;
          background: transparent;
          border: 1px solid #A9A9A9;
          color: #ffffff;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 16px 24px;
          cursor: pointer;
          text-decoration: none;
          display: block;
          text-align: center;
          transition: border-color 0.2s, color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .gate-btn:hover {
          border-color: #A855F7;
          color: #A855F7;
          box-shadow: 0 0 18px rgba(168,85,247,0.35), inset 0 0 18px rgba(168,85,247,0.05);
        }

        .gate-signout {
          background: none;
          border: none;
          color: #555555;
          font-family: inherit;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
        }

        .gate-signout:hover {
          color: #A9A9A9;
        }
      `}</style>

      {/* X dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'none',
            border: 'none',
            color: '#555555',
            fontSize: 18,
            fontFamily: 'inherit',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '4px 8px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#A9A9A9' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#555555' }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}

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
          margin: '0 0 32px',
        }}>
          Authorize Operator Status
        </p>

        {/* Challenge */}
        <p style={{
          color: '#A9A9A9',
          fontSize: 13,
          lineHeight: 1.9,
          textAlign: 'center',
          margin: '0 0 32px',
        }}>
          A code without a cost is a fantasy. To enter the Vanguard circle, you must have skin in
          the game. This is your first act of discipline — a physical commitment to the standard
          you just signed.
        </p>

        {/* Terminal Specs */}
        <div style={{
          border: '1px solid #1e1e1e',
          background: '#111111',
          padding: '24px 28px',
          marginBottom: 28,
        }}>
          <p style={{
            color: '#A9A9A9',
            fontSize: 10,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            margin: '0 0 20px',
            fontVariant: 'small-caps',
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
                <span style={{ color: '#A855F7', fontSize: 10, marginTop: 3, flexShrink: 0 }}>▸</span>
                <span style={{ color: '#A9A9A9', fontSize: 12, lineHeight: 1.6 }}>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>{label}:</span>{' '}{detail}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <a href="/payment" className="gate-btn">
          [ Activate Full Terminal — £9.99/Month ]
        </a>

        {/* Footer */}
        <p style={{
          color: '#333333',
          fontSize: 10,
          letterSpacing: '1px',
          textAlign: 'center',
          margin: '16px 0 24px',
          lineHeight: 1.7,
        }}>
          Verify your intent. Secure your legacy. Cancel anytime.
        </p>

        <div style={{ textAlign: 'center' }}>
          <button className="gate-signout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>

      </div>
    </div>
  )
}

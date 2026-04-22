'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GatekeeperPage() {
  const router = useRouter()
  const [fading, setFading] = useState(false)
  const [checked, setChecked] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem('vanguard_cleared') === 'true') {
      router.replace('/login')
    } else {
      setChecked(true)
    }
  }, [router])

  function handleAccept() {
    sessionStorage.setItem('vanguard_cleared', 'true')
    setFading(true)
    setTimeout(() => router.push('/login'), 500)
  }

  if (!checked) return null

  return (
    <div
      style={{
        background: '#000000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

        @keyframes breathe {
          0%   { box-shadow: 0 0 0px rgba(168,85,247,0); }
          50%  { box-shadow: 0 0 30px rgba(168,85,247,0.5); }
          100% { box-shadow: 0 0 0px rgba(168,85,247,0); }
        }

        .accept-btn {
          border: 1px solid #A9A9A9;
          background: transparent;
          color: #A9A9A9;
          font-size: 11px;
          letter-spacing: 3px;
          font-family: inherit;
          padding: 14px 28px;
          cursor: pointer;
          margin-top: 48px;
          transition: border-color 0.3s, color 0.3s;
          text-transform: uppercase;
        }

        .accept-btn:hover {
          border-color: #A855F7;
          color: #A855F7;
        }
      `}</style>

      {/* Logo */}
      <div style={{ background: 'transparent', lineHeight: 0 }}>
        <img
          src="/vanguard-logo.png"
          alt="Vanguard"
          style={{
            height: 100,
            width: 'auto',
            background: 'transparent',
            display: 'block',
            mixBlendMode: 'screen',
            animation: 'breathe 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Advisory heading */}
      <p
        style={{
          color: '#7F1D1D',
          fontSize: 13,
          letterSpacing: '4px',
          fontFamily: 'inherit',
          marginTop: 40,
          marginBottom: 0,
          textTransform: 'uppercase',
        }}
      >
        [ ! ] System Advisory
      </p>

      {/* Message */}
      <p
        style={{
          color: '#A9A9A9',
          fontSize: 13,
          lineHeight: 1.9,
          maxWidth: 340,
          textAlign: 'center',
          fontFamily: 'inherit',
          marginTop: 24,
          marginBottom: 0,
        }}
      >
        This terminal is engineered for Absolute Accountability. It is not designed for comfort or
        validation. It exists to hold the line. If you seek excuses, exit now.
      </p>

      {/* Accept button */}
      <button className="accept-btn" onClick={handleAccept}>
        [ I Accept the Standard ]
      </button>

      {/* Fade overlay */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000000',
          opacity: fading ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

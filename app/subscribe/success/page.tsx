'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SuccessPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const duration = 3000

    const raf = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      setProgress(p)
      if (p < 1) {
        requestAnimationFrame(raf)
      } else {
        router.push('/dashboard')
      }
    }
    requestAnimationFrame(raf)
  }, [router])

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

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>

      <img
        src="/vanguard-logo.png"
        alt="Vanguard"
        style={{ height: 72, width: 'auto', mixBlendMode: 'screen', marginBottom: 36 }}
      />

      <p style={{
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '5px',
        textTransform: 'uppercase',
        margin: '0 0 8px',
        textAlign: 'center',
      }}>
        Operator Status Authorized
      </p>

      <p style={{
        color: '#A9A9A9',
        fontSize: 11,
        letterSpacing: '2px',
        margin: '0 0 40px',
        textAlign: 'center',
      }}>
        Welcome to Vanguard.
      </p>

      {/* Loading bar */}
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <span style={{ color: '#555555', fontSize: 10, letterSpacing: '2px' }}>
            SYSTEM INITIALIZING
          </span>
          <span style={{ color: '#A855F7', fontSize: 10, letterSpacing: '1px', animation: 'blink 1s infinite' }}>
            {Math.round(progress * 100)}%
          </span>
        </div>

        {/* Track */}
        <div style={{
          width: '100%',
          height: 2,
          background: '#111111',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Fill */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress * 100}%`,
            background: '#A855F7',
            boxShadow: '0 0 8px rgba(168,85,247,0.6)',
            transition: 'none',
          }} />
        </div>

        <p style={{
          color: '#333333',
          fontSize: 10,
          letterSpacing: '1px',
          marginTop: 16,
          textAlign: 'center',
        }}>
          Loading your terminal...
        </p>
      </div>
    </div>
  )
}

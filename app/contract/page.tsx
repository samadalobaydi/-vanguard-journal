'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const HOLD_DURATION = 3000
const CIRCUMFERENCE = 2 * Math.PI * 40

const STANDARDS = [
  'values his integrity over his comfort.',
  'does what is required, not what is convenient.',
  'refuses to negotiate with his own excuses.',
  'is the master of his impulses, not their slave.',
  'takes absolute ownership of his failures.',
  'seeks the struggle because it builds the man.',
  'upholds the standard especially when he is alone.',
  'is the man his family relies on to hold the line.',
  'refuses to be outworked by his former self.',
  'chooses the hard path until it becomes his nature.',
]

function wordCount(str: string) {
  return str.trim().split(/\s+/).filter(Boolean).length
}

export default function ContractPage() {
  const router = useRouter()
  const supabase = createClient()

  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [shaking, setShaking] = useState(false)
  const [holding, setHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sealed, setSealed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const holdStart = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isReady = wordCount(value) >= 3

  const cancelHold = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    holdStart.current = null
    setHolding(false)
    setProgress(0)
  }, [])

  const tick = useCallback(() => {
    if (holdStart.current === null) return
    const elapsed = Date.now() - holdStart.current
    const p = Math.min(elapsed / HOLD_DURATION, 1)
    setProgress(p)
    if (p < 1) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      handleSeal()
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const startHold = useCallback(() => {
    if (sealed || !isReady) return
    setError(null)
    holdStart.current = Date.now()
    setHolding(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [isReady, sealed, tick])

  async function handleSeal() {
    setHolding(false)
    setSealed(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    await supabase
      .from('profiles')
      .update({ identity_statement: value.trim() })
      .eq('id', user.id)
    router.push('/dashboard')
  }

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  function selectStandard(s: string) {
    setValue(s)
    setDrawerOpen(false)
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const ringColor = holding ? '#A855F7' : '#1e1e1e'
  const btnColor = isReady ? '#A9A9A9' : '#333333'

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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }

        .contract-input:focus {
          outline: none;
          border-bottom-color: #A855F7 !important;
        }

        .contract-input::placeholder {
          color: #333333;
          opacity: 1;
        }

        .hold-btn {
          user-select: none;
          -webkit-user-select: none;
          cursor: pointer;
          touch-action: none;
        }

        .standard-item {
          padding: 10px 0;
          border-bottom: 1px solid #111111;
          color: #555555;
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
          transition: color 0.15s;
          text-align: left;
          letter-spacing: 0.5px;
          line-height: 1.5;
        }

        .standard-item:hover {
          color: #A9A9A9;
        }

        .standard-item:last-child {
          border-bottom: none;
        }

        .drawer-toggle {
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 10px;
          letter-spacing: 3px;
          color: #555555;
          padding: 0;
          text-transform: uppercase;
          transition: color 0.2s;
        }

        .drawer-toggle:hover {
          color: #A9A9A9;
        }
      `}</style>

      {/* Page label */}
      <p style={{
        color: '#333333',
        fontSize: 10,
        letterSpacing: '4px',
        textTransform: 'uppercase',
        margin: '0 0 40px',
      }}>
        Contract Initialization
      </p>

      {/* Input section */}
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Lead-in label */}
        <p style={{
          color: '#A9A9A9',
          fontSize: 11,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          margin: '0 0 12px',
        }}>
          I am the man who...
        </p>

        {/* Input + counter */}
        <div style={{
          position: 'relative',
          marginBottom: 8,
          animation: shaking ? 'shake 0.5s ease' : 'none',
        }}>
          <input
            ref={inputRef}
            className="contract-input"
            type="text"
            maxLength={80}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(null) }}
            placeholder="[ TYPE YOUR CODE... ]"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${error ? '#7f1d1d' : '#A9A9A9'}`,
              color: '#ffffff',
              fontSize: 18,
              fontWeight: 700,
              fontFamily: 'inherit',
              padding: '10px 0',
              boxSizing: 'border-box',
              transition: 'border-bottom-color 0.2s',
            }}
          />
          <span style={{
            position: 'absolute',
            right: 0,
            bottom: -18,
            fontSize: 10,
            color: '#333333',
            fontFamily: 'inherit',
          }}>
            {value.length}/80
          </span>
        </div>

        {/* Error */}
        <div style={{ height: 24, marginTop: 20 }}>
          {error && (
            <p style={{
              color: '#fca5a5',
              fontSize: 10,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: 0,
              fontFamily: 'inherit',
            }}>
              {error}
            </p>
          )}
        </div>

        {/* Drawer toggle */}
        <div style={{ marginTop: 8, marginBottom: 0 }}>
          <button
            className="drawer-toggle"
            onClick={() => setDrawerOpen((o) => !o)}
          >
            {drawerOpen ? '[ CLOSE ]' : '[ VIEW THE CODE ]'}
          </button>
        </div>

        {/* Inspiration drawer */}
        {drawerOpen && (
          <div style={{
            marginTop: 12,
            maxHeight: 280,
            overflowY: 'auto',
            borderTop: '1px solid #111111',
          }}>
            {STANDARDS.map((s, i) => (
              <button
                key={i}
                className="standard-item"
                style={{ display: 'block', width: '100%', background: 'none', border: 'none' }}
                onClick={() => selectStandard(s)}
              >
                <span style={{ color: '#333333', marginRight: 10 }}>{String(i + 1).padStart(2, '0')}.</span>
                ...{s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div style={{ height: 48 }} />

      {/* Hold to seal button */}
      <div
        className={isReady ? 'hold-btn' : ''}
        style={{
          position: 'relative',
          width: 100,
          height: 100,
          cursor: isReady ? 'pointer' : 'not-allowed',
          opacity: isReady ? 1 : 0.4,
          transition: 'opacity 0.3s',
        }}
        onMouseDown={isReady ? startHold : undefined}
        onMouseUp={isReady ? cancelHold : undefined}
        onMouseLeave={isReady ? cancelHold : undefined}
        onTouchStart={isReady ? (e) => { e.preventDefault(); startHold() } : undefined}
        onTouchEnd={isReady ? cancelHold : undefined}
      >
        {/* SVG ring */}
        <svg
          width="100"
          height="100"
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e1e" strokeWidth="2.2" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={ringColor}
            strokeWidth="2.2"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: progress === 0 ? 'stroke-dashoffset 0.1s' : 'none' }}
          />
        </svg>

        {/* Label */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 10px',
        }}>
          <span style={{
            fontSize: 9,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontFamily: 'inherit',
            color: holding ? '#A855F7' : btnColor,
            lineHeight: 1.4,
            transition: 'color 0.2s',
            pointerEvents: 'none',
          }}>
            {holding ? 'HOLDING...' : 'SEAL THE\nCONTRACT'}
          </span>
        </div>
      </div>

      {/* Hold instruction */}
      <p style={{
        marginTop: 16,
        fontSize: 10,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        fontFamily: 'inherit',
        color: holding ? '#A855F7' : '#333333',
        transition: 'color 0.2s',
      }}>
        {holding ? 'Keep Holding...' : 'Hold to Seal'}
      </p>
    </div>
  )
}

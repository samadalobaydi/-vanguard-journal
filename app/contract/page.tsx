'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const HOLD_DURATION = 3000
const CIRCUMFERENCE = 2 * Math.PI * 40

export default function ContractPage() {
  const router = useRouter()
  const supabase = createClient()

  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [shaking, setShaking] = useState(false)
  const [holding, setHolding] = useState(false)
  const [progress, setProgress] = useState(0) // 0–1
  const [sealed, setSealed] = useState(false)

  const holdStart = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    if (sealed) return
    if (!value || value.trim().length < 3) {
      setError('DEFINE YOUR IDENTITY FIRST')
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
      return
    }
    setError(null)
    holdStart.current = Date.now()
    setHolding(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [value, sealed, tick])

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

  // Clean up on unmount
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const ringColor = holding || progress > 0 ? '#A855F7' : '#1e1e1e'

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
        fontFamily: "'JetBrains Mono', 'var(--font-mono)', monospace",
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

        .hold-btn {
          user-select: none;
          -webkit-user-select: none;
          cursor: pointer;
          touch-action: none;
        }

        .hold-btn:active { opacity: 0.9; }
      `}</style>

      {/* Label */}
      <p
        style={{
          color: '#555555',
          fontSize: 10,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          margin: 0,
          marginBottom: 32,
        }}
      >
        Contract Initialization
      </p>

      {/* Instruction */}
      <p
        style={{
          color: '#A9A9A9',
          fontSize: 13,
          lineHeight: 1.8,
          maxWidth: 360,
          textAlign: 'center',
          margin: 0,
          marginBottom: 40,
        }}
      >
        Define your identity. This is not a goal. It is your new standard. Choose your words with intent.
      </p>

      {/* Lead-in */}
      <p
        style={{
          color: '#A9A9A9',
          fontSize: 14,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          margin: 0,
          marginBottom: 16,
        }}
      >
        I am the man who...
      </p>

      {/* Input + counter */}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          position: 'relative',
          marginBottom: 8,
          animation: shaking ? 'shake 0.5s ease' : 'none',
        }}
      >
        <input
          ref={inputRef}
          className="contract-input"
          type="text"
          maxLength={80}
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null) }}
          placeholder="never quits"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${error ? '#7f1d1d' : '#333333'}`,
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 700,
            fontFamily: 'inherit',
            textAlign: 'center',
            padding: '8px 0',
            boxSizing: 'border-box',
            transition: 'border-bottom-color 0.2s',
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: 0,
            bottom: -20,
            fontSize: 10,
            color: '#555555',
            fontFamily: 'inherit',
          }}
        >
          {value.length}/80
        </span>
      </div>

      {/* Error */}
      <div style={{ height: 28, marginBottom: 40, marginTop: 16, textAlign: 'center' }}>
        {error && (
          <p
            style={{
              color: '#fca5a5',
              fontSize: 11,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: 0,
              fontFamily: 'inherit',
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Hold to sign button with ring */}
      <div
        className="hold-btn"
        style={{ position: 'relative', width: 100, height: 100 }}
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={(e) => { e.preventDefault(); startHold() }}
        onTouchEnd={cancelHold}
      >
        {/* SVG ring */}
        <svg
          width="100"
          height="100"
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#1e1e1e"
            strokeWidth="2"
          />
          {/* Progress ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={ringColor}
            strokeWidth="2"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: progress === 0 ? 'stroke-dashoffset 0.1s' : 'none' }}
          />
        </svg>

        {/* Button label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 10px',
          }}
        >
          <span
            style={{
              fontSize: 9,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
              color: holding ? '#A855F7' : '#A9A9A9',
              lineHeight: 1.4,
              transition: 'color 0.2s',
              pointerEvents: 'none',
            }}
          >
            {holding ? 'HOLDING...' : 'SEAL THE\nCONTRACT'}
          </span>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const HOLD_DURATION = 3000
const CIRCUMFERENCE = 2 * Math.PI * 40

const STANDARDS = [
  '...values his integrity over his comfort.',
  '...does what is required, not what is convenient.',
  '...refuses to negotiate with his own excuses.',
  '...is the master of his impulses, not their slave.',
  '...takes absolute ownership of his failures.',
  '...seeks the struggle because it builds the man.',
  '...upholds the standard especially when he is alone.',
  '...is the man his family relies on to hold the line.',
  '...refuses to be outworked by his former self.',
  '...chooses the hard path until it becomes his nature.',
]

function wordCount(str: string) {
  return str.trim().split(/\s+/).filter(Boolean).length
}

export default function ContractPage() {
  const router = useRouter()
  const supabase = createClient()

  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [userTyped, setUserTyped] = useState(false)
  const [holding, setHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sealed, setSealed] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const holdStart = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // Keep a ref to the latest value so handleSeal never reads a stale closure
  const valueRef = useRef(value)
  useEffect(() => { valueRef.current = value }, [value])

  const isReady = wordCount(value) >= 3
  const showSuggestions = focused && !userTyped

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const cancelHold = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    holdStart.current = null
    setHolding(false)
    setProgress(0)
  }, [])

  const handleSeal = useCallback(async () => {
    alert('hold complete')
    setHolding(false)
    setSealed(true)
    setSaveError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      await supabase
        .from('profiles')
        .update({ identity_statement: valueRef.current.trim() })
        .eq('id', user.id)

      window.location.href = '/dashboard'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setSaveError('ERROR: ' + msg)
      setSealed(false)
    }
  }, [supabase])

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
  }, [handleSeal])

  const startHold = useCallback(() => {
    if (sealed || !isReady) return
    setSaveError(null)
    holdStart.current = Date.now()
    setHolding(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [isReady, sealed, tick])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  function selectStandard(s: string) {
    // Strip leading "..."
    const clean = s.replace(/^\.\.\./, '')
    setValue(clean)
    setUserTyped(false)
    setFocused(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
    setUserTyped(e.target.value.length > 0)
  }

  function handleFocus() {
    setFocused(true)
    if (value.length === 0) setUserTyped(false)
  }

  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const ringColor = holding ? '#A855F7' : (isReady ? '#A855F7' : '#1e1e1e')
  const btnTextColor = holding ? '#A855F7' : (isReady ? '#ffffff' : '#333333')
  const ringTrackColor = isReady ? 'rgba(168,85,247,0.2)' : '#111111'

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

        .contract-input {
          caret-color: #A855F7;
        }

        .contract-input:focus {
          outline: none;
        }

        .contract-input::placeholder {
          color: #2a2a2a;
          opacity: 1;
        }

        .hold-btn {
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
        }

        .suggestion-item {
          display: block;
          width: 100%;
          background: none;
          border: none;
          padding: 9px 0;
          text-align: left;
          font-family: inherit;
          font-size: 12px;
          color: rgba(169,169,169,0.5);
          cursor: pointer;
          transition: color 0.15s;
          letter-spacing: 0.3px;
          line-height: 1.4;
        }

        .suggestion-item:hover {
          color: rgba(169,169,169,0.9);
        }
      `}</style>

      {/* Logo */}
      <img
        src="/vanguard-logo.png"
        alt="Vanguard"
        style={{
          height: 72,
          width: 'auto',
          mixBlendMode: 'screen',
          marginBottom: 28,
          display: 'block',
        }}
      />

      {/* Header */}
      <p style={{
        color: '#C0C0C0',
        fontSize: 11,
        letterSpacing: '4px',
        textTransform: 'uppercase',
        margin: '0 0 40px',
      }}>
        Contract Initialization
      </p>

      {/* Input section */}
      <div ref={containerRef} style={{ width: '100%', maxWidth: 440 }}>

        {/* Lead-in */}
        <p style={{
          color: '#A9A9A9',
          fontSize: 11,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          margin: '0 0 12px',
        }}>
          I am the man who...
        </p>

        {/* Input */}
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            className="contract-input"
            type="text"
            maxLength={80}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="[ TYPE YOUR CODE... ]"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${focused || value.length > 0 ? '#A855F7' : '#A9A9A9'}`,
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

        {/* Suggestion list */}
        <div style={{
          marginTop: 4,
          maxHeight: showSuggestions ? 320 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.25s ease',
        }}>
          <div style={{ paddingTop: 8 }}>
            {STANDARDS.map((s, i) => (
              <button
                key={i}
                className="suggestion-item"
                onMouseDown={(e) => { e.preventDefault(); selectStandard(s) }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ height: 52 }} />

      {/* Hold to seal */}
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
        <svg
          width="100"
          height="100"
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          <circle cx="50" cy="50" r="40" fill="none" stroke={ringTrackColor} strokeWidth="2.2" />
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
            color: btnTextColor,
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

      {/* Save error */}
      {saveError && (
        <p style={{
          marginTop: 16,
          color: '#fca5a5',
          fontSize: 10,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'inherit',
          textAlign: 'center',
          maxWidth: 360,
        }}>
          {saveError}
        </p>
      )}
    </div>
  )
}

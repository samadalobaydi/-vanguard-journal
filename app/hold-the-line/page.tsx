'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const HOLD_DURATION = 30000
const CIRCUMFERENCE = 2 * Math.PI * 45 // radius in vmin units — handled via SVG viewBox

const MESSAGES = [
  { from: 0,  to: 5,  text: 'Take a deep breath. Control your breathing.' },
  { from: 5,  to: 10, text: null }, // identity statement
  { from: 10, to: 15, text: "It's all in your head." },
  { from: 15, to: 20, text: 'Control your emotions.' },
  { from: 20, to: 22, text: 'Remember why you started.' },
  { from: 22, to: 25, text: 'If it were easy, everyone would do it.' },
  { from: 25, to: 30, text: 'The urge has passed. The man remains.' },
]

export default function HoldTheLinePage() {
  const router = useRouter()
  const supabase = createClient()

  const [identity, setIdentity] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [holding, setHolding] = useState(false)
  const [progress, setProgress] = useState(0) // 0–1
  const [message, setMessage] = useState<string | null>(null)
  const [messageVisible, setMessageVisible] = useState(false)
  const [failureFlash, setFailureFlash] = useState(false)
  const [failureText, setFailureText] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completionText, setCompletionText] = useState<'vanguard' | 'points' | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const holdStart = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastMessageIndex = useRef<number>(-1)
  const currentMessage = useRef<string | null>(null)

  // Fetch identity statement
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('identity_statement')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.identity_statement) setIdentity(data.identity_statement)
        })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Request camera
  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        setCameraStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
      .catch(() => {}) // silently ignore denial
    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Attach stream to video element when both are ready
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.play().catch(() => {})
    }
  }, [cameraStream])

  const showMessage = useCallback((text: string) => {
    if (currentMessage.current === text) return
    currentMessage.current = text
    setMessageVisible(false)
    setTimeout(() => {
      setMessage(text)
      setMessageVisible(true)
    }, 400)
  }, [])

  const tick = useCallback(() => {
    if (holdStart.current === null) return
    const elapsed = (Date.now() - holdStart.current) / 1000 // seconds

    const p = Math.min(elapsed / 30, 1)
    setProgress(p)

    // Message sequencing
    for (let i = 0; i < MESSAGES.length; i++) {
      const m = MESSAGES[i]
      if (elapsed >= m.from && elapsed < m.to) {
        if (lastMessageIndex.current !== i) {
          lastMessageIndex.current = i
          const text = m.text ?? (identity ? `I AM THE MAN WHO... ${identity}` : 'I AM THE MAN WHO...')
          showMessage(text)
        }
        break
      }
    }

    if (p < 1) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      handleComplete()
    }
  }, [identity, showMessage]) // eslint-disable-line react-hooks/exhaustive-deps

  const cancelHold = useCallback(() => {
    if (!holding) return
    const elapsed = holdStart.current ? (Date.now() - holdStart.current) / 1000 : 0
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    holdStart.current = null
    setHolding(false)
    setProgress(0)
    setMessageVisible(false)
    setMessage(null)
    currentMessage.current = null
    lastMessageIndex.current = -1

    if (elapsed >= 2) {
      setFailureFlash(true)
      setFailureText(true)
      setTimeout(() => setFailureFlash(false), 500)
      setTimeout(() => setFailureText(false), 3000)
    }
  }, [holding])

  const startHold = useCallback(() => {
    if (completed) return
    setFailureText(false)
    holdStart.current = Date.now()
    setHolding(true)
    lastMessageIndex.current = -1
    currentMessage.current = null
    rafRef.current = requestAnimationFrame(tick)
  }, [completed, tick])

  async function handleComplete() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    holdStart.current = null
    setHolding(false)
    setCompleted(true)
    setMessageVisible(false)

    // Award +2 bonus points
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('bonus_points')
        .eq('id', user.id)
        .single()
      const current = profile?.bonus_points ?? 0
      await supabase
        .from('profiles')
        .update({ bonus_points: current + 2 })
        .eq('id', user.id)
    }

    // Show "WE ARE VANGUARD."
    setCompletionText('vanguard')
    setTimeout(() => {
      setCompletionText('points')
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    }, 2000)
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // SVG ring: use a large viewBox, radius 45 "units"
  const ringCircumference = 2 * Math.PI * 45
  const dashOffset = ringCircumference * (1 - progress)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: failureFlash ? '#7F1D1D' : '#000000',
        transition: failureFlash ? 'none' : 'background 0.5s ease',
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
      `}</style>

      {/* Camera feed */}
      <video
        ref={videoRef}
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.15,
          transform: 'scaleX(-1)',
          pointerEvents: 'none',
        }}
      />

      {/* Abort link */}
      <Link
        href="/dashboard"
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          fontSize: 10,
          letterSpacing: '2px',
          color: '#333333',
          textDecoration: 'none',
          fontFamily: 'inherit',
          zIndex: 10,
        }}
      >
        ← ABORT
      </Link>

      {/* Border progress ring — large SVG centered */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#111111"
          strokeWidth="0.4"
          vectorEffect="non-scaling-stroke"
        />
        {/* Progress */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#A855F7"
          strokeWidth="0.6"
          strokeDasharray={ringCircumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          vectorEffect="non-scaling-stroke"
          style={{ transition: progress === 0 ? 'stroke-dashoffset 0.15s' : 'none' }}
        />
      </svg>

      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          zIndex: 5,
        }}
      >
        {/* Message */}
        <div
          style={{
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
          }}
        >
          {!completed && (
            <p
              style={{
                color: '#A9A9A9',
                fontSize: 16,
                fontFamily: 'inherit',
                maxWidth: 300,
                textAlign: 'center',
                margin: 0,
                lineHeight: 1.6,
                opacity: messageVisible ? 1 : 0,
                transition: 'opacity 0.8s ease',
              }}
            >
              {message}
            </p>
          )}
        </div>

        {/* Completion state */}
        {completed && (
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            {completionText === 'vanguard' && (
              <p
                style={{
                  color: '#ffffff',
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  letterSpacing: '4px',
                  margin: 0,
                }}
              >
                WE ARE VANGUARD.
              </p>
            )}
            {completionText === 'points' && (
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    color: '#ffffff',
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    letterSpacing: '4px',
                    margin: '0 0 12px',
                  }}
                >
                  WE ARE VANGUARD.
                </p>
                <p
                  style={{
                    color: '#A855F7',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    letterSpacing: '2px',
                    margin: 0,
                  }}
                >
                  +2 POINTS AWARDED
                </p>
              </div>
            )}
          </div>
        )}

        {/* Logo */}
        <img
          src="/vanguard-logo.png"
          alt="Vanguard"
          style={{ height: 80, width: 'auto', marginBottom: 28 }}
        />

        {/* Hold button */}
        {!completed && (
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: `2px solid ${holding ? '#A855F7' : '#A855F7'}`,
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'none',
              transition: 'border-color 0.2s',
            }}
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={(e) => { e.preventDefault(); startHold() }}
            onTouchEnd={cancelHold}
          >
            <span
              style={{
                fontSize: 10,
                letterSpacing: '3px',
                color: holding ? '#A855F7' : '#A9A9A9',
                fontFamily: 'inherit',
                transition: 'color 0.2s',
                pointerEvents: 'none',
              }}
            >
              HOLD
            </span>
          </div>
        )}

        {/* Failure text */}
        {failureText && !holding && (
          <p
            style={{
              marginTop: 24,
              color: '#fca5a5',
              fontSize: 11,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
              textAlign: 'center',
            }}
          >
            DO NOT FOLD. HOLD THE LINE.
          </p>
        )}
      </div>
    </div>
  )
}

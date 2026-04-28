'use client'

import { useEffect, useState } from 'react'

const R = 50
const SW = 8
const CIRC = 2 * Math.PI * R

interface Props {
  score: number
  streak: number
}

export default function ScoreGauge({ score, streak }: Props) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120)
    return () => clearTimeout(t)
  }, [score])

  const dashoffset = CIRC * (1 - (animated ? score / 1000 : 0))

  const label =
    score >= 800 ? 'ELITE' :
    score >= 600 ? 'STRONG' :
    score >= 400 ? 'BUILDING' : 'UNTESTED'

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #1a0533, #0d0020)',
        border: '1px solid rgba(168,85,247,0.25)',
        borderRadius: 16,
        padding: '20px',
        overflow: 'hidden',
      }}
    >
      <p
        style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: 9,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: 16,
          fontFamily: 'var(--font-mono), monospace',
        }}
      >
        vanguard score
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Ring */}
        <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="sgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth={SW} />
            <circle
              cx="60" cy="60" r={R}
              fill="none"
              stroke="url(#sgGrad)"
              strokeWidth={SW}
              strokeLinecap="round"
              strokeDasharray={`${CIRC} ${CIRC}`}
              strokeDashoffset={dashoffset}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: 28,
                fontWeight: 700,
                lineHeight: 1,
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              {score}
            </span>
            <span
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: 8,
                letterSpacing: '2px',
                marginTop: 3,
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              /1000
            </span>
          </div>
        </div>

        {/* Right stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 3, fontFamily: 'var(--font-mono), monospace' }}>
              Status
            </p>
            <p style={{ color: '#A855F7', fontSize: 14, fontWeight: 700, letterSpacing: '2px', fontFamily: 'var(--font-mono), monospace' }}>
              {label}
            </p>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 3, fontFamily: 'var(--font-mono), monospace' }}>
              Streak
            </p>
            <p style={{ color: '#ffffff', fontSize: 24, fontWeight: 700, lineHeight: 1, fontFamily: 'var(--font-mono), monospace' }}>
              {streak}
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 400, marginLeft: 4 }}>days</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

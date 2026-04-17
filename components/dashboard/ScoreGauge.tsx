'use client'

import { useEffect, useState } from 'react'

const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface Props {
  score: number
}

export default function ScoreGauge({ score }: Props) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120)
    return () => clearTimeout(t)
  }, [score])

  const progress = animated ? score / 1000 : 0
  const dashoffset = CIRCUMFERENCE * (1 - progress)

  const label =
    score >= 800
      ? 'ELITE'
      : score >= 600
      ? 'STRONG'
      : score >= 400
      ? 'BUILDING'
      : 'UNTESTED'

  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #1e1e1e',
        borderRadius: 16,
        padding: '24px',
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
        Vanguard Score
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Track */}
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke="#1e1e1e"
              strokeWidth="10"
            />
            {/* Progress arc */}
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke="#A855F7"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashoffset}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: 42,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-1px',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              {score}
            </span>
            <span
              style={{
                color: '#555555',
                letterSpacing: '3px',
                fontSize: 9,
                textTransform: 'uppercase',
                marginTop: 4,
              }}
            >
              / 1000
            </span>
            <span
              style={{
                color: '#A855F7',
                letterSpacing: '2px',
                fontSize: 9,
                textTransform: 'uppercase',
                marginTop: 6,
              }}
            >
              {label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

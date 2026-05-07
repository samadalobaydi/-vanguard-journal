'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const FALLBACK = [
  { label: 'Mon', pct: 0,    isToday: false },
  { label: 'Tue', pct: 0.45, isToday: false },
  { label: 'Wed', pct: 1.00, isToday: false },
  { label: 'Thu', pct: 0.60, isToday: false },
  { label: 'Fri', pct: 0,    isToday: false },
  { label: 'Sat', pct: 0.80, isToday: false },
  { label: 'Sun', pct: 0.30, isToday: true  },
]

interface Day {
  label:   string
  pct:     number
  isToday: boolean
}

const PAD  = 20
const STEP = (300 - PAD * 2) / 6
const TOP  = 12
const BOT  = 72
const LBL  = 86

function xOf(i: number) { return PAD + i * STEP }
function yOf(pct: number) { return BOT - pct * (BOT - TOP) }

const A = 0.25
function ctrl(pts: { x: number; y: number }[], i: number) {
  const p0 = pts[Math.max(i - 1, 0)]
  const p1 = pts[i]
  const p2 = pts[i + 1]
  const p3 = pts[Math.min(i + 2, pts.length - 1)]
  return {
    c1x: p1.x + (p2.x - p0.x) * A,
    c1y: p1.y + (p2.y - p0.y) * A,
    c2x: p2.x - (p3.x - p1.x) * A,
    c2y: p2.y - (p3.y - p1.y) * A,
  }
}

export default function WeeklyCompletionGraph() {
  const [days, setDays] = useState<Day[]>(FALLBACK)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const now      = new Date()
        const todayStr = now.toISOString().split('T')[0]
        const dates    = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now)
          d.setDate(now.getDate() - 6 + i)
          return d.toISOString().split('T')[0]
        })

        const { data, error } = await supabase
          .from('daily_commands')
          .select('command_date, completed_count, total_count')
          .eq('user_id', user.id)
          .gte('command_date', dates[0])
          .lte('command_date', todayStr)

        if (error) return

        const map = new Map<string, { completed: number; total: number }>()
        for (const row of data ?? []) {
          map.set(row.command_date, {
            completed: row.completed_count ?? 0,
            total:     row.total_count     ?? 0,
          })
        }

        setDays(dates.map(dateStr => {
          const d   = new Date(dateStr + 'T12:00:00')
          const row = map.get(dateStr)
          return {
            label:   d.toLocaleDateString('en-US', { weekday: 'short' }),
            pct:     row && row.total > 0 ? row.completed / row.total : 0,
            isToday: dateStr === todayStr,
          }
        }))
      } catch {
        // keep fallback data
      }
    }
    load()
  }, [])

  const pts = days.map((d, i) => ({ x: xOf(i), y: yOf(d.pct) }))

  let curvePath = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < 6; i++) {
    const { c1x, c1y, c2x, c2y } = ctrl(pts, i)
    curvePath += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${pts[i + 1].x.toFixed(2)} ${pts[i + 1].y.toFixed(2)}`
  }

  const fillPath = curvePath + ` L ${pts[6].x} ${BOT} L ${pts[0].x} ${BOT} Z`

  return (
    <div style={{
      background: '#272727', borderRadius: 16,
      padding: '14px 16px 10px', marginBottom: 12,
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <p style={{
        color: '#666', fontSize: 10, fontWeight: 600,
        letterSpacing: '0.1em', marginBottom: 8,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        7-DAY COMPLETION
      </p>

      <svg viewBox="0 0 300 100" width="100%" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(139,92,246,0.3)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0)"   />
          </linearGradient>
        </defs>

        <path d={fillPath} fill="url(#grad)" />

        <path
          d={curvePath}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {pts.map((pt, i) => {
          const isToday = days[i].isToday
          const hasData = days[i].pct > 0
          return (
            <g key={i}>
              {isToday && (
                <circle cx={pt.x} cy={pt.y} r={8}
                  fill="none" stroke="#8B5CF6" strokeOpacity="0.3" />
              )}
              <circle
                cx={pt.x} cy={pt.y}
                r={isToday ? 5 : 3}
                fill={hasData ? '#8B5CF6' : '#333'}
              />
            </g>
          )
        })}

        {days.map((day, i) => (
          <text
            key={i}
            x={xOf(i)} y={LBL}
            textAnchor="middle"
            fontSize="8"
            fill="#666"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {day.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

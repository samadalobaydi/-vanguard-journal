'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const SYS:    React.CSSProperties = { fontFamily: 'system-ui, -apple-system, sans-serif' }
const VIOLET  = '#8B5CF6'
const SURF    = '#272727'
const MUTED   = '#888888'
const BAR_H   = 52

interface DayBar {
  dateStr: string
  label:   string
  pct:     number   // 0–1 if data exists; -1 if no data
  isToday: boolean
}

export default function WeeklyCompletionGraph() {
  const [bars, setBars] = useState<DayBar[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today    = new Date()
      const todayStr = today.toISOString().split('T')[0]

      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - 6 + i)
        return d.toISOString().split('T')[0]
      })

      const { data } = await supabase
        .from('daily_commands')
        .select('command_date, completed_count, total_count')
        .eq('user_id', user.id)
        .gte('command_date', last7[0])
        .lte('command_date', todayStr)

      const rowMap = new Map<string, { completed: number; total: number }>()
      for (const row of data ?? []) {
        rowMap.set(row.command_date, {
          completed: row.completed_count ?? 0,
          total:     row.total_count     ?? 0,
        })
      }

      setBars(last7.map(dateStr => {
        // Use noon to avoid DST edge cases when getting day-of-week
        const d   = new Date(dateStr + 'T12:00:00')
        const row = rowMap.get(dateStr)
        return {
          dateStr,
          label:   d.toLocaleDateString('en-US', { weekday: 'short' }),
          pct:     row ? (row.total > 0 ? row.completed / row.total : 0) : -1,
          isToday: dateStr === todayStr,
        }
      }))
    }
    load()
  }, [])

  if (bars.length === 0) return null

  return (
    <div style={{
      background: SURF,
      borderRadius: 16,
      padding: '14px 18px 16px',
      marginBottom: 12,
    }}>
      <p style={{
        color: MUTED, fontSize: 10, fontWeight: 600,
        letterSpacing: '0.1em', marginBottom: 12, ...SYS,
      }}>
        7-DAY COMPLETION
      </p>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}>
        {bars.map(bar => {
          const hasData   = bar.pct >= 0
          const fillPct   = hasData ? bar.pct : 0
          const fillPx    = Math.round(fillPct * BAR_H)
          const minFillPx = hasData ? 4 : 0   // show 4px stub when committed but 0% done

          return (
            <div key={bar.dateStr} style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            }}>
              {/* Bar track */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: BAR_H,
                borderRadius: 4,
                background: '#2A2A2A',
                border: bar.isToday
                  ? '1.5px solid rgba(139,92,246,0.5)'
                  : '1.5px solid transparent',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}>
                {/* Violet fill — anchored to bottom */}
                {hasData && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: Math.max(fillPx, minFillPx),
                    background: VIOLET,
                    opacity: fillPct === 0 ? 0.35 : 1,
                  }} />
                )}
              </div>

              {/* Day label */}
              <span style={{
                fontSize: 9,
                color: bar.isToday ? VIOLET : MUTED,
                fontWeight: bar.isToday ? 700 : 400,
                ...SYS,
              }}>
                {bar.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

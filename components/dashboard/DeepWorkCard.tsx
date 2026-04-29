'use client'

// SUPABASE TODO: On session complete, insert into deep_work_sessions
// SUPABASE TODO: On mount, check if session completed today and set completedToday state
// SUPABASE TODO: Table schema — id, user_id, duration_minutes, started_at, ended_at, completed, created_at

import { useState, useEffect, useRef } from 'react'

const DURATION_OPTIONS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '90 min', minutes: 90 },
  { label: '2 hours', minutes: 120 },
  { label: 'Custom', minutes: -1 },
]

const CLOCK_PATH = 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z'
const CHECK_PATH = 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono), monospace' }

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDuration(minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60}h`
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  return `${minutes}m`
}

export default function DeepWorkCard() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMinutes, setSelectedMinutes] = useState(60)
  const [isCustom, setIsCustom] = useState(false)
  const [customMinutes, setCustomMinutes] = useState(45)

  const [timerActive, setTimerActive] = useState(false)
  const [timerPaused, setTimerPaused] = useState(false)
  const [timerComplete, setTimerComplete] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(60)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerActive && !timerPaused) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setTimerActive(false)
            setTimerComplete(true)
            // SUPABASE TODO: On session complete, insert into deep_work_sessions
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerActive, timerPaused])

  function startTimer() {
    const mins = isCustom ? customMinutes : selectedMinutes
    setSessionDurationMinutes(mins)
    setRemainingSeconds(mins * 60)
    setTimerActive(true)
    setTimerPaused(false)
    setTimerComplete(false)
    setModalOpen(false)
  }

  function endTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimerActive(false)
    setTimerComplete(false)
    setRemainingSeconds(0)
  }

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    background: 'linear-gradient(145deg, #2A2A30, #1B1B20)',
    border: timerActive
      ? '1px solid rgba(139,92,246,0.35)'
      : timerComplete
      ? '1px solid rgba(139,92,246,0.2)'
      : '1px solid rgba(255,255,255,0.08)',
    boxShadow: timerActive ? '0 0 16px rgba(139,92,246,0.15)' : undefined,
    borderRadius: 20,
    padding: '16px',
    cursor: timerActive || timerComplete ? 'default' : 'pointer',
  }

  const iconCircleStyle: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: timerComplete ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: timerActive ? 'deepWorkPulse 2s ease-in-out infinite' : 'none',
    flexShrink: 0,
  }

  return (
    <>
      <style>{`
        @keyframes deepWorkPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
      `}</style>

      {/* ── CARD ── */}
      <div
        style={cardStyle}
        onClick={() => { if (!timerActive && !timerComplete) setModalOpen(true) }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={iconCircleStyle}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#8B5CF6">
              <path d={timerComplete ? CHECK_PATH : CLOCK_PATH} />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600, marginBottom: 1, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Deep Work
            </p>
            <p style={{ color: timerActive ? '#8B5CF6' : '#A1A1AA', fontSize: 11 }}>
              {timerActive
                ? 'Session running'
                : timerComplete
                ? 'Session completed today'
                : 'Start focused session'}
            </p>
          </div>
        </div>

        <span style={{ color: timerComplete ? '#8B5CF6' : '#F8FAFC', fontSize: 18, fontWeight: 700, lineHeight: 1, ...MONO }}>
          {timerActive
            ? formatTime(remainingSeconds)
            : timerComplete
            ? formatDuration(sessionDurationMinutes)
            : '1h'}
        </span>

        {timerActive && (
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            <button
              onClick={(e) => { e.stopPropagation(); setTimerPaused((p) => !p) }}
              style={{
                fontSize: 11, background: 'rgba(255,255,255,0.06)', border: 'none',
                borderRadius: 8, padding: '3px 8px', color: '#A1A1AA', cursor: 'pointer',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {timerPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); endTimer() }}
              style={{
                fontSize: 11, background: 'rgba(239,68,68,0.08)', border: 'none',
                borderRadius: 8, padding: '3px 8px', color: 'rgba(239,68,68,0.7)', cursor: 'pointer',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              End
            </button>
          </div>
        )}
      </div>

      {/* ── BOTTOM SHEET MODAL ── */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 50,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: 'min(390px, 100%)',
              background: '#1C1C20',
              borderRadius: '24px 24px 0 0',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              padding: '24px 20px 40px',
              zIndex: 51,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 16px' }} />

            <p style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 700, marginBottom: 6, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Deep Work
            </p>
            <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 20, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Choose how long you want to lock in.
            </p>

            {/* Duration pills */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 4 }}>
              {DURATION_OPTIONS.map(({ label, minutes }) => {
                const selected = minutes === -1 ? isCustom : (!isCustom && selectedMinutes === minutes)
                return (
                  <button
                    key={label}
                    onClick={() => {
                      if (minutes === -1) { setIsCustom(true) }
                      else { setIsCustom(false); setSelectedMinutes(minutes) }
                    }}
                    style={{
                      flexShrink: 0,
                      background: selected ? 'rgba(139,92,246,0.15)' : '#25252A',
                      border: `1px solid ${selected ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 20,
                      padding: '8px 16px',
                      color: selected ? '#8B5CF6' : '#F8FAFC',
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Custom duration input */}
            {isCustom && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                <input
                  type="number"
                  min={1}
                  max={480}
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: 80,
                    background: '#25252A',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 10,
                    color: '#F8FAFC',
                    fontSize: 16,
                    padding: '8px 12px',
                    outline: 'none',
                    textAlign: 'center',
                    ...MONO,
                  }}
                />
                <span style={{ color: '#A1A1AA', fontSize: 13, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  minutes
                </span>
              </div>
            )}

            <button
              onClick={startTimer}
              style={{
                width: '100%',
                height: 52,
                marginTop: 16,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none',
                borderRadius: 14,
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              Start Focus
            </button>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#71717A',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

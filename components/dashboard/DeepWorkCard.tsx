'use client'

// SUPABASE TODO: On session complete, insert into deep_work_sessions
// SUPABASE TODO: On mount, check if session completed today and set completedToday state
// SUPABASE TODO: Table schema — id, user_id, duration_minutes, started_at, ended_at, completed, created_at

import { useState, useEffect, useRef } from 'react'

const GRID_OPTIONS = [
  { label: '30',  sub: 'minutes', minutes: 30  },
  { label: '1',   sub: 'hour',    minutes: 60  },
  { label: '90',  sub: 'minutes', minutes: 90  },
  { label: '2',   sub: 'hours',   minutes: 120 },
]

const CLOCK_PATH = 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z'
const CHECK_PATH = 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono), monospace' }
const SYS: React.CSSProperties  = { fontFamily: 'system-ui, -apple-system, sans-serif' }

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

interface Props {
  onModalChange: (isOpen: boolean) => void
}

export default function DeepWorkCard({ onModalChange }: Props) {
  const [modalOpen, setModalOpen]       = useState(false)
  const [selectedMinutes, setSelected]  = useState(60)
  const [isCustom, setIsCustom]         = useState(false)
  const [customMinutes, setCustom]      = useState(45)

  const [timerActive,   setTimerActive]   = useState(false)
  const [timerPaused,   setTimerPaused]   = useState(false)
  const [timerComplete, setTimerComplete] = useState(false)
  const [remaining,     setRemaining]     = useState(0)
  const [sessionMins,   setSessionMins]   = useState(60)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown
  useEffect(() => {
    if (timerActive && !timerPaused) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
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

  function openModal() {
    if (!timerActive && !timerComplete) {
      setModalOpen(true)
      onModalChange(true)
    }
  }

  function closeModal() {
    setModalOpen(false)
    onModalChange(false)
  }

  function startTimer() {
    const mins = isCustom ? customMinutes : selectedMinutes
    setSessionMins(mins)
    setRemaining(mins * 60)
    setTimerActive(true)
    setTimerPaused(false)
    setTimerComplete(false)
    setModalOpen(false)
    onModalChange(false)
  }

  function endTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimerActive(false)
    setTimerComplete(false)
    setRemaining(0)
  }

  // ── CARD ──────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes deepWorkPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
      `}</style>

      <div
        style={{
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
        }}
        onClick={openModal}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: timerComplete ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: timerActive ? 'deepWorkPulse 2s ease-in-out infinite' : 'none',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#8B5CF6">
              <path d={timerComplete ? CHECK_PATH : CLOCK_PATH} />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600, marginBottom: 1, ...SYS }}>Deep Work</p>
            <p style={{ color: timerActive ? '#8B5CF6' : '#A1A1AA', fontSize: 11 }}>
              {timerActive ? 'Session running' : timerComplete ? 'Session completed today' : 'Start focused session'}
            </p>
          </div>
        </div>

        <span style={{ color: timerComplete ? '#8B5CF6' : '#F8FAFC', fontSize: 18, fontWeight: 700, lineHeight: 1, ...MONO }}>
          {timerActive ? formatTime(remaining) : timerComplete ? formatDuration(sessionMins) : '1h'}
        </span>

        {timerActive && (
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            <button
              onClick={(e) => { e.stopPropagation(); setTimerPaused((p) => !p) }}
              style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '3px 8px', color: '#A1A1AA', cursor: 'pointer', ...SYS }}
            >
              {timerPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); endTimer() }}
              style={{ fontSize: 11, background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 8, padding: '3px 8px', color: 'rgba(239,68,68,0.7)', cursor: 'pointer', ...SYS }}
            >
              End
            </button>
          </div>
        )}
      </div>

      {/* ── BOTTOM SHEET MODAL ── */}
      {modalOpen && (
        <>
          {/* Overlay */}
          <div
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 200,
            }}
            onClick={closeModal}
          />

          {/* Sheet */}
          <div
            style={{
              position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: 'min(390px, 100vw)',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'linear-gradient(145deg, #2A2A30, #1B1B20)',
              borderRadius: '24px 24px 0 0',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              padding: `20px 20px max(40px, env(safe-area-inset-bottom))`,
              zIndex: 201,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2, margin: '0 auto 16px' }} />

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 700, ...SYS }}>Deep Work</p>
              <button
                onClick={closeModal}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', border: 'none',
                  color: '#A1A1AA', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 20, ...SYS }}>
              Choose how long you want to lock in.
            </p>

            {/* 2×2 duration grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              {GRID_OPTIONS.map(({ label, sub, minutes }) => {
                const sel = !isCustom && selectedMinutes === minutes
                return (
                  <button
                    key={minutes}
                    onClick={() => { setIsCustom(false); setSelected(minutes) }}
                    style={{
                      background: sel ? 'rgba(99,102,241,0.12)' : '#1C1C20',
                      border: `1px solid ${sel ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 14,
                      padding: '14px',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <p style={{ color: sel ? '#8B5CF6' : '#F8FAFC', fontSize: 16, fontWeight: 700, marginBottom: 2, ...MONO }}>{label}</p>
                    <p style={{ color: '#71717A', fontSize: 11, ...SYS }}>{sub}</p>
                  </button>
                )
              })}
            </div>

            {/* Custom option */}
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#1C1C20',
                border: `1px solid ${isCustom ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 14,
                padding: '12px 16px',
                marginBottom: 0,
                cursor: 'pointer',
              }}
              onClick={() => setIsCustom(true)}
            >
              <span style={{ color: '#A1A1AA', fontSize: 13, ...SYS }}>Custom</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  min={1}
                  max={480}
                  value={customMinutes}
                  onClick={(e) => { e.stopPropagation(); setIsCustom(true) }}
                  onChange={(e) => { setIsCustom(true); setCustom(Math.max(1, parseInt(e.target.value) || 1)) }}
                  style={{
                    width: 60, background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isCustom ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 8, color: '#F8FAFC', fontSize: 14,
                    padding: '4px 8px', outline: 'none', textAlign: 'center', ...MONO,
                  }}
                />
                <span style={{ color: '#71717A', fontSize: 11, ...SYS }}>min</span>
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={startTimer}
              style={{
                width: '100%', height: 52, marginTop: 16, marginBottom: 8,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none', borderRadius: 16,
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                ...SYS,
              }}
            >
              Start Focus
            </button>

            {/* Footer note */}
            <p style={{ textAlign: 'center', color: '#71717A', fontSize: 11, marginTop: 10, ...SYS }}>
              Stay locked in. The timer will appear on your dashboard.
            </p>
          </div>
        </>
      )}
    </>
  )
}

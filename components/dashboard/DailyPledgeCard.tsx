'use client'

// SUPABASE TODO: On mount, fetch today's daily_pledge for user
// SUPABASE TODO: On Lock Pledge, upsert into daily_pledges table
// SUPABASE TODO: Table — id, user_id, date, non_negotiable, daily_standard, locked, created_at

import { useState, useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono), monospace' }
const SYS: React.CSSProperties  = { fontFamily: 'system-ui, -apple-system, sans-serif' }

interface Props {
  onModalChange: (isOpen: boolean) => void
}

export default function DailyPledgeCard({ onModalChange }: Props) {
  const [modalOpen,       setModalOpen]       = useState(false)
  const [nonNegotiable,   setNonNegotiable]   = useState('')
  const [dailyStandard,   setDailyStandard]   = useState('')
  const [pledgeLocked,    setPledgeLocked]    = useState(false)
  const [editMode,        setEditMode]        = useState(false)
  const [todayDate,       setTodayDate]       = useState<string | null>(null)

  // Reset if stored date isn't today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (todayDate && todayDate !== today) {
      setNonNegotiable('')
      setDailyStandard('')
      setPledgeLocked(false)
      setEditMode(false)
      setTodayDate(null)
    }
  }, [todayDate])

  // Missed: past 18:00, no pledge set
  const hour = new Date().getHours()
  const isMissed = !pledgeLocked && hour >= 18

  function openModal() {
    setModalOpen(true)
    onModalChange(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditMode(false)
    onModalChange(false)
  }

  function lockPledge() {
    if (!nonNegotiable.trim() && !dailyStandard.trim()) return
    const today = new Date().toISOString().split('T')[0]
    setTodayDate(today)
    setPledgeLocked(true)
    setEditMode(false)
    setModalOpen(false)
    onModalChange(false)
    // SUPABASE TODO: upsert into daily_pledges table
  }

  const isReadOnly = pledgeLocked && !editMode
  const canLock    = nonNegotiable.trim() || dailyStandard.trim()

  const displayValue = pledgeLocked
    ? 'Locked'
    : isMissed
    ? 'Unset'
    : 'Pending'

  const displaySub = pledgeLocked
    ? (nonNegotiable.trim().slice(0, 24) || dailyStandard.trim().slice(0, 24) || 'Pledge set')
    : isMissed
    ? 'No standard set today'
    : 'Set today\'s standard'

  const cardBorder = pledgeLocked
    ? '1px solid rgba(139,92,246,0.25)'
    : '1px solid rgba(255,255,255,0.08)'

  const valueColor = pledgeLocked
    ? '#8B5CF6'
    : isMissed
    ? '#71717A'
    : '#F8FAFC'

  return (
    <>
      {/* ── CARD ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          background: 'linear-gradient(145deg, #2A2A30, #1B1B20)',
          border: cardBorder,
          borderRadius: 20,
          padding: '14px',
          cursor: 'pointer',
        }}
        onClick={openModal}
      >
        {/* Top row: icon circle + label/sub */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: pledgeLocked ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={17} color="#8B5CF6" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600, marginBottom: 1, ...SYS }}>Daily Pledge</p>
            <p style={{
              color: '#A1A1AA', fontSize: 11,
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            }}>
              {displaySub}
            </p>
          </div>
        </div>

        {/* Bottom row: value + decorative watermark */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <span style={{ color: valueColor, fontSize: 26, fontWeight: 700, lineHeight: 1, ...MONO }}>
            {displayValue}
          </span>
          <ShieldCheck size={28} color="rgba(139,92,246,0.12)" style={{ flexShrink: 0 }} />
        </div>
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

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 700, ...SYS }}>Daily Pledge</p>
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
              {isReadOnly ? 'Your standard for today.' : 'Define your standard before the day runs away.'}
            </p>

            {/* Non-negotiable field */}
            <div style={{ marginBottom: 10 }}>
              <p style={{ color: '#71717A', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase', ...SYS }}>
                Non-Negotiable
              </p>
              <input
                type="text"
                placeholder="The one thing you must do today"
                value={nonNegotiable}
                onChange={(e) => setNonNegotiable(e.target.value)}
                readOnly={isReadOnly}
                style={{
                  width: '100%',
                  background: isReadOnly ? 'rgba(255,255,255,0.03)' : '#1C1C20',
                  border: `1px solid ${isReadOnly ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10,
                  padding: '10px',
                  color: isReadOnly ? '#A1A1AA' : '#F8FAFC',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: isReadOnly ? 'default' : 'text',
                  ...SYS,
                }}
              />
            </div>

            {/* Daily standard field */}
            <div style={{ marginBottom: 0 }}>
              <p style={{ color: '#71717A', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase', ...SYS }}>
                Daily Standard
              </p>
              <textarea
                placeholder="How you intend to show up today"
                value={dailyStandard}
                onChange={(e) => setDailyStandard(e.target.value)}
                readOnly={isReadOnly}
                rows={3}
                style={{
                  width: '100%',
                  background: isReadOnly ? 'rgba(255,255,255,0.03)' : '#1C1C20',
                  border: `1px solid ${isReadOnly ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10,
                  padding: '10px',
                  color: isReadOnly ? '#A1A1AA' : '#F8FAFC',
                  fontSize: 13,
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                  cursor: isReadOnly ? 'default' : 'text',
                  ...SYS,
                }}
              />
            </div>

            {/* Action button */}
            {isReadOnly ? (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  width: '100%', height: 52, marginTop: 16, marginBottom: 8,
                  background: 'transparent',
                  border: '1px solid rgba(139,92,246,0.4)',
                  borderRadius: 16,
                  color: '#8B5CF6',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ...SYS,
                }}
              >
                Edit Pledge
              </button>
            ) : (
              <button
                onClick={lockPledge}
                disabled={!canLock}
                style={{
                  width: '100%', height: 52, marginTop: 16, marginBottom: 8,
                  background: canLock
                    ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                    : 'rgba(255,255,255,0.06)',
                  border: 'none', borderRadius: 16,
                  color: canLock ? '#fff' : '#71717A',
                  fontSize: 15, fontWeight: 700, cursor: canLock ? 'pointer' : 'not-allowed',
                  boxShadow: canLock ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
                  transition: 'all 0.2s ease',
                  ...SYS,
                }}
              >
                Lock Pledge
              </button>
            )}
          </div>
        </>
      )}
    </>
  )
}

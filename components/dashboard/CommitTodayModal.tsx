'use client'

// SUPABASE TODO: On commit, upsert into daily_commits table
// SUPABASE TODO: On standard tick, update completed_standards
// SUPABASE TODO: Table — id, user_id, date, standards[], note, completed_standards[], created_at

import { useState, useEffect } from 'react'

const PREDEFINED_STANDARDS = [
  'No porn',
  'Workout done',
  'No doom scrolling',
  'Clean diet',
  'Work on business',
  'Deep work',
  'No smoking',
  'No alcohol',
  'No drugs',
  'Read / learn',
  'Sleep on time',
]

const SYS: React.CSSProperties = { fontFamily: 'system-ui, -apple-system, sans-serif' }

const CARD: React.CSSProperties = {
  borderRadius: 20,
  background: 'linear-gradient(145deg, #2A2A30, #1B1B20)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
  padding: '18px',
  marginBottom: 16,
  borderLeft: '2px solid rgba(139,92,246,0.5)',
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

interface Props {
  onModalChange: (isOpen: boolean) => void
}

export default function CommitTodayModal({ onModalChange }: Props) {
  const [modalOpen,           setModalOpen]           = useState(false)
  const [committed,           setCommitted]           = useState(false)
  const [selectedStandards,   setSelectedStandards]   = useState<string[]>([])
  const [customStandards,     setCustomStandards]     = useState<string[]>([])
  const [note,                setNote]                = useState('')
  const [completedStandards,  setCompletedStandards]  = useState<string[]>([])
  const [todayDate,           setTodayDate]           = useState(todayStr)
  const [addingCustom,        setAddingCustom]        = useState(false)
  const [customInput,         setCustomInput]         = useState('')

  // Reset all state on new day
  useEffect(() => {
    const current = todayStr()
    if (current !== todayDate) {
      setTodayDate(current)
      setCommitted(false)
      setSelectedStandards([])
      setCustomStandards([])
      setNote('')
      setCompletedStandards([])
    }
  })

  const allStandards  = [...PREDEFINED_STANDARDS, ...customStandards]
  const canCommit     = selectedStandards.length > 0 || note.trim().length > 0
  const allDone       = committed && selectedStandards.length > 0 &&
                        selectedStandards.every(s => completedStandards.includes(s))

  function openModal() {
    setModalOpen(true)
    onModalChange(true)
  }

  function closeModal() {
    setModalOpen(false)
    onModalChange(false)
    setAddingCustom(false)
    setCustomInput('')
  }

  function toggleStandard(s: string) {
    setSelectedStandards(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  function addCustom() {
    const trimmed = customInput.trim()
    if (!trimmed || customStandards.length >= 3) return
    setCustomStandards(prev => [...prev, trimmed])
    setSelectedStandards(prev => [...prev, trimmed])
    setCustomInput('')
    setAddingCustom(false)
  }

  function handleCommit() {
    if (!canCommit) return
    setCommitted(true)
    closeModal()
  }

  function toggleCompleted(s: string) {
    setCompletedStandards(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  return (
    <>
      {/* ── TODAY'S COMMAND CARD ── */}
      <div style={{
        ...CARD,
        ...(allDone && {
          boxShadow: '0 0 20px rgba(139,92,246,0.12), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        }),
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ color: '#A1A1AA', fontSize: 13, fontWeight: 600, margin: 0, ...SYS }}>Today&apos;s Command</p>
          {committed && (
            <div style={{
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 20, padding: '2px 8px',
            }}>
              <span style={{ color: '#8B5CF6', fontSize: 10, fontWeight: 600, ...SYS }}>
                {selectedStandards.length} standard{selectedStandards.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {!committed ? (
          <>
            <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 14, lineHeight: 1.5, ...SYS }}>
              No entry yet today. Set your intention and commit to the standard.
            </p>
            <button
              onClick={openModal}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', height: 50, border: 'none',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                ...SYS,
              }}
            >
              Commit Today
            </button>
          </>
        ) : (
          <>
            {/* Standards list */}
            <div style={{ marginBottom: 8 }}>
              {selectedStandards.map(s => {
                const done = completedStandards.includes(s)
                return (
                  <div
                    key={s}
                    onClick={() => toggleCompleted(s)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      border: done ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                      background: done ? '#8B5CF6' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {done && (
                        <svg width="10" height="10" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      )}
                    </div>
                    <span style={{
                      color: done ? '#71717A' : '#F8FAFC',
                      fontSize: 13,
                      textDecoration: done ? 'line-through' : 'none',
                      ...SYS,
                    }}>
                      {s}
                    </span>
                  </div>
                )
              })}
            </div>

            {note.trim() && (
              <p style={{ color: '#71717A', fontSize: 12, fontStyle: 'italic', marginBottom: 8, lineHeight: 1.5, ...SYS }}>
                {note}
              </p>
            )}

            {allDone && (
              <p style={{ color: '#8B5CF6', fontSize: 11, fontWeight: 600, marginBottom: 6, ...SYS }}>
                All standards held.
              </p>
            )}

            <button
              onClick={openModal}
              style={{ background: 'none', border: 'none', color: '#8B5CF6', fontSize: 11, cursor: 'pointer', padding: 0, ...SYS }}
            >
              Update Standards
            </button>
          </>
        )}
      </div>

      {/* ── BOTTOM SHEET MODAL ── */}
      {modalOpen && (
        <>
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

          <div
            style={{
              position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: 'min(390px, 100vw)',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'linear-gradient(145deg, #2A2A30, #1B1B20)',
              borderRadius: '24px 24px 0 0',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              padding: '20px 20px max(40px, env(safe-area-inset-bottom))',
              zIndex: 201,
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2, margin: '0 auto 16px' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 700, margin: 0, ...SYS }}>Commit Today</p>
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

            <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 16, ...SYS }}>
              Choose the standards you will hold today.
            </p>

            {/* Standards list */}
            {allStandards.map(s => {
              const sel = selectedStandards.includes(s)
              return (
                <div
                  key={s}
                  onClick={() => toggleStandard(s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: sel ? 'rgba(139,92,246,0.06)' : '#1C1C20',
                    border: `1px solid ${sel ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 12, padding: '12px 14px', marginBottom: 8,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: sel ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                    background: sel ? '#8B5CF6' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {sel && (
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    )}
                  </div>
                  <span style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 500, ...SYS }}>{s}</span>
                </div>
              )
            })}

            {/* Add custom standard */}
            {customStandards.length < 3 && !addingCustom && (
              <div
                onClick={() => setAddingCustom(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  border: '1.5px dashed rgba(139,92,246,0.25)',
                  borderRadius: 12, padding: '12px 14px', marginBottom: 8,
                  cursor: 'pointer',
                }}
              >
                <span style={{ color: '#8B5CF6', fontSize: 16, lineHeight: 1 }}>+</span>
                <span style={{ color: '#8B5CF6', fontSize: 14, ...SYS }}>Add custom standard</span>
              </div>
            )}

            {addingCustom && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  autoFocus
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustom()}
                  placeholder="Custom standard..."
                  style={{
                    flex: 1, background: '#1C1C20',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 10, color: '#F8FAFC', fontSize: 14,
                    padding: '10px 12px', outline: 'none', ...SYS,
                  }}
                />
                <button
                  onClick={addCustom}
                  style={{
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 10, color: '#8B5CF6', fontSize: 14, fontWeight: 600,
                    padding: '0 14px', cursor: 'pointer', ...SYS,
                  }}
                >
                  Add
                </button>
              </div>
            )}

            {/* Optional note */}
            <p style={{ color: '#A1A1AA', fontSize: 12, marginTop: 16, marginBottom: 6, ...SYS }}>
              Add a note or intention (optional)
            </p>
            <textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#1C1C20', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '12px', color: '#F8FAFC', fontSize: 13,
                outline: 'none', resize: 'vertical', ...SYS,
              }}
            />

            {/* Commit button */}
            <button
              onClick={handleCommit}
              disabled={!canCommit}
              style={{
                width: '100%', height: 52, marginTop: 16, marginBottom: 8,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none', borderRadius: 16,
                color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: canCommit ? 'pointer' : 'default',
                boxShadow: canCommit ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
                opacity: canCommit ? 1 : 0.4,
                ...SYS,
              }}
            >
              Commit Standard
            </button>
          </div>
        </>
      )}
    </>
  )
}

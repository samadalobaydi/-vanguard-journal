'use client'

// SUPABASE TODO: upsert daily_commits on commit
// SUPABASE TODO: update completed_standards on tick
// SUPABASE TODO: Table — id, user_id, date, standards[], note, completed_standards[], created_at

import { useState, useEffect } from 'react'
import CommitTodayModal from './CommitTodayModal'

const SYS: React.CSSProperties = { fontFamily: 'system-ui, -apple-system, sans-serif' }

const CARD: React.CSSProperties = {
  borderRadius: 20,
  background: 'linear-gradient(145deg, #2A2A30, #1B1B20)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
  padding: '18px',
  marginBottom: 16,
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

interface Props {
  onModalChange: (isOpen: boolean) => void
}

export default function TodaysCommandCard({ onModalChange }: Props) {
  const [modalOpen,          setModalOpen]          = useState(false)
  const [committed,          setCommitted]          = useState(false)
  const [selectedStandards,  setSelectedStandards]  = useState<string[]>([])
  const [customStandards,    setCustomStandards]    = useState<string[]>([])
  const [note,               setNote]               = useState('')
  const [completedStandards, setCompletedStandards] = useState<string[]>([])
  const [todayDate,          setTodayDate]          = useState(todayStr)

  // Reset on new day
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

  const allDone = committed && selectedStandards.length > 0 &&
                  selectedStandards.every(s => completedStandards.includes(s))

  function openModal() {
    setModalOpen(true)
    onModalChange(true)
  }

  function closeModal() {
    setModalOpen(false)
    onModalChange(false)
  }

  function toggleStandard(s: string) {
    setSelectedStandards(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  function addCustom(s: string) {
    setCustomStandards(prev => [...prev, s])
    setSelectedStandards(prev => [...prev, s])
  }

  function handleCommit() {
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
        borderLeft: '2px solid rgba(139,92,246,0.5)',
        ...(allDone && {
          border: '1px solid rgba(139,92,246,0.3)',
          borderLeft: '2px solid rgba(139,92,246,0.5)',
          boxShadow: '0 0 20px rgba(139,92,246,0.1), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        }),
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ color: '#A1A1AA', fontSize: 13, fontWeight: 600, margin: 0, ...SYS }}>
            Today&apos;s Command
          </p>
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
          /* ── UNCOMMITTED ── */
          <>
            <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 14, lineHeight: 1.5, ...SYS }}>
              No standards set. Commit before the day decides for you.
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
          /* ── COMMITTED ── */
          <>
            <p style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600, marginBottom: 8, ...SYS }}>
              Standards locked.
            </p>

            <div style={{ marginBottom: 4 }}>
              {selectedStandards.map(s => {
                const done = completedStandards.includes(s)
                return (
                  <div
                    key={s}
                    onClick={() => toggleCompleted(s)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: done ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                      background: done ? '#8B5CF6' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {done && (
                        <svg width="12" height="12" viewBox="0 0 12 12">
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
              <p style={{ color: '#71717A', fontSize: 12, fontStyle: 'italic', marginTop: 8, lineHeight: 1.5, ...SYS }}>
                {note}
              </p>
            )}

            {allDone && (
              <p style={{ color: '#8B5CF6', fontSize: 11, fontWeight: 600, marginTop: 8, ...SYS }}>
                The standard is held.
              </p>
            )}

            <button
              onClick={openModal}
              style={{ background: 'none', border: 'none', color: '#8B5CF6', fontSize: 11, cursor: 'pointer', padding: 0, marginTop: 10, ...SYS }}
            >
              Review Standards
            </button>
          </>
        )}
      </div>

      {/* ── MODAL ── */}
      <CommitTodayModal
        isOpen={modalOpen}
        onClose={closeModal}
        selectedStandards={selectedStandards}
        onToggleStandard={toggleStandard}
        customStandards={customStandards}
        onAddCustom={addCustom}
        note={note}
        onNoteChange={setNote}
        onCommit={handleCommit}
      />
    </>
  )
}

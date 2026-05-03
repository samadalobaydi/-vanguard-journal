'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import CommitTodayModal, { type Standard } from './CommitTodayModal'

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
  const [modalOpen,      setModalOpen]      = useState(false)
  const [userId,         setUserId]         = useState<string | null>(null)
  const [committed,      setCommitted]      = useState(false)
  const [standards,      setStandards]      = useState<Standard[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [customLabels,   setCustomLabels]   = useState<string[]>([])
  const [note,           setNote]           = useState('')
  const [todayDate,      setTodayDate]      = useState(todayStr)

  // Fetch today's command on mount
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const today = todayStr()
      const { data } = await supabase
        .from('daily_commands')
        .select('*')
        .eq('user_id', user.id)
        .eq('command_date', today)
        .single()

      if (data) {
        const stds: Standard[] = data.standards ?? []
        setStandards(stds)
        setSelectedLabels(stds.map((s: Standard) => s.label))
        setCustomLabels(stds.filter((s: Standard) => s.category === 'custom').map((s: Standard) => s.label))
        setNote(data.note ?? '')
        setCommitted(true)
      }
    }
    load()
  }, [])

  // Reset on new day
  useEffect(() => {
    const current = todayStr()
    if (current !== todayDate) {
      setTodayDate(current)
      setCommitted(false)
      setStandards([])
      setSelectedLabels([])
      setCustomLabels([])
      setNote('')
    }
  })

  const total       = standards.length
  const doneCount   = standards.filter(s => s.completed).length
  const allDone     = committed && total > 0 && doneCount === total
  const progressPct = total > 0 ? (doneCount / total) * 100 : 0

  const visibleStandards = standards.slice(0, 5)
  const hiddenCount      = standards.length > 5 ? standards.length - 5 : 0

  function openModal() {
    setModalOpen(true)
    onModalChange(true)
  }

  function closeModal() {
    setModalOpen(false)
    onModalChange(false)
  }

  function toggleStandard(label: string) {
    setSelectedLabels(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]
    )
  }

  function addCustom(label: string) {
    setCustomLabels(prev => [...prev, label])
    setSelectedLabels(prev => [...prev, label])
  }

  function handleCommit(newStandards: Standard[], newNote: string) {
    setStandards(newStandards)
    setSelectedLabels(newStandards.map(s => s.label))
    setCustomLabels(newStandards.filter(s => s.category === 'custom').map(s => s.label))
    setNote(newNote)
    setCommitted(true)
    closeModal()
  }

  async function toggleCompleted(label: string) {
    if (!userId) return
    const updated = standards.map(s =>
      s.label === label ? { ...s, completed: !s.completed } : s
    )
    setStandards(updated)

    const supabase = createClient()
    await supabase.from('daily_commands').upsert({
      user_id: userId,
      command_date: todayDate,
      standards: updated,
      note,
      completed_count: updated.filter(s => s.completed).length,
      total_count: updated.length,
      is_complete: updated.every(s => s.completed),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,command_date' })
  }

  return (
    <>
      {/* ── TODAY'S COMMAND CARD ── */}
      <div style={{
        ...CARD,
        ...(allDone
          ? { border: '1px solid rgba(139,92,246,0.25)', boxShadow: '0 0 20px rgba(139,92,246,0.1), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)' }
          : { borderLeft: '2px solid rgba(139,92,246,0.5)' }
        ),
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
                {standards.length} standard{standards.length !== 1 ? 's' : ''}
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
            <p style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600, marginBottom: 2, marginTop: 0, ...SYS }}>
              Standards locked.
            </p>

            <p style={{
              color: allDone ? '#8B5CF6' : '#71717A',
              fontSize: 11, fontStyle: 'italic',
              marginTop: 0, marginBottom: 10,
              ...SYS,
            }}>
              {allDone ? 'The standard is held.' : 'Hold the line before midnight.'}
            </p>

            {/* Progress counter */}
            <p style={{ fontSize: 12, margin: '0 0 6px', ...SYS }}>
              <span style={{ color: '#8B5CF6', fontWeight: 700 }}>{doneCount}</span>
              <span style={{ color: '#71717A' }}> / {total} held</span>
            </p>

            {/* Progress bar */}
            <div style={{
              height: 3, borderRadius: 2,
              background: 'rgba(255,255,255,0.06)',
              marginBottom: 12, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }} />
            </div>

            {/* Standards list */}
            <div>
              {visibleStandards.map((s, i) => {
                const isLast = i === visibleStandards.length - 1 && hiddenCount === 0
                return (
                  <div
                    key={s.label}
                    onClick={() => toggleCompleted(s.label)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '6px 0',
                      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: s.completed ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                      background: s.completed ? '#8B5CF6' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {s.completed && (
                        <svg width="10" height="10" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      )}
                    </div>
                    <span style={{
                      color: s.completed ? '#71717A' : '#F8FAFC',
                      fontSize: 13,
                      textDecoration: s.completed ? 'line-through' : 'none',
                      ...SYS,
                    }}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
              {hiddenCount > 0 && (
                <div style={{ padding: '6px 0', color: '#71717A', fontSize: 11, ...SYS }}>
                  +{hiddenCount} more
                </div>
              )}
            </div>

            {note.trim() && (
              <p style={{ color: '#71717A', fontSize: 12, fontStyle: 'italic', marginTop: 8, lineHeight: 1.5, ...SYS }}>
                {note}
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
        selectedStandards={selectedLabels}
        onToggleStandard={toggleStandard}
        customStandards={customLabels}
        onAddCustom={addCustom}
        note={note}
        onNoteChange={setNote}
        onCommit={handleCommit}
        userId={userId}
      />
    </>
  )
}

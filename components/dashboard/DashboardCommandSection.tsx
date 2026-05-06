'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import CommitTodayModal, { type Standard } from './CommitTodayModal'

const SYS:  React.CSSProperties = { fontFamily: 'system-ui, -apple-system, sans-serif' }
const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono), monospace' }

const VIOLET = '#8B5CF6'
const GREEN  = '#3DDE6E'
const TEXT   = '#EDEDED'
const MUTED  = '#888888'
const SURF   = '#272727'

const CARD: React.CSSProperties = {
  background: SURF,
  borderRadius: 16,
  padding: '18px',
  marginBottom: 12,
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

interface Props {
  onModalChange: (isOpen: boolean) => void
  onOpenReckon?: () => void
}

export default function DashboardCommandSection({ onModalChange, onOpenReckon }: Props) {
  const [modalOpen,      setModalOpen]      = useState(false)
  const [userId,         setUserId]         = useState<string | null>(null)
  const [committed,      setCommitted]      = useState(false)
  const [standards,      setStandards]      = useState<Standard[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [customLabels,   setCustomLabels]   = useState<string[]>([])
  const [note,           setNote]           = useState('')
  const [todayDate,      setTodayDate]      = useState(todayStr)

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

  // Reset state on day change
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
  const progressPct = total > 0 ? doneCount / total : 0
  const overloaded  = total > 5
  const visibleStds = standards.slice(0, 5)
  const hiddenCount = Math.max(0, total - 5)

  // Ring geometry
  const ringR      = 36
  const ringCirc   = 2 * Math.PI * ringR
  const ringOffset = ringCirc * (1 - progressPct)
  const ringColor  = allDone ? GREEN : VIOLET

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
      {/* ── HERO: TODAY'S COMMAND ── */}
      <div style={{
        ...CARD,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px',
      }}>
        {/* Left */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
          <p style={{ color: TEXT, fontSize: 22, fontWeight: 700, lineHeight: 1.1, marginBottom: 4, ...SYS }}>
            {committed && total > 0
              ? `${total} standard${total !== 1 ? 's' : ''} locked`
              : 'No standards locked'
            }
          </p>
          <p style={{ color: MUTED, fontSize: 12, marginBottom: overloaded ? 4 : 14, ...SYS }}>
            {committed && total > 0
              ? 'Hold the line before midnight.'
              : "Choose today's standards."
            }
          </p>
          {committed && overloaded && (
            <p style={{ color: '#6B6B6B', fontSize: 11, fontStyle: 'italic', marginBottom: 14, ...SYS }}>
              Too many standards. Reduce the load.
            </p>
          )}

          {committed && total > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 10 }}>
                <span style={{ ...MONO, color: allDone ? GREEN : VIOLET, fontSize: 22, fontWeight: 700 }}>
                  {doneCount}
                </span>
                <span style={{ color: MUTED, fontSize: 11 }}>/ {total} held</span>
              </div>
              <button
                onClick={openModal}
                style={{
                  background: 'none', border: 'none',
                  color: VIOLET, fontSize: 11, cursor: 'pointer', padding: 0, ...SYS,
                }}
              >
                Review Command
              </button>
            </>
          ) : (
            <button
              onClick={openModal}
              style={{
                background: VIOLET, border: 'none',
                borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', padding: '8px 18px', ...SYS,
              }}
            >
              Set Today's Standards
            </button>
          )}
        </div>

        {/* Ring */}
        <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
          <svg width="84" height="84" viewBox="0 0 84 84">
            {/* Track */}
            <circle
              cx="42" cy="42" r={ringR} fill="none"
              stroke={committed && total > 0 ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.15)'}
              strokeWidth="4"
            />
            {/* Fill arc — only when there's progress */}
            {committed && total > 0 && doneCount > 0 && (
              <circle
                cx="42" cy="42" r={ringR}
                fill="none" stroke={ringColor} strokeWidth="4" strokeLinecap="round"
                strokeDasharray={ringCirc.toFixed(2)}
                strokeDashoffset={ringOffset.toFixed(2)}
                transform="rotate(-90 42 42)"
                style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease' }}
              />
            )}
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            {committed && total > 0 ? (
              <>
                <span style={{ ...MONO, color: allDone ? GREEN : VIOLET, fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
                  {doneCount}
                </span>
                <span style={{ color: MUTED, fontSize: 9, marginTop: 2 }}>/ {total}</span>
              </>
            ) : (
              <span style={{ ...MONO, color: '#333', fontSize: 22, fontWeight: 700 }}>—</span>
            )}
          </div>
        </div>
      </div>

      {/* ── RESET PROTOCOL BANNER ── */}
      <div
        onClick={onOpenReckon}
        style={{
          ...CARD,
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(139,92,246,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill={VIOLET}>
            <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: TEXT, fontSize: 13, fontWeight: 600, marginBottom: 2, ...SYS }}>Reset Protocol</p>
          <p style={{ color: MUTED, fontSize: 11, ...SYS }}>60 seconds. Breathe. Reset. Commit.</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={VIOLET} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {/* ── STANDARDS LIST — only render when standards exist ── */}
      {committed && total > 0 && (
        <div style={{ ...CARD }}>
          {visibleStds.map((s, i) => {
            const isLast   = i === visibleStds.length - 1 && hiddenCount === 0
            const catLabel = s.category === 'resist' ? 'Resist' : s.category === 'execute' ? 'Execute' : 'Custom'
            return (
              <div
                key={s.label}
                onClick={() => toggleCompleted(s.label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0',
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                }}
              >
                {/* Checkbox — green outline + check icon only, no solid fill */}
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  border: s.completed
                    ? '1.5px solid rgba(61,222,110,0.4)'
                    : '1.5px solid rgba(255,255,255,0.2)',
                  background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {s.completed && (
                    <svg width="10" height="10" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>
                {/* Name */}
                <span style={{
                  flex: 1,
                  color: s.completed ? '#A0A0A0' : TEXT,
                  fontSize: 13, fontWeight: 500,
                  ...SYS,
                }}>
                  {s.label}
                </span>
                {/* Category */}
                <span style={{ color: '#3A3A3A', fontSize: 10, marginRight: 6, ...SYS }}>{catLabel}</span>
                {/* Status */}
                <span style={{
                  color: s.completed ? GREEN : '#555',
                  fontSize: 10, fontWeight: 600,
                  minWidth: 42, textAlign: 'right',
                  ...SYS,
                }}>
                  {s.completed ? 'Held' : 'Unheld'}
                </span>
              </div>
            )
          })}
          {hiddenCount > 0 && (
            <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                onClick={openModal}
                style={{
                  background: 'none', border: 'none',
                  color: VIOLET, fontSize: 11, cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center', gap: 3,
                  ...SYS,
                }}
              >
                +{hiddenCount} more standard{hiddenCount !== 1 ? 's' : ''}
                <span style={{ fontSize: 12, lineHeight: 1 }}>›</span>
              </button>
            </div>
          )}
        </div>
      )}

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

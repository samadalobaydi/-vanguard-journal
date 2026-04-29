'use client'

// SUPABASE TODO: On mount, fetch today's daily_mission_set and daily_missions for user
// SUPABASE TODO: On Lock Missions, insert daily_mission_set + daily_missions rows
// SUPABASE TODO: On mission check, update daily_missions completed + completed_at
// SUPABASE TODO: Tables — daily_mission_sets, daily_missions (see spec)

import { useState, useEffect } from 'react'
import { ListChecks, Plus } from 'lucide-react'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono), monospace' }
const SYS: React.CSSProperties  = { fontFamily: 'system-ui, -apple-system, sans-serif' }

interface MissionOption {
  id: string
  title: string
  detail: string
}

const PRESET_MISSIONS: MissionOption[] = [
  { id: 'deep_work',  title: 'Deep Work Session', detail: '1 hour focus session' },
  { id: 'training',   title: 'Training',           detail: 'Set in Training card' },
  { id: 'read',       title: 'Read 10 Pages',      detail: 'Build wisdom' },
  { id: 'no_scroll',  title: 'No Scrolling',       detail: 'Protect attention' },
  { id: 'recovery',   title: 'Recovery',            detail: 'Sleep / stretch / reset' },
]

interface LockedMission {
  id: string
  title: string
  detail: string
}

interface Props {
  onModalChange: (isOpen: boolean) => void
  trainingType?: string
}

export default function DailyMissionsCard({ onModalChange, trainingType }: Props) {
  const [modalOpen,        setModalOpen]        = useState(false)
  const [selectedIds,      setSelectedIds]       = useState<string[]>([])
  const [customMissions,   setCustomMissions]    = useState<MissionOption[]>([])
  const [showCustomInput,  setShowCustomInput]   = useState(false)
  const [customInputText,  setCustomInputText]   = useState('')
  const [lockedMissions,   setLockedMissions]    = useState<LockedMission[]>([])
  const [completedIds,     setCompletedIds]      = useState<string[]>([])
  const [editMode,         setEditMode]          = useState(false)
  const [todayDate,        setTodayDate]         = useState<string | null>(null)

  // Reset if stored date isn't today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (todayDate && todayDate !== today) {
      setSelectedIds([])
      setCustomMissions([])
      setShowCustomInput(false)
      setCustomInputText('')
      setLockedMissions([])
      setCompletedIds([])
      setEditMode(false)
      setTodayDate(null)
    }
  }, [todayDate])

  const missionsLocked = lockedMissions.length > 0 && !editMode
  const allDone = missionsLocked && completedIds.length === lockedMissions.length

  // Inject dynamic training detail
  const presetOptions: MissionOption[] = PRESET_MISSIONS.map((m) =>
    m.id === 'training' && trainingType ? { ...m, detail: trainingType } : m
  )

  // All available options = presets + any added custom missions
  const allOptions: MissionOption[] = [...presetOptions, ...customMissions]

  const atLimit = selectedIds.length >= 5

  function openModal() {
    setModalOpen(true)
    onModalChange(true)
  }

  function closeModal() {
    setModalOpen(false)
    setShowCustomInput(false)
    setCustomInputText('')
    if (editMode) setEditMode(false)
    onModalChange(false)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 5) return prev
      return [...prev, id]
    })
  }

  function addCustomMission() {
    const name = customInputText.trim()
    if (!name) return
    const id = `custom_${Date.now()}`
    const newMission: MissionOption = { id, title: name, detail: '' }
    setCustomMissions((prev) => [...prev, newMission])
    setSelectedIds((prev) => [...prev, id])
    setCustomInputText('')
    setShowCustomInput(false)
  }

  function lockMissions() {
    if (selectedIds.length === 0) return
    const today = new Date().toISOString().split('T')[0]
    const locked: LockedMission[] = selectedIds.map((id) => {
      const opt = allOptions.find((m) => m.id === id)!
      return { id, title: opt.title, detail: opt.detail }
    })
    setLockedMissions(locked)
    setCompletedIds([])
    setTodayDate(today)
    setEditMode(false)
    setShowCustomInput(false)
    setCustomInputText('')
    setModalOpen(false)
    onModalChange(false)
    // SUPABASE TODO: On Lock Missions, insert daily_mission_set + daily_missions rows
  }

  function toggleComplete(id: string) {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    // SUPABASE TODO: On mission check, update daily_missions completed + completed_at
  }

  function enterEditMode() {
    setSelectedIds(lockedMissions.map((m) => m.id))
    // Restore any custom missions from locked set
    const restoredCustom = lockedMissions
      .filter((m) => m.id.startsWith('custom_'))
      .map((m) => ({ id: m.id, title: m.title, detail: m.detail }))
    setCustomMissions(restoredCustom)
    setEditMode(true)
  }

  // Card display
  const completedCount = completedIds.length
  const totalCount     = lockedMissions.length

  const displayValue = allDone
    ? 'Done'
    : lockedMissions.length > 0
    ? `${completedCount}/${totalCount}`
    : 'Unset'

  const displaySub = allDone
    ? 'All missions completed'
    : lockedMissions.length > 0
    ? 'Missions locked in'
    : 'Select 1–5 missions'

  const firstMission = lockedMissions[0]?.title ?? null

  const cardBorder = allDone
    ? '1px solid rgba(139,92,246,0.35)'
    : lockedMissions.length > 0
    ? '1px solid rgba(139,92,246,0.25)'
    : '1px solid rgba(255,255,255,0.08)'

  const valueColor = allDone ? '#8B5CF6' : '#F8FAFC'

  const canLock = selectedIds.length >= 1 && selectedIds.length <= 5

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
            background: lockedMissions.length > 0 ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ListChecks size={17} color="#8B5CF6" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600, marginBottom: 1, ...SYS }}>Daily Missions</p>
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
          <div>
            <span style={{ color: valueColor, fontSize: 26, fontWeight: 700, lineHeight: 1, ...MONO }}>
              {displayValue}
            </span>
            {lockedMissions.length > 0 && !allDone && firstMission && (
              <p style={{
                color: '#71717A', fontSize: 10, marginTop: 3,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                maxWidth: 100,
                ...SYS,
              }}>
                {firstMission}
              </p>
            )}
          </div>
          <ListChecks size={28} color="rgba(139,92,246,0.12)" style={{ flexShrink: 0 }} />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 700, ...SYS }}>Daily Missions</p>
                {missionsLocked && (
                  <span style={{
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    borderRadius: 20,
                    padding: '2px 8px',
                    color: '#8B5CF6',
                    fontSize: 12,
                    fontWeight: 700,
                    ...MONO,
                  }}>
                    {completedCount}/{totalCount}
                  </span>
                )}
              </div>
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

            {/* ── SELECTION MODE ── */}
            {!missionsLocked && (
              <>
                <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 8, ...SYS }}>
                  Choose what must be completed today.
                </p>
                <p style={{ color: '#71717A', fontSize: 11, marginBottom: 16, ...SYS }}>
                  Select 1–5 missions
                </p>

                {/* Preset missions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {allOptions.map((mission) => {
                    const sel = selectedIds.includes(mission.id)
                    return (
                      <div
                        key={mission.id}
                        onClick={() => toggleSelect(mission.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: sel ? 'rgba(139,92,246,0.06)' : '#1C1C20',
                          border: `1px solid ${sel ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: 14,
                          padding: '12px 14px',
                          cursor: 'pointer',
                        }}
                      >
                        {/* Checkbox */}
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          background: sel ? '#8B5CF6' : 'transparent',
                          border: `1.5px solid ${sel ? '#8B5CF6' : 'rgba(255,255,255,0.15)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {sel && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 500, marginBottom: mission.detail ? 2 : 0, ...SYS }}>
                            {mission.title}
                          </p>
                          {mission.detail && (
                            <p style={{ color: '#71717A', fontSize: 11, ...SYS }}>{mission.detail}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Add Custom Mission button — hidden at limit */}
                  {!atLimit && (
                    <div>
                      <div
                        onClick={() => setShowCustomInput((v) => !v)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: 'transparent',
                          border: '1px dashed rgba(139,92,246,0.25)',
                          borderRadius: 14,
                          padding: '12px 14px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(139,92,246,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Plus size={18} color="#8B5CF6" />
                        </div>
                        <div>
                          <p style={{ color: '#8B5CF6', fontSize: 14, fontWeight: 500, marginBottom: 2, ...SYS }}>
                            Add Custom Mission
                          </p>
                          <p style={{ color: '#71717A', fontSize: 11, ...SYS }}>Create your own task</p>
                        </div>
                      </div>

                      {/* Inline input — expands below when tapped */}
                      {showCustomInput && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Mission name"
                            value={customInputText}
                            onChange={(e) => setCustomInputText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') addCustomMission() }}
                            autoFocus
                            style={{
                              flex: 1,
                              background: '#1C1C20',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: 10,
                              padding: '10px 12px',
                              color: '#F8FAFC',
                              fontSize: 13,
                              outline: 'none',
                              ...SYS,
                            }}
                          />
                          <button
                            onClick={addCustomMission}
                            style={{
                              background: 'rgba(139,92,246,0.15)',
                              border: '1px solid rgba(139,92,246,0.3)',
                              borderRadius: 8,
                              padding: '6px 14px',
                              color: '#8B5CF6',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              ...SYS,
                            }}
                          >
                            Add Mission
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={lockMissions}
                  disabled={!canLock}
                  style={{
                    width: '100%', height: 52, marginTop: 16, marginBottom: 8,
                    background: canLock
                      ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                      : 'rgba(255,255,255,0.06)',
                    border: 'none', borderRadius: 16,
                    color: canLock ? '#fff' : '#71717A',
                    fontSize: 15, fontWeight: 700,
                    cursor: canLock ? 'pointer' : 'not-allowed',
                    opacity: selectedIds.length === 0 ? 0.4 : 1,
                    boxShadow: canLock ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
                    transition: 'all 0.2s ease',
                    ...SYS,
                  }}
                >
                  Lock Missions
                </button>
              </>
            )}

            {/* ── PROGRESS MODE ── */}
            {missionsLocked && (
              <>
                <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 16, ...SYS }}>
                  {allDone ? 'All missions complete. Solid.' : 'Check off as you go.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {lockedMissions.map((mission) => {
                    const done = completedIds.includes(mission.id)
                    return (
                      <div
                        key={mission.id}
                        onClick={() => toggleComplete(mission.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: done ? 'rgba(139,92,246,0.04)' : '#1C1C20',
                          border: `1px solid ${done ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: 14,
                          padding: '12px 14px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          background: done ? '#8B5CF6' : 'transparent',
                          border: `1.5px solid ${done ? '#8B5CF6' : 'rgba(255,255,255,0.1)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {done && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            color: done ? '#71717A' : '#F8FAFC',
                            fontSize: 14, fontWeight: 500, marginBottom: mission.detail ? 2 : 0,
                            textDecoration: done ? 'line-through' : 'none',
                            ...SYS,
                          }}>
                            {mission.title}
                          </p>
                          {mission.detail && (
                            <p style={{ color: '#71717A', fontSize: 11, ...SYS }}>{mission.detail}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={enterEditMode}
                  style={{
                    width: '100%', height: 44, marginTop: 16, marginBottom: 8,
                    background: 'transparent',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 16,
                    color: '#8B5CF6',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    ...SYS,
                  }}
                >
                  Edit Missions
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}

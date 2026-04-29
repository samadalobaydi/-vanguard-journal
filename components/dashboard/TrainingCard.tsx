'use client'

// SUPABASE TODO: On mount, fetch today's training_session for user
// SUPABASE TODO: On Set Session, upsert into training_sessions table
// SUPABASE TODO: Table — id, user_id, date, training_type, focus, exercises, custom_notes, completed, created_at

import { useState, useEffect } from 'react'
import { Dumbbell } from 'lucide-react'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono), monospace' }
const SYS: React.CSSProperties  = { fontFamily: 'system-ui, -apple-system, sans-serif' }

type TrainingType =
  | 'Push' | 'Pull' | 'Legs' | 'Upper' | 'Lower'
  | 'Cardio' | 'Boxing' | 'Rest Day' | 'Custom'

interface Template {
  focus: string
  exercises: string[]
}

const TEMPLATES: Record<Exclude<TrainingType, 'Custom'>, Template> = {
  Push:     { focus: 'Chest / Shoulders / Triceps',       exercises: ['Bench Press', 'Incline Dumbbell Press', 'Shoulder Press', 'Lateral Raises', 'Tricep Pushdowns'] },
  Pull:     { focus: 'Back / Biceps / Rear Delts',        exercises: ['Pull-ups or Lat Pulldown', 'Barbell Row', 'Seated Cable Row', 'Face Pulls', 'Bicep Curls'] },
  Legs:     { focus: 'Quads / Hamstrings / Glutes / Calves', exercises: ['Squat or Leg Press', 'Romanian Deadlift', 'Leg Extension', 'Hamstring Curl', 'Calf Raises'] },
  Upper:    { focus: 'Full Upper Body',                   exercises: ['Bench Press', 'Lat Pulldown', 'Shoulder Press', 'Row Variation', 'Arm Finisher'] },
  Lower:    { focus: 'Full Lower Body',                   exercises: ['Squat or Leg Press', 'Romanian Deadlift', 'Walking Lunges', 'Hamstring Curl', 'Calf Raises'] },
  Cardio:   { focus: 'Conditioning',                      exercises: ['20–30 min steady cardio', 'OR 10 rounds intervals', 'Cooldown walk', 'Stretch'] },
  Boxing:   { focus: 'Conditioning / Skill',              exercises: ['3 rounds shadow boxing', '5 rounds bag work', '3 rounds footwork', 'Core finisher'] },
  'Rest Day': { focus: 'Recovery',                        exercises: ['Walk', 'Stretch', 'Mobility', 'Hydration', 'Early sleep'] },
}

const TYPE_OPTIONS: TrainingType[] = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Cardio', 'Boxing', 'Rest Day', 'Custom']

interface Props {
  onModalChange: (isOpen: boolean) => void
}

export default function TrainingCard({ onModalChange }: Props) {
  const [modalOpen,    setModalOpen]    = useState(false)
  const [selected,     setSelected]     = useState<TrainingType | null>(null)
  const [customName,   setCustomName]   = useState('')
  const [customNotes,  setCustomNotes]  = useState('')
  const [sessionSet,   setSessionSet]   = useState(false)
  const [storedDate,   setStoredDate]   = useState<string | null>(null)

  // Reset if stored date isn't today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (storedDate && storedDate !== today) {
      setSelected(null)
      setSessionSet(false)
      setStoredDate(null)
    }
  }, [storedDate])

  function openModal() {
    setModalOpen(true)
    onModalChange(true)
  }

  function closeModal() {
    setModalOpen(false)
    onModalChange(false)
  }

  function setSession() {
    if (!selected) return
    const today = new Date().toISOString().split('T')[0]
    setStoredDate(today)
    setSessionSet(true)
    setModalOpen(false)
    onModalChange(false)
    // SUPABASE TODO: On Set Session, upsert into training_sessions table
  }

  const activeTemplate = selected && selected !== 'Custom' ? TEMPLATES[selected] : null
  const displayValue = sessionSet && selected
    ? (selected === 'Custom' ? (customName.trim() || 'Custom') : selected)
    : 'Set'
  const displaySub = sessionSet && selected
    ? (selected === 'Custom' ? (customNotes.trim() || 'Custom session') : activeTemplate?.focus ?? '')
    : 'Choose today\'s session'

  return (
    <>
      {/* ── CARD ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          background: 'linear-gradient(145deg, #2A2A30, #1B1B20)',
          border: sessionSet ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '16px',
          cursor: 'pointer',
        }}
        onClick={openModal}
      >
        {/* Icon circle — top left only */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: sessionSet ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Dumbbell size={17} color="#6366F1" />
        </div>

        {/* Stacked text */}
        <span style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 700, lineHeight: 1, marginTop: 8, ...MONO }}>
          {displayValue}
        </span>
        <p style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600, marginBottom: 1, ...SYS }}>Training</p>
        <p style={{
          color: '#A1A1AA', fontSize: 11,
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          {displaySub}
        </p>
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
              <p style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 700, ...SYS }}>Training</p>
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
              Choose today&apos;s physical standard.
            </p>

            {/* 3-column type grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {TYPE_OPTIONS.map((type) => {
                const sel = selected === type
                return (
                  <button
                    key={type}
                    onClick={() => setSelected(type)}
                    style={{
                      background: sel ? 'rgba(99,102,241,0.12)' : '#1C1C20',
                      border: `1px solid ${sel ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 12,
                      padding: '10px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      color: sel ? '#6366F1' : '#F8FAFC',
                      fontSize: 13,
                      fontWeight: 500,
                      ...SYS,
                    }}
                  >
                    {type}
                  </button>
                )
              })}
            </div>

            {/* Template preview */}
            {selected && selected !== 'Custom' && activeTemplate && (
              <div style={{
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.12)',
                borderRadius: 14,
                padding: '14px',
                marginTop: 12,
              }}>
                <p style={{ color: '#6366F1', fontSize: 12, fontWeight: 600, marginBottom: 8, ...SYS }}>
                  Focus: {activeTemplate.focus}
                </p>
                {activeTemplate.exercises.map((ex) => (
                  <p key={ex} style={{ color: '#A1A1AA', fontSize: 12, lineHeight: 1.8 }}>
                    › {ex}
                  </p>
                ))}
              </div>
            )}

            {/* Custom fields */}
            {selected === 'Custom' && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="text"
                  placeholder="Session name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  style={{
                    background: '#1C1C20',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '10px',
                    color: '#F8FAFC',
                    fontSize: 13,
                    outline: 'none',
                    ...SYS,
                  }}
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={3}
                  style={{
                    background: '#1C1C20',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '10px',
                    color: '#F8FAFC',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'none',
                    ...SYS,
                  }}
                />
              </div>
            )}

            {/* Set Session button */}
            <button
              onClick={setSession}
              disabled={!selected}
              style={{
                width: '100%', height: 52, marginTop: 16, marginBottom: 8,
                background: selected
                  ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                  : 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: 16,
                color: selected ? '#fff' : '#71717A',
                fontSize: 15, fontWeight: 700, cursor: selected ? 'pointer' : 'not-allowed',
                boxShadow: selected ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
                transition: 'all 0.2s ease',
                ...SYS,
              }}
            >
              Set Session
            </button>

          </div>
        </>
      )}
    </>
  )
}

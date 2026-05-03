'use client'

import { useState } from 'react'

const RESIST_STANDARDS = [
  'No porn',
  'No doom scrolling',
  'No smoking',
  'No alcohol',
  'No drugs',
  'No junk food',
]

const EXECUTE_STANDARDS = [
  'Train',
  'Clean diet',
  'Deep work',
  'Work on business',
  'Read / learn',
  'Sleep on time',
]

const SYS: React.CSSProperties = { fontFamily: 'system-ui, -apple-system, sans-serif' }

interface Props {
  isOpen: boolean
  onClose: () => void
  selectedStandards: string[]
  onToggleStandard: (s: string) => void
  customStandards: string[]
  onAddCustom: (s: string) => void
  note: string
  onNoteChange: (v: string) => void
  onCommit: () => void
}

export default function CommitTodayModal({
  isOpen, onClose,
  selectedStandards, onToggleStandard,
  customStandards, onAddCustom,
  note, onNoteChange,
  onCommit,
}: Props) {
  const [addingCustom, setAddingCustom] = useState(false)
  const [customInput,  setCustomInput]  = useState('')

  if (!isOpen) return null

  const count       = selectedStandards.length
  const canCommit   = count > 0
  const overSelected = count > 5

  const counterColor = overSelected ? '#D946EF' : count >= 3 ? '#8B5CF6' : '#71717A'

  function handleAddCustom() {
    const trimmed = customInput.trim()
    if (!trimmed || customStandards.length >= 3) return
    onAddCustom(trimmed)
    setCustomInput('')
    setAddingCustom(false)
  }

  function handleClose() {
    setAddingCustom(false)
    setCustomInput('')
    onClose()
  }

  function StandardRow({ label }: { label: string }) {
    const sel = selectedStandards.includes(label)
    return (
      <div
        onClick={() => onToggleStandard(label)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: sel ? 'rgba(139,92,246,0.06)' : '#1C1C20',
          border: `1px solid ${sel ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 12, padding: '11px 14px', marginBottom: 7,
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
        <span style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 500, ...SYS }}>{label}</span>
      </div>
    )
  }

  return (
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
        onClick={handleClose}
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
            onClick={handleClose}
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

        <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 6, ...SYS }}>
          Choose the standards you will hold today.
        </p>

        {/* Selection counter */}
        <p style={{ color: counterColor, fontSize: 12, fontWeight: 600, marginBottom: overSelected ? 4 : 20, marginTop: 0, ...SYS }}>
          {count} / 5 recommended
        </p>

        {/* Over-selection warning */}
        {overSelected && (
          <p style={{ color: '#D946EF', fontSize: 11, fontStyle: 'italic', marginTop: 0, marginBottom: 20, ...SYS }}>
            Too many standards weakens execution. Choose what matters.
          </p>
        )}

        {/* RESIST section */}
        <p style={{ color: '#71717A', fontSize: 10, letterSpacing: '0.14em', marginBottom: 4, ...SYS }}>RESIST</p>
        <p style={{ color: '#71717A', fontSize: 11, marginBottom: 10, ...SYS }}>Vices to eliminate.</p>
        {RESIST_STANDARDS.map(s => <StandardRow key={s} label={s} />)}

        {/* Section separator */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />

        {/* EXECUTE section */}
        <p style={{ color: '#71717A', fontSize: 10, letterSpacing: '0.14em', marginBottom: 4, ...SYS }}>EXECUTE</p>
        <p style={{ color: '#71717A', fontSize: 11, marginBottom: 10, ...SYS }}>Actions that move life forward.</p>
        {EXECUTE_STANDARDS.map(s => <StandardRow key={s} label={s} />)}

        {/* Custom standards */}
        {customStandards.map(s => <StandardRow key={s} label={s} />)}

        {/* Add custom */}
        {customStandards.length < 3 && !addingCustom && (
          <div
            onClick={() => setAddingCustom(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: '1.5px dashed rgba(139,92,246,0.25)',
              borderRadius: 12, padding: '11px 14px', marginBottom: 7,
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
              onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
              placeholder="Custom standard..."
              style={{
                flex: 1, background: '#1C1C20',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: 10, color: '#F8FAFC', fontSize: 14,
                padding: '10px 12px', outline: 'none', ...SYS,
              }}
            />
            <button
              onClick={handleAddCustom}
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
          onChange={e => onNoteChange(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#1C1C20', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '12px', color: '#F8FAFC', fontSize: 13,
            outline: 'none', resize: 'vertical', ...SYS,
          }}
        />

        {/* Commit button */}
        <button
          onClick={canCommit ? onCommit : undefined}
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
          Commit Standards
        </button>
      </div>
    </>
  )
}

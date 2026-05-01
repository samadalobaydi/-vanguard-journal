'use client'

import { useState } from 'react'
import { Timer } from 'lucide-react'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono), monospace' }
const SYS: React.CSSProperties  = { fontFamily: 'system-ui, -apple-system, sans-serif' }

interface Props {
  onModalChange: (isOpen: boolean) => void
}

export default function ReckonCard({ onModalChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  function openModal() {
    setModalOpen(true)
    onModalChange(true)
  }

  function closeModal() {
    setModalOpen(false)
    onModalChange(false)
  }

  return (
    <>
      {/* ── CARD ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 88,
          background: 'linear-gradient(145deg, #2A2A30, #1B1B20)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '14px',
          cursor: 'pointer',
        }}
        onClick={openModal}
      >
        {/* Top row: icon + label/sub */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(139,92,246,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Timer size={17} color="#8B5CF6" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600, marginBottom: 1, ...SYS }}>60s Reckon</p>
            <p style={{ color: '#A1A1AA', fontSize: 11, ...SYS }}>Quick check-in</p>
          </div>
        </div>

        {/* Bottom row: value + decorative ring */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <span style={{ color: '#F8FAFC', fontSize: 26, fontWeight: 700, lineHeight: 1, ...MONO }}>Ready</span>
          <svg width="40" height="40" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="2" />
          </svg>
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
              <p style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 700, ...SYS }}>60s Reckon</p>
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

            <p style={{ color: '#A1A1AA', fontSize: 15, lineHeight: 1.7, margin: '20px 0', ...SYS }}>
              Take 60 seconds. Breathe. Reset. Commit.
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(139,92,246,0.15)', width: '100%', marginBottom: 20 }} />

            {/* CTA button */}
            <button
              onClick={closeModal}
              style={{
                width: '100%', height: 52,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none', borderRadius: 16,
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                ...SYS,
              }}
            >
              BEGIN RECKON
            </button>

            <p style={{ textAlign: 'center', color: '#71717A', fontSize: 11, marginTop: 10, ...SYS }}>
              60 seconds of radical honesty.
            </p>
          </div>
        </>
      )}
    </>
  )
}

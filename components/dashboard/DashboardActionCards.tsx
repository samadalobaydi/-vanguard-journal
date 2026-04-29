'use client'

// Single client component owning all quick-action modal states so exactly
// one BottomNav renders and its hidden prop reflects either modal being open.

import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import DeepWorkCard from './DeepWorkCard'
import TrainingCard from './TrainingCard'
import DailyMissionsCard from './DailyMissionsCard'

const ICONS = {
  reckon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z',
}

export default function DashboardActionCards() {
  const [deepWorkOpen,    setDeepWorkOpen]    = useState(false)
  const [trainingOpen,    setTrainingOpen]    = useState(false)
  const [dailyMissionsOpen, setDailyMissionsOpen] = useState(false)

  const anyModalOpen = deepWorkOpen || trainingOpen || dailyMissionsOpen

  return (
    <>
      {/* 2×2 Quick Actions Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <DeepWorkCard  onModalChange={setDeepWorkOpen} />
        <TrainingCard  onModalChange={setTrainingOpen} />

        {[
          { label: '60s Reckon', sub: 'Quick check-in', href: '/journal', icon: ICONS.reckon },
        ].map(({ label, sub, href, icon }) => (
          <Link
            key={label}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              background: '#1C1C20',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: '16px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(99,102,241,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#6366F1">
                <path d={icon} />
              </svg>
            </div>
            <div>
              <p style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 500, marginBottom: 2, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {label}
              </p>
              <p style={{ color: '#A1A1AA', fontSize: 11, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {sub}
              </p>
            </div>
          </Link>
        ))}

        <DailyMissionsCard onModalChange={setDailyMissionsOpen} />
      </div>

      {/* Single BottomNav — hidden when any modal is open */}
      <BottomNav hidden={anyModalOpen} />
    </>
  )
}

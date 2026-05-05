'use client'

import { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import DeepWorkCard from './DeepWorkCard'
import TrainingCard from './TrainingCard'
import DailyMissionsCard from './DailyMissionsCard'
import ReckonCard from './ReckonCard'
import DashboardCommandSection from './DashboardCommandSection'

export default function DashboardActionCards() {
  const [deepWorkOpen,      setDeepWorkOpen]      = useState(false)
  const [trainingOpen,      setTrainingOpen]      = useState(false)
  const [dailyMissionsOpen, setDailyMissionsOpen] = useState(false)
  const [reckonOpen,        setReckonOpen]        = useState(false)
  const [commitModalOpen,   setCommitModalOpen]   = useState(false)
  const [reckonTrigger,     setReckonTrigger]     = useState(0)

  const anyModalOpen = deepWorkOpen || trainingOpen || dailyMissionsOpen || reckonOpen || commitModalOpen

  function triggerReckon() {
    setReckonTrigger(n => n + 1)
    setReckonOpen(true)
  }

  return (
    <>
      {/* Today's Command hero + Focus Reset banner + standards rows */}
      <DashboardCommandSection onModalChange={setCommitModalOpen} onOpenReckon={triggerReckon} />

      {/* Secondary tool cards */}
      <p style={{
        color: '#444', fontSize: 10, letterSpacing: '0.12em',
        marginTop: 24, marginBottom: 8,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        TOOLS
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 16,
      }}>
        <DeepWorkCard      onModalChange={setDeepWorkOpen} />
        <TrainingCard      onModalChange={setTrainingOpen} />
        <ReckonCard        onModalChange={setReckonOpen} triggerOpen={reckonTrigger} />
        <DailyMissionsCard onModalChange={setDailyMissionsOpen} />
      </div>

      <BottomNav hidden={anyModalOpen} />
    </>
  )
}

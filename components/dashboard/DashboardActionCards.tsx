'use client'

import { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import DeepWorkCard from './DeepWorkCard'
import TrainingCard from './TrainingCard'
import DailyMissionsCard from './DailyMissionsCard'
import ReckonCard from './ReckonCard'
import CommitTodayModal from './CommitTodayModal'

export default function DashboardActionCards() {
  const [deepWorkOpen,      setDeepWorkOpen]      = useState(false)
  const [trainingOpen,      setTrainingOpen]      = useState(false)
  const [dailyMissionsOpen, setDailyMissionsOpen] = useState(false)
  const [reckonOpen,        setReckonOpen]        = useState(false)
  const [commitModalOpen,   setCommitModalOpen]   = useState(false)

  const anyModalOpen = deepWorkOpen || trainingOpen || dailyMissionsOpen || reckonOpen || commitModalOpen

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
        <DeepWorkCard      onModalChange={setDeepWorkOpen} />
        <TrainingCard      onModalChange={setTrainingOpen} />
        <ReckonCard        onModalChange={setReckonOpen} />
        <DailyMissionsCard onModalChange={setDailyMissionsOpen} />
      </div>

      {/* Today's Command card + modal */}
      <CommitTodayModal onModalChange={setCommitModalOpen} />

      {/* Single BottomNav — hidden when any modal is open */}
      <BottomNav hidden={anyModalOpen} />
    </>
  )
}

'use client'

import { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import ReckonCard from './ReckonCard'
import DashboardCommandSection from './DashboardCommandSection'
import EndOfDayReview from './EndOfDayReview'

export default function DashboardActionCards() {
  const [reckonOpen,      setReckonOpen]      = useState(false)
  const [commitModalOpen, setCommitModalOpen] = useState(false)
  const [reckonTrigger,   setReckonTrigger]   = useState(0)

  const anyModalOpen = reckonOpen || commitModalOpen

  function triggerReckon() {
    setReckonTrigger(n => n + 1)
    setReckonOpen(true)
  }

  return (
    <>
      {/* Today's Command hero + Reset Protocol banner + standards rows */}
      <DashboardCommandSection onModalChange={setCommitModalOpen} onOpenReckon={triggerReckon} />

      {/* End of Day Review — self-gating, appears when standards exist + conditions met */}
      <EndOfDayReview />

      {/* ReckonCard rendered for modal only — triggered by 60-Second Reset banner */}
      <div style={{ display: 'none' }}>
        <ReckonCard onModalChange={setReckonOpen} triggerOpen={reckonTrigger} />
      </div>

      <BottomNav hidden={anyModalOpen} />
    </>
  )
}

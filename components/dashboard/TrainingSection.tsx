'use client'

import { useState } from 'react'
import TrainingCard from './TrainingCard'
import BottomNav from '@/components/BottomNav'

export default function TrainingSection() {
  const [trainingModalOpen, setTrainingModalOpen] = useState(false)

  return (
    <>
      <TrainingCard onModalChange={setTrainingModalOpen} />
      <BottomNav hidden={trainingModalOpen} />
    </>
  )
}

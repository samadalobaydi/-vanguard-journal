'use client'

import { useState } from 'react'
import DeepWorkCard from './DeepWorkCard'
import BottomNav from '@/components/BottomNav'

export default function DeepWorkSection() {
  const [deepWorkModalOpen, setDeepWorkModalOpen] = useState(false)

  return (
    <>
      <DeepWorkCard onModalChange={setDeepWorkModalOpen} />
      <BottomNav hidden={deepWorkModalOpen} />
    </>
  )
}

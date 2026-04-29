'use client'

import { useState } from 'react'
import DeepWorkCard from './DeepWorkCard'

// BottomNav is managed by DashboardActionCards to avoid duplicate nav instances.

interface Props {
  onModalChange: (isOpen: boolean) => void
}

export default function DeepWorkSection({ onModalChange }: Props) {
  const [open, setOpen] = useState(false)

  function handle(isOpen: boolean) {
    setOpen(isOpen)
    onModalChange(isOpen)
  }

  return <DeepWorkCard onModalChange={handle} />
}

'use client'

import { useState } from 'react'
import SubscriptionGate from './SubscriptionGate'

interface Props {
  isSubscribed: boolean
  children: React.ReactNode
}

export default function DashboardInterceptor({ isSubscribed, children }: Props) {
  const [showGate, setShowGate] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      {children}

      {/* Transparent click interceptor for non-subscribers */}
      {!isSubscribed && !showGate && (
        <div
          onClick={() => setShowGate(true)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            background: 'transparent',
            cursor: 'pointer',
          }}
        />
      )}

      {/* Gate overlay */}
      {!isSubscribed && showGate && <SubscriptionGate onDismiss={() => setShowGate(false)} />}
    </div>
  )
}

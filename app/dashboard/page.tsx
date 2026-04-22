import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  calculateVanguardScore,
  getStreakData,
  getReEntryRequired,
  getDayGrid,
  getSparklineData,
  getDisciplineScore,
} from '@/lib/vanguard-score'
import IdentityCard from '@/components/dashboard/IdentityCard'
import ScoreGauge from '@/components/dashboard/ScoreGauge'
import StreakCard from '@/components/dashboard/StreakCard'
import Sparkline from '@/components/dashboard/Sparkline'
import ReckoningCard from '@/components/dashboard/ReckoningCard'
import DayGrid from '@/components/dashboard/DayGrid'
import VanguardPrinciple from '@/components/dashboard/VanguardPrinciple'
import DashboardNav from '@/components/DashboardNav'
import BottomNav from '@/components/BottomNav'
import SubscriptionGate from '@/components/SubscriptionGate'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, identity_statement')
    .eq('id', user.id)
    .single()

  const isSubscribed = profile?.subscription_status === 'active'

  const todayStr = new Date().toISOString().split('T')[0]

  const { data: todayEntry } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', todayStr)
    .single()

  const { data: recentEntries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .limit(60)

  const entries = recentEntries ?? []
  const { current, longest } = getStreakData(entries)
  const vanguardScore = calculateVanguardScore(entries, !!profile?.identity_statement?.trim())
  const reEntryRequired = getReEntryRequired(entries)
  const dayGrid = getDayGrid(entries)
  const sparklineData = getSparklineData(entries)
  const todayScore = todayEntry ? getDisciplineScore(todayEntry) : 0

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      {!isSubscribed && <SubscriptionGate />}
      <DashboardNav email={user.email ?? ''} streak={current} />

      <main
        style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 96px' }}
        className="sm:px-6 sm:pb-12"
      >
        {/* Bento grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* 1. Identity Contract — full width */}
          <IdentityCard statement={profile?.identity_statement ?? null} />

          {/* 2. Score + Streak — 50/50 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
            className="grid-cols-1 sm:grid-cols-2"
          >
            <ScoreGauge score={vanguardScore} />
            <StreakCard current={current} longest={longest} />
          </div>

          {/* 3. 14-Day Sparkline — full width */}
          <Sparkline data={sparklineData} todayScore={todayScore} />

          {/* 4. 60-Second Reckoning — full width */}
          <ReckoningCard
            date={todayStr}
            initialEntry={todayEntry ?? null}
            reEntryRequired={reEntryRequired}
          />

          {/* 5. 14-Day Grid — full width */}
          <DayGrid days={dayGrid} />

          {/* 6. Vanguard Principle — full width */}
          <VanguardPrinciple />

        </div>
      </main>

      <BottomNav />

      {/* Emergency protocol */}
      <Link
        href="/hold-the-line"
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          fontSize: 10,
          letterSpacing: '2px',
          color: '#333333',
          textDecoration: 'none',
          fontFamily: 'var(--font-mono), monospace',
          zIndex: 50,
        }}
      >
        HOLD THE LINE
      </Link>
    </div>
  )
}

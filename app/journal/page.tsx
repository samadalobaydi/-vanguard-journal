import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getReEntryRequired } from '@/lib/vanguard-score'
import ReckoningCard from '@/components/dashboard/ReckoningCard'
import BottomNav from '@/components/BottomNav'

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.subscription_status !== 'active') {
    redirect('/subscribe')
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const { data: todayEntry } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', todayStr)
    .single()

  const { data: recentDates } = await supabase
    .from('journal_entries')
    .select('entry_date')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .limit(30)

  const reEntryRequired = getReEntryRequired(recentDates ?? [])

  return (
    <div
      style={{
        background: '#08000f',
        minHeight: '100vh',
        fontFamily: 'var(--font-mono), monospace',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '20px 16px 14px',
          borderBottom: '1px solid rgba(168,85,247,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p
            style={{
              color: 'rgba(168,85,247,0.3)',
              fontSize: 9,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            vanguard
          </p>
          <h1
            style={{
              color: '#ffffff',
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Daily Entry
          </h1>
        </div>
        <Link
          href="/dashboard"
          style={{
            color: 'rgba(255,255,255,0.25)',
            fontSize: 9,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            textDecoration: 'none',
            padding: '8px 0',
          }}
        >
          ← BACK
        </Link>
      </header>

      <main style={{ padding: '16px 16px 96px' }}>
        <ReckoningCard
          date={todayStr}
          initialEntry={todayEntry ?? null}
          reEntryRequired={reEntryRequired}
        />
      </main>

      <BottomNav />
    </div>
  )
}

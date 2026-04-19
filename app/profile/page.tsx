import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/DashboardNav'
import BottomNav from '@/components/BottomNav'
import IdentityContractCard from '@/components/profile/IdentityContractCard'
import AccountCard from '@/components/profile/AccountCard'
import DangerZone from '@/components/profile/DangerZone'
import { getStreakData } from '@/lib/vanguard-score'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
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

  if (!profile || profile.subscription_status !== 'active') {
    redirect('/subscribe')
  }

  // Fetch entries for streak count in nav
  const { data: recentEntries } = await supabase
    .from('journal_entries')
    .select('entry_date')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .limit(60)

  const { current } = getStreakData(recentEntries ?? [])

  const memberSince = new Date(user.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      <DashboardNav email={user.email ?? ''} streak={current} />

      <main
        style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 96px' }}
        className="sm:px-6 sm:pb-12"
      >
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              color: '#555555',
              letterSpacing: '4px',
              fontSize: 10,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Settings
          </p>
          <h1
            style={{
              color: '#ffffff',
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1,
              fontFamily: 'var(--font-bebas), sans-serif',
              letterSpacing: '3px',
            }}
          >
            Profile
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <IdentityContractCard
            userId={user.id}
            initialStatement={profile.identity_statement ?? null}
          />
          <AccountCard email={user.email ?? ''} memberSince={memberSince} />
          <DangerZone />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

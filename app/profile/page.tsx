import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/BottomNav'
import SignOutButton from '@/components/SignOutButton'
import IdentityContractCard from '@/components/profile/IdentityContractCard'
import AccountCard from '@/components/profile/AccountCard'
import DangerZone from '@/components/profile/DangerZone'

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

  const memberSince = new Date(user.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div style={{ background: '#08000f', minHeight: '100vh', fontFamily: 'var(--font-mono), monospace' }}>
      {/* Header */}
      <header
        style={{
          padding: '20px 16px 14px',
          borderBottom: '1px solid rgba(168,85,247,0.07)',
          display: 'flex',
          alignItems: 'flex-start',
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
            Profile
          </h1>
        </div>
        <SignOutButton />
      </header>

      <main style={{ padding: '16px 16px 96px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <IdentityContractCard
          userId={user.id}
          initialStatement={profile.identity_statement ?? null}
        />
        <AccountCard email={user.email ?? ''} memberSince={memberSince} />
        <DangerZone />
      </main>

      <BottomNav />
    </div>
  )
}

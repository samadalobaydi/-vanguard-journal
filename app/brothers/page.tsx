import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WeeklyCompletionGraph from '@/components/dashboard/WeeklyCompletionGraph'

export const dynamic = 'force-dynamic'

const BG  = '#1C1C1C'
const SYS: React.CSSProperties = { fontFamily: 'system-ui, -apple-system, sans-serif' }

export default async function IntelPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '24px 16px 80px', ...SYS }}>
      <p style={{ color: '#444', fontSize: 10, letterSpacing: '0.12em', marginBottom: 16 }}>
        INTEL
      </p>
      <WeeklyCompletionGraph />
    </div>
  )
}

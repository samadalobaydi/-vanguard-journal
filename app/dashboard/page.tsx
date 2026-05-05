import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Flame, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getStreakData } from '@/lib/vanguard-score'
import DashboardInterceptor from '@/components/DashboardInterceptor'
import DashboardActionCards from '@/components/dashboard/DashboardActionCards'

export const dynamic = 'force-dynamic'

const BG    = '#1C1C1C'
const SURF  = '#272727'
const GREEN = '#3DDE6E'
const TEXT  = '#EDEDED'
const MUTED = '#888888'
const SYS:  React.CSSProperties = { fontFamily: 'system-ui, -apple-system, sans-serif' }
const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono), monospace' }

const CARD: React.CSSProperties = {
  background: SURF,
  borderRadius: 16,
  padding: '18px',
  marginBottom: 12,
}

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

  const today    = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const { data: recentEntries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .limit(60)

  const entries  = recentEntries ?? []
  const { current: streak } = getStreakData(entries)
  const isSigned = !!profile?.identity_statement?.trim()
  const username = user.email ? user.email.split('@')[0] : 'Recruit'

  // 14-day trail
  const entrySet       = new Set(entries.map((e) => e.entry_date))
  const trail14        = Array.from({ length: 14 }, (_, i) => {
    const d       = new Date(today)
    d.setDate(today.getDate() - 13 + i)
    const dateStr = d.toISOString().split('T')[0]
    return {
      dateStr,
      isToday:  dateStr === todayStr,
      hasEntry: entrySet.has(dateStr),
      isFuture: dateStr > todayStr,
    }
  })
  const loggedCount    = trail14.filter((d) => d.hasEntry && !d.isFuture).length
  const totalDays      = trail14.filter((d) => !d.isFuture).length
  const consistencyPct = totalDays > 0 ? Math.round((loggedCount / totalDays) * 100) : 0

  const cycleStatus = consistencyPct <= 35
    ? { label: 'Current cycle: Unstable',   color: '#E54D4D' }
    : consistencyPct <= 70
    ? { label: 'Current cycle: Building',   color: MUTED }
    : consistencyPct <= 90
    ? { label: 'Current cycle: Locked In',  color: GREEN }
    : { label: 'Current cycle: Relentless', color: GREEN }

  return (
    <div style={{ background: BG, minHeight: '100vh', ...SYS, overflowX: 'hidden' }}>
      <style>{`
        @keyframes todayPulse {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 0.9; }
        }
        .today-dot { animation: todayPulse 2.4s ease-in-out infinite; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 16px 8px',
      }}>
        {/* Streak pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: SURF, borderRadius: 20, padding: '6px 12px',
        }}>
          <Flame size={14} color="#8B5CF6" />
          <span style={{ ...MONO, color: '#8B5CF6', fontSize: 14, fontWeight: 700 }}>{streak}</span>
          <span style={{ color: MUTED, fontSize: 11 }}>streak</span>
        </div>

        {/* TODAY nav pill */}
        <div style={{
          background: SURF, borderRadius: 20, padding: '6px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ color: MUTED, fontSize: 12 }}>‹</span>
          <span style={{ color: TEXT, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>TODAY</span>
          <span style={{ color: MUTED, fontSize: 12 }}>›</span>
        </div>

        {/* Username */}
        <div style={{ width: 72, textAlign: 'right' }}>
          <span style={{ color: MUTED, fontSize: 11 }}>{username}</span>
        </div>
      </header>

      <DashboardInterceptor isSubscribed={isSubscribed}>
        <main style={{ padding: '8px 16px 0', paddingBottom: 120, display: 'flex', flexDirection: 'column' }}>

          {/* ── DYNAMIC SECTION: hero + tools ── */}
          <DashboardActionCards />

          {/* ── IDENTITY CONTRACT ── */}
          <div style={{ ...CARD, border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 6v6c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V6L12 2z"
                    fill={isSigned ? 'rgba(61,222,110,0.12)' : 'transparent'}
                    stroke={isSigned ? GREEN : '#555'}
                    strokeWidth="1.5" strokeLinejoin="round"
                  />
                  {isSigned && (
                    <path d="M9 12l2 2 4-4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
                <span style={{ color: MUTED, fontSize: 12, fontWeight: 600 }}>Identity Contract</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: isSigned ? GREEN : MUTED, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em' }}>
                  {isSigned ? 'ACTIVE' : 'NOT SIGNED'}
                </span>
                <Link href="/profile" style={{ display: 'flex', alignItems: 'center' }}>
                  <Pencil size={13} color={MUTED} />
                </Link>
              </div>
            </div>

            {isSigned ? (
              <p style={{ color: TEXT, fontSize: 14, lineHeight: 1.65, fontStyle: 'italic', wordBreak: 'break-word' }}>
                &ldquo;{profile!.identity_statement}&rdquo;
              </p>
            ) : (
              <div>
                <p style={{ color: MUTED, fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
                  Define who you are committed to being.
                </p>
                <Link href="/profile" style={{ color: GREEN, fontSize: 12, fontWeight: 500, textDecoration: 'none' }}>
                  → Sign in Profile
                </Link>
              </div>
            )}
          </div>

          {/* ── 14-DAY CONSISTENCY ── */}
          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: MUTED, fontSize: 12, fontWeight: 600 }}>14-Day Consistency</span>
              <span style={{ ...MONO, color: GREEN, fontSize: 15, fontWeight: 700 }}>{consistencyPct}%</span>
            </div>

            <div style={{ display: 'flex', gap: 3 }}>
              {trail14.map(({ dateStr, isToday, hasEntry, isFuture }) => (
                <div
                  key={dateStr}
                  title={dateStr}
                  style={{
                    flex: 1, height: 18, borderRadius: 3, flexShrink: 0,
                    background: hasEntry ? GREEN : isToday ? 'rgba(61,222,110,0.15)' : '#333',
                    border: isToday ? `1.5px solid ${GREEN}` : 'none',
                    opacity: isFuture ? 0.2 : 1,
                  }}
                  className={isToday && !hasEntry ? 'today-dot' : undefined}
                />
              ))}
            </div>

            <p style={{ color: MUTED, fontSize: 11, marginTop: 8 }}>
              {loggedCount} / 14 days held
            </p>
            <p style={{ color: cycleStatus.color, fontSize: 11, fontStyle: 'italic', marginTop: 3 }}>
              {cycleStatus.label}
            </p>
          </div>

        </main>
      </DashboardInterceptor>
    </div>
  )
}

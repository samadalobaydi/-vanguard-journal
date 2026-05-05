import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Flame, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { calculateVanguardScore, getStreakData } from '@/lib/vanguard-score'
import DashboardInterceptor from '@/components/DashboardInterceptor'
import DashboardActionCards from '@/components/dashboard/DashboardActionCards'

export const dynamic = 'force-dynamic'

// ── Design tokens ────────────────────────────────────────────────
const BG    = '#1C1C1C'
const SURF  = '#272727'
const GREEN = '#3DDE6E'
const TEXT  = '#EDEDED'
const MUTED = '#888888'
const SYS: React.CSSProperties   = { fontFamily: 'system-ui, -apple-system, sans-serif' }
const MONO: React.CSSProperties  = { fontFamily: 'var(--font-mono), monospace' }

const CARD: React.CSSProperties = {
  background: SURF,
  borderRadius: 16,
  padding: '18px',
  marginBottom: 12,
}

function getRank(score: number) {
  if (score >= 800) return 'ELITE'
  if (score >= 600) return 'COMMANDER'
  if (score >= 400) return 'SPECIALIST'
  if (score >= 200) return 'OPERATOR'
  return 'RECRUIT'
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

  const { data: todayEntry } = await supabase
    .from('journal_entries')
    .select('morning_intention')
    .eq('user_id', user.id)
    .eq('entry_date', todayStr)
    .single()

  const { data: recentEntries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .limit(60)

  // Today's standards (graceful — table may not exist yet)
  const { data: todayCommand } = await supabase
    .from('daily_commands')
    .select('total_count, completed_count')
    .eq('user_id', user.id)
    .eq('command_date', todayStr)
    .maybeSingle()

  const entries      = recentEntries ?? []
  const { current: streak, longest: bestStreak } = getStreakData(entries)
  const vanguardScore = calculateVanguardScore(entries, !!profile?.identity_statement?.trim())
  const isCommitted  = !!todayEntry
  const isSigned     = !!profile?.identity_statement?.trim()
  const rank         = getRank(vanguardScore)
  const username     = user.email ? user.email.split('@')[0] : 'Recruit'

  // 14-day trail
  const entrySet  = new Set(entries.map((e) => e.entry_date))
  const trail14   = Array.from({ length: 14 }, (_, i) => {
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
  const loggedCount   = trail14.filter((d) => d.hasEntry && !d.isFuture).length
  const totalDays     = trail14.filter((d) => !d.isFuture).length
  const consistencyPct = totalDays > 0 ? Math.round((loggedCount / totalDays) * 100) : 0

  // 7-day trend
  const trend7: number[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 6 + i)
    return entrySet.has(d.toISOString().split('T')[0]) ? 100 : 0
  })
  const hasTrendData  = trend7.some((v) => v > 0)
  const firstHalfAvg  = trend7.slice(0, 3).reduce((a: number, b: number) => a + b, 0) / 3
  const secondHalfAvg = trend7.slice(4).reduce((a: number, b: number) => a + b, 0) / 3
  const isImproving   = hasTrendData && secondHalfAvg >= firstHalfAvg

  // 14-day cycle status
  const cycleStatus = consistencyPct <= 35
    ? { label: 'Current cycle: Unstable',   color: '#E54D4D' }
    : consistencyPct <= 70
    ? { label: 'Current cycle: Building',   color: MUTED }
    : consistencyPct <= 90
    ? { label: 'Current cycle: Locked In',  color: GREEN }
    : { label: 'Current cycle: Relentless', color: GREEN }

  // Hero ring (streak vs best)
  const ringR        = 36
  const ringCirc     = 2 * Math.PI * ringR
  const ringProgress = bestStreak > 0 ? Math.min(streak / bestStreak, 1) : (streak > 0 ? 1 : 0)
  const ringOffset   = ringCirc * (1 - ringProgress)

  // Standards counts
  const standardsTotal    = todayCommand?.total_count    ?? 0
  const standardsComplete = todayCommand?.completed_count ?? 0

  return (
    <div style={{ background: BG, minHeight: '100vh', ...SYS, overflowX: 'hidden' }}>
      <style>{`
        @keyframes ringIn {
          from { stroke-dashoffset: ${ringCirc.toFixed(2)}; }
          to   { stroke-dashoffset: ${ringOffset.toFixed(2)}; }
        }
        @keyframes todayPulse {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 0.9; }
        }
        .ring-fill    { animation: ringIn 0.9s ease-out forwards; }
        .today-dot    { animation: todayPulse 2.4s ease-in-out infinite; }
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
          <Flame size={14} color={GREEN} />
          <span style={{ ...MONO, color: GREEN, fontSize: 14, fontWeight: 700 }}>{streak}</span>
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

          {/* ── HERO CARD ── */}
          <div style={{ ...CARD, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
            {/* Left */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: TEXT, fontSize: 26, fontWeight: 700, lineHeight: 1.1, marginBottom: 4 }}>
                {streak === 0 ? 'Day one.' : `${streak} days in.`}
              </p>
              <p style={{ color: MUTED, fontSize: 12, marginBottom: 14 }}>
                {isCommitted ? 'Committed today.' : 'Not committed today.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ ...MONO, color: GREEN, fontSize: 22, fontWeight: 700 }}>{vanguardScore}</span>
                <span style={{ color: MUTED, fontSize: 11 }}>XP</span>
              </div>
              <p style={{ color: MUTED, fontSize: 10, marginTop: 3, letterSpacing: '0.1em' }}>{rank}</p>
              {isImproving && (
                <p style={{ color: GREEN, fontSize: 10, marginTop: 6 }}>↑ Improving this week</p>
              )}
            </div>

            {/* Ring */}
            <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
              <svg width="84" height="84" viewBox="0 0 84 84">
                <circle cx="42" cy="42" r={ringR} fill="none" stroke="#333" strokeWidth="4" />
                <circle
                  cx="42" cy="42" r={ringR}
                  fill="none" stroke={GREEN} strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${ringCirc.toFixed(2)}`}
                  strokeDashoffset={`${ringCirc.toFixed(2)}`}
                  transform="rotate(-90 42 42)"
                  className="ring-fill"
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ ...MONO, color: TEXT, fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{streak}</span>
                {bestStreak > 0 && (
                  <span style={{ color: MUTED, fontSize: 9, marginTop: 2 }}>/ {bestStreak}</span>
                )}
              </div>
            </div>
          </div>

          {/* ── FOCUS RESET BANNER ── */}
          <div style={{
            ...CARD,
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(61,222,110,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Lightning bolt */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill={GREEN}>
                <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: TEXT, fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Focus Reset</p>
              <p style={{ color: MUTED, fontSize: 11 }}>60 seconds. Breathe. Reset. Commit.</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>

          {/* ── ACTION CARDS + TODAY'S COMMAND ── */}
          <DashboardActionCards />

          {/* ── IDENTITY CONTRACT ── */}
          <div style={{ ...CARD, borderLeft: `3px solid ${GREEN}` }}>
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

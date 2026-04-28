import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculateVanguardScore, getStreakData, getDisciplineScore } from '@/lib/vanguard-score'
import DashboardInterceptor from '@/components/DashboardInterceptor'

export const dynamic = 'force-dynamic'

const RING_R = 20
const RING_SW = 5
const RING_CIRC = 2 * Math.PI * RING_R

const NAV_ITEMS = [
  {
    label: 'JOURNAL',
    href: '/journal',
    active: false,
    d: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  },
  {
    label: 'DASHBOARD',
    href: '/dashboard',
    active: true,
    d: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
  },
  {
    label: 'ANALYSIS',
    href: '/analysis',
    active: false,
    d: 'M4 20V9h4v11H4zm6 0V4h4v16h-4zm6 0v-7h4v7h-4z',
  },
  {
    label: 'BROTHERS',
    href: '/brothers',
    active: false,
    d: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  },
  {
    label: 'PROFILE',
    href: '/profile',
    active: false,
    d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  },
]

function metricStatus(pct: number): { icon: string; color: string } {
  if (pct >= 70) return { icon: '✓', color: '#4ade80' }
  if (pct >= 40) return { icon: '—', color: '#fbbf24' }
  return { icon: '✗', color: '#f87171' }
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

  const { data: recentEntries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .limit(60)

  const entries = recentEntries ?? []
  const hasData = entries.length > 0

  const { current: streak } = getStreakData(entries)
  const vanguardScore = calculateVanguardScore(entries, !!profile?.identity_statement?.trim())

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const entryMap = new Map(entries.map((e) => [e.entry_date, e]))

  // Resolved display values (real data or spec placeholders)
  const displayScore = hasData ? vanguardScore : 530
  const displayStreak = hasData ? streak : 14

  // Score ring offset
  const scoreRingOffset = RING_CIRC * (1 - Math.min(1, displayScore / 1000))

  // Current ISO week (Mon–Sun)
  const dow = today.getDay()
  const daysFromMon = dow === 0 ? 6 : dow - 1
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((label, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - daysFromMon + i)
    const dateStr = d.toISOString().split('T')[0]
    const entry = entryMap.get(dateStr)
    return {
      label,
      score: entry ? getDisciplineScore(entry) : 0,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    }
  })

  // 7D / prev-7D averages
  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 6 + i)
    return d.toISOString().split('T')[0]
  })
  const prev7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 13 + i)
    return d.toISOString().split('T')[0]
  })

  const avg = (dates: string[]) =>
    dates.reduce((s, d) => {
      const e = entryMap.get(d)
      return s + (e ? getDisciplineScore(e) : 0)
    }, 0) / dates.length

  const avgLast7 = avg(last7Dates)
  const avgPrev7 = avg(prev7Dates)
  const todayScore = (() => { const e = entryMap.get(todayStr); return e ? getDisciplineScore(e) : 0 })()
  const gain7D = avgPrev7 > 0 ? Math.round(((avgLast7 - avgPrev7) / avgPrev7) * 100) : avgLast7 > 0 ? 100 : 0

  const displayToday = hasData ? todayScore : 85
  const displayLastWk = hasData ? Math.round(avgPrev7) : 71
  const displayGain = hasData ? gain7D : 14

  // Grind metrics — last 14 days
  const last14Dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 13 + i)
    return d.toISOString().split('T')[0]
  }).filter((d) => d <= todayStr)
  const n = last14Dates.length || 1

  const morningPct = hasData
    ? Math.round(last14Dates.filter((d) => entryMap.get(d)?.morning_intention?.trim()).length / n * 100)
    : 90
  const eveningPct = hasData
    ? Math.round(last14Dates.filter((d) => entryMap.get(d)?.evening_review?.trim()).length / n * 100)
    : 60
  const identityPct = hasData ? (profile?.identity_statement?.trim() ? 75 : 0) : 75
  const holdPct = hasData
    ? Math.round(last14Dates.filter((d) => entryMap.get(d)?.tomorrow_target?.trim()).length / n * 100)
    : 30

  const metrics = [
    { num: '01', label: 'Morning Reckoning', pct: morningPct },
    { num: '02', label: 'Evening Reckoning', pct: eveningPct },
    { num: '03', label: 'Identity Audit', pct: identityPct },
    { num: '04', label: 'Hold The Line', pct: holdPct },
  ]

  // Streak milestone
  const milestones = [7, 14, 30, 60, 90, 180, 365]
  const nextMilestone = milestones.find((m) => m > displayStreak) ?? 365
  const weeksToMilestone = Math.ceil((nextMilestone - displayStreak) / 7)

  // Card styles
  const cardFeatured: React.CSSProperties = {
    background: 'linear-gradient(145deg, #1a0533, #0d0020)',
    border: '1px solid rgba(168,85,247,0.25)',
    borderRadius: 18,
    overflow: 'hidden',
  }
  const cardStandard: React.CSSProperties = {
    background: 'linear-gradient(145deg, #120028, #080015)',
    border: '1px solid rgba(168,85,247,0.15)',
    borderRadius: 18,
    overflow: 'hidden',
  }
  const cardLabel: React.CSSProperties = {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    letterSpacing: '2.5px',
    textTransform: 'uppercase' as const,
    margin: '0 0 14px',
  }

  return (
    <div
      style={{
        background: '#08000f',
        minHeight: '100vh',
        fontFamily: "'JetBrains Mono', monospace",
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Background glow orbs */}
      <div
        style={{
          position: 'fixed', top: -120, left: -120,
          width: 440, height: 440,
          background: 'rgba(140,40,220,0.18)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed', bottom: -100, right: -100,
          width: 300, height: 300,
          background: 'rgba(100,20,180,0.12)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <DashboardInterceptor isSubscribed={isSubscribed}>
        <main
          style={{
            maxWidth: 480,
            margin: '0 auto',
            padding: '0 16px 108px',
            position: 'relative',
            zIndex: 1,
          }}
        >

          {/* ── HEADER ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '22px 0 18px',
            }}
          >
            <div>
              <p
                style={{
                  color: 'rgba(168,85,247,0.3)',
                  fontSize: 9,
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  marginBottom: 5,
                  fontFamily: 'inherit',
                }}
              >
                VANGUARD
              </p>
              <h1
                style={{
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontFamily: 'inherit',
                }}
              >
                OPERATOR TERMINAL
              </h1>
            </div>

            {/* Shield icon */}
            <div
              style={{
                width: 42, height: 42,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(124,58,237,0.15))',
                border: '1px solid rgba(168,85,247,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(168,85,247,0.85)">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
              </svg>
            </div>
          </div>

          {/* ── TOP ROW: Score + Streak ── */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}
          >

            {/* VANGUARD SCORE */}
            <div style={{ ...cardFeatured, padding: '18px 14px' }}>
              <p style={cardLabel}>SCORE</p>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ position: 'relative', width: 54, height: 54 }}>
                  <svg width="54" height="54" viewBox="0 0 54 54">
                    <defs>
                      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#c084fc" />
                      </linearGradient>
                    </defs>
                    {/* Track */}
                    <circle
                      cx="27" cy="27" r={RING_R}
                      fill="none"
                      stroke="rgba(168,85,247,0.12)"
                      strokeWidth={RING_SW}
                    />
                    {/* Progress */}
                    <circle
                      cx="27" cy="27" r={RING_R}
                      fill="none"
                      stroke="url(#ringGrad)"
                      strokeWidth={RING_SW}
                      strokeLinecap="round"
                      strokeDasharray={`${RING_CIRC} ${RING_CIRC}`}
                      strokeDashoffset={scoreRingOffset}
                      transform="rotate(-90 27 27)"
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: '#A855F7',
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: 'inherit',
                      }}
                    >
                      {displayScore}
                    </span>
                  </div>
                </div>
              </div>

              <p
                style={{
                  color: '#4ade80',
                  fontSize: 10,
                  textAlign: 'center',
                  letterSpacing: '0.5px',
                  fontFamily: 'inherit',
                }}
              >
                +12 pts this week
              </p>
            </div>

            {/* STREAK */}
            <div style={{ ...cardStandard, padding: '18px 14px' }}>
              <p style={cardLabel}>STREAK</p>

              <span
                style={{
                  color: '#A855F7',
                  fontSize: 36,
                  fontWeight: 700,
                  lineHeight: 1,
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                {displayStreak}
              </span>
              <p
                style={{
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: 10,
                  letterSpacing: '1px',
                  marginBottom: 14,
                  fontFamily: 'inherit',
                }}
              >
                days clean
              </p>

              {/* 5-segment fading bar */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
                {[1, 0.7, 0.45, 0.25, 0.08].map((op, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: `rgba(168,85,247,${op})`,
                    }}
                  />
                ))}
              </div>

              <p
                style={{
                  color: 'rgba(255,255,255,0.25)',
                  fontSize: 9,
                  letterSpacing: '0.8px',
                  fontFamily: 'inherit',
                }}
              >
                {weeksToMilestone} wks to milestone
              </p>
            </div>
          </div>

          {/* ── CONSISTENCY TRACKER ── */}
          <div style={{ ...cardStandard, padding: '18px 16px', marginBottom: 12 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <p style={{ ...cardLabel, margin: 0 }}>CONSISTENCY TRACKER</p>
              <span
                style={{
                  color: 'rgba(168,85,247,0.6)',
                  fontSize: 9,
                  letterSpacing: '1px',
                  fontFamily: 'inherit',
                }}
              >
                7D
              </span>
            </div>

            {/* Bar chart */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'flex-end',
                height: 80,
                marginBottom: 8,
              }}
            >
              {weekDays.map(({ label, score, isToday, isFuture }) => {
                const barH = isFuture ? 5 : Math.max(8, (score / 100) * 72)
                return (
                  <div
                    key={label}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      height: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: barH,
                        borderRadius: '4px 4px 2px 2px',
                        background: isToday
                          ? 'linear-gradient(to top, #c084fc, rgba(192,132,252,0.3))'
                          : !isFuture && score > 0
                            ? 'linear-gradient(to top, #A855F7, rgba(100,30,180,0.3))'
                            : 'linear-gradient(to top, rgba(168,85,247,0.35), rgba(80,20,140,0.15))',
                        boxShadow: isToday
                          ? '0 0 10px rgba(192,132,252,0.5)'
                          : !isFuture && score > 0
                            ? '0 0 4px rgba(168,85,247,0.3)'
                            : 'none',
                      }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Day labels */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {weekDays.map(({ label, isToday }) => (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <span
                    style={{
                      fontSize: 8,
                      letterSpacing: '1px',
                      color: isToday ? '#A855F7' : 'rgba(255,255,255,0.2)',
                      fontWeight: isToday ? 700 : 400,
                      fontFamily: 'inherit',
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* 3 stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                paddingTop: 14,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 7,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    marginBottom: 5,
                    fontFamily: 'inherit',
                  }}
                >
                  7D GAIN
                </p>
                <p
                  style={{
                    color: displayGain >= 0 ? '#4ade80' : '#f87171',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                  }}
                >
                  {displayGain >= 0 ? '+' : ''}
                  {displayGain}%
                </p>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  borderLeft: '1px solid rgba(255,255,255,0.04)',
                  borderRight: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <p
                  style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 7,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    marginBottom: 5,
                    fontFamily: 'inherit',
                  }}
                >
                  TODAY
                </p>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                  }}
                >
                  {displayToday}%
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 7,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    marginBottom: 5,
                    fontFamily: 'inherit',
                  }}
                >
                  LAST WK
                </p>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                  }}
                >
                  {displayLastWk}%
                </p>
              </div>
            </div>
          </div>

          {/* ── GRIND METRICS ── */}
          <div style={{ ...cardFeatured, padding: '18px 16px', marginBottom: 12 }}>
            <p style={cardLabel}>GRIND METRICS</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {metrics.map(({ num, label, pct }) => {
                const { icon, color } = metricStatus(pct)
                return (
                  <div
                    key={num}
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    {/* Numbered circle */}
                    <div
                      style={{
                        width: 36, height: 36,
                        flexShrink: 0,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(88,28,220,0.2))',
                        border: '1px solid rgba(168,85,247,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          color: '#A855F7',
                          fontSize: 9,
                          fontWeight: 700,
                          fontFamily: 'inherit',
                        }}
                      >
                        {num}
                      </span>
                    </div>

                    {/* Label + bar */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: 10,
                          letterSpacing: '0.5px',
                          marginBottom: 7,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontFamily: 'inherit',
                        }}
                      >
                        {label}
                      </p>
                      <div
                        style={{
                          height: 4,
                          borderRadius: 2,
                          background: 'rgba(168,85,247,0.1)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: 2,
                            background: 'linear-gradient(to right, #A855F7, rgba(168,85,247,0.35))',
                          }}
                        />
                      </div>
                    </div>

                    {/* Status icon */}
                    <span
                      style={{
                        color,
                        fontSize: 14,
                        fontWeight: 700,
                        flexShrink: 0,
                        width: 18,
                        textAlign: 'center',
                        fontFamily: 'inherit',
                      }}
                    >
                      {icon}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── SYSTEM ANALYSIS ── */}
          <div style={{ ...cardStandard, padding: '18px 16px', marginBottom: 12 }}>
            <p style={cardLabel}>SYSTEM ANALYSIS</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  background: 'rgba(168,85,247,0.07)',
                  border: '1px solid rgba(168,85,247,0.18)',
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <p
                  style={{
                    color: '#A855F7',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    marginBottom: 7,
                    fontFamily: 'inherit',
                  }}
                >
                  ⚠ TRIGGER WINDOW
                </p>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: 10,
                    lineHeight: 1.65,
                    fontFamily: 'inherit',
                  }}
                >
                  High-risk: 21:00–23:00. Three of your last five failures occurred in this window.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(168,85,247,0.07)',
                  border: '1px solid rgba(168,85,247,0.18)',
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <p
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    marginBottom: 7,
                    fontFamily: 'inherit',
                  }}
                >
                  PATTERN DETECTED
                </p>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: 10,
                    lineHeight: 1.65,
                    fontFamily: 'inherit',
                  }}
                >
                  Repetitive justification language in last 3 logs. Avoidance cycle active.
                </p>
              </div>
            </div>
          </div>

        </main>

        {/* ── BOTTOM NAV ── */}
        <nav
          style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            background: 'rgba(8,0,15,0.97)',
            borderTop: '1px solid rgba(168,85,247,0.1)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '8px 0 calc(8px + env(safe-area-inset-bottom, 0px))',
            zIndex: 100,
          }}
        >
          {NAV_ITEMS.map(({ label, href, active, d }) => (
            <Link
              key={label}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
                opacity: active ? 1 : 0.2,
                padding: '4px 10px',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={active ? '#A855F7' : '#ffffff'}
              >
                <path d={d} />
              </svg>
              <span
                style={{
                  fontSize: 7,
                  letterSpacing: '1.5px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: active ? '#A855F7' : '#ffffff',
                  fontWeight: active ? 700 : 400,
                }}
              >
                {label}
              </span>
            </Link>
          ))}
        </nav>
      </DashboardInterceptor>
    </div>
  )
}

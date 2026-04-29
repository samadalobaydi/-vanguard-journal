import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculateVanguardScore, getStreakData } from '@/lib/vanguard-score'
import DashboardInterceptor from '@/components/DashboardInterceptor'
import DeepWorkSection from '@/components/dashboard/DeepWorkSection'

export const dynamic = 'force-dynamic'

const CARD: React.CSSProperties = {
  borderRadius: 20,
  background: 'linear-gradient(145deg, #2A2A30, #1B1B20)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
  padding: '18px',
  marginBottom: 16,
}

const CARD_TITLE: React.CSSProperties = {
  color: '#A1A1AA',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  marginBottom: 14,
}

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-mono), monospace',
}

const ICONS = {
  commit:  'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  journal: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  reckon:  'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z',
  profile: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
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

  const today = new Date()
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

  const entries = recentEntries ?? []
  const { current: streak, longest: bestStreak } = getStreakData(entries)
  const vanguardScore = calculateVanguardScore(entries, !!profile?.identity_statement?.trim())
  const isCommitted = !!todayEntry
  const isSigned = !!profile?.identity_statement?.trim()
  const rank = getRank(vanguardScore)

  // 14-day trail data
  const entrySet = new Set(entries.map((e) => e.entry_date))
  const trail14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 13 + i)
    const dateStr = d.toISOString().split('T')[0]
    return {
      dateStr,
      isToday: dateStr === todayStr,
      hasEntry: entrySet.has(dateStr),
      isFuture: dateStr > todayStr,
    }
  })
  const loggedCount = trail14.filter((d) => d.hasEntry && !d.isFuture).length
  const totalDays = trail14.filter((d) => !d.isFuture).length
  const consistencyPct = totalDays > 0 ? Math.round((loggedCount / totalDays) * 100) : 0

  // 7-day trend
  const trend7: number[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 6 + i)
    return entrySet.has(d.toISOString().split('T')[0]) ? 100 : 0
  })
  const hasTrendData = trend7.some((v) => v > 0)
  const firstHalfAvg = trend7.slice(0, 3).reduce((a: number, b: number) => a + b, 0) / 3
  const secondHalfAvg = trend7.slice(4).reduce((a: number, b: number) => a + b, 0) / 3
  const isImproving = hasTrendData && secondHalfAvg >= firstHalfAvg

  // Trend SVG path (260×52 viewBox)
  const tW = 260; const tH = 52; const tPadX = 8; const tPadY = 6
  const tPlotW = tW - tPadX * 2; const tPlotH = tH - tPadY * 2
  const trendPts = trend7.map((v, i) => ({
    x: tPadX + (i / 6) * tPlotW,
    y: tPadY + (1 - v / 100) * tPlotH,
  }))
  const trendLine = trendPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const trendArea = `${trendLine} L ${trendPts[6].x.toFixed(1)} ${tH} L ${trendPts[0].x.toFixed(1)} ${tH} Z`

  // Score arc constants
  const scoreR = 62
  const scoreHalfCirc = Math.PI * scoreR
  const scoreProgress = Math.min(vanguardScore, 1000) / 1000
  const scoreOffsetStart = scoreHalfCirc
  const scoreOffsetEnd = scoreHalfCirc * (1 - scoreProgress)

  // Streak ring constants
  const ringR = 78
  const ringCirc = 2 * Math.PI * ringR
  const ringProgress = bestStreak > 0 ? Math.min(streak / bestStreak, 1) : 0
  const ringFull = streak > 0 && streak >= bestStreak
  const ringOffsetEnd = ringCirc * (1 - ringProgress)

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #151518 0%, #0B0B0D 100%)',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @keyframes trailPulse {
          0%, 100% { box-shadow: 0 0 4px rgba(139,92,246,0.4); opacity: 0.7; }
          50%       { box-shadow: 0 0 12px rgba(139,92,246,0.8), 0 0 24px rgba(139,92,246,0.3); opacity: 1; }
        }
        @keyframes scoreArcIn {
          from { stroke-dashoffset: ${scoreOffsetStart.toFixed(2)}; }
          to   { stroke-dashoffset: ${scoreOffsetEnd.toFixed(2)}; }
        }
        @keyframes ringIn {
          from { stroke-dashoffset: ${ringCirc.toFixed(2)}; }
          to   { stroke-dashoffset: ${ringOffsetEnd.toFixed(2)}; }
        }
        @keyframes statusBarIn {
          from { width: 0; }
          to   { width: 100%; }
        }
        .score-arc-fill { animation: scoreArcIn 1s ease-out forwards; }
        .ring-fill      { animation: ringIn 1s ease-out forwards; }
        .status-bar-fill { animation: statusBarIn 0.8s ease forwards; }
      `}</style>

      {/* ── HEADER ── */}
      <header
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
        }}
      >
        <span
          style={{
            color: '#6366F1',
            opacity: 0.7,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Vanguard
        </span>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: isCommitted ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isCommitted ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 20,
            padding: '4px 10px',
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: isCommitted ? '#8B5CF6' : '#71717A' }} />
          <span style={{ color: isCommitted ? '#8B5CF6' : '#A1A1AA', fontSize: 12, fontWeight: 500 }}>
            {isCommitted ? 'Committed' : 'Pending'}
          </span>
        </div>
      </header>

      <DashboardInterceptor isSubscribed={isSubscribed}>
        <main
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '20px 16px 0',
            paddingBottom: 120,
            display: 'flex',
            flexDirection: 'column',
          }}
        >

          {/* ── STREAK HERO ── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 0 28px',
              position: 'relative',
            }}
          >
            {/* Outer soft glow */}
            <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 360, height: 360, background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            {/* Inner glow — pink if streak at best */}
            <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 260, height: 260, background: ringFull ? 'radial-gradient(circle, rgba(217,70,239,0.18) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Ring */}
            <div
              style={{
                position: 'relative',
                width: 180,
                height: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={ringFull ? '#D946EF' : '#6366F1'} />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor={ringFull ? '#8B5CF6' : '#D946EF'} />
                  </linearGradient>
                </defs>
                <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle
                  cx="90" cy="90" r="78" fill="none"
                  stroke="url(#ringGrad)" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${ringCirc.toFixed(2)}`}
                  strokeDashoffset={`${ringCirc.toFixed(2)}`}
                  transform="rotate(-90 90 90)"
                  className="ring-fill"
                  style={ringFull ? { filter: 'drop-shadow(0 0 6px rgba(217,70,239,0.5))' } : undefined}
                />
              </svg>

              {/* Streak number + optional flame */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                <span style={{ color: '#F8FAFC', fontSize: 88, fontWeight: 700, lineHeight: 1, ...MONO }}>
                  {streak}
                </span>
                {streak > 7 && (
                  <svg width="22" height="22" viewBox="0 0 24 24" style={{ marginTop: 10, flexShrink: 0 }}>
                    <path
                      d="M12 2c-2 3-4 5.5-4 8a4 4 0 0 0 8 0c0-1-.3-2-.8-3-.5 1.5-1.2 2.5-2.2 3 .5-2 .5-4-.5-6-.5 1.5-1.5 2.5-2.5 3.5C10 5.5 12 2 12 2z"
                      fill="#D946EF"
                    />
                  </svg>
                )}
              </div>
            </div>

            <p style={{ color: '#A1A1AA', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 14, marginBottom: 4 }}>
              Day Streak
            </p>
            {bestStreak > 0 && (
              <p style={{ color: '#71717A', fontSize: 10, marginBottom: 10, ...MONO }}>
                BEST: {bestStreak}
              </p>
            )}

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 20,
                padding: '4px 12px',
                marginBottom: 10,
              }}
            >
              <span style={{ color: '#8B5CF6', fontSize: 11, fontWeight: 600 }}>
                {isCommitted ? 'Committed' : 'Untested'}
              </span>
            </div>

            <p style={{ color: '#A1A1AA', fontSize: 12 }}>
              Score: <span style={{ ...MONO, color: '#F8FAFC' }}>{vanguardScore}</span> / 1000
            </p>
          </div>

          {/* ── VANGUARD SCORE ARC ── */}
          <div style={CARD}>
            <p style={CARD_TITLE}>Vanguard Score</p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width="140" height="80" viewBox="0 0 140 80" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#D946EF" />
                  </linearGradient>
                </defs>
                {/* Track */}
                <circle
                  cx="70" cy="80" r="62"
                  fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${scoreHalfCirc.toFixed(2)} ${(scoreHalfCirc * 2).toFixed(2)}`}
                  transform="rotate(-180 70 80)"
                />
                {/* Fill */}
                <circle
                  cx="70" cy="80" r="62"
                  fill="none" stroke="url(#scoreGrad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${scoreHalfCirc.toFixed(2)} ${(scoreHalfCirc * 2).toFixed(2)}`}
                  strokeDashoffset={`${scoreOffsetStart.toFixed(2)}`}
                  transform="rotate(-180 70 80)"
                  className="score-arc-fill"
                />
              </svg>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <span style={{ color: '#F8FAFC', fontSize: 28, fontWeight: 700, ...MONO }}>{vanguardScore}</span>
                <span style={{ color: '#71717A', fontSize: 12 }}>/ 1000</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  marginTop: 8,
                  background: 'rgba(139,92,246,0.12)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: 20,
                  padding: '3px 10px',
                }}
              >
                <span style={{ color: '#8B5CF6', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' }}>{rank}</span>
              </div>
            </div>
          </div>

          {/* ── DISCIPLINE TREND + BEST STREAK ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>

            {/* Discipline Trend */}
            <div
              style={{
                borderRadius: 20,
                background: 'linear-gradient(145deg, #2A2A30, #1B1B20)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
                padding: '14px',
              }}
            >
              <p style={{ color: '#F8FAFC', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>7-Day Trend</p>

              {hasTrendData ? (
                <>
                  <svg
                    width="100%" height="52" viewBox={`0 0 ${tW} ${tH}`}
                    preserveAspectRatio="none"
                    style={{ display: 'block' }}
                  >
                    <defs>
                      <linearGradient id="trendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#D946EF" />
                      </linearGradient>
                      <linearGradient id="trendAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(99,102,241,0.18)" />
                        <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                      </linearGradient>
                    </defs>
                    <path d={trendArea} fill="url(#trendAreaGrad)" />
                    <path
                      d={trendLine}
                      fill="none" stroke="url(#trendGrad)"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    />
                    {trendPts.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="3" fill="#8B5CF6" />
                    ))}
                  </svg>
                  <p style={{ color: isImproving ? '#8B5CF6' : '#71717A', fontSize: 11, marginTop: 8 }}>
                    {isImproving ? '↑ Improving' : '→ Hold the line'}
                  </p>
                </>
              ) : (
                <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: '#71717A', fontSize: 11 }}>No data yet</p>
                </div>
              )}
            </div>

            {/* Best Streak */}
            <div
              style={{
                borderRadius: 20,
                background: 'linear-gradient(145deg, #2A2A30, #1B1B20)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <p style={{ color: '#A1A1AA', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Best Streak</p>

              <span style={{ color: '#F8FAFC', fontSize: 32, fontWeight: 700, ...MONO, lineHeight: 1 }}>
                {bestStreak}
              </span>
              <p style={{ color: '#71717A', fontSize: 11, marginTop: 4 }}>days</p>

              {/* Mountain peak icon */}
              <svg width="40" height="24" viewBox="0 0 40 24" style={{ marginTop: 10 }}>
                <path d="M 0 24 L 14 6 L 20 13 L 26 4 L 40 24 Z" fill="#8B5CF6" opacity="0.35" />
                <path d="M 0 24 L 14 6 L 20 13 L 26 4 L 40 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6" />
              </svg>
            </div>
          </div>

          {/* ── QUICK ACTIONS 2×2 ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              marginBottom: 16,
            }}
          >
            {/* Deep Work timer replaces Commit Entry */}
            <DeepWorkSection />

            {[
              { label: 'Journal',    sub: 'Write & reflect', href: '/journal', icon: ICONS.journal },
              { label: '60s Reckon', sub: 'Quick check-in',  href: '/journal', icon: ICONS.reckon  },
              { label: 'Profile',    sub: 'Settings & stats',href: '/profile', icon: ICONS.profile },
            ].map(({ label, sub, href, icon }) => (
              <Link
                key={label}
                href={href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  background: '#1C1C20',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20,
                  padding: '16px',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'rgba(99,102,241,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#6366F1">
                    <path d={icon} />
                  </svg>
                </div>
                <div>
                  <p style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{label}</p>
                  <p style={{ color: '#A1A1AA', fontSize: 11 }}>{sub}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* ── TODAY'S COMMAND ── */}
          <div style={{ ...CARD, borderLeft: '2px solid rgba(139,92,246,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ ...CARD_TITLE, marginBottom: 0 }}>Today&apos;s Command</p>
              {isCommitted && (
                <Link href="/journal" style={{ color: '#6366F1', fontSize: 12, fontWeight: 500, textDecoration: 'none', flexShrink: 0 }}>
                  Edit →
                </Link>
              )}
            </div>

            {/* Status bar */}
            <div
              style={{
                height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)',
                marginBottom: 14, overflow: 'hidden', position: 'relative',
              }}
            >
              {isCommitted && (
                <div
                  className="status-bar-fill"
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                    borderRadius: 4,
                    width: 0,
                  }}
                />
              )}
            </div>

            {isCommitted ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
                <span style={{ color: 'rgba(167,243,208,0.75)', fontSize: 20, flexShrink: 0, lineHeight: 1 }}>✓</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Committed</p>
                  {todayEntry?.morning_intention && (
                    <p style={{ color: '#A1A1AA', fontSize: 13, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {todayEntry.morning_intention.slice(0, 52)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                  No entry yet today. Set your intention and commit to the standard.
                </p>
                <Link
                  href="/journal"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 52,
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                  }}
                >
                  Commit Today
                </Link>
              </>
            )}
          </div>

          {/* ── IDENTITY CONTRACT ── */}
          <div style={{ ...CARD, borderLeft: '2px solid rgba(139,92,246,0.4)' }}>
            {/* Title row with shield */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 6v6c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V6L12 2z"
                    fill={isSigned ? 'rgba(139,92,246,0.2)' : 'transparent'}
                    stroke={isSigned ? '#8B5CF6' : 'rgba(255,255,255,0.2)'}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {isSigned && (
                    <path d="M9 12l2 2 4-4" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
                <span style={{ color: '#A1A1AA', fontSize: 13, fontWeight: 600 }}>Identity Contract</span>
              </div>

              {isSigned ? (
                <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 20, padding: '2px 8px' }}>
                  <span style={{ color: '#8B5CF6', fontSize: 10, fontWeight: 600 }}>Contract Active</span>
                </div>
              ) : (
                <span style={{ color: '#71717A', fontSize: 11 }}>Not Signed</span>
              )}
            </div>

            {isSigned ? (
              <p style={{ color: '#F8FAFC', fontSize: 16, lineHeight: 1.6, fontStyle: 'italic' }}>
                &ldquo;{profile!.identity_statement}&rdquo;
              </p>
            ) : (
              <div>
                <p style={{ color: '#71717A', fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
                  Define who you are committed to being.
                </p>
                <Link
                  href="/profile"
                  style={{ color: '#8B5CF6', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
                >
                  → Sign in Profile
                </Link>
              </div>
            )}
          </div>

          {/* ── 14-DAY CONSISTENCY ── */}
          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ ...CARD_TITLE, marginBottom: 0 }}>14-Day Consistency</p>
              <span style={{ color: '#8B5CF6', fontSize: 16, fontWeight: 700, ...MONO }}>{consistencyPct}%</span>
            </div>

            {/* Bar segments */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', justifyContent: 'center' }}>
              {trail14.map(({ dateStr, isToday, hasEntry, isFuture }) => (
                <div
                  key={dateStr}
                  title={dateStr}
                  style={{
                    flex: 1,
                    height: 20,
                    borderRadius: 3,
                    background: hasEntry
                      ? 'linear-gradient(180deg, #8B5CF6, #6366F1)'
                      : isToday
                      ? 'rgba(139,92,246,0.15)'
                      : 'rgba(255,255,255,0.06)',
                    border: isToday ? '1px solid #8B5CF6' : 'none',
                    boxShadow: hasEntry ? '0 0 6px rgba(139,92,246,0.35)' : 'none',
                    opacity: isFuture ? 0.2 : 1,
                    animation: isToday && !hasEntry ? 'trailPulse 2.5s ease-in-out infinite' : 'none',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>

            <p style={{ color: '#71717A', fontSize: 11, marginTop: 10 }}>
              {loggedCount} of {totalDays} days logged
            </p>
          </div>

        </main>

      </DashboardInterceptor>
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculateVanguardScore, getStreakData } from '@/lib/vanguard-score'
import BottomNav from '@/components/BottomNav'
import DashboardInterceptor from '@/components/DashboardInterceptor'

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

  // 14-day trail
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
            fontFamily: 'system-ui, -apple-system, sans-serif',
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
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isCommitted ? '#8B5CF6' : '#71717A',
            }}
          />
          <span
            style={{
              color: isCommitted ? '#8B5CF6' : '#A1A1AA',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
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
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 360,
                height: 360,
                background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            {/* Inner glow */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 260,
                height: 260,
                background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

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
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#D946EF" />
                  </linearGradient>
                </defs>
                {/* Track */}
                <circle
                  cx="90"
                  cy="90"
                  r="78"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="3"
                />
                {/* Fill arc — progress based on score/1000 */}
                <circle
                  cx="90"
                  cy="90"
                  r="78"
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 78}`}
                  strokeDashoffset={`${2 * Math.PI * 78 * (1 - Math.min(vanguardScore, 1000) / 1000)}`}
                  transform="rotate(-90 90 90)"
                />
              </svg>
              <span
                style={{
                  color: '#F8FAFC',
                  fontSize: 88,
                  fontWeight: 700,
                  lineHeight: 1,
                  ...MONO,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {streak}
              </span>
            </div>

            <p
              style={{
                color: '#A1A1AA',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: 14,
                marginBottom: 10,
              }}
            >
              Day Streak
            </p>

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
              Score:{' '}
              <span style={{ ...MONO, color: '#F8FAFC' }}>{vanguardScore}</span>
              {' '}/ 1000
            </p>
          </div>

          {/* ── STAT CARDS ROW ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
              marginBottom: 16,
            }}
          >
            {[
              { label: 'Vanguard Score', value: vanguardScore },
              { label: 'Streak', value: streak },
              { label: 'Best Streak', value: bestStreak },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: '#25252A',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: '12px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <span style={{ color: '#F8FAFC', fontSize: 22, fontWeight: 700, ...MONO }}>
                  {value}
                </span>
                <span style={{ color: '#A1A1AA', fontSize: 11, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {label}
                </span>
              </div>
            ))}
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
            {[
              {
                label: 'Commit Entry',
                sub: 'Daily command',
                href: '/journal',
                icon: ICONS.commit,
                primary: true,
              },
              {
                label: 'Journal',
                sub: 'Write & reflect',
                href: '/journal',
                icon: ICONS.journal,
                primary: false,
              },
              {
                label: '60s Reckon',
                sub: 'Quick check-in',
                href: '/journal',
                icon: ICONS.reckon,
                primary: false,
              },
              {
                label: 'Profile',
                sub: 'Settings & stats',
                href: '/profile',
                icon: ICONS.profile,
                primary: false,
              },
            ].map(({ label, sub, href, icon, primary }) => (
              <Link
                key={label}
                href={href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  background: '#1C1C20',
                  border: `1px solid ${primary ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 20,
                  padding: '16px',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: primary ? 'rgba(139,92,246,0.12)' : 'rgba(99,102,241,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={primary ? '#8B5CF6' : '#6366F1'}>
                    <path d={icon} />
                  </svg>
                </div>
                <div>
                  <p style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
                    {label}
                  </p>
                  <p style={{ color: '#A1A1AA', fontSize: 11 }}>
                    {sub}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* ── TODAY'S COMMAND ── */}
          <div style={{ ...CARD, borderLeft: '2px solid linear-gradient(180deg, #8B5CF6, transparent)' }}>
            <p style={CARD_TITLE}>Today&apos;s Command</p>

            {isCommitted ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
                  <span
                    style={{
                      color: 'rgba(167,243,208,0.75)',
                      fontSize: 20,
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    ✓
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                      Committed
                    </p>
                    {todayEntry?.morning_intention && (
                      <p
                        style={{
                          color: '#A1A1AA',
                          fontSize: 13,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {todayEntry.morning_intention.slice(0, 48)}
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href="/journal"
                  style={{
                    color: '#6366F1',
                    fontSize: 12,
                    fontWeight: 500,
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  Edit →
                </Link>
              </div>
            ) : (
              <>
                <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                  No entry yet today. Set your intention and commit to the standard.
                </p>
                <Link
                  href="/journal"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 52,
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    borderRadius: 14,
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 700,
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
            <p style={CARD_TITLE}>Identity Contract</p>

            {profile?.identity_statement?.trim() ? (
              <p
                style={{
                  color: '#F8FAFC',
                  fontSize: 16,
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{profile.identity_statement}&rdquo;
              </p>
            ) : (
              <Link
                href="/contract"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 52,
                  background: 'transparent',
                  border: '1px solid #8B5CF6',
                  borderRadius: 14,
                  color: '#8B5CF6',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Sign Contract
              </Link>
            )}
          </div>

          {/* ── 14-DAY TRAIL ── */}
          <div style={CARD}>
            <p style={CARD_TITLE}>14-Day Trail</p>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
              {trail14.map(({ dateStr, isToday, hasEntry, isFuture }) => (
                <div
                  key={dateStr}
                  title={dateStr}
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: '50%',
                    background: hasEntry
                      ? '#8B5CF6'
                      : isToday
                      ? 'transparent'
                      : 'rgba(255,255,255,0.08)',
                    border: isToday ? '1.5px solid #8B5CF6' : 'none',
                    boxShadow: hasEntry ? '0 0 8px rgba(139,92,246,0.4)' : 'none',
                    opacity: isFuture ? 0.2 : 1,
                    animation: isToday ? 'trailPulse 2.5s ease-in-out infinite' : 'none',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>

        </main>

        <BottomNav />
      </DashboardInterceptor>
    </div>
  )
}

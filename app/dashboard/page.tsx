import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculateVanguardScore, getStreakData } from '@/lib/vanguard-score'
import BottomNav from '@/components/BottomNav'
import DashboardInterceptor from '@/components/DashboardInterceptor'

export const dynamic = 'force-dynamic'

const ICONS = {
  commit:  'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  journal: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  reckon:  'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z',
  profile: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
}

const CARD: React.CSSProperties = {
  borderRadius: 20,
  background: '#111014',
  border: '1px solid #2A2233',
  padding: '16px',
  overflow: 'hidden',
}

const CARD_LABEL: React.CSSProperties = {
  color: '#8F7440',
  fontSize: 9,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  fontFamily: 'var(--font-mono), monospace',
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
  const { current: streak } = getStreakData(entries)
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
        background: '#050506',
        minHeight: '100vh',
        fontFamily: 'var(--font-mono), monospace',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @keyframes ringPulse {
          0%, 100% { transform: scale(0.96); opacity: 0.35; filter: drop-shadow(0 0 6px #8F7440); }
          50%       { transform: scale(1.04); opacity: 0.9;  filter: drop-shadow(0 0 22px #8F7440) drop-shadow(0 0 40px rgba(143,116,64,0.35)); }
        }
        @keyframes dotPulse {
          0%, 100% { box-shadow: 0 0 4px rgba(139,92,246,0.5); }
          50%       { box-shadow: 0 0 10px #8B5CF6, 0 0 20px rgba(139,92,246,0.35); }
        }
      `}</style>

      {/* Grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          opacity: 0.03,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── HEADER ── */}
      <header
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 16px 12px',
        }}
      >
        <span
          style={{
            color: '#8F7440',
            opacity: 0.6,
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          VANGUARD
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: isCommitted ? '#4ADE80' : '#8D8794',
              boxShadow: isCommitted ? '0 0 5px rgba(74,222,128,0.6)' : 'none',
            }}
          />
          <span
            style={{
              color: isCommitted ? '#C9A45C' : '#8D8794',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {isCommitted ? 'COMMITTED' : 'PENDING'}
          </span>
        </div>
      </header>

      <DashboardInterceptor isSubscribed={isSubscribed}>
        <main
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '0 16px',
            paddingBottom: 96,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >

          {/* ── STREAK HERO ── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '32px 0 28px',
            }}
          >
            {/* Ring + number */}
            <div
              style={{
                position: 'relative',
                width: 200,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                style={{
                  position: 'absolute',
                  inset: 0,
                  animation: 'ringPulse 3s ease-in-out infinite',
                }}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke="#C9A45C"
                  strokeWidth="1.5"
                />
              </svg>
              <span
                style={{
                  color: '#F5F2EA',
                  fontSize: 96,
                  fontWeight: 700,
                  lineHeight: 1,
                  fontFamily: 'var(--font-mono), monospace',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {streak}
              </span>
            </div>

            <p
              style={{
                color: '#8D8794',
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginTop: 12,
                marginBottom: 8,
              }}
            >
              DAYS UNDER COMMAND
            </p>
            <p
              style={{
                color: isCommitted ? '#4ADE80' : '#C9A45C',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              {isCommitted ? 'COMMITTED' : 'UNTESTED'}
            </p>
            <p
              style={{
                color: '#8D8794',
                fontSize: 11,
                letterSpacing: '0.05em',
              }}
            >
              SCORE: {vanguardScore} / 1000
            </p>
          </div>

          {/* ── QUICK ACTION ROW ── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'flex-start',
              padding: '0 4px',
            }}
          >
            {[
              { label: 'COMMIT',  href: '/journal',  icon: ICONS.commit  },
              { label: 'JOURNAL', href: '/journal',  icon: ICONS.journal },
              { label: 'RECKON',  href: '/journal',  icon: ICONS.reckon  },
              { label: 'PROFILE', href: '/profile',  icon: ICONS.profile },
            ].map(({ label, href, icon }) => (
              <Link
                key={label}
                href={href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  minWidth: 56,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#16121B',
                    border: '1px solid #2A2233',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#8D8794">
                    <path d={icon} />
                  </svg>
                </div>
                <span
                  style={{
                    color: '#8D8794',
                    fontSize: 8,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono), monospace',
                  }}
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>

          {/* ── TODAY'S COMMAND ── */}
          <div style={CARD}>
            <p style={CARD_LABEL}>TODAY&apos;S COMMAND</p>

            {isCommitted ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={{ color: '#4ADE80', fontSize: 16, flexShrink: 0 }}>✓</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: '#4ADE80', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 3 }}>
                      COMMITTED
                    </p>
                    {todayEntry?.morning_intention && (
                      <p
                        style={{
                          color: '#8D8794',
                          fontSize: 11,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          fontFamily: 'var(--font-mono), monospace',
                        }}
                      >
                        {todayEntry.morning_intention.slice(0, 40)}
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href="/journal"
                  style={{
                    color: '#8F7440',
                    fontSize: 10,
                    letterSpacing: '0.05em',
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  Edit →
                </Link>
              </div>
            ) : (
              <Link
                href="/journal"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 52,
                  background: '#C9A45C',
                  borderRadius: 12,
                  color: '#050506',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                [ COMMIT TODAY ]
              </Link>
            )}
          </div>

          {/* ── IDENTITY CONTRACT ── */}
          <div style={CARD}>
            <p style={CARD_LABEL}>IDENTITY CONTRACT</p>

            {profile?.identity_statement?.trim() ? (
              <p
                style={{
                  color: '#F5F2EA',
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  fontFamily: 'var(--font-mono), monospace',
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
                  border: '1px solid #C9A45C',
                  borderRadius: 12,
                  color: '#C9A45C',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                [ SIGN CONTRACT ]
              </Link>
            )}
          </div>

          {/* ── 14-DAY STREAK TRAIL ── */}
          <div style={CARD}>
            <p
              style={{
                color: '#8D8794',
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono), monospace',
                marginBottom: 12,
              }}
            >
              14-DAY TRAIL
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {trail14.map(({ dateStr, isToday, hasEntry, isFuture }) => (
                <div
                  key={dateStr}
                  title={dateStr}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: hasEntry ? '#8B5CF6' : isToday ? 'transparent' : '#2A2233',
                    border: isToday ? '1px solid #8B5CF6' : 'none',
                    boxShadow: hasEntry ? '0 0 6px rgba(139,92,246,0.6)' : 'none',
                    opacity: isFuture ? 0.2 : 1,
                    animation: isToday ? 'dotPulse 3s ease-in-out infinite' : 'none',
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

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  calculateVanguardScore,
  getStreakData,
} from '@/lib/vanguard-score'
import ScoreGauge from '@/components/dashboard/ScoreGauge'
import IdentityCard from '@/components/dashboard/IdentityCard'
import DayGrid from '@/components/dashboard/DayGrid'
import BottomNav from '@/components/BottomNav'
import DashboardInterceptor from '@/components/DashboardInterceptor'

export const dynamic = 'force-dynamic'

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
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

  // Greeting
  const hour = today.getUTCHours()
  const greeting =
    hour < 12 ? 'Good Morning' :
    hour < 18 ? 'Good Afternoon' : 'Good Evening'

  // Recent activity — last 3 entries
  const recent = entries.slice(0, 3)

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
              marginBottom: 3,
            }}
          >
            {greeting}, Operator
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: '0.5px' }}>
            {formatDate(today)}
          </p>
        </div>

        {/* Status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isCommitted ? '#4ade80' : '#fbbf24',
              boxShadow: isCommitted
                ? '0 0 6px rgba(74,222,128,0.6)'
                : '0 0 6px rgba(251,191,36,0.6)',
            }}
          />
          <span
            style={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: 9,
              letterSpacing: '1.5px',
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
            padding: '12px 16px',
            paddingBottom: 96,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* 1. Vanguard Score */}
          <ScoreGauge score={vanguardScore} streak={streak} />

          {/* 2. Identity Contract */}
          <IdentityCard statement={profile?.identity_statement ?? null} />

          {/* 3. Today's Action */}
          <div
            style={{
              background: 'linear-gradient(145deg, #120028, #080015)',
              border: '1px solid rgba(168,85,247,0.15)',
              borderRadius: 16,
              padding: '16px',
              overflow: 'hidden',
            }}
          >
            <p
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: 9,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              Today&apos;s Action
            </p>

            {isCommitted ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'rgba(74,222,128,0.1)',
                      border: '1px solid rgba(74,222,128,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: '#4ade80', fontSize: 14 }}>✓</span>
                  </div>
                  <div>
                    <p style={{ color: '#4ade80', fontSize: 11, fontWeight: 700, letterSpacing: '1px' }}>
                      COMMITTED
                    </p>
                    {todayEntry?.morning_intention && (
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.3)',
                          fontSize: 10,
                          marginTop: 2,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          maxWidth: 180,
                        }}
                      >
                        {todayEntry.morning_intention}
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href="/journal"
                  style={{
                    color: 'rgba(168,85,247,0.6)',
                    fontSize: 10,
                    letterSpacing: '1px',
                    textDecoration: 'none',
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
                  minHeight: 56,
                  background: 'rgba(168,85,247,0.12)',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: 12,
                  color: '#A855F7',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                [ WRITE TODAY&apos;S ENTRY ]
              </Link>
            )}
          </div>

          {/* 4. 30-Day Calendar */}
          <DayGrid entryDates={entries.map((e) => e.entry_date)} />

          {/* 5. Recent Activity */}
          {recent.length > 0 && (
            <div
              style={{
                background: 'linear-gradient(145deg, #120028, #080015)',
                border: '1px solid rgba(168,85,247,0.15)',
                borderRadius: 16,
                padding: '16px',
                overflow: 'hidden',
              }}
            >
              <p
                style={{
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: 9,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}
              >
                Recent Activity
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {recent.map((entry, i) => {
                  const d = new Date(entry.entry_date + 'T00:00:00')
                  const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                  const filledCount = [
                    entry.morning_intention,
                    entry.evening_review,
                    entry.tomorrow_target,
                  ].filter((v) => v?.trim()).length
                  const pct = Math.round((filledCount / 3) * 100)
                  const isLast = i === recent.length - 1

                  return (
                    <div
                      key={entry.entry_date}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: i === 0 ? 0 : 12,
                        paddingBottom: isLast ? 0 : 12,
                        borderBottom: isLast ? 'none' : '1px solid rgba(168,85,247,0.07)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <span
                          style={{
                            color: 'rgba(255,255,255,0.35)',
                            fontSize: 10,
                            letterSpacing: '1px',
                            flexShrink: 0,
                          }}
                        >
                          {label}
                        </span>
                        <p
                          style={{
                            color: 'rgba(255,255,255,0.55)',
                            fontSize: 11,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            margin: 0,
                          }}
                        >
                          {entry.morning_intention?.trim()
                            ? entry.morning_intention.slice(0, 50)
                            : '—'}
                        </p>
                      </div>
                      <span
                        style={{
                          color: pct === 100 ? '#4ade80' : pct >= 66 ? '#A855F7' : 'rgba(255,255,255,0.3)',
                          fontSize: 10,
                          fontWeight: 700,
                          flexShrink: 0,
                          marginLeft: 8,
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>

        <BottomNav />
      </DashboardInterceptor>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateStreak, calculateScore } from '@/lib/streak'
import DashboardNav from '@/components/DashboardNav'
import StreakDisplay from '@/components/StreakDisplay'
import JournalForm from '@/components/JournalForm'
import EntryHistory from '@/components/EntryHistory'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Subscription check
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.subscription_status !== 'active') {
    redirect('/subscribe')
  }

  // Fetch today's entry
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: todayEntry } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', todayStr)
    .single()

  // Fetch recent entries (last 30 days) for history + streak
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().split('T')[0]
  const { data: recentEntries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('entry_date', thirtyDaysAgo)
    .order('entry_date', { ascending: false })

  const entries = recentEntries ?? []
  const allDates = entries.map((e) => e.entry_date)
  const { current, longest } = calculateStreak(allDates)
  const todayScore = todayEntry ? calculateScore(todayEntry) : 0

  // Format date display
  const now = new Date()
  const dateDisplay = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-base">
      <DashboardNav email={user.email ?? ''} streak={current} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">{dateDisplay}</p>
            <h1 className="font-bebas text-4xl sm:text-5xl tracking-wider text-white leading-none">
              Daily <span className="text-gold">Reckoning</span>
            </h1>
          </div>
          <div className="text-xs text-gray-600 tracking-wider uppercase">
            {todayScore === 100
              ? '⚡ Standard held. Full score.'
              : todayScore > 0
              ? `${3 - [todayEntry?.morning_intention, todayEntry?.evening_review, todayEntry?.tomorrow_target].filter((v) => v?.trim()).length} fields remaining`
              : 'No entry yet today. Begin.'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Journal + stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats row */}
            <StreakDisplay
              current={current}
              longest={longest}
              score={todayScore}
              date={todayStr}
            />

            {/* Journal form */}
            <div>
              <div className="border-b border-white/[0.06] mb-5 pb-3 flex items-center gap-3">
                <h2 className="font-bebas text-2xl tracking-wider text-white">
                  Today&apos;s Entry
                </h2>
                <span className="text-xs tracking-widest uppercase text-gray-600">
                  {todayStr}
                </span>
              </div>
              <JournalForm
                date={todayStr}
                initialEntry={todayEntry ?? null}
              />
            </div>
          </div>

          {/* Right: History */}
          <div className="space-y-6">
            {/* Discipline score ring */}
            <div className="border border-white/[0.06] bg-dark p-6 text-center">
              <p className="text-xs tracking-widest uppercase text-gray-600 mb-3">
                Current Month
              </p>
              <div className="font-bebas text-7xl tracking-wider text-gold leading-none">
                {entries.length > 0
                  ? Math.round(
                      entries.reduce((sum, e) => sum + calculateScore(e), 0) / entries.length
                    )
                  : 0}
              </div>
              <p className="text-xs tracking-widest uppercase text-gray-600 mt-2">
                Avg. Discipline Score
              </p>
              <div className="mt-4 pt-4 border-t border-white/[0.05]">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Entries</span>
                  <span className="text-gray-400">{entries.length} / 30</span>
                </div>
                <div className="mt-2 h-1 bg-dark-3">
                  <div
                    className="h-full bg-gold transition-all"
                    style={{ width: `${(entries.length / 30) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Entry history */}
            <div className="border border-white/[0.06] bg-dark p-5">
              <EntryHistory entries={entries} />
            </div>

            {/* Motivational callout */}
            <div
              className="border border-gold/15 p-5"
              style={{ background: 'rgba(201,168,76,0.03)' }}
            >
              <p className="text-xs tracking-widest uppercase text-gold/60 mb-2">
                Vanguard Principle
              </p>
              <blockquote className="text-sm text-gray-400 leading-relaxed italic">
                &ldquo;You don&apos;t rise to the level of your goals. You fall to the level of your
                systems.&rdquo;
              </blockquote>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

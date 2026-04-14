import { calculateScore } from '@/lib/streak'

interface Entry {
  entry_date: string
  morning_intention?: string | null
  evening_review?: string | null
  tomorrow_target?: string | null
}

interface Props {
  entries: Entry[]
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function EntryHistory({ entries }: Props) {
  // Build a set of dates that have entries for quick lookup
  const entryMap = new Map(entries.map((e) => [e.entry_date, e]))

  // Generate the last 14 days
  const days: { date: string; label: string; entry: Entry | undefined }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    const dateStr = d.toISOString().split('T')[0]
    const label = DAY_LABELS[d.getDay()]
    days.push({ date: dateStr, label, entry: entryMap.get(dateStr) })
  }

  return (
    <div>
      <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-3">
        Last 14 Days
      </h3>

      <div className="grid grid-cols-7 gap-1 sm:grid-cols-14 sm:gap-1.5">
        {days.map(({ date, label, entry }) => {
          const score = entry ? calculateScore(entry) : null
          const isToday = date === new Date().toISOString().split('T')[0]

          let bgClass = 'bg-dark-2 border-white/[0.04]'
          if (score === 100) bgClass = 'bg-gold/20 border-gold/30'
          else if (score && score >= 33) bgClass = 'bg-gold/8 border-gold/15'

          return (
            <div
              key={date}
              title={`${date}${score !== null ? ` — Score: ${score}` : ' — No entry'}`}
              className={`border ${bgClass} flex flex-col items-center justify-center py-2 ${
                isToday ? 'ring-1 ring-gold/40' : ''
              }`}
            >
              <span className="text-[10px] text-gray-600 tracking-wider">{label}</span>
              {score !== null ? (
                <span
                  className={`text-xs font-bold mt-0.5 ${
                    score === 100 ? 'text-gold' : score >= 33 ? 'text-gold/50' : 'text-gray-700'
                  }`}
                >
                  {score}
                </span>
              ) : (
                <span className="text-xs text-gray-800 mt-0.5">—</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Recent entries list */}
      {entries.length > 0 && (
        <div className="mt-6 space-y-2">
          {entries.slice(0, 5).map((e) => {
            const score = calculateScore(e)
            const d = new Date(e.entry_date + 'T00:00:00')
            const formatted = d.toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })
            return (
              <div
                key={e.entry_date}
                className="flex items-center justify-between border border-white/[0.05] bg-dark px-4 py-3"
              >
                <div>
                  <span className="text-xs font-medium text-gray-400 tracking-wider">
                    {formatted}
                  </span>
                  {e.morning_intention && (
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1 max-w-xs">
                      {e.morning_intention}
                    </p>
                  )}
                </div>
                <span
                  className={`font-bebas text-xl tracking-wider ${
                    score === 100
                      ? 'text-gold'
                      : score >= 66
                      ? 'text-yellow-600'
                      : 'text-gray-700'
                  }`}
                >
                  {score}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

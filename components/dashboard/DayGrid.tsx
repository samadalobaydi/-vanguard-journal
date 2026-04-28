interface Props {
  entryDates: string[]
}

const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function DayGrid({ entryDates }: Props) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const year = today.getFullYear()
  const month = today.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // ISO day of week for the 1st: Mon=0 … Sun=6
  const firstDow = new Date(year, month, 1).getDay()
  const startOffset = firstDow === 0 ? 6 : firstDow - 1

  const entrySet = new Set(entryDates)

  // Build cell array: leading nulls + day numbers
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function pad(n: number) {
    return String(n).padStart(2, '0')
  }

  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #1e1e1e',
        borderRadius: 16,
        padding: '20px 20px 18px',
      }}
    >
      <p
        style={{
          color: '#555555',
          letterSpacing: '3px',
          fontSize: 10,
          textTransform: 'uppercase',
          marginBottom: 16,
          fontFamily: 'var(--font-mono), monospace',
        }}
      >
        {today.toLocaleString('default', { month: 'long' })} {year}
      </p>

      {/* Day-of-week headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
          marginBottom: 6,
        }}
      >
        {DOW_LABELS.map((l, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.2)',
              fontSize: 9,
              fontFamily: 'var(--font-mono), monospace',
              letterSpacing: '1px',
              paddingBottom: 2,
            }}
          >
            {l}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
        }}
      >
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />
          }

          const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
          const isToday = dateStr === todayStr
          const hasEntry = entrySet.has(dateStr)
          const isFuture = dateStr > todayStr

          let color: string
          if (isToday) color = '#A855F7'
          else if (isFuture) color = 'rgba(255,255,255,0.1)'
          else if (hasEntry) color = 'rgba(255,255,255,0.9)'
          else color = 'rgba(255,255,255,0.2)'

          return (
            <div
              key={dateStr}
              title={dateStr}
              style={{
                aspectRatio: '1',
                borderRadius: 6,
                background: hasEntry && !isToday ? 'rgba(168,85,247,0.18)' : 'transparent',
                border: isToday ? '1px solid #A855F7' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: 10,
                  color,
                  lineHeight: 1,
                  fontWeight: isToday || hasEntry ? 600 : 400,
                }}
              >
                {day}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

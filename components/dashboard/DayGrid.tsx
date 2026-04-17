interface DayItem {
  date: string
  hasEntry: boolean
  isToday: boolean
}

interface Props {
  days: DayItem[]
}

export default function DayGrid({ days }: Props) {
  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #1e1e1e',
        borderRadius: 16,
        padding: '24px',
      }}
    >
      <p
        style={{
          color: '#555555',
          letterSpacing: '3px',
          fontSize: 10,
          textTransform: 'uppercase',
          marginBottom: 20,
        }}
      >
        14-Day Grid
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 8,
        }}
      >
        {days.map((day) => (
          <div
            key={day.date}
            title={day.date}
            style={{
              aspectRatio: '1',
              borderRadius: 8,
              background: day.hasEntry ? '#A855F7' : '#0A0A0A',
              border: day.isToday
                ? '2px solid #A855F7'
                : day.hasEntry
                ? '2px solid #A855F7'
                : '1px solid #1e1e1e',
              boxShadow: day.isToday ? '0 0 10px rgba(168,85,247,0.3)' : 'none',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: '#A855F7',
            }}
          />
          <span
            style={{
              color: '#555555',
              fontSize: 9,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Entry
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: '#0A0A0A',
              border: '1px solid #1e1e1e',
            }}
          />
          <span
            style={{
              color: '#555555',
              fontSize: 9,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Missed
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: 'transparent',
              border: '2px solid #A855F7',
            }}
          />
          <span
            style={{
              color: '#555555',
              fontSize: 9,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Today
          </span>
        </div>
      </div>
    </div>
  )
}

interface Props {
  current: number
  longest: number
}

export default function StreakCard({ current, longest }: Props) {
  const progress = longest > 0 ? Math.min((current / longest) * 100, 100) : 0

  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #1e1e1e',
        borderRadius: 16,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
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
        Active Streak
      </p>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span
            style={{
              color: '#A855F7',
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1,
              display: 'block',
            }}
          >
            {current}
          </span>
          <span
            style={{
              color: '#A9A9A9',
              letterSpacing: '3px',
              fontSize: 10,
              textTransform: 'uppercase',
              display: 'block',
              marginTop: 8,
            }}
          >
            {current === 1 ? 'Day' : 'Days'}
          </span>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                color: '#555555',
                fontSize: 10,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Best
            </span>
            <span style={{ color: '#A9A9A9', fontSize: 12 }}>{longest} days</span>
          </div>
          <div style={{ background: '#1e1e1e', borderRadius: 2, height: 3 }}>
            <div
              style={{
                width: `${progress}%`,
                background: '#A855F7',
                borderRadius: 2,
                height: 3,
                transition: 'width 1s ease',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

interface DataPoint {
  date: string
  score: number
}

interface Props {
  data: DataPoint[]
  todayScore: number
}

const W = 560
const H = 100
const PAD_X = 8
const PAD_Y = 12

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
}

export default function Sparkline({ data, todayScore }: Props) {
  const innerW = W - PAD_X * 2
  const innerH = H - PAD_Y * 2

  const points = data.map((d, i) => ({
    x: PAD_X + (i / (data.length - 1)) * innerW,
    y: PAD_Y + innerH - (d.score / 100) * innerH,
    score: d.score,
    date: d.date,
  }))

  // This week = last 7 entries (data[7..13]), last week = data[0..6]
  const thisWeekScores = data.slice(7)
  const lastWeekScores = data.slice(0, 7)
  const thisWeekAvg = thisWeekScores.reduce((s, d) => s + d.score, 0) / 7
  const lastWeekAvg = lastWeekScores.reduce((s, d) => s + d.score, 0) / 7
  const gain = thisWeekAvg - lastWeekAvg

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
        14-Day Discipline Track
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', overflow: 'visible', display: 'block' }}
      >
        {/* Grid lines at 0, 33, 66, 100 */}
        {[0, 33, 66, 100].map((v) => {
          const y = PAD_Y + innerH - (v / 100) * innerH
          return (
            <line
              key={v}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={y}
              y2={y}
              stroke="#1e1e1e"
              strokeWidth="1"
            />
          )
        })}

        {/* Area fill */}
        <path
          d={`${buildPath(points)} L ${points[points.length - 1].x.toFixed(1)} ${(PAD_Y + innerH).toFixed(1)} L ${PAD_X.toFixed(1)} ${(PAD_Y + innerH).toFixed(1)} Z`}
          fill="rgba(168,85,247,0.07)"
        />

        {/* Line */}
        <path
          d={buildPath(points)}
          fill="none"
          stroke="#A855F7"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {points.map((p, i) => {
          const isToday = i === points.length - 1
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={isToday ? 5 : 2.5}
              fill={isToday ? '#A855F7' : '#111111'}
              stroke="#A855F7"
              strokeWidth={isToday ? 0 : 1.5}
            />
          )
        })}
      </svg>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginTop: 20,
          paddingTop: 20,
          borderTop: '1px solid #1e1e1e',
        }}
      >
        <div>
          <p
            style={{
              color: '#555555',
              letterSpacing: '2px',
              fontSize: 9,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            7D Gain
          </p>
          <p
            style={{
              color: gain >= 0 ? '#A855F7' : '#ef4444',
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {gain >= 0 ? '+' : ''}
            {Math.round(gain)}
          </p>
        </div>
        <div>
          <p
            style={{
              color: '#555555',
              letterSpacing: '2px',
              fontSize: 9,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Today
          </p>
          <p style={{ color: '#ffffff', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
            {todayScore}
          </p>
        </div>
        <div>
          <p
            style={{
              color: '#555555',
              letterSpacing: '2px',
              fontSize: 9,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Last Wk Avg
          </p>
          <p style={{ color: '#A9A9A9', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
            {Math.round(lastWeekAvg)}
          </p>
        </div>
      </div>
    </div>
  )
}

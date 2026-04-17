interface Props {
  current: number
  longest: number
  score: number
  date: string
}

export default function StreakDisplay({ current, longest, score, date }: Props) {
  const scoreColor =
    score === 100 ? 'text-gold' : score >= 66 ? 'text-yellow-500' : score >= 33 ? 'text-orange-500' : 'text-gray-600'

  const scoreLabel =
    score === 100 ? 'Forged' : score >= 66 ? 'Strong' : score >= 33 ? 'Building' : 'Untested'

  return (
    <div className="grid grid-cols-3 gap-px bg-white/[0.04] border border-white/[0.06]">
      {/* Current streak */}
      <div className="bg-dark p-5 text-center">
        <div className="flex justify-center mb-1">
          <svg width="22" height="28" viewBox="0 0 13 17" fill="none">
            <path d="M6.5 0C5.1 2.3 2 5.8 2 9.5C2 12.54 4.02 15 6.5 15C8.98 15 11 12.54 11 9.5C11 5.8 7.9 2.3 6.5 0ZM6.5 12.5C5.4 12.5 4.5 11.6 4.5 10.5C4.5 8.8 6.5 6.8 6.5 6.8C6.5 6.8 8.5 8.8 8.5 10.5C8.5 11.6 7.6 12.5 6.5 12.5Z" fill="#A855F7" />
          </svg>
        </div>
        <div className="font-bebas text-4xl text-gold tracking-wider leading-none">{current}</div>
        <div className="text-xs tracking-widest uppercase text-gray-500 mt-1">Day Streak</div>
      </div>

      {/* Discipline score */}
      <div className="bg-dark p-5 text-center">
        <div className={`font-bebas text-5xl tracking-wider leading-none ${scoreColor}`}>
          {score}
        </div>
        <div className="text-xs tracking-widest uppercase text-gray-500 mt-1">Score</div>
        <div className={`text-xs font-medium tracking-widest uppercase mt-1 ${scoreColor}`}>
          {scoreLabel}
        </div>
      </div>

      {/* Longest streak */}
      <div className="bg-dark p-5 text-center">
        <div className="font-bebas text-5xl text-gray-600 tracking-wider leading-none">
          {longest}
        </div>
        <div className="text-xs tracking-widest uppercase text-gray-500 mt-1">Best Streak</div>
        <div className="text-xs text-gray-700 tracking-wider uppercase mt-1">All Time</div>
      </div>
    </div>
  )
}

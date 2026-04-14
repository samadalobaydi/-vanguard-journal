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
        <div className="text-4xl mb-0.5">🔥</div>
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

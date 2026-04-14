export function calculateStreak(dates: string[]): {
  current: number
  longest: number
} {
  if (!dates.length) return { current: 0, longest: 0 }

  // Deduplicate and sort descending
  const sorted = [...new Set(dates)].sort().reverse()

  const todayStr = new Date().toISOString().split('T')[0]
  const yesterdayStr = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

  // If the most recent entry isn't today or yesterday, streak is broken
  const streakActive = sorted[0] === todayStr || sorted[0] === yesterdayStr

  let current = streakActive ? 1 : 0
  let longest = 1

  if (streakActive) {
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1])
      const curr = new Date(sorted[i])
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86_400_000)
      if (diffDays === 1) {
        current++
        longest = Math.max(longest, current)
      } else {
        break
      }
    }
  }

  // Also compute longest streak across all data
  let tempStreak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86_400_000)
    if (diffDays === 1) {
      tempStreak++
      longest = Math.max(longest, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  return { current, longest: Math.max(longest, current) }
}

export function calculateScore(fields: {
  morning_intention?: string | null
  evening_review?: string | null
  tomorrow_target?: string | null
}): number {
  const values = [fields.morning_intention, fields.evening_review, fields.tomorrow_target]
  const filled = values.filter((v) => v && v.trim().length > 0).length
  return Math.round((filled / 3) * 100)
}

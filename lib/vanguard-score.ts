export interface JournalEntry {
  entry_date: string
  morning_intention?: string | null
  evening_review?: string | null
  tomorrow_target?: string | null
}

export function getDisciplineScore(entry: JournalEntry): number {
  const fields = [entry.morning_intention, entry.evening_review, entry.tomorrow_target]
  const filled = fields.filter((v) => v && v.trim().length > 0).length
  return Math.round((filled / 3) * 100)
}

export function getStreakData(entries: JournalEntry[]): { current: number; longest: number } {
  if (!entries.length) return { current: 0, longest: 0 }

  const sorted = Array.from(new Set(entries.map((e) => e.entry_date)))
    .sort()
    .reverse()

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

  const streakActive = sorted[0] === today || sorted[0] === yesterday

  let current = streakActive ? 1 : 0
  let longest = 1

  if (streakActive) {
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1])
      const curr = new Date(sorted[i])
      const diff = Math.round((prev.getTime() - curr.getTime()) / 86_400_000)
      if (diff === 1) {
        current++
        longest = Math.max(longest, current)
      } else {
        break
      }
    }
  }

  // Compute longest streak across all history
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86_400_000)
    if (diff === 1) {
      run++
      longest = Math.max(longest, run)
    } else {
      run = 1
    }
  }

  return { current, longest: Math.max(longest, current) }
}

export function calculateVanguardScore(entries: JournalEntry[]): number {
  const { current } = getStreakData(entries)
  const total_entries = entries.length

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const entryDates = new Set(entries.map((e) => e.entry_date))

  // Count missed days in last 30
  let missedDays = 0
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (!entryDates.has(d.toISOString().split('T')[0])) missedDays++
  }

  // Decay penalty for recent absence (2+ days since last entry)
  const sortedDates = Array.from(entryDates).sort().reverse()
  let decayPenalty = 0
  if (sortedDates.length > 0) {
    const last = new Date(sortedDates[0])
    last.setHours(0, 0, 0, 0)
    const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000)
    if (diffDays >= 2) {
      decayPenalty = (diffDays - 1) * 25
    }
  }

  const raw = 500 + current * 15 + total_entries * 8 - missedDays * 12 - decayPenalty
  return Math.min(1000, Math.max(0, raw))
}

export function getReEntryRequired(entries: JournalEntry[]): boolean {
  if (!entries.length) return false
  const sorted = entries.map((e) => e.entry_date).sort().reverse()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
  return sorted[0] !== today && sorted[0] !== yesterday
}

export function getDayGrid(entries: JournalEntry[]): Array<{
  date: string
  hasEntry: boolean
  isToday: boolean
}> {
  const today = new Date()
  const entryDates = new Set(entries.map((e) => e.entry_date))
  const result = []

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    result.push({ date: dateStr, hasEntry: entryDates.has(dateStr), isToday: i === 0 })
  }

  return result
}

export function getSparklineData(entries: JournalEntry[]): Array<{
  date: string
  score: number
}> {
  const today = new Date()
  const entryMap = new Map(entries.map((e) => [e.entry_date, e]))
  const result = []

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const entry = entryMap.get(dateStr)
    result.push({ date: dateStr, score: entry ? getDisciplineScore(entry) : 0 })
  }

  return result
}

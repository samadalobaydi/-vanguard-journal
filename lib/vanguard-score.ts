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

export function calculateVanguardScore(
  entries: JournalEntry[],
  hasIdentityStatement: boolean,
): number {
  const base = hasIdentityStatement ? 100 : 0
  const floor = hasIdentityStatement ? 100 : 0

  const entryDates = new Set(entries.map((e) => e.entry_date))

  // Count missed days from first entry date up to yesterday
  let missedDays = 0
  if (entries.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sortedAsc = Array.from(entryDates).sort()
    const firstDate = new Date(sortedAsc[0])
    firstDate.setHours(0, 0, 0, 0)

    const daysSinceFirst = Math.round((today.getTime() - firstDate.getTime()) / 86_400_000)
    for (let i = 1; i <= daysSinceFirst; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      if (!entryDates.has(d.toISOString().split('T')[0])) missedDays++
    }
  }

  const raw = base + entries.length * 5 - missedDays * 10
  return Math.min(1000, Math.max(floor, raw))
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

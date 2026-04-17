'use client'

import { useState } from 'react'

interface Entry {
  id?: string
  morning_intention?: string | null
  evening_review?: string | null
  tomorrow_target?: string | null
}

interface Props {
  date: string
  initialEntry: Entry | null
  onSave?: (entry: Entry) => void
}

const FIELDS = [
  {
    key: 'morning_intention' as const,
    label: 'Morning Intention',
    icon: '◆',
    placeholder:
      'What is your single most important commitment today? Who do you choose to be in the next 24 hours?',
    prompt: 'Set your standard for the day.',
  },
  {
    key: 'evening_review' as const,
    label: 'Evening Review',
    icon: '◈',
    placeholder:
      'Did you honour your intention? Where did you hold the line — and where did you compromise?',
    prompt: 'Brutal honesty builds men.',
  },
  {
    key: 'tomorrow_target' as const,
    label: "Tomorrow's Target",
    icon: '◇',
    placeholder:
      'What three things will move the needle tomorrow? No more than three. Commit to them now.',
    prompt: 'Plan with precision.',
  },
]

export default function JournalForm({ date, initialEntry, onSave }: Props) {
  const [fields, setFields] = useState<Entry>({
    morning_intention: initialEntry?.morning_intention ?? '',
    evening_review: initialEntry?.evening_review ?? '',
    tomorrow_target: initialEntry?.tomorrow_target ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setField(key: keyof Entry, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, ...fields }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save entry.')
      }

      const data = await res.json()
      setSaved(true)
      onSave?.(data.entry)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const wordCount = (v?: string | null) =>
    v ? v.trim().split(/\s+/).filter(Boolean).length : 0

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {FIELDS.map((field) => {
        const value = (fields[field.key] as string) ?? ''
        const isFilled = value.trim().length > 0

        return (
          <div
            key={field.key}
            className={`border transition-colors ${
              isFilled ? 'border-gold/25 bg-gold-muted' : 'border-white/[0.06] bg-dark'
            }`}
          >
            {/* Field header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <span className="text-gold text-sm">{field.icon}</span>
                <span className="text-xs font-semibold tracking-widest uppercase text-gray-300">
                  {field.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {isFilled && (
                  <span className="text-xs text-gold/60 tracking-wider">
                    {wordCount(value)}w
                  </span>
                )}
                <span className="text-xs text-gray-700 italic hidden sm:block">{field.prompt}</span>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={value}
              onChange={(e) => setField(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className="w-full bg-transparent px-5 py-4 text-sm text-gray-200 placeholder-gray-700 focus:outline-none leading-relaxed resize-none"
            />
          </div>
        )
      })}

      {error && (
        <div className="border border-red-900/50 bg-red-950/30 text-red-400 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-700 tracking-wide">
          {saved ? (
            <span className="text-gold/70">Entry saved. The record stands.</span>
          ) : (
            'Your entry is not saved yet.'
          )}
        </p>

        <button
          type="submit"
          disabled={saving}
          className="bg-gold text-black font-bold text-xs tracking-widest uppercase px-8 py-3.5 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : saved ? 'Update Entry' : 'Commit Entry'}
        </button>
      </div>
    </form>
  )
}

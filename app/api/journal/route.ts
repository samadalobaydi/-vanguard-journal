import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/journal — fetch all entries for the current user
export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entries: data })
}

// POST /api/journal — upsert today's entry
export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify subscription
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  if (profile?.subscription_status !== 'active') {
    return NextResponse.json({ error: 'Active subscription required.' }, { status: 403 })
  }

  const body = await request.json()
  const { date, morning_intention, evening_review, tomorrow_target } = body

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid or missing date.' }, { status: 400 })
  }

  // Prevent writing future dates
  const today = new Date().toISOString().split('T')[0]
  if (date > today) {
    return NextResponse.json({ error: 'Cannot create entries for future dates.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .upsert(
      {
        user_id: user.id,
        entry_date: date,
        morning_intention: morning_intention ?? null,
        evening_review: evening_review ?? null,
        tomorrow_target: tomorrow_target ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,entry_date' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entry: data })
}

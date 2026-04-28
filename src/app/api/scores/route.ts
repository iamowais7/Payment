import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = supabase as any
  const { data, error } = await db
    .from('golf_scores')
    .select('*')
    .eq('user_id', user.id)
    .order('score_date', { ascending: false })
    .limit(5)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scores: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { score, score_date } = await request.json()

  if (!score || score < 1 || score > 45) {
    return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 })
  }

  if (!score_date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  const db = supabase as any

  // Check subscription is active
  const { data: sub } = await db
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single()

  if (!sub || sub.status !== 'active') {
    return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
  }

  const { data, error } = await db
    .from('golf_scores')
    .insert({ user_id: user.id, score: parseInt(score), score_date })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A score for this date already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enforce max 5 scores (delete oldest if > 5)
  const { data: allScores } = await db
    .from('golf_scores')
    .select('id')
    .eq('user_id', user.id)
    .order('score_date', { ascending: false })

  if (allScores && allScores.length > 5) {
    const toDelete = allScores.slice(5).map((s: any) => s.id)
    await db.from('golf_scores').delete().in('id', toDelete)
  }

  return NextResponse.json({ score: data }, { status: 201 })
}

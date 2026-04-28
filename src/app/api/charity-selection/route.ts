import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('charity_selections')
    .select('*, charity:charities(*)')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ selection: data })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { charity_id, contribution_percentage } = await request.json()

  if (!charity_id) return NextResponse.json({ error: 'Charity required' }, { status: 400 })
  if (contribution_percentage < 10 || contribution_percentage > 100) {
    return NextResponse.json({ error: 'Percentage must be 10-100' }, { status: 400 })
  }

  const db = supabase as any
  const { data, error } = await db
    .from('charity_selections')
    .upsert({ user_id: user.id, charity_id, contribution_percentage }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ selection: data })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculatePrizePools } from '@/lib/utils'

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const db = supabase as any
  const { data: p } = await db.from('profiles').select('role').eq('id', user.id).single()
  return p?.role === 'admin' ? user : null
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { draw_month, draw_year, draw_type, prize_pool_percentage } = await request.json()
  const db = supabase as any

  // Check for existing draw
  const { data: existing } = await db
    .from('draws')
    .select('id')
    .eq('draw_month', draw_month)
    .eq('draw_year', draw_year)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'A draw for this month already exists' }, { status: 409 })
  }

  // Count active subscribers and calculate prize pool
  const { count: activeSubs } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const monthlyRevenue = (activeSubs ?? 0) * 1999
  const prizePoolPct = (prize_pool_percentage ?? 30) / 100
  const totalPoolCents = Math.floor(monthlyRevenue * prizePoolPct)
  const pools = calculatePrizePools(totalPoolCents)

  const { data, error } = await db
    .from('draws')
    .insert({
      draw_month,
      draw_year,
      draw_type: draw_type ?? 'random',
      status: 'pending',
      winning_numbers: [],
      total_pool_cents: totalPoolCents,
      jackpot_pool_cents: pools.fiveMatch,
      four_match_pool_cents: pools.fourMatch,
      three_match_pool_cents: pools.threeMatch,
      active_subscribers: activeSubs ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ draw: data }, { status: 201 })
}

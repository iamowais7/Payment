import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Draw } from '@/types/database'

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const db = supabase as any
  const { data: p } = await db.from('profiles').select('role').eq('id', user.id).single()
  return p?.role === 'admin' ? user : null
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const { data: drawRaw } = await supabase
    .from('draws')
    .select('*')
    .eq('id', id)
    .single()

  const draw = drawRaw as Draw | null

  if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
  if (draw.status !== 'simulated') {
    return NextResponse.json({ error: 'Draw must be simulated before publishing' }, { status: 400 })
  }

  const simulationData = draw.simulation_data as any
  const winners = simulationData?.winners ?? []

  // Create draw results for each winner
  for (const winner of winners) {
    await (supabase.from('draw_results') as any).upsert({
      draw_id: id,
      user_id: winner.userId,
      match_count: winner.matchCount,
      matched_numbers: winner.matchedNumbers,
      prize_amount_cents: winner.prizeCents,
      payment_status: 'pending',
    }, { onConflict: 'draw_id,user_id' }).catch(console.error)
  }

  // Handle jackpot rollover if no 5-match winner
  const hasFiveMatch = winners.some((w: any) => w.matchCount === 5)
  if (!hasFiveMatch && draw.jackpot_pool_cents > 0) {
    const nextMonth = draw.draw_month === 12 ? 1 : draw.draw_month + 1
    const nextYear = draw.draw_month === 12 ? draw.draw_year + 1 : draw.draw_year

    const { data: nextDrawRaw } = await supabase
      .from('draws')
      .select('id')
      .eq('draw_month', nextMonth)
      .eq('draw_year', nextYear)
      .maybeSingle()

    const nextDraw = nextDrawRaw as { id: string } | null

    if (nextDraw) {
      await (supabase.from('jackpot_rollovers') as any).insert({
        from_draw_id: id,
        to_draw_id: nextDraw.id,
        amount_cents: draw.jackpot_pool_cents,
      })
    }
  }

  // Publish the draw
  const { error } = await (supabase.from('draws') as any)
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, winnersCreated: winners.length })
}

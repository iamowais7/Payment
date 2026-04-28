import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runDrawRandom, runDrawAlgorithmic, countMatches, getMatchedNumbers, calculatePrizePools } from '@/lib/utils'
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

  // Fetch the draw
  const { data: drawRaw } = await supabase
    .from('draws')
    .select('*')
    .eq('id', id)
    .single()

  const drawRecord = drawRaw as Draw | null

  if (!drawRecord) return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
  if (drawRecord.status === 'published') {
    return NextResponse.json({ error: 'Draw already published' }, { status: 400 })
  }

  // Collect all active subscriber user IDs
  const { data: activeSubsRaw } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  const activeSubs = (activeSubsRaw ?? []) as { user_id: string }[]
  const userIds = activeSubs.map(s => s.user_id)

  // Build score frequency for algorithmic draw
  const scoreFrequency: Record<number, number> = {}
  for (const userId of userIds) {
    const { data: scoresRaw } = await supabase
      .from('golf_scores')
      .select('score')
      .eq('user_id', userId)
    const scores = (scoresRaw ?? []) as { score: number }[]
    for (const s of scores) {
      scoreFrequency[s.score] = (scoreFrequency[s.score] ?? 0) + 1
    }
  }

  // Generate winning numbers
  const winningNumbers = drawRecord.draw_type === 'algorithmic'
    ? runDrawAlgorithmic(scoreFrequency)
    : runDrawRandom()

  // Check for rollover from previous month
  const { data: rolloverRaw } = await supabase
    .from('jackpot_rollovers')
    .select('amount_cents')
    .eq('to_draw_id', id)
    .maybeSingle()

  const rollover = rolloverRaw as { amount_cents: number } | null
  const rolloverCents = rollover?.amount_cents ?? 0
  const pools = calculatePrizePools(drawRecord.total_pool_cents, rolloverCents)

  // Find winners (users with 3+ matches)
  const winners: { userId: string; matchCount: number; matchedNumbers: number[]; prizeCents: number }[] = []
  const matchGroups: Record<number, string[]> = { 3: [], 4: [], 5: [] }

  for (const userId of userIds) {
    const { data: userScoresRaw } = await supabase
      .from('golf_scores')
      .select('score')
      .eq('user_id', userId)

    const userScores = (userScoresRaw ?? []) as { score: number }[]
    const scores = userScores.map(s => s.score)
    if (scores.length === 0) continue

    const matchCount = countMatches(scores, winningNumbers)
    if (matchCount >= 3) {
      matchGroups[matchCount]?.push(userId)
    }
  }

  // Calculate prizes (split equally among winners per tier)
  for (const [matchStr, userList] of Object.entries(matchGroups)) {
    const matchCount = parseInt(matchStr)
    if (userList.length === 0) continue

    const poolKey = matchCount === 5 ? pools.fiveMatch : matchCount === 4 ? pools.fourMatch : pools.threeMatch
    const prizePerWinner = Math.floor(poolKey / userList.length)

    for (const userId of userList) {
      const { data: userScoresRaw } = await supabase
        .from('golf_scores')
        .select('score')
        .eq('user_id', userId)
      const userScores = (userScoresRaw ?? []) as { score: number }[]
      const scores = userScores.map(s => s.score)
      const matched = getMatchedNumbers(scores, winningNumbers)

      winners.push({
        userId,
        matchCount,
        matchedNumbers: matched,
        prizeCents: prizePerWinner,
      })
    }
  }

  // Store simulation data
  const { error: updateError } = await (supabase.from('draws') as any)
    .update({
      status: 'simulated',
      winning_numbers: winningNumbers,
      jackpot_pool_cents: pools.fiveMatch,
      four_match_pool_cents: pools.fourMatch,
      three_match_pool_cents: pools.threeMatch,
      rollover_cents: rolloverCents,
      simulation_data: { winners, winningNumbers, scoreFrequency },
    })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({
    winningNumbers,
    winners: winners.length,
    pools,
    simulationData: { winners },
  })
}

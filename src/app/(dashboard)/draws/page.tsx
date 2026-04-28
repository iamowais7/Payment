import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Target, Calendar, Star } from 'lucide-react'
import { formatCurrency, formatMonth, countMatches } from '@/lib/utils'
import type { Draw, DrawResult } from '@/types/database'

export default async function DrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: drawsRaw }, { data: myScoresRaw }, { data: myResultsRaw }] = await Promise.all([
    supabase.from('draws').select('*').order('draw_year', { ascending: false }).order('draw_month', { ascending: false }).limit(12),
    supabase.from('golf_scores').select('score').eq('user_id', user.id).order('score_date', { ascending: false }).limit(5),
    supabase.from('draw_results').select('*, draw:draws(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const draws = (drawsRaw ?? []) as Draw[]
  const myScores = (myScoresRaw ?? []) as { score: number }[]
  const myResults = (myResultsRaw ?? []) as (DrawResult & { draw: { draw_month: number; draw_year: number } | null })[]

  const myScoreNumbers = myScores.map(s => s.score)
  const myResultDrawIds = new Set(myResults.map(r => r.draw_id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Draws & Results</h1>
        <p className="text-slate-500 mt-1">Monthly draws based on your Stableford scores</p>
      </div>

      {/* My Current Scores */}
      {myScoreNumbers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              My Draw Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {myScoreNumbers.map((score, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-lg"
                >
                  {score}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              These numbers are matched against the winning draw each month
            </p>
          </CardContent>
        </Card>
      )}

      {/* Published Draws */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Draw History</h2>
        {draws.filter(d => d.status === 'published').length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">No published draws yet. The first draw is coming soon!</p>
            </CardContent>
          </Card>
        ) : (
          draws
            .filter(d => d.status === 'published')
            .map(draw => {
              const isWinner = myResultDrawIds.has(draw.id)
              const myResult = myResults.find(r => r.draw_id === draw.id)
              const myMatchCount = myScoreNumbers.length > 0
                ? countMatches(myScoreNumbers, draw.winning_numbers)
                : 0

              return (
                <Card key={draw.id} className={isWinner ? 'border-amber-300 bg-amber-50' : ''}>
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Draw Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-slate-900">
                            {formatMonth(draw.draw_month, draw.draw_year)} Draw
                          </h3>
                          {isWinner && (
                            <Badge variant="gold" className="gap-1">
                              <Star className="w-3 h-3" /> Winner!
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          <span className="text-xs text-slate-500 mr-2">Winning numbers:</span>
                          {draw.winning_numbers.map((n: number) => (
                            <span
                              key={n}
                              className={`inline-flex w-8 h-8 rounded-lg items-center justify-center text-sm font-bold ${
                                myScoreNumbers.includes(n)
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                        {myScoreNumbers.length > 0 && (
                          <p className="text-xs text-slate-500">
                            You matched: <strong className="text-emerald-600">{myMatchCount}</strong> number{myMatchCount !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      {/* Prize Pools */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                          { label: '5-Match', amount: draw.jackpot_pool_cents, match: 5 },
                          { label: '4-Match', amount: draw.four_match_pool_cents, match: 4 },
                          { label: '3-Match', amount: draw.three_match_pool_cents, match: 3 },
                        ].map(({ label, amount, match }) => (
                          <div
                            key={label}
                            className={`p-2 rounded-xl ${
                              myResult?.match_count === match
                                ? 'bg-amber-200 border border-amber-300'
                                : 'bg-slate-100'
                            }`}
                          >
                            <div className="text-xs text-slate-500">{label}</div>
                            <div className="font-bold text-sm text-slate-900">
                              {formatCurrency(amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Winner result */}
                    {myResult && (
                      <div className="mt-4 pt-4 border-t border-amber-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-amber-800">
                            🏆 You won {formatCurrency(myResult.prize_amount_cents)}!
                          </span>
                          <Badge variant={myResult.payment_status === 'paid' ? 'default' : 'warning'}>
                            {myResult.payment_status}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
        )}
      </div>

      {/* Upcoming */}
      {draws.filter(d => d.status !== 'published').length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming Draws</h2>
          {draws
            .filter(d => d.status !== 'published')
            .map(draw => (
              <Card key={draw.id} className="border-dashed">
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="font-semibold text-slate-700">
                      {formatMonth(draw.draw_month, draw.draw_year)} Draw
                    </div>
                    <div className="text-xs text-slate-400">
                      {draw.status === 'simulated' ? 'Simulation complete — awaiting publish' : 'Pending'}
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-auto">{draw.status}</Badge>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}

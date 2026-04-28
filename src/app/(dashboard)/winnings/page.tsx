import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Award, Upload, Trophy } from 'lucide-react'
import { formatCurrency, formatMonth } from '@/lib/utils'
import Link from 'next/link'
import type { DrawResult, WinnerVerification } from '@/types/database'

type ResultRow = DrawResult & {
  draw: { draw_month: number; draw_year: number } | null
  verification: WinnerVerification[] | null
}

export default async function WinningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: resultsRaw } = await supabase
    .from('draw_results')
    .select('*, draw:draws(*), verification:winner_verifications(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const results = (resultsRaw ?? []) as ResultRow[]

  const totalWon = results.reduce((sum, r) => sum + r.prize_amount_cents, 0)
  const totalPaid = results.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + r.prize_amount_cents, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Winnings</h1>
        <p className="text-slate-500 mt-1">Track your prize winnings and verification status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <Trophy className="w-8 h-8 text-amber-500 mb-3" />
            <div className="text-2xl font-black text-slate-900">{formatCurrency(totalWon)}</div>
            <div className="text-sm text-slate-500">Total Winnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Award className="w-8 h-8 text-emerald-500 mb-3" />
            <div className="text-2xl font-black text-slate-900">{formatCurrency(totalPaid)}</div>
            <div className="text-sm text-slate-500">Paid Out</div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      {results.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No winnings yet</h3>
            <p className="text-slate-400 text-sm">
              Keep entering your scores and joining monthly draws — your win could be next!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map(result => {
            const verification = Array.isArray(result.verification) ? result.verification[0] : result.verification
            const needsVerification = result.match_count >= 3 && !verification && result.payment_status === 'pending'

            return (
              <Card key={result.id} className={result.match_count === 5 ? 'border-amber-300' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">
                          {result.match_count}-Number Match
                        </h3>
                        {result.match_count === 5 && <span className="text-amber-500">🏆</span>}
                      </div>
                      <p className="text-sm text-slate-500">
                        {formatMonth((result as any).draw?.draw_month, (result as any).draw?.draw_year)}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(result.matched_numbers ?? []).map((n: number) => (
                          <span key={n} className="inline-flex w-7 h-7 rounded-lg bg-emerald-500 text-white text-xs font-bold items-center justify-center">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-amber-600">
                        {formatCurrency(result.prize_amount_cents)}
                      </div>
                      <Badge
                        variant={
                          result.payment_status === 'paid' ? 'default' :
                          result.payment_status === 'rejected' ? 'destructive' : 'warning'
                        }
                        className="mt-1"
                      >
                        {result.payment_status}
                      </Badge>
                    </div>
                  </div>

                  {/* Verification Status */}
                  {needsVerification && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm text-amber-700 mb-3">
                        Please submit proof of your scores to claim your prize
                      </p>
                      <Link href={`/winnings/verify/${result.id}`}>
                        <Button size="sm" variant="gold" className="gap-2">
                          <Upload className="w-4 h-4" />
                          Submit Verification
                        </Button>
                      </Link>
                    </div>
                  )}

                  {verification && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500">Verification:</span>
                        <Badge variant={
                          verification.status === 'approved' ? 'default' :
                          verification.status === 'rejected' ? 'destructive' : 'warning'
                        }>
                          {verification.status}
                        </Badge>
                        {verification.admin_notes && (
                          <span className="text-slate-400 text-xs">{verification.admin_notes}</span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

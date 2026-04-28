import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, ExternalLink } from 'lucide-react'
import { formatCurrency, formatMonth } from '@/lib/utils'
import { VerificationActions } from '@/components/admin/verification-actions'
import type { WinnerVerification, DrawResult } from '@/types/database'

type VerificationRow = WinnerVerification & {
  result: (DrawResult & { draw: { draw_month: number; draw_year: number } | null }) | null
  user: { full_name: string | null; email: string } | null
}

type ResultRow = DrawResult & {
  draw: { draw_month: number; draw_year: number } | null
  user: { full_name: string | null; email: string } | null
}

export default async function AdminWinnersPage() {
  const supabase = await createClient()

  const { data: verificationsRaw } = await supabase
    .from('winner_verifications')
    .select(`
      *,
      result:draw_results(*, draw:draws(*)),
      user:profiles(full_name, email)
    `)
    .order('created_at', { ascending: false })

  const { data: unverifiedResultsRaw } = await supabase
    .from('draw_results')
    .select('*, draw:draws(*), user:profiles(full_name, email)')
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: false })

  const verifications = (verificationsRaw ?? []) as VerificationRow[]
  const unverifiedResults = (unverifiedResultsRaw ?? []) as ResultRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Winners Management</h1>
        <p className="text-slate-500 mt-1">Review verification submissions and manage payouts</p>
      </div>

      {/* Pending Verifications */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Pending Verifications</h2>
        {(verifications ?? []).filter(v => v.status === 'pending').length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No pending verifications</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(verifications ?? [])
              .filter(v => v.status === 'pending')
              .map(v => {
                const result = Array.isArray(v.result) ? v.result[0] : v.result
                const user = Array.isArray(v.user) ? v.user[0] : v.user
                const draw = (result as any)?.draw

                return (
                  <Card key={v.id} className="border-amber-200">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="warning" className="gap-1">
                              <Clock className="w-3 h-3" />
                              Pending Review
                            </Badge>
                            <span className="text-sm font-bold text-amber-700">
                              {(result as any)?.match_count}-Number Match
                            </span>
                          </div>
                          <div className="font-semibold text-slate-900">{(user as any)?.full_name}</div>
                          <div className="text-sm text-slate-500">{(user as any)?.email}</div>
                          <div className="text-sm text-slate-500 mt-1">
                            {draw ? `${formatMonth(draw.draw_month, draw.draw_year)} Draw` : ''}
                          </div>
                          <div className="mt-2 font-bold text-amber-700">
                            Prize: {formatCurrency((result as any)?.prize_amount_cents ?? 0)}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <a
                            href={v.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Proof Screenshot
                          </a>
                          <VerificationActions verificationId={v.id} resultId={(result as any)?.id} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}
      </div>

      {/* All Winners */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">All Winners</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left p-4 font-semibold text-slate-600">Winner</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Draw</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Match</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Prize</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {(unverifiedResults ?? []).map(result => {
                    const user = Array.isArray(result.user) ? result.user[0] : result.user
                    const draw = Array.isArray(result.draw) ? result.draw[0] : result.draw
                    const verification = (verifications ?? []).find(v => (Array.isArray(v.result) ? v.result[0] : v.result)?.id === result.id)

                    return (
                      <tr key={result.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="p-4">
                          <div className="font-medium text-slate-900">{(user as any)?.full_name ?? '—'}</div>
                          <div className="text-xs text-slate-400">{(user as any)?.email}</div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {draw ? formatMonth(draw.draw_month, draw.draw_year) : '—'}
                        </td>
                        <td className="p-4">
                          <span className="font-bold">{result.match_count}</span>
                          <span className="text-slate-400 text-xs ml-1">matches</span>
                        </td>
                        <td className="p-4 font-bold text-amber-700">
                          {formatCurrency(result.prize_amount_cents)}
                        </td>
                        <td className="p-4">
                          <Badge variant={
                            result.payment_status === 'paid' ? 'default' :
                            result.payment_status === 'rejected' ? 'destructive' : 'warning'
                          }>
                            {result.payment_status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {verification ? (
                            <Badge variant={
                              verification.status === 'approved' ? 'default' :
                              verification.status === 'rejected' ? 'destructive' : 'warning'
                            }>
                              {verification.status}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 text-xs">Not submitted</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

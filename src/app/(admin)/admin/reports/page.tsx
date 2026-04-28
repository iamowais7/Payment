import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, Heart, Trophy } from 'lucide-react'
import { formatCurrency, formatMonth } from '@/lib/utils'
import type { Draw } from '@/types/database'

type CharitySelRow = { charity_id: string | null; contribution_percentage: number; charity: { name: string } | null }
type DrawResultRow = { prize_amount_cents: number; payment_status: string; match_count: number }

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { count: _cancelledSubs },
    { data: drawsRaw },
    { data: charityDataRaw },
    { data: drawResultsRaw },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabase.from('draws').select('*').eq('status', 'published').order('draw_year', { ascending: false }).order('draw_month', { ascending: false }).limit(12),
    supabase.from('charity_selections').select('charity_id, contribution_percentage, charity:charities(name)'),
    supabase.from('draw_results').select('prize_amount_cents, payment_status, match_count'),
  ])

  const draws = (drawsRaw ?? []) as Draw[]
  const charityData = (charityDataRaw ?? []) as CharitySelRow[]
  const drawResults = (drawResultsRaw ?? []) as DrawResultRow[]

  // Charity totals
  const charityTotals: Record<string, { name: string; supporters: number; estimatedDonation: number }> = {}
  for (const sel of charityData ?? []) {
    const key = sel.charity_id ?? 'unknown'
    const name = (sel.charity as any)?.name ?? 'Unknown'
    if (!charityTotals[key]) charityTotals[key] = { name, supporters: 0, estimatedDonation: 0 }
    charityTotals[key].supporters++
    charityTotals[key].estimatedDonation += Math.floor(1999 * ((sel.contribution_percentage ?? 10) / 100))
  }

  // Prize stats
  const totalPrizesPaid = (drawResults ?? [])
    .filter(r => r.payment_status === 'paid')
    .reduce((sum, r) => sum + r.prize_amount_cents, 0)
  const totalPrizesPending = (drawResults ?? [])
    .filter(r => r.payment_status === 'pending')
    .reduce((sum, r) => sum + r.prize_amount_cents, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Platform-wide statistics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: totalUsers ?? 0, icon: Users, color: 'blue' },
          { label: 'Active Subscribers', value: activeSubscribers ?? 0, icon: TrendingUp, color: 'emerald' },
          { label: 'Monthly Revenue (est.)', value: formatCurrency((activeSubscribers ?? 0) * 1999), icon: DollarSign, color: 'violet' },
          { label: 'Total Prizes Paid', value: formatCurrency(totalPrizesPaid), icon: Trophy, color: 'amber' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
              <div className="text-xl font-black text-slate-900">{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Draw Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Draw Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Draws', value: draws?.length ?? 0 },
              { label: 'Total Winners', value: drawResults?.length ?? 0 },
              { label: 'Prizes Paid', value: formatCurrency(totalPrizesPaid) },
              { label: 'Prizes Pending', value: formatCurrency(totalPrizesPending) },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-3 bg-slate-50 rounded-xl">
                <div className="text-xl font-black text-slate-900">{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Draw History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 font-semibold text-slate-600">Draw</th>
                  <th className="text-left py-2 font-semibold text-slate-600">Type</th>
                  <th className="text-right py-2 font-semibold text-slate-600">Prize Pool</th>
                  <th className="text-right py-2 font-semibold text-slate-600">Jackpot</th>
                  <th className="text-right py-2 font-semibold text-slate-600">Subscribers</th>
                </tr>
              </thead>
              <tbody>
                {(draws ?? []).map(draw => (
                  <tr key={draw.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3">{formatMonth(draw.draw_month, draw.draw_year)}</td>
                    <td className="py-3 capitalize text-slate-500">{draw.draw_type}</td>
                    <td className="py-3 text-right">{formatCurrency(draw.total_pool_cents)}</td>
                    <td className="py-3 text-right text-amber-700 font-semibold">{formatCurrency(draw.jackpot_pool_cents)}</td>
                    <td className="py-3 text-right text-slate-500">{draw.active_subscribers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charity Contributions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Charity Contribution Totals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.values(charityTotals)
              .sort((a, b) => b.estimatedDonation - a.estimatedDonation)
              .map(({ name, supporters, estimatedDonation }) => (
                <div key={name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-slate-900">{name}</div>
                    <div className="text-xs text-slate-500">{supporters} supporters</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-700">{formatCurrency(estimatedDonation)}</div>
                    <div className="text-xs text-slate-400">est. per month</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TrendingUp({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

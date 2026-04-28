import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatMonth } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Play, Globe } from 'lucide-react'
import type { Draw, DrawResult } from '@/types/database'

export default async function DrawDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: drawRaw }, { data: resultsRaw }] = await Promise.all([
    supabase.from('draws').select('*').eq('id', id).single(),
    supabase.from('draw_results').select('*, user:profiles(full_name, email)').eq('draw_id', id).order('match_count', { ascending: false }),
  ])

  const draw = drawRaw as Draw | null
  const results = (resultsRaw ?? []) as Array<DrawResult & { user: { full_name: string | null; email: string } | null }>

  if (!draw) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/draws">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Draws
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {formatMonth(draw.draw_month, draw.draw_year)} Draw
          </h1>
          <Badge variant={draw.status === 'published' ? 'default' : draw.status === 'simulated' ? 'warning' : 'secondary'}>
            {draw.status}
          </Badge>
        </div>
        <div className="ml-auto flex gap-2">
          {draw.status === 'pending' && (
            <Link href={`/admin/draws/${id}/simulate`}>
              <Button size="sm" className="gap-1"><Play className="w-3 h-3" /> Simulate</Button>
            </Link>
          )}
          {draw.status === 'simulated' && (
            <Link href={`/admin/draws/${id}/publish`}>
              <Button size="sm" className="gap-1"><Globe className="w-3 h-3" /> Publish</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Draw Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: 'Type', value: draw.draw_type },
              { label: 'Active Subscribers', value: draw.active_subscribers },
              { label: 'Total Prize Pool', value: formatCurrency(draw.total_pool_cents) },
              { label: 'Jackpot (5-Match)', value: formatCurrency(draw.jackpot_pool_cents) },
              { label: '4-Match Pool', value: formatCurrency(draw.four_match_pool_cents) },
              { label: '3-Match Pool', value: formatCurrency(draw.three_match_pool_cents) },
              { label: 'Rollover Added', value: formatCurrency(draw.rollover_cents) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1 border-b border-slate-50 last:border-0">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-900 capitalize">{value}</span>
              </div>
            ))}
            {draw.winning_numbers?.length > 0 && (
              <div className="pt-2">
                <div className="text-slate-500 mb-2">Winning Numbers</div>
                <div className="flex gap-2">
                  {draw.winning_numbers.map((n: number) => (
                    <span key={n} className="w-9 h-9 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Winners ({results?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            {(results ?? []).length === 0 ? (
              <p className="text-slate-400 text-sm">No winners yet</p>
            ) : (
              <div className="space-y-2">
                {(results ?? []).map(r => {
                  const user = Array.isArray(r.user) ? r.user[0] : r.user
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{(user as any)?.full_name}</div>
                        <div className="text-xs text-slate-500">{r.match_count}-Match</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-700">{formatCurrency(r.prize_amount_cents)}</div>
                        <Badge variant={r.payment_status === 'paid' ? 'default' : 'warning'} className="text-xs">
                          {r.payment_status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

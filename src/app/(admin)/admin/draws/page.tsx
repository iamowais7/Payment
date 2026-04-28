import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatMonth } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Trophy, Play, Globe } from 'lucide-react'
import type { Draw } from '@/types/database'

export default async function AdminDrawsPage() {
  const supabase = await createClient()

  const { data: drawsRaw } = await supabase
    .from('draws')
    .select('*')
    .order('draw_year', { ascending: false })
    .order('draw_month', { ascending: false })

  const draws = (drawsRaw ?? []) as Draw[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Draw Management</h1>
          <p className="text-slate-500 mt-1">Configure, simulate, and publish monthly draws</p>
        </div>
        <Link href="/admin/draws/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Draw
          </Button>
        </Link>
      </div>

      {(draws ?? []).length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="font-bold text-slate-900 mb-2">No draws yet</h3>
            <p className="text-slate-400 text-sm mb-4">Create your first monthly draw</p>
            <Link href="/admin/draws/new">
              <Button size="sm">Create Draw</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(draws ?? []).map(draw => (
            <Card key={draw.id}>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-900">
                        {formatMonth(draw.draw_month, draw.draw_year)}
                      </h3>
                      <Badge variant={
                        draw.status === 'published' ? 'default' :
                        draw.status === 'simulated' ? 'warning' : 'secondary'
                      }>
                        {draw.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {draw.draw_type}
                      </Badge>
                    </div>
                    {draw.winning_numbers?.length > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-xs text-slate-500 mr-1">Numbers:</span>
                        {draw.winning_numbers.map((n: number) => (
                          <span key={n} className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-3 text-center mt-2">
                      {[
                        { label: 'Jackpot (5-match)', val: draw.jackpot_pool_cents },
                        { label: '4-Match', val: draw.four_match_pool_cents },
                        { label: '3-Match', val: draw.three_match_pool_cents },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-2 text-xs">
                          <div className="text-slate-400">{label}</div>
                          <div className="font-bold text-slate-900">{formatCurrency(val)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {draw.status === 'pending' && (
                      <Link href={`/admin/draws/${draw.id}/simulate`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Play className="w-3 h-3" />
                          Simulate
                        </Button>
                      </Link>
                    )}
                    {draw.status === 'simulated' && (
                      <Link href={`/admin/draws/${draw.id}/publish`}>
                        <Button size="sm" className="gap-1">
                          <Globe className="w-3 h-3" />
                          Publish
                        </Button>
                      </Link>
                    )}
                    <Link href={`/admin/draws/${draw.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

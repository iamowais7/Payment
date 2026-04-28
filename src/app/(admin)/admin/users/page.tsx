import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Profile } from '@/types/database'

type UserRow = Profile & {
  subscription: { plan: string; status: string; amount_cents: number; current_period_end: string | null }[] | null
  scores: { score: number; score_date: string }[] | null
  charity: { contribution_percentage: number; charity: { name: string } | null }[] | null
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: usersRaw } = await supabase
    .from('profiles')
    .select(`
      *,
      subscription:subscriptions(plan, status, amount_cents, current_period_end),
      scores:golf_scores(score, score_date),
      charity:charity_selections(contribution_percentage, charity:charities(name))
    `)
    .order('created_at', { ascending: false })

  const users = (usersRaw ?? []) as UserRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-1">{users?.length ?? 0} registered users</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left p-4 font-semibold text-slate-600">User</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Plan</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Scores</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Charity</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Joined</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map(user => {
                  const sub = Array.isArray(user.subscription) ? user.subscription[0] : user.subscription
                  const scores = Array.isArray(user.scores) ? user.scores : []
                  const charity = Array.isArray(user.charity) ? user.charity[0] : user.charity

                  return (
                    <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                            {user.full_name?.[0]?.toUpperCase() ?? 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{user.full_name ?? '—'}</div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize">{sub?.plan ?? '—'}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={
                          sub?.status === 'active' ? 'default' :
                          sub?.status === 'cancelled' ? 'destructive' : 'secondary'
                        }>
                          {sub?.status ?? 'none'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {scores.slice(0, 5).map((s: any, i: number) => (
                            <span key={i} className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">
                              {s.score}
                            </span>
                          ))}
                          {scores.length === 0 && <span className="text-slate-400 text-xs">None</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-slate-600">
                          {(charity as any)?.charity?.name ?? '—'}
                          {charity?.contribution_percentage ? ` (${charity.contribution_percentage}%)` : ''}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {formatDate(user.created_at)}
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
  )
}

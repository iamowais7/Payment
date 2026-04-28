import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Trophy, Heart, DollarSign, TrendingUp, Award } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Draw } from '@/types/database'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { count: totalDraws },
    { data: latestDrawRaw },
    { data: charityTotals },
    { count: pendingVerifications },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('draws').select('*', { count: 'exact', head: true }),
    supabase.from('draws').select('*').eq('status', 'published').order('draw_year', { ascending: false }).order('draw_month', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('charity_selections').select('charity_id, contribution_percentage', { count: 'exact' }),
    supabase.from('winner_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const latestDraw = latestDrawRaw as Draw | null
  const totalPool = latestDraw?.total_pool_cents ?? 0

  const stats = [
    { label: 'Total Users', value: totalUsers ?? 0, icon: Users, color: 'blue', change: 'All time' },
    { label: 'Active Subscribers', value: activeSubscribers ?? 0, icon: TrendingUp, color: 'emerald', change: 'Currently active' },
    { label: 'Total Draws', value: totalDraws ?? 0, icon: Trophy, color: 'amber', change: 'All time' },
    { label: 'Last Prize Pool', value: formatCurrency(totalPool), icon: DollarSign, color: 'violet', change: 'Most recent draw' },
    { label: 'Charity Supporters', value: charityTotals?.length ?? 0, icon: Heart, color: 'red', change: 'Users with charity' },
    { label: 'Pending Verifications', value: pendingVerifications ?? 0, icon: Award, color: 'orange', change: 'Needs review' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Admin Overview</h1>
        <p className="text-slate-500 mt-1">Platform statistics and quick actions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-sm font-medium text-slate-700 mt-1">{label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Run New Draw', href: '/admin/draws/new', color: 'emerald' },
            { label: 'Review Winners', href: '/admin/winners', color: 'amber' },
            { label: 'Add Charity', href: '/admin/charities/new', color: 'teal' },
            { label: 'View Reports', href: '/admin/reports', color: 'violet' },
          ].map(({ label, href, color }) => (
            <a
              key={label}
              href={href}
              className={`flex items-center justify-center p-4 rounded-2xl bg-${color}-50 border border-${color}-200 text-${color}-700 font-semibold text-sm hover:bg-${color}-100 transition-colors text-center`}
            >
              {label}
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

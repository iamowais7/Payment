import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatMonth } from '@/lib/utils'
import { Target, Trophy, Heart, Award, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Profile, Subscription, GolfScore, CharitySelection, DrawResult, Draw } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profileRaw },
    { data: subscriptionRaw },
    { data: scoresRaw },
    { data: charitySelectionRaw },
    { data: recentResultsRaw },
    { data: upcomingDrawRaw },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('golf_scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }).limit(5),
    supabase.from('charity_selections').select('*, charity:charities(*)').eq('user_id', user.id).maybeSingle(),
    supabase.from('draw_results').select('*, draw:draws(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('draws').select('*').in('status', ['pending', 'simulated']).order('draw_year', { ascending: false }).order('draw_month', { ascending: false }).limit(1).maybeSingle(),
  ])

  const profile = profileRaw as Profile | null
  const subscription = subscriptionRaw as Subscription | null
  const scores = scoresRaw as GolfScore[] | null
  const charitySelection = charitySelectionRaw as (CharitySelection & { charity: { name: string } | null }) | null
  const recentResults = recentResultsRaw as (DrawResult & { draw: { draw_month: number; draw_year: number } | null })[] | null
  const upcomingDraw = upcomingDrawRaw as Draw | null

  const isActive = subscription?.status === 'active'
  const totalWon = (recentResults ?? []).reduce((sum, r) => sum + r.prize_amount_cents, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Golfer'} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here&apos;s your GreenHeart overview.</p>
      </div>

      {/* Subscription Alert */}
      {!isActive && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Subscription {subscription?.status ?? 'inactive'}</p>
            <p className="text-amber-700 text-sm mt-1">
              {subscription?.status === 'cancelled'
                ? 'Your subscription has been cancelled. Resubscribe to rejoin draws.'
                : 'Subscribe to access score entry and monthly draws.'}
            </p>
            <Link href="/subscribe" className="mt-3 inline-block">
              <Button size="sm" variant="gold">
                {subscription?.status === 'cancelled' ? 'Resubscribe' : 'Subscribe Now'}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Subscription',
            value: isActive ? (subscription?.plan === 'yearly' ? 'Yearly' : 'Monthly') : 'Inactive',
            sub: isActive ? `Renews ${subscription?.current_period_end ? formatDate(subscription.current_period_end) : '—'}` : 'Not subscribed',
            icon: CheckCircle2,
            color: isActive ? 'emerald' : 'amber',
          },
          {
            label: 'Scores Entered',
            value: `${scores?.length ?? 0}/5`,
            sub: 'Stableford scores',
            icon: Target,
            color: 'teal',
          },
          {
            label: 'Draws Entered',
            value: upcomingDraw ? formatMonth(upcomingDraw.draw_month, upcomingDraw.draw_year) : 'No draw',
            sub: 'Next draw',
            icon: Trophy,
            color: 'violet',
          },
          {
            label: 'Total Winnings',
            value: formatCurrency(totalWon),
            sub: 'Lifetime earnings',
            icon: Award,
            color: 'amber',
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
              <div className="text-lg font-bold text-slate-900 leading-tight">{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">My Stableford Scores</CardTitle>
            <Link href="/scores">
              <Button variant="ghost" size="sm" className="gap-1 text-emerald-600">
                Manage <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {scores && scores.length > 0 ? (
              <div className="space-y-2">
                {scores.map((score, i) => (
                  <div key={score.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                      <span className="text-sm text-slate-600">{formatDate(score.score_date)}</span>
                    </div>
                    <span className="font-bold text-slate-900">{score.score} pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No scores yet</p>
                <Link href="/scores">
                  <Button size="sm" className="mt-3" disabled={!isActive}>Add Your First Score</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charity & Draw Info */}
        <div className="space-y-4">
          {/* Charity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">My Charity</CardTitle>
              <Link href="/charity">
                <Button variant="ghost" size="sm" className="gap-1 text-emerald-600">
                  Change <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {charitySelection ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-emerald-600 fill-emerald-200" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">
                      {(charitySelection as any).charity?.name ?? 'Selected'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {charitySelection.contribution_percentage}% of your subscription
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm">No charity selected</p>
                  <Link href="/charity">
                    <Button size="sm" variant="outline" className="mt-2">Select a Charity</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Draw */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">
                    {upcomingDraw
                      ? `${formatMonth(upcomingDraw.draw_month, upcomingDraw.draw_year)} Draw`
                      : 'No upcoming draw'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isActive && (scores?.length ?? 0) >= 1
                      ? 'You are entered! 🎉'
                      : isActive
                      ? 'Add scores to enter'
                      : 'Subscribe to enter'}
                  </div>
                </div>
                <Link href="/draws" className="ml-auto">
                  <Button variant="ghost" size="sm" className="gap-1 text-emerald-600">
                    View <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Winnings */}
      {recentResults && recentResults.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Winnings</CardTitle>
            <Link href="/winnings">
              <Button variant="ghost" size="sm" className="gap-1 text-emerald-600">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentResults.map(result => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-amber-900 text-sm">
                      {result.match_count}-Number Match
                    </div>
                    <div className="text-xs text-amber-700">
                      {formatMonth((result as any).draw?.draw_month, (result as any).draw?.draw_year)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-700">{formatCurrency(result.prize_amount_cents)}</div>
                    <Badge variant={result.payment_status === 'paid' ? 'default' : 'warning'} className="text-xs">
                      {result.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

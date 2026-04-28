import Link from 'next/link'
import { Heart, Trophy, Star, ArrowRight, CheckCircle2, TrendingUp, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import type { Charity, Draw } from '@/types/database'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: charitiesRaw }, { data: latestDrawRaw }, { count: subscriberCount }] = await Promise.all([
    supabase.from('charities').select('*').eq('is_featured', true).eq('is_active', true).limit(3),
    supabase.from('draws').select('*').eq('status', 'published').order('draw_year', { ascending: false }).order('draw_month', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  const charities = (charitiesRaw ?? []) as Charity[]
  const latestDraw = latestDrawRaw as Draw | null

  const totalPool = latestDraw?.total_pool_cents ?? 0
  const jackpot = latestDraw?.jackpot_pool_cents ?? 0

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-20 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-sm font-medium mb-8">
                <Heart className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                Golf with a purpose
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
                Play Golf.
                <span className="block bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  Win Big.
                </span>
                Give Back.
              </h1>

              <p className="text-xl text-slate-300 leading-relaxed mb-10 max-w-lg">
                Subscribe, enter your Stableford scores, and join monthly prize draws — while automatically supporting the charity of your choice.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/signup">
                  <Button size="xl" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl shadow-emerald-500/30 gap-3">
                    Start for €19.99/mo
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                    How It Works
                  </Button>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Cancel anytime
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Stripe-secured
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Monthly draws
                </span>
              </div>
            </div>

            {/* Right: Prize Pool Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="glass rounded-3xl p-8 w-full max-w-sm border border-white/10">
                <div className="text-center mb-8">
                  <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-float" />
                  <div className="text-4xl font-black text-white mb-1">
                    {formatCurrency(jackpot || 150000)}
                  </div>
                  <div className="text-slate-400 text-sm">This Month&apos;s Jackpot</div>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    { label: '5-Number Match', pct: '40%', highlight: true },
                    { label: '4-Number Match', pct: '35%' },
                    { label: '3-Number Match', pct: '25%' },
                  ].map(({ label, pct, highlight }) => (
                    <div key={label} className={`flex items-center justify-between px-4 py-3 rounded-xl ${highlight ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/5'}`}>
                      <span className={`text-sm font-medium ${highlight ? 'text-amber-300' : 'text-slate-300'}`}>{label}</span>
                      <span className={`text-sm font-bold ${highlight ? 'text-amber-400' : 'text-slate-400'}`}>{pct}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xl font-bold text-white">{subscriberCount ?? 0}</div>
                    <div className="text-xs text-slate-400">Active Members</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xl font-bold text-white">Monthly</div>
                    <div className="text-xs text-slate-400">Draw Cycle</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">How GreenHeart Works</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Three simple steps to play, win, and give.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Star,
                title: 'Subscribe',
                desc: 'Choose monthly (€19.99) or yearly (€199.99). Your subscription funds the prize pool and supports charity.',
                color: 'emerald',
              },
              {
                step: '02',
                icon: TrendingUp,
                title: 'Enter Your Scores',
                desc: 'Log your last 5 Stableford scores (1–45). These are your lucky numbers for the monthly draw.',
                color: 'teal',
              },
              {
                step: '03',
                icon: Gift,
                title: 'Win & Give',
                desc: 'Match 3, 4, or 5 numbers to win prize tiers. Your subscription automatically funds the charity you chose.',
                color: 'amber',
              },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <Card key={step} className="relative overflow-hidden hover:shadow-lg transition-shadow group">
                <CardContent className="p-8">
                  <div className={`absolute top-0 right-0 text-8xl font-black opacity-5 text-${color}-500 -mt-4 -mr-4`}>{step}</div>
                  <div className={`w-14 h-14 bg-${color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 text-${color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-500 leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CHARITY SPOTLIGHT */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">Charities We Support</h2>
              <p className="text-slate-500">Minimum 10% of every subscription goes to your chosen charity.</p>
            </div>
            <Link href="/charities">
              <Button variant="outline" className="gap-2">
                View All Charities <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(charities ?? []).length > 0 ? (
              charities!.map((charity) => (
                <Link key={charity.id} href={`/charities/${charity.id}`}>
                  <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                        <Heart className="w-6 h-6 text-emerald-600 fill-emerald-200" />
                      </div>
                      {charity.is_featured && (
                        <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full mb-3">
                          Featured
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{charity.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-3">{charity.short_description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              // Fallback when DB not yet seeded
              [
                { name: 'The Golf Foundation', desc: 'Supporting young people through golf' },
                { name: 'Irish Cancer Society', desc: 'Fighting cancer in Ireland' },
                { name: 'Pieta House', desc: 'Suicide prevention and mental health support' },
              ].map((c) => (
                <Card key={c.name} className="hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-emerald-600 fill-emerald-200" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{c.name}</h3>
                    <p className="text-sm text-slate-500">{c.desc}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { label: 'Active Members', value: `${subscriberCount ?? 0}+` },
              { label: 'Prize Pool', value: formatCurrency(totalPool || 50000) },
              { label: 'Charities Supported', value: '4+' },
              { label: 'Monthly Draws', value: 'Every Month' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-3xl md:text-4xl font-black mb-1">{value}</div>
                <div className="text-emerald-100 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-500 text-lg">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Monthly */}
            <Card className="border-2 border-slate-200 hover:border-emerald-300 transition-colors">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">Monthly</h3>
                <div className="text-4xl font-black text-slate-900 mb-1">€19.99</div>
                <div className="text-slate-500 text-sm mb-8">/month</div>
                <ul className="space-y-3 mb-8">
                  {['5 Stableford score slots', 'Monthly prize draw entry', 'Charity contribution (min 10%)', 'Full dashboard access'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup?plan=monthly" className="block">
                  <Button className="w-full">Subscribe Monthly</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Yearly */}
            <Card className="border-2 border-emerald-500 relative shadow-lg shadow-emerald-100">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                BEST VALUE — SAVE 17%
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">Yearly</h3>
                <div className="text-4xl font-black text-slate-900 mb-1">€199.99</div>
                <div className="text-slate-500 text-sm mb-8">/year (≈€16.67/mo)</div>
                <ul className="space-y-3 mb-8">
                  {['Everything in Monthly', 'Priority draw entry', '2 months free', 'Early access to features'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup?plan=yearly" className="block">
                  <Button variant="gold" className="w-full">Subscribe Yearly</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Heart className="w-16 h-16 text-emerald-400 fill-emerald-400/30 mx-auto mb-6 animate-float" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Play with Purpose?
          </h2>
          <p className="text-slate-300 text-lg mb-10">
            Join thousands of golfers who are winning prizes and changing lives — one Stableford score at a time.
          </p>
          <Link href="/signup">
            <Button size="xl" className="bg-emerald-500 hover:bg-emerald-400 text-white gap-3 shadow-2xl shadow-emerald-500/30">
              Get Started Today
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

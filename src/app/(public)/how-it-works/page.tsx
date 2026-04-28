import Link from 'next/link'
import { CheckCircle2, Trophy, Heart, Target, ArrowRight, Star, Shield, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">How GreenHeart Works</h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          A simple, transparent platform that rewards your golf and funds charity.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* Steps */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 text-center mb-10">The Journey</h2>
          <div className="space-y-8">
            {[
              {
                step: 1,
                icon: Star,
                title: 'Subscribe to GreenHeart',
                desc: 'Choose a monthly (€19.99) or yearly (€199.99) plan. Your payment is processed securely via Stripe.',
                details: ['Cancel anytime', 'Stripe-secured payments', 'Instant access to all features'],
                color: 'emerald',
              },
              {
                step: 2,
                icon: Heart,
                title: 'Pick Your Charity',
                desc: 'Select from our directory of verified charities. Set your contribution — minimum 10%, up to 50%.',
                details: ['Auto-contributes monthly', 'Change charity anytime', 'Independent donations also supported'],
                color: 'teal',
              },
              {
                step: 3,
                icon: Target,
                title: 'Enter Your Stableford Scores',
                desc: 'Log your last 5 Stableford scores (1–45 points each). One score per date, automatically rolling.',
                details: ['Scores range 1–45 (Stableford format)', 'Oldest score replaced when 6th added', 'Scores are your draw numbers'],
                color: 'violet',
              },
              {
                step: 4,
                icon: Trophy,
                title: 'Enter the Monthly Draw',
                desc: 'Every month, 5 numbers are drawn. Match 3, 4, or 5 of your scores to win a prize tier.',
                details: ['5-Match: 40% of prize pool (Jackpot)', '4-Match: 35% of prize pool', '3-Match: 25% of prize pool'],
                color: 'amber',
              },
            ].map(({ step, icon: Icon, title, desc, details, color }) => (
              <div key={step} className="flex gap-6">
                <div className={`w-12 h-12 bg-${color}-100 rounded-2xl flex items-center justify-center shrink-0 mt-1`}>
                  <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
                <div>
                  <div className={`text-xs font-bold text-${color}-600 mb-1`}>STEP {step}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-500 mb-3">{desc}</p>
                  <ul className="space-y-1">
                    {details.map(d => (
                      <li key={d} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className={`w-4 h-4 text-${color}-500 shrink-0`} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prize Pool Breakdown */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Prize Pool Breakdown</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6 text-center mb-6">
                {[
                  { label: 'Jackpot (5-Match)', pct: '40%', desc: 'Rolls over if unclaimed', highlight: true },
                  { label: '4-Number Match', pct: '35%', desc: 'Split among all 4-match winners' },
                  { label: '3-Number Match', pct: '25%', desc: 'Split among all 3-match winners' },
                ].map(({ label, pct, desc, highlight }) => (
                  <div key={label} className={`p-4 rounded-2xl ${highlight ? 'bg-amber-50 border-2 border-amber-300' : 'bg-slate-50'}`}>
                    <div className={`text-3xl font-black mb-1 ${highlight ? 'text-amber-600' : 'text-slate-900'}`}>{pct}</div>
                    <div className="font-semibold text-slate-900 mb-1">{label}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 text-center">
                The prize pool is automatically calculated from subscription fees each month.
                If there is no 5-match winner, the jackpot rolls over to the next draw.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Winner Verification */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Winner Verification</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Winners Verified', desc: 'Only draw winners need to verify — submit a screenshot from your golf platform.' },
              { icon: CheckCircle2, title: 'Admin Review', desc: 'Our team reviews all submissions within 1-2 business days.' },
              { icon: Zap, title: 'Fast Payout', desc: 'Approved winners receive payment directly to their bank account.' },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/signup">
            <Button size="xl" className="gap-3">
              Join GreenHeart Today <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

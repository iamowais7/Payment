'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Heart, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Charity } from '@/types/database'

function SubscribeForm() {
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<'monthly' | 'yearly'>(
    (searchParams.get('plan') as 'monthly' | 'yearly') || 'monthly'
  )
  const [charityId, setCharityId] = useState('')
  const [charityPct, setCharityPct] = useState(10)
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    ;(supabase as any).from('charities').select('*').eq('is_active', true).then(({ data }: { data: Charity[] | null }) => {
      if (data) setCharities(data)
    })
  }, [])

  async function handleSubscribe() {
    setLoading(true)
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, charityId, charityPercentage: charityPct }),
    })
    const { url, error } = await res.json()
    if (error) { alert(error); setLoading(false); return }
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Heart className="w-12 h-12 text-emerald-400 fill-emerald-400/30 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">Choose Your Plan</h1>
          <p className="text-slate-400">Join the GreenHeart community</p>
        </div>

        {/* Plan selector */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {(['monthly', 'yearly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                plan === p
                  ? 'border-emerald-500 bg-emerald-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="text-white font-bold capitalize mb-1">{p}</div>
              <div className="text-2xl font-black text-white mb-1">
                {p === 'monthly' ? '€19.99' : '€199.99'}
              </div>
              <div className="text-slate-400 text-sm">
                {p === 'monthly' ? 'per month' : 'per year (save 17%)'}
              </div>
              {p === 'yearly' && (
                <div className="mt-2 inline-block px-2 py-0.5 bg-amber-500/30 text-amber-300 text-xs rounded-full font-semibold">
                  Best Value
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Charity selection */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-400" />
            Choose Your Charity
          </h3>
          <div className="space-y-2 mb-4">
            {charities.map(charity => (
              <button
                key={charity.id}
                onClick={() => setCharityId(charity.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  charityId === charity.id
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                }`}
              >
                <div className="font-medium">{charity.name}</div>
                <div className="text-xs opacity-70">{charity.short_description}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">
              Contribution: <span className="text-emerald-400 font-bold">{charityPct}%</span>
              {' '}(min. 10%)
            </label>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={charityPct}
              onChange={e => setCharityPct(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>10%</span><span>30%</span><span>50%</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-white font-bold mb-4">Summary</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Plan', value: plan === 'monthly' ? '€19.99/month' : '€199.99/year' },
              { label: 'Charity Contribution', value: `${charityPct}% of subscription` },
              { label: 'Prize Pool Share', value: '~30% of subscription' },
              { label: 'Draw Entries', value: 'Monthly automatic entry' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-slate-300">
                <span>{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubscribe}
          loading={loading}
          size="lg"
          className="w-full gap-3"
        >
          <CreditCard className="w-5 h-5" />
          Continue to Payment
        </Button>
        <p className="text-center text-xs text-slate-500 mt-3">
          Secured by Stripe · Cancel anytime
        </p>
      </div>
    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900" />}>
      <SubscribeForm />
    </Suspense>
  )
}

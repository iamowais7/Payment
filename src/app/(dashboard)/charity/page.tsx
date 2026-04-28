'use client'

import { useState, useEffect } from 'react'
import { Heart, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Charity } from '@/types/database'

export default function CharityPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [selected, setSelected] = useState<{ charity_id: string; contribution_percentage: number } | null>(null)
  const [charityId, setCharityId] = useState('')
  const [pct, setPct] = useState(10)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const [charitiesRes, selectionRes] = await Promise.all([
        fetch('/api/charities'),
        fetch('/api/charity-selection'),
      ])
      const { charities: c } = await charitiesRes.json()
      const { selection } = await selectionRes.json()
      setCharities(c ?? [])
      if (selection) {
        setSelected(selection)
        setCharityId(selection.charity_id ?? '')
        setPct(selection.contribution_percentage ?? 10)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!charityId) { alert('Please select a charity'); return }
    setSaving(true)
    setSuccess(false)
    const res = await fetch('/api/charity-selection', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charity_id: charityId, contribution_percentage: pct }),
    })
    if (res.ok) setSuccess(true)
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Charity</h1>
        <p className="text-slate-500 mt-1">Select the charity your subscription supports</p>
      </div>

      {/* Info */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800">
        <strong>How it works:</strong> A minimum of 10% of your subscription fee is automatically donated to your chosen charity each month.
        You can increase your contribution up to 50%.
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Charity Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-600" />
                Choose Your Charity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {charities.map(charity => (
                <button
                  key={charity.id}
                  onClick={() => setCharityId(charity.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    charityId === charity.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        charityId === charity.id ? 'bg-emerald-500' : 'bg-slate-100'
                      }`}>
                        {charityId === charity.id
                          ? <CheckCircle2 className="w-4 h-4 text-white" />
                          : <Heart className="w-4 h-4 text-slate-400" />
                        }
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{charity.name}</div>
                        <div className="text-xs text-slate-500">{charity.short_description}</div>
                      </div>
                    </div>
                    {charity.is_featured && (
                      <Badge variant="default" className="text-xs">Featured</Badge>
                    )}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Contribution Slider */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Contribution Percentage</h3>
                <span className="text-2xl font-black text-emerald-600">{pct}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={pct}
                onChange={e => setPct(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>10% (min)</span>
                <span>30%</span>
                <span>50% (max)</span>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                You&apos;ll donate approximately{' '}
                <strong className="text-emerald-600">
                  €{((19.99 * pct) / 100).toFixed(2)}
                </strong>
                {' '}per month to your chosen charity.
              </p>
            </CardContent>
          </Card>

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Charity selection saved successfully!
            </div>
          )}

          <Button onClick={handleSave} loading={saving} className="w-full">
            Save Charity Selection
          </Button>
        </>
      )}
    </div>
  )
}

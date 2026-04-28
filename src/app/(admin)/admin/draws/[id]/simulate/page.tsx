'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Play, Users, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function SimulateDrawPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function handleSimulate() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/admin/draws/${id}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Simulation failed')
      setLoading(false)
      return
    }
    setResult(data)
    setLoading(false)
  }

  async function handlePublish() {
    setLoading(true)
    const res = await fetch(`/api/admin/draws/${id}/publish`, { method: 'POST' })
    if (res.ok) {
      router.push('/admin/draws')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Publish failed')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Simulate & Publish Draw</h1>
        <p className="text-slate-500 mt-1">Run the draw simulation before publishing results</p>
      </div>

      {!result ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-6 animate-float" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to Simulate</h3>
            <p className="text-slate-500 text-sm mb-6">
              This will generate winning numbers and calculate all potential winners
              based on current subscriber scores. Review before publishing.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}
            <Button onClick={handleSimulate} loading={loading} size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Run Simulation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Winning Numbers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Winning Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {result.winningNumbers.map((n: number) => (
                  <div
                    key={n}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-xl flex items-center justify-center shadow-lg"
                  >
                    {n}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prize Pools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Prize Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Jackpot (5-Match)', value: result.pools.fiveMatch, pct: '40%' },
                { label: '4-Number Match', value: result.pools.fourMatch, pct: '35%' },
                { label: '3-Number Match', value: result.pools.threeMatch, pct: '25%' },
              ].map(({ label, value, pct }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{label}</div>
                    <div className="text-xs text-slate-400">{pct} of pool</div>
                  </div>
                  <div className="font-bold text-slate-900">{formatCurrency(value)}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Winners Summary */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-emerald-600" />
                <div>
                  <div className="text-2xl font-black text-slate-900">{result.winners}</div>
                  <div className="text-slate-500 text-sm">Total Winners Found</div>
                </div>
              </div>

              {result.winners === 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                  No 5-match winner — jackpot will roll over to next month
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handlePublish} loading={loading} size="lg" className="flex-1 gap-2">
              <Trophy className="w-4 h-4" />
              Publish Results
            </Button>
            <Button
              variant="outline"
              onClick={handleSimulate}
              loading={loading}
              className="flex-1"
            >
              Re-Simulate
            </Button>
          </div>
          <p className="text-center text-xs text-slate-400">
            Publishing is irreversible. Winners will be notified by email.
          </p>
        </div>
      )}
    </div>
  )
}

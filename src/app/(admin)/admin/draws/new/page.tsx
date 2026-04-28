'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function NewDrawPage() {
  const router = useRouter()
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random')
  const [prizePercent, setPrizePercent] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draw_month: parseInt(month),
        draw_year: parseInt(year),
        draw_type: drawType,
        prize_pool_percentage: prizePercent,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to create draw')
      setLoading(false)
      return
    }
    router.push('/admin/draws')
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Create New Draw</h1>
        <p className="text-slate-500 mt-1">Configure the monthly draw parameters</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2025, 2026, 2027].map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Draw Logic</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['random', 'algorithmic'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setDrawType(type)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    drawType === type
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold capitalize text-sm text-slate-900">{type}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {type === 'random'
                      ? 'Standard lottery-style random draw'
                      : 'Weighted by most/least frequent scores'
                    }
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prize Pool from Subscriptions: <strong className="text-emerald-600">{prizePercent}%</strong></Label>
            <input
              type="range"
              min={20}
              max={50}
              step={5}
              value={prizePercent}
              onChange={e => setPrizePercent(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-xs text-slate-400">
              Distribution: Jackpot (40%) + 4-Match (35%) + 3-Match (25%)
            </p>
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleCreate} loading={loading} className="flex-1">
              Create Draw
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

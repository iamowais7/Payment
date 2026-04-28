'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Target, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import type { GolfScore } from '@/types/database'

export default function ScoresPage() {
  const [scores, setScores] = useState<GolfScore[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editScore, setEditScore] = useState<GolfScore | null>(null)
  const [form, setForm] = useState({ score: '', score_date: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadScores() {
    const res = await fetch('/api/scores')
    const { scores: data } = await res.json()
    setScores(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadScores() }, [])

  function openAdd() {
    setEditScore(null)
    setForm({ score: '', score_date: new Date().toISOString().split('T')[0] })
    setError('')
    setDialogOpen(true)
  }

  function openEdit(score: GolfScore) {
    setEditScore(score)
    setForm({ score: String(score.score), score_date: score.score_date })
    setError('')
    setDialogOpen(true)
  }

  async function handleSave() {
    setError('')
    const s = parseInt(form.score)
    if (!s || s < 1 || s > 45) {
      setError('Score must be between 1 and 45')
      return
    }
    if (!form.score_date) {
      setError('Date is required')
      return
    }

    setSaving(true)
    const url = editScore ? `/api/scores/${editScore.id}` : '/api/scores'
    const method = editScore ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: s, score_date: form.score_date }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to save score')
      setSaving(false)
      return
    }

    setDialogOpen(false)
    setSaving(false)
    await loadScores()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this score?')) return
    await fetch(`/api/scores/${id}`, { method: 'DELETE' })
    await loadScores()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Golf Scores</h1>
          <p className="text-slate-500 mt-1">Track up to 5 Stableford scores (1–45 points)</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Score
        </Button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-emerald-800 text-sm">
          Only your <strong>5 most recent scores</strong> are kept. A new score automatically replaces the oldest.
          One score per date — you can edit or delete an existing score for a date.
        </p>
      </div>

      {/* Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5 text-emerald-600" />
            Score History ({scores.length}/5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">No scores yet</h3>
              <p className="text-slate-400 text-sm mb-4">
                Add your Stableford scores to enter the monthly draw
              </p>
              <Button onClick={openAdd} size="sm">Add First Score</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {scores.map((score, i) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">{formatDate(score.score_date)}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {i === 0 ? 'Most recent' : `${i + 1} score`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-black text-slate-900">{score.score}</div>
                    <div className="text-xs text-slate-400">pts</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(score)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(score.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stableford Guide */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-slate-900 mb-3 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Stableford Score Guide
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            {[
              { score: '0', label: 'No points (missed hole)' },
              { score: '1', label: 'Bogey (par + 1)' },
              { score: '2', label: 'Par' },
              { score: '3', label: 'Birdie (par − 1)' },
              { score: '4', label: 'Eagle (par − 2)' },
              { score: '5+', label: 'Double eagle+' },
            ].map(({ score, label }) => (
              <div key={score} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                <span className="font-bold text-emerald-600">{score}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editScore ? 'Edit Score' : 'Add New Score'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Stableford Score (1–45)</Label>
              <Input
                type="number"
                min={1}
                max={45}
                value={form.score}
                onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                placeholder="Enter your score"
                error={error.includes('Score') ? error : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label>Date Played</Label>
              <Input
                type="date"
                value={form.score_date}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, score_date: e.target.value }))}
                error={error.includes('Date') ? error : undefined}
              />
            </div>
            {error && !error.includes('Score') && !error.includes('Date') && (
              <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                loading={saving}
                className="flex-1"
              >
                {editScore ? 'Update Score' : 'Add Score'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

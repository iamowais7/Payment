'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewCharityPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    short_description: '',
    description: '',
    website_url: '',
    is_featured: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.name || !form.short_description) {
      setError('Name and short description are required')
      return
    }
    setLoading(true)
    const res = await fetch('/api/admin/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, is_active: true }),
    })
    if (res.ok) {
      router.push('/admin/charities')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to create charity')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Add New Charity</h1>
        <p className="text-slate-500 mt-1">Add a charity to the platform directory</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Charity Name *</Label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Irish Heart Foundation"
            />
          </div>
          <div className="space-y-2">
            <Label>Short Description *</Label>
            <Input
              value={form.short_description}
              onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
              placeholder="One-line description for the directory listing"
            />
          </div>
          <div className="space-y-2">
            <Label>Full Description</Label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Detailed description of the charity's mission and work..."
              rows={4}
              className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Website URL</Label>
            <Input
              type="url"
              value={form.website_url}
              onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
              placeholder="https://charity.ie"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
              className="accent-amber-500 w-4 h-4"
            />
            <span className="text-sm font-medium text-slate-700">Featured on homepage</span>
          </label>

          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleSubmit} loading={loading} className="flex-1">Add Charity</Button>
            <Button variant="outline" onClick={() => router.back()} className="flex-1">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

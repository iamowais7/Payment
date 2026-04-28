'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Globe, AlertTriangle } from 'lucide-react'

export default function PublishDrawPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Publish Draw Results</h1>
        <p className="text-slate-500 mt-1">Make draw results visible to subscribers</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm">
              Publishing is <strong>irreversible</strong>. All winners will be notified by email
              and results will be visible to all subscribers.
            </p>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handlePublish} loading={loading} className="flex-1 gap-2">
              <Globe className="w-4 h-4" />
              Publish Results
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

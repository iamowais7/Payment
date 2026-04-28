'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function VerificationActions({
  verificationId,
  resultId,
}: {
  verificationId: string
  resultId: string
}) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()

  async function handle(action: 'approve' | 'reject') {
    setLoading(action)
    await fetch(`/api/admin/verifications/${verificationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, resultId }),
    })
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => handle('approve')}
        loading={loading === 'approve'}
        className="gap-1 bg-emerald-600 hover:bg-emerald-700"
      >
        <CheckCircle2 className="w-3 h-3" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handle('reject')}
        loading={loading === 'reject'}
        className="gap-1"
      >
        <XCircle className="w-3 h-3" />
        Reject
      </Button>
    </div>
  )
}

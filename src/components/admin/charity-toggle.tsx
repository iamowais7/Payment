'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CharityToggle({
  id,
  isActive,
  isFeatured,
}: {
  id: string
  isActive: boolean
  isFeatured: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle(field: 'is_active' | 'is_featured', value: boolean) {
    setLoading(true)
    await fetch(`/api/admin/charities/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-1 shrink-0">
      <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => toggle('is_active', e.target.checked)}
          disabled={loading}
          className="accent-emerald-500"
        />
        Active
      </label>
      <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={e => toggle('is_featured', e.target.checked)}
          disabled={loading}
          className="accent-amber-500"
        />
        Featured
      </label>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Upload, CheckCircle2, FileImage } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyWinningPage() {
  const router = useRouter()
  const { resultId } = useParams()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    setFile(f)
    setError('')
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  async function handleSubmit() {
    if (!file) { setError('Please upload a screenshot'); return }
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('resultId', resultId as string)

    const res = await fetch('/api/verifications', { method: 'POST', body: formData })
    if (res.ok) {
      setSuccess(true)
    } else {
      const { error: e } = await res.json()
      setError(e ?? 'Upload failed')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center pt-12">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Submitted!</h2>
        <p className="text-slate-500 mb-6">
          Our team will review your proof within 1-2 business days.
          You'll be notified by email once reviewed.
        </p>
        <Button onClick={() => router.push('/winnings')}>Back to Winnings</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Submit Verification</h1>
        <p className="text-slate-500 mt-1">Upload a screenshot from your golf platform to claim your prize</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>Please upload a screenshot showing:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Your scores from your official golf platform</li>
            <li>The dates corresponding to your submitted scores</li>
            <li>Your name visible in the screenshot</li>
          </ul>
          <p className="text-amber-600 font-medium mt-2">
            Accepted formats: JPG, PNG, WebP
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
          }`}>
            {preview ? (
              <img src={preview} alt="Preview" className="h-40 object-contain rounded-xl" />
            ) : (
              <>
                <FileImage className="w-12 h-12 text-slate-300 mb-3" />
                <span className="text-slate-500 text-sm font-medium">Click to upload screenshot</span>
                <span className="text-slate-400 text-xs mt-1">PNG, JPG, WebP up to 10MB</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          {error && (
            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} loading={loading} disabled={!file} className="flex-1 gap-2">
          <Upload className="w-4 h-4" />
          Submit Verification
        </Button>
        <Button variant="outline" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}

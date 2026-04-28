import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  const resultId = formData.get('resultId') as string

  if (!file || !resultId) {
    return NextResponse.json({ error: 'File and result ID required' }, { status: 400 })
  }

  const db = supabase as any

  // Verify the draw result belongs to this user
  const { data: result } = await db
    .from('draw_results')
    .select('id')
    .eq('id', resultId)
    .eq('user_id', user.id)
    .single()

  if (!result) return NextResponse.json({ error: 'Result not found' }, { status: 404 })

  // Upload to Supabase Storage
  const fileName = `verifications/${user.id}/${resultId}-${Date.now()}.${file.name.split('.').pop()}`
  const { error: uploadError } = await supabase.storage
    .from('winner-proofs')
    .upload(fileName, file, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('winner-proofs')
    .getPublicUrl(fileName)

  // Create verification record
  const { data, error } = await db
    .from('winner_verifications')
    .insert({
      draw_result_id: resultId,
      user_id: user.id,
      proof_url: publicUrl,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ verification: data }, { status: 201 })
}

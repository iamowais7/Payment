import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const db = supabase as any
  const { data: p } = await db.from('profiles').select('role, id').eq('id', user.id).single()
  return p?.role === 'admin' ? (p as { role: string; id: string }) : null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const admin = await assertAdmin(supabase)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { action, resultId, adminNotes } = await request.json()

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const db = supabase as any

  const { error: vError } = await db
    .from('winner_verifications')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      admin_notes: adminNotes ?? null,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (vError) return NextResponse.json({ error: vError.message }, { status: 500 })

  if (action === 'approve' && resultId) {
    await db.from('draw_results').update({ payment_status: 'paid' }).eq('id', resultId)
  } else if (action === 'reject' && resultId) {
    await db.from('draw_results').update({ payment_status: 'rejected' }).eq('id', resultId)
  }

  return NextResponse.json({ success: true })
}

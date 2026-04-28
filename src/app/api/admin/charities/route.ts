import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const db = supabase as any
  const { data: p } = await db.from('profiles').select('role').eq('id', user.id).single()
  return p?.role === 'admin'
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { name, short_description, description, website_url, is_featured, is_active } = body

  if (!name || !short_description) {
    return NextResponse.json({ error: 'Name and short description required' }, { status: 400 })
  }

  const db = supabase as any
  const { data, error } = await db
    .from('charities')
    .insert({ name, short_description, description, website_url, is_featured: !!is_featured, is_active: !!is_active })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ charity: data }, { status: 201 })
}

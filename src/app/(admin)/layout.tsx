import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import type { Profile } from '@/types/database'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as Profile | null

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar profile={profile} />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  )
}

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={profile} />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}

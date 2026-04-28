import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import type { Charity } from '@/types/database'

export default async function CharitiesPage() {
  const supabase = await createClient()
  const { data: charitiesRaw } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('name')

  const charities = (charitiesRaw ?? []) as Charity[]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="w-12 h-12 text-emerald-400 fill-emerald-400/30 mx-auto mb-6" />
          <h1 className="text-4xl font-black text-white mb-4">Our Charity Partners</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Every GreenHeart subscription automatically contributes to the charity you choose.
            Minimum 10% of your subscription — you choose the percentage.
          </p>
        </div>
      </div>

      {/* Charities Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(charities ?? []).map(charity => (
            <Link key={charity.id} href={`/charities/${charity.id}`}>
              <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Heart className="w-6 h-6 text-emerald-600 fill-emerald-200" />
                    </div>
                    {charity.is_featured && (
                      <Badge variant="gold">Featured</Badge>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">{charity.name}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                    {charity.short_description}
                  </p>
                  {(charity.upcoming_events as any[])?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-emerald-600 font-semibold">
                        {(charity.upcoming_events as any[]).length} upcoming event{(charity.upcoming_events as any[]).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {(!charities || charities.length === 0) && (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400">No charities listed yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}

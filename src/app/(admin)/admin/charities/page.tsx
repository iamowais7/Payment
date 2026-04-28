import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CharityToggle } from '@/components/admin/charity-toggle'
import type { Charity } from '@/types/database'

export default async function AdminCharitiesPage() {
  const supabase = await createClient()

  const { data: charitiesRaw } = await supabase
    .from('charities')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('name')

  const charities = (charitiesRaw ?? []) as Charity[]

  // Count subscribers per charity
  const { data: selectionCounts } = await supabase
    .from('charity_selections')
    .select('charity_id')

  const countMap: Record<string, number> = {}
  for (const s of (selectionCounts ?? []) as Array<{ charity_id: string | null }>) {
    if (s.charity_id) {
      countMap[s.charity_id] = (countMap[s.charity_id] ?? 0) + 1
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Charity Management</h1>
          <p className="text-slate-500 mt-1">{charities?.length ?? 0} charities in directory</p>
        </div>
        <Link href="/admin/charities/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Charity
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {(charities ?? []).map(charity => (
          <Card key={charity.id} className={!charity.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-emerald-600 fill-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{charity.name}</h3>
                    <div className="flex gap-1.5 mt-1">
                      {charity.is_featured && <Badge variant="gold" className="text-xs">Featured</Badge>}
                      <Badge variant={charity.is_active ? 'default' : 'secondary'} className="text-xs">
                        {charity.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CharityToggle id={charity.id} isActive={charity.is_active} isFeatured={charity.is_featured} />
              </div>

              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{charity.short_description}</p>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {countMap[charity.id] ?? 0} supporters
                </span>
                {charity.website_url && (
                  <a href={charity.website_url} target="_blank" rel="noopener noreferrer"
                     className="text-emerald-600 hover:underline">
                    Website
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

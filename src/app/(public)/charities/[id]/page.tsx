import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Heart, ExternalLink, Calendar, MapPin, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Charity } from '@/types/database'

export default async function CharityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: charityRaw } = await supabase
    .from('charities')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  const charity = charityRaw as Charity | null

  if (!charity) notFound()

  const events = ((charity as any).upcoming_events as any[]) ?? []

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/charities" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            All Charities
          </Link>
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center shrink-0">
              <Heart className="w-8 h-8 text-emerald-400 fill-emerald-400/30" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-white">{charity.name}</h1>
                {charity.is_featured && <Badge variant="gold">Featured Partner</Badge>}
              </div>
              <p className="text-slate-300 text-lg">{charity.short_description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {charity.description && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">About {charity.name}</h2>
                  <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {charity.description}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Events */}
            {events.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    Upcoming Events
                  </h2>
                  <div className="space-y-4">
                    {events.map((event: any, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {new Date(event.date).getDate()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{event.name}</div>
                          <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(event.date)}
                          </div>
                          {event.location && (
                            <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white">
              <CardContent className="p-6 text-center">
                <Heart className="w-10 h-10 fill-white/30 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Support {charity.name}</h3>
                <p className="text-emerald-100 text-sm mb-4">
                  Subscribe to GreenHeart and direct minimum 10% of your subscription here.
                </p>
                <Link href={`/signup?charity=${charity.id}`}>
                  <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                    Subscribe & Support
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {charity.website_url && (
              <Card>
                <CardContent className="p-4">
                  <a
                    href={charity.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit {charity.name} website
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { User, CreditCard, Bell, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const [{ data: pRaw }, { data: sRaw }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
      ])
      const p = pRaw as any
      const s = sRaw as any
      setProfile(p)
      setSubscription(s)
      setFullName(p?.full_name ?? '')
      setPhone(p?.phone ?? '')
    })
  }, [])

  async function handleSaveProfile() {
    setSaving(true)
    setSuccess(false)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await (supabase.from('profiles') as any).update({ full_name: fullName, phone }).eq('id', user.id)
    setSaving(false)
    setSuccess(true)
  }

  async function handleManageSubscription() {
    setPortalLoading(true)
    const res = await fetch('/api/stripe/create-portal', { method: 'POST' })
    const { url, error } = await res.json()
    if (error) { alert(error); setPortalLoading(false); return }
    window.location.href = url
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email ?? ''} disabled className="opacity-60" />
            <p className="text-xs text-slate-400">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+353 xxx xxx xxx"
            />
          </div>
          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              Profile updated!
            </div>
          )}
          <Button onClick={handleSaveProfile} loading={saving} className="w-full">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-xs mb-1">Plan</div>
                  <div className="font-semibold capitalize">{subscription.plan}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-xs mb-1">Status</div>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'warning'}>
                    {subscription.status}
                  </Badge>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-xs mb-1">Amount</div>
                  <div className="font-semibold">{formatCurrency(subscription.amount_cents)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-xs mb-1">Renews</div>
                  <div className="font-semibold text-xs">
                    {subscription.current_period_end ? formatDate(subscription.current_period_end) : '—'}
                  </div>
                </div>
              </div>
              {subscription.cancel_at_period_end && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                  ⚠️ Your subscription will cancel at the end of the current period.
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                loading={portalLoading}
                className="w-full"
              >
                Manage Subscription via Stripe
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm mb-3">No active subscription</p>
              <a href="/subscribe">
                <Button size="sm">Subscribe Now</Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Draw results', desc: 'Get notified when monthly draws are published' },
            { label: 'Winner alerts', desc: 'Know immediately when you win' },
            { label: 'Subscription reminders', desc: 'Renewal and payment updates' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
              <div>
                <div className="text-sm font-medium text-slate-900">{label}</div>
                <div className="text-xs text-slate-400">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Target, Trophy, Heart, Award, Settings,
  LogOut, ChevronRight, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import type { Profile, Subscription } from '@/types/database'

interface SidebarProps {
  profile: Profile | null
  subscription: Subscription | null
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scores', label: 'My Scores', icon: Target },
  { href: '/draws', label: 'Draws & Results', icon: Trophy },
  { href: '/charity', label: 'My Charity', icon: Heart },
  { href: '/winnings', label: 'My Winnings', icon: Award },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar({ profile, subscription }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const statusColor = subscription?.status === 'active' ? 'default' : 'warning'
  const statusLabel = subscription?.status === 'active'
    ? 'Active'
    : subscription?.status === 'cancelled'
    ? 'Cancelled'
    : subscription?.status === 'lapsed'
    ? 'Lapsed'
    : 'Inactive'

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-black text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            GreenHeart
          </span>
        </Link>
      </div>

      {/* Profile */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 text-sm truncate">
              {profile?.full_name ?? 'Golfer'}
            </div>
            <Badge variant={statusColor} className="text-xs mt-0.5">{statusLabel}</Badge>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive(href)
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive(href) ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            {label}
            {isActive(href) && <ChevronRight className="w-3 h-3 ml-auto text-emerald-400" />}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 w-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex-col z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-100 px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-black text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            GreenHeart
          </span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-slate-100">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}

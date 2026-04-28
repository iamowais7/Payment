'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Trophy, Heart, Award, BarChart3,
  LogOut, ChevronRight, Menu, X, Shield
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/draws', label: 'Draw Management', icon: Trophy },
  { href: '/admin/charities', label: 'Charities', icon: Heart },
  { href: '/admin/winners', label: 'Winners', icon: Award },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

export function AdminSidebar({ profile }: { profile: Profile }) {
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
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg text-white">Admin Panel</span>
        </div>
        <div className="mt-3 text-slate-400 text-xs">{profile.email}</div>
      </div>

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

      <div className="p-4 border-t border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 mb-1">
          <LayoutDashboard className="w-4 h-4" />
          User Dashboard
        </Link>
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
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex-col z-30">
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900 px-4 h-16 flex items-center justify-between">
        <span className="font-black text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Admin Panel
        </span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-slate-700 text-white">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

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

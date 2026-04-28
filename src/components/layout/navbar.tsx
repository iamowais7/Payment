'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Heart, Trophy, LogOut, LayoutDashboard, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

interface NavbarProps {
  user?: Profile | null
}

export function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/charities', label: 'Charities', icon: Heart },
    { href: '/how-it-works', label: 'How It Works', icon: Trophy },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-black text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              GreenHeart
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                  pathname === href ? 'text-emerald-600' : 'text-slate-600'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">Admin</Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700"
              onClick={() => setOpen(false)}
            >
              <Icon className="w-4 h-4 text-emerald-600" />
              {label}
            </Link>
          ))}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <button
                  onClick={() => { setOpen(false); handleSignOut() }}
                  className="w-full flex items-center gap-2 justify-center text-sm text-red-500 py-2 rounded-xl hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

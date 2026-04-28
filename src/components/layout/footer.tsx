import Link from 'next/link'
import { Heart, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-black text-xl text-white">GreenHeart</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Where golf meets generosity. Track your Stableford scores, enter monthly prize draws, and make a real difference for causes you care about.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="mailto:hello@greenheart.ie" className="text-slate-500 hover:text-emerald-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/charities', label: 'Our Charities' },
                { href: '/signup', label: 'Subscribe' },
                { href: '/login', label: 'Sign In' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-emerald-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/responsible-play', label: 'Responsible Play' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-emerald-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} GreenHeart. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for golfers who give back
          </p>
        </div>
      </div>
    </footer>
  )
}

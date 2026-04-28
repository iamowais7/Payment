import Link from 'next/link'
import { CheckCircle2, Trophy, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SubscribeSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-8">
          <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto" />
        </div>

        <h1 className="text-3xl font-black text-white mb-4">
          You&apos;re In! 🎉
        </h1>
        <p className="text-slate-300 text-lg mb-8">
          Welcome to GreenHeart. Your subscription is active — enter your scores to join the next monthly draw!
        </p>

        <div className="glass rounded-2xl p-6 mb-8 text-left space-y-3">
          {[
            'Enter your 5 Stableford scores',
            'Select your charity if you haven\'t already',
            'You\'re automatically entered in the next monthly draw',
            'Track your winnings in your dashboard',
          ].map(step => (
            <div key={step} className="flex items-center gap-3 text-slate-300 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {step}
            </div>
          ))}
        </div>

        <Link href="/dashboard">
          <Button size="lg" className="w-full gap-2">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

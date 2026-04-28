import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GreenHeart — Play Golf. Win Big. Give Back.',
  description: 'Subscribe, track your golf scores, enter monthly prize draws, and support charities you care about.',
  keywords: ['golf', 'charity', 'prize draw', 'Stableford', 'subscription'],
  openGraph: {
    title: 'GreenHeart — Play Golf. Win Big. Give Back.',
    description: 'Where golf meets charity. Monthly prize draws for subscribers.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth h-full">
      <body className="bg-slate-50 text-slate-900 min-h-full antialiased">
        {children}
      </body>
    </html>
  )
}

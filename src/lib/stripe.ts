import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia' as any,
  typescript: true,
})

export const PLANS = {
  monthly: {
    name: 'Monthly',
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 1999,
    currency: 'eur',
    interval: 'month' as const,
  },
  yearly: {
    name: 'Yearly',
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    amount: 19999,
    currency: 'eur',
    interval: 'year' as const,
  },
}

export const SUBSCRIPTION_CONTRIBUTION_CENTS = {
  monthly: 1999,
  yearly: Math.round(19999 / 12),
}

export const PRIZE_POOL_PERCENTAGE = 0.3

export const POOL_DISTRIBUTION = {
  fiveMatch: 0.4,
  fourMatch: 0.35,
  threeMatch: 0.25,
}

export const CHARITY_MIN_PERCENTAGE = 10

import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan, charityId, charityPercentage } = await request.json()
  const planConfig = PLANS[plan as keyof typeof PLANS]

  if (!planConfig) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const db = supabase as any
  const { data: profile } = await db
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .single()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: profile?.email ?? user.email!,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?cancelled=true`,
    metadata: {
      userId: user.id,
      plan,
      charityId: charityId ?? '',
      charityPercentage: String(charityPercentage ?? 10),
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        plan,
      },
    },
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}

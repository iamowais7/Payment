import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const userId = session.metadata?.userId
      const plan = (session.metadata?.plan ?? 'monthly') as 'monthly' | 'yearly'
      const charityId = session.metadata?.charityId
      const charityPct = parseInt(session.metadata?.charityPercentage ?? '10')

      if (!userId) break

      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      const planConfig = PLANS[plan]

      // Use billing_cycle_anchor for period info in newer Stripe API
      const subAny = sub as any
      const periodStart = subAny.current_period_start ?? subAny.billing_cycle_anchor ?? Math.floor(Date.now() / 1000)
      const periodEnd = subAny.current_period_end ?? (periodStart + (plan === 'yearly' ? 31536000 : 2592000))

      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          plan,
          status: 'active' as const,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          stripe_price_id: sub.items.data[0].price.id,
          current_period_start: new Date(periodStart * 1000).toISOString(),
          current_period_end: new Date(periodEnd * 1000).toISOString(),
          amount_cents: planConfig.amount,
          currency: planConfig.currency,
          cancel_at_period_end: false,
        } as any,
        { onConflict: 'user_id' }
      )

      if (charityId) {
        await supabase.from('charity_selections').upsert(
          { user_id: userId, charity_id: charityId, contribution_percentage: charityPct } as any,
          { onConflict: 'user_id' }
        )
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const subAny = sub as any
      const userId = sub.metadata?.userId
      if (!userId) break

      const periodStart = subAny.current_period_start ?? subAny.billing_cycle_anchor
      const periodEnd = subAny.current_period_end

      await (supabase.from('subscriptions') as any).update({
        status: sub.status === 'active' ? 'active' : sub.status === 'canceled' ? 'cancelled' : 'lapsed',
        ...(periodStart && { current_period_start: new Date(periodStart * 1000).toISOString() }),
        ...(periodEnd && { current_period_end: new Date(periodEnd * 1000).toISOString() }),
        cancel_at_period_end: subAny.cancel_at_period_end ?? false,
      }).eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await (supabase.from('subscriptions') as any).update({
        status: 'cancelled',
        cancel_at_period_end: false,
      }).eq('stripe_subscription_id', sub.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const invoiceAny = invoice as any
      const subId: string | undefined = invoiceAny.subscription ?? invoiceAny.parent?.subscription_details?.subscription
      if (subId) {
        await (supabase.from('subscriptions') as any).update({ status: 'lapsed' }).eq('stripe_subscription_id', subId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

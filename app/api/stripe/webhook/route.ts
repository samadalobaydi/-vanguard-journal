import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      // ── Checkout completed (first-time subscription) ────────────────────────
      case 'checkout.session.completed': {
        const thin = event.data.object as { id: string }
        const session = await stripe.checkout.sessions.retrieve(thin.id)

        const userId = session.metadata?.userId
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
        const customerEmail = session.customer_details?.email ?? undefined

        if (userId) {
          await supabase.from('profiles').upsert({
            id: userId,
            email: customerEmail,
            subscription_status: 'active',
            stripe_customer_id: customerId,
          })
        }
        break
      }

      // ── Primary payment confirmation ────────────────────────────────────────
      case 'payment_intent.succeeded': {
        // v2 thin events: event.data.object only has {id, object} — retrieve the full object
        const thin = event.data.object as { id: string }
        const pi = await stripe.paymentIntents.retrieve(thin.id)

        const userId = pi.metadata?.userId
        const priceId = pi.metadata?.priceId
        const customerId = typeof pi.customer === 'string' ? pi.customer : pi.customer?.id

        // Update profile by userId (most reliable) or fall back to stripe_customer_id
        if (userId) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'active' })
            .eq('id', userId)
        } else if (customerId) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'active' })
            .eq('stripe_customer_id', customerId)
        }

        // Create the subscription now that payment is confirmed
        if (priceId && customerId) {
          await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            metadata: { supabase_user_id: userId ?? '' },
          })
        }
        break
      }

      // ── Recurring invoice paid (subscription renewal) ───────────────────────
      case 'invoice.payment_succeeded': {
        const thin = event.data.object as { id: string }
        const invoice = await stripe.invoices.retrieve(thin.id)
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

        if (customerId) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'active' })
            .eq('stripe_customer_id', customerId)
        }
        break
      }

      // ── Subscription lifecycle ──────────────────────────────────────────────
      case 'customer.subscription.updated': {
        const thin = event.data.object as { id: string }
        const subscription = await stripe.subscriptions.retrieve(thin.id)
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

        await supabase
          .from('profiles')
          .update({ subscription_status: subscription.status })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const thin = event.data.object as { id: string }
        const subscription = await stripe.subscriptions.retrieve(thin.id)
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

        await supabase
          .from('profiles')
          .update({ subscription_status: 'inactive' })
          .eq('stripe_customer_id', customerId)
        break
      }

      // ── Failed payment ──────────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const thin = event.data.object as { id: string }
        const invoice = await stripe.invoices.retrieve(thin.id)
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

        if (customerId) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_customer_id', customerId)
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Error handling webhook event:', err)
    return NextResponse.json({ error: 'Internal error processing webhook' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

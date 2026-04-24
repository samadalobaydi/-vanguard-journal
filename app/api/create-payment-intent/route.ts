import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Retrieve or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from('profiles')
      .upsert({ id: user.id, email: user.email, stripe_customer_id: customerId })
  }

  // Create a SetupIntent for subscription — we collect the payment method
  // then create the subscription on the webhook after payment succeeds.
  // To embed Stripe Payment Element for a subscription we use a subscription
  // with payment_behavior: 'default_incomplete' which gives us a PaymentIntent client_secret.
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: process.env.STRIPE_PRICE_ID! }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: { supabase_user_id: user.id },
  })

  const invoice = subscription.latest_invoice as any
  const paymentIntent = invoice?.payment_intent

  if (!paymentIntent?.client_secret) {
    return NextResponse.json({ error: 'Could not create payment intent' }, { status: 500 })
  }

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    subscriptionId: subscription.id,
  })
}

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

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 999,
    currency: 'gbp',
    customer: customerId,
    metadata: { userId: user.id, priceId: process.env.STRIPE_PRICE_ID! },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}

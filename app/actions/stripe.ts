'use server'

import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { getProductById } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'

export async function startCheckoutSession(productId: string) {
  const product = getProductById(productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Get user profile to check for existing stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, full_name')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  // Create or retrieve Stripe customer
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: profile?.full_name || undefined,
      metadata: {
        supabase_user_id: user.id,
      },
    })
    customerId = customer.id

    // Save customer ID to profile
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  // Determine currency and price based on locale
  const locale = await getLocale()
  const isEnglish = locale === 'en'
  const currency = isEnglish ? 'usd' : 'mxn'
  const unitAmount = isEnglish ? product.prices.usd : product.prices.mxn

  // Create Checkout Session for subscription
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    // ui_mode: 'embedded', // Removed for hosted checkout
    line_items: [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: unitAmount,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/processing-payment?session_id={CHECKOUT_SESSION_ID}&locale=${locale}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/upgrade`,
    metadata: {
      user_id: user.id,
      product_id: productId,
      tier: product.tier,
    },
  })

  // Return generated URL for redirect
  return session.url
}

export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return session
  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    return null
  }
}

export async function createBillingPortalSession() {
  const supabase = await createClient()
  const locale = await getLocale()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    throw new Error('No Stripe customer found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/profile`,
  })

  redirect(session.url)
}

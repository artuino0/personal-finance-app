import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const tier = session.metadata?.tier as 'pro' | 'premium'

        if (!userId || !tier) {
          console.error('Missing metadata in checkout session')
          break
        }

        // Update user profile with subscription info
        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
            subscription_ends_at: null,
          })
          .eq('id', userId)

        console.log(`✅ Subscription activated for user ${userId} - ${tier} tier`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!profile) {
          console.error('Profile not found for customer:', customerId)
          break
        }

        // Map subscription status
        const status = subscription.status === 'active' || subscription.status === 'trialing'
          ? 'active'
          : subscription.status === 'past_due'
          ? 'past_due'
          : 'inactive'

        await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            stripe_subscription_id: subscription.id,
            subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', profile.id)

        console.log(`✅ Subscription updated for user ${profile.id} - status: ${status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!profile) {
          console.error('Profile not found for customer:', customerId)
          break
        }

        // Downgrade to free tier
        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', profile.id)

        console.log(`✅ Subscription canceled for user ${profile.id}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find user by customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!profile) {
          console.error('Profile not found for customer:', customerId)
          break
        }

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
          })
          .eq('id', profile.id)

        console.log(`⚠️ Payment failed for user ${profile.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

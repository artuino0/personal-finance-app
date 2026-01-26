import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')
    const locale = searchParams.get('locale') || 'en'

    if (!sessionId) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard/upgrade`, req.url))
    }

    try {
        // 1. Verify session with Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription.latest_invoice']
        })

        if (session.payment_status !== 'paid') {
            console.error('Payment not paid:', session.payment_status)
            return NextResponse.redirect(new URL(`/${locale}/dashboard/upgrade?error=payment_failed`, req.url))
        }

        const userId = session.metadata?.user_id
        const tier = session.metadata?.tier as 'pro' | 'premium'

        if (!userId || !tier) {
            console.error('Missing metadata')
            return NextResponse.redirect(new URL(`/${locale}/dashboard/upgrade?error=invalid_session`, req.url))
        }

        const supabase = createServiceRoleClient()

        // 2. Check if payment already recorded to avoid duplicates
        const { data: existingPayment } = await supabase
            .from('payments')
            .select('id')
            .eq('stripe_session_id', sessionId)
            .single()

        if (!existingPayment) {
            // Extract Payment Intent ID
            let paymentIntentId = session.payment_intent as string
            if (!paymentIntentId && session.subscription) {
                const subscription = session.subscription as any // Type assertion for expanded object
                if (subscription.latest_invoice && typeof subscription.latest_invoice !== 'string') {
                    paymentIntentId = subscription.latest_invoice.payment_intent as string
                }
            }

            // 3. Record payment
            const { error: paymentError } = await supabase
                .from('payments')
                .insert({
                    user_id: userId,
                    stripe_session_id: sessionId,
                    stripe_payment_intent_id: paymentIntentId,
                    amount: session.amount_total || 0,
                    currency: session.currency || 'usd',
                    status: session.payment_status,
                    receipt_url: session.url, // Ideally fetch from charge, but session.url is backup
                    metadata: session.metadata
                })

            if (paymentError) {
                console.error('Error recording payment:', paymentError)
                // Continue anyway to update subscription
            }

            // 4. Update user profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    subscription_tier: tier,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    subscription_status: 'active',
                    subscription_ends_at: null, // Determine based on period if needed, or rely on webhook for sync
                })
                .eq('id', userId)

            if (profileError) {
                console.error('Error updating profile:', profileError)
                return NextResponse.redirect(new URL(`/${locale}/dashboard/upgrade?error=update_failed`, req.url))
            }
        }

        // 5. Redirect to success
        return NextResponse.redirect(new URL(`/${locale}/dashboard/profile?payment=success&session_id=${sessionId}`, req.url))

    } catch (error) {
        console.error('Error processing payment:', error)
        return NextResponse.redirect(new URL(`/${locale}/dashboard/upgrade?error=server_error`, req.url))
    }
}

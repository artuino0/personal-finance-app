# Stripe Payment Integration Setup

This guide explains how to set up Stripe payments for your personal finance app.

## Features

- 🎯 Two subscription tiers: **Pro** ($99/month) and **Premium** ($199/month)
- 💳 Embedded Stripe Checkout for seamless payment experience
- 🔄 Automatic subscription management via webhooks
- 📊 Customer billing portal for users to manage subscriptions
- 🔒 Secure server-side price validation

## Environment Variables

Add these to your Vercel project:

```env
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (get after setting up webhook endpoint)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Stripe Dashboard Setup

### 1. Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers → API keys**
3. Copy your **Publishable key** and **Secret key**
4. Add them to your environment variables

### 2. Set Up Webhook Endpoint

1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your environment as `STRIPE_WEBHOOK_SECRET`

### 3. Test Mode vs Live Mode

- By default, you're in **Test Mode** (keys start with `sk_test_` and `pk_test_`)
- Use [Stripe test cards](https://stripe.com/docs/testing) to test payments:
  - Success: `4242 4242 4242 4242`
  - Requires authentication: `4000 0025 0000 3155`
- When ready for production, switch to **Live Mode** keys

## How It Works

### User Flow

1. User clicks "Upgrade" on profile page or pricing page
2. Redirected to `/dashboard/upgrade` to choose a plan
3. Clicks "Upgrade to this plan" → Opens Stripe Checkout
4. Completes payment in embedded checkout form
5. Webhook processes payment and updates user's subscription tier
6. User is redirected back with success message

### Subscription Management

- **Active subscriptions**: Users can manage via Billing Portal
- **Billing Portal**: Accessible from profile page for Pro/Premium users
- **Cancel subscription**: Done through Billing Portal, tier reverts to Free
- **Payment failures**: Subscription status updates to `past_due`

## Pricing Plans

### Free Tier
- 3 accounts
- 0 shared users
- 5 recurring services
- 2 active credits
- 1 basic AI analysis/month

### Pro Tier ($99/month)
- Unlimited accounts
- 1 shared user
- Unlimited recurring services
- Unlimited active credits
- 4 advanced AI analyses/month

### Premium Tier ($199/month)
- Unlimited accounts
- 5 shared users
- Unlimited recurring services
- Unlimited active credits
- Unlimited AI analyses
- Priority support

## Database Schema

The subscription data is stored in the `profiles` table:

```sql
- stripe_customer_id: Stripe customer ID
- stripe_subscription_id: Active subscription ID
- subscription_tier: 'free' | 'pro' | 'premium'
- subscription_status: 'active' | 'inactive' | 'canceled' | 'past_due'
- subscription_ends_at: Renewal/expiration date
```

## Testing Webhooks Locally

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Use the webhook secret printed in the terminal
5. Trigger test events: `stripe trigger checkout.session.completed`

## Files Structure

```
/lib
  ├── stripe.ts              # Stripe client initialization
  └── products.ts            # Product catalog (source of truth)

/app/actions
  └── stripe.ts              # Server actions for checkout/billing

/app/api
  ├── webhooks/stripe/       # Webhook handler
  └── billing-portal/        # Billing portal redirect

/app/[locale]/dashboard
  └── upgrade/               # Upgrade page
      └── checkout/          # Checkout page

/components/stripe
  └── checkout.tsx           # Embedded Checkout component
```

## Security Notes

- ✅ Prices are validated server-side (cannot be tampered with)
- ✅ Webhook signatures are verified
- ✅ Customer IDs are linked to user accounts
- ✅ Server-only imports for Stripe secret key
- ⚠️ Never expose `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` to client

## Support

For issues with Stripe integration:
1. Check Stripe Dashboard → Logs for failed webhooks
2. Verify environment variables are set correctly
3. Ensure webhook endpoint is publicly accessible
4. Check webhook signing secret matches your endpoint

export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  tier: 'free' | 'pro' | 'premium'
  features: string[]
}

// This is the source of truth for all subscription products.
// All UI to display products should pull from this array.
// IDs passed to the checkout session should be the same as IDs from this array.
export const PRODUCTS: Product[] = [
  {
    id: 'pro-monthly',
    name: 'Pro Plan',
    description: 'For individuals looking to maximize their savings',
    priceInCents: 9900, // $99 MXN
    tier: 'pro',
    features: [
      'Unlimited accounts',
      '1 shared user',
      'Unlimited recurring services',
      'Unlimited active credits',
      '4 advanced AI analyses per month',
    ],
  },
  {
    id: 'premium-monthly',
    name: 'Premium Plan',
    description: 'For investors and families',
    priceInCents: 19900, // $199 MXN
    tier: 'premium',
    features: [
      'Everything in Pro +',
      '5 shared users',
      'Unlimited AI analyses',
      'Priority support',
      'Advanced financial insights',
    ],
  },
]

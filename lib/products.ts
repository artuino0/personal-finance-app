export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number // Default/Legacy
  prices: {
    mxn: number
    usd: number
  }
  tier: 'free' | 'pro' | 'premium'
  features: string[]
}

// Source of truth for all subscription products
// IDs must match the productId passed to checkout
export const PRODUCTS: Product[] = [
  {
    id: 'pro-monthly',
    name: 'Pro Plan',
    description: 'Perfect for individuals managing multiple accounts',
    priceInCents: 9900, // Legacy
    prices: {
      mxn: 9900, // $99.00 MXN
      usd: 500,  // $5.00 USD
    },
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
    description: 'Best for families and teams',
    priceInCents: 19900, // Legacy
    prices: {
      mxn: 19900, // $199.00 MXN
      usd: 1000,  // $10.00 USD
    },
    tier: 'premium',
    features: [
      'Unlimited accounts',
      '5 shared users',
      'Unlimited recurring services',
      'Unlimited active credits',
      'Unlimited AI analyses',
      'Priority support',
    ],
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function getProductByTier(tier: 'pro' | 'premium'): Product | undefined {
  return PRODUCTS.find((p) => p.tier === tier)
}

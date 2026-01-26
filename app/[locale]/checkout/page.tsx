import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Checkout from '@/components/stripe/checkout'
import { ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { PRODUCTS } from '@/lib/products'

interface CheckoutPageProps {
  searchParams: Promise<{
    plan?: string
  }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/checkout')
  }

  const params = await searchParams
  const plan = params.plan || 'pro-monthly'

  const product = PRODUCTS.find((p) => p.id === plan)

  if (!product) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Profile
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscribe to {product.name}</h1>
        <p className="mt-2 text-muted-foreground">{product.description}</p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <Checkout productId={plan} />
      </Suspense>
    </div>
  )
}

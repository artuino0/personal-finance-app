'use client'

import { useCallback, useEffect, useState } from 'react'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { startCheckoutSession, getCheckoutSession } from '@/app/actions/stripe'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function Checkout({ productId }: { productId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [isProcessing, setIsProcessing] = useState(false)

  // Check if returning from successful checkout
  useEffect(() => {
    if (sessionId) {
      setIsProcessing(true)
      getCheckoutSession(sessionId).then((session) => {
        if (session?.status === 'complete') {
          // Redirect to profile with success message
          router.push('/dashboard/profile?payment=success')
        } else {
          setIsProcessing(false)
        }
      })
    }
  }, [sessionId, router])

  const startCheckoutSessionForProduct = useCallback(
    () => startCheckoutSession(productId),
    [productId]
  )

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{'Processing your subscription...'}</p>
      </div>
    )
  }

  return (
    <div id="checkout" className="w-full max-w-2xl mx-auto">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret: startCheckoutSessionForProduct }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

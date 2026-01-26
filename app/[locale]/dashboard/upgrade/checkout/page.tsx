import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Checkout } from '@/components/stripe/checkout'
import { PageHeader } from '@/components/dashboard/page-header'
import { getProductById } from '@/lib/products'
import { getTranslations } from 'next-intl/server'

interface CheckoutPageProps {
  searchParams: Promise<{ product?: string }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const params = await searchParams
  const productId = params.product

  if (!productId) {
    redirect('/dashboard/upgrade')
  }

  const product = getProductById(productId)
  if (!product) {
    redirect('/dashboard/upgrade')
  }

  const t = await getTranslations('Checkout')

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title', { plan: product.name })}
        description={t('description')}
      />

      <Checkout productId={productId} />
    </div>
  )
}

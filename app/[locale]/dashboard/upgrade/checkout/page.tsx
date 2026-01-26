import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Checkout } from '@/components/stripe/checkout'
import { PageHeader } from '@/components/dashboard/page-header'
import { getProductById } from '@/lib/products'
import { getTranslations } from 'next-intl/server'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
        tier={(profile?.subscription_tier as "free" | "pro") || "free"}
      />
      <main className="container mx-auto p-6">
        <div className="space-y-6 max-w-3xl mx-auto">
          <PageHeader
            title={t('title', { plan: product.name })}
            description={t('description')}
            currentUserId={user.id}
            currentUserName={profile?.full_name || 'User'}
            currentUserEmail={profile?.email || user.email || ''}
          />

          <Checkout productId={productId} />
        </div>
      </main>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Gem, Sparkles } from 'lucide-react'
import { PRODUCTS } from '@/lib/products'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function UpgradePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const currentTier = profile?.subscription_tier || 'free'
  const t = await getTranslations('Upgrade')

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {PRODUCTS.map((product) => {
          const isCurrentPlan = currentTier === product.tier
          const isPro = product.tier === 'pro'
          
          return (
            <Card
              key={product.id}
              className={`relative ${
                !isPro
                  ? 'border-2 border-primary shadow-lg'
                  : ''
              }`}
            >
              {!isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t('recommended')}
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {!isPro && <Gem className="h-6 w-6 text-primary" />}
                    {product.name}
                  </CardTitle>
                  {isCurrentPlan && (
                    <div className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                      {t('currentPlan')}
                    </div>
                  )}
                </div>
                <CardDescription className="text-base">
                  {product.description}
                </CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      ${(product.priceInCents / 100).toFixed(0)}
                    </span>
                    <span className="text-muted-foreground">/ {t('month')}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        !isPro
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                          : 'bg-primary'
                      }`}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button disabled className="w-full" size="lg">
                    {t('currentPlan')}
                  </Button>
                ) : (
                  <Link href={`/dashboard/upgrade/checkout?product=${product.id}`}>
                    <Button
                      className={`w-full ${
                        !isPro
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 shadow-lg hover:shadow-xl'
                          : ''
                      }`}
                      size="lg"
                    >
                      {t('upgrade')}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {currentTier !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('manageBilling')}</CardTitle>
            <CardDescription>{t('manageBillingDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/billing-portal" method="POST">
              <Button type="submit" variant="outline">
                {t('openBillingPortal')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

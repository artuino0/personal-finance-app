import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Gem, Sparkles } from 'lucide-react'
import { PRODUCTS } from '@/lib/products'
import { Link } from '@/lib/i18n/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { SubscribeButton } from '@/components/upgrade/subscribe-button'

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
    .select('*')
    .eq('id', user.id)
    .single()

  const currentTier = profile?.subscription_tier || 'free'
  const t = await getTranslations('Upgrade')
  const locale = await getLocale()
  const isEnglish = locale === 'en'

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
        tier={(profile?.subscription_tier as "free" | "pro") || "free"}
      />
      <main className="container mx-auto p-6">
        <div className="space-y-8 max-w-5xl mx-auto">
          <PageHeader
            title={t('title')}
            description={t('description')}
            currentUserId={user.id}
            currentUserName={profile?.full_name || 'User'}
            currentUserEmail={profile?.email || user.email || ''}
            selectedAccountId={undefined}
          />

          <div className="grid gap-8 md:grid-cols-2">
            {PRODUCTS.map((product) => {
              const isCurrentPlan = (currentTier || '').toLowerCase() === product.tier.toLowerCase()
              const isPremium = product.tier === 'premium'

              return (
                <Card
                  key={product.id}
                  className={`relative ${isPremium
                    ? 'border-2 border-primary shadow-lg'
                    : 'border'
                    }`}
                >
                  {isPremium && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
                        <Sparkles className="h-3 w-3" />
                        {t('recommended')}
                      </div>
                    </div>
                  )}

                  <CardHeader className="space-y-4 pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {isPremium && <Gem className="h-5 w-5 text-primary" />}
                        <CardTitle className="text-xl font-semibold">
                          {product.name}
                        </CardTitle>
                      </div>
                      {isCurrentPlan && (
                        <div className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-md">
                          {t('currentPlan')}
                        </div>
                      )}
                    </div>
                    <CardDescription className="text-sm text-muted-foreground">
                      {product.description}
                    </CardDescription>
                    <div className="pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">
                          {isEnglish
                            ? `$${(product.prices.usd / 100).toFixed(2)}`
                            : `$${(product.prices.mxn / 100).toFixed(0)}`
                          }
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / {t('month')} {isEnglish ? 'USD' : 'MXN'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-2.5">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${isPremium
                            ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                            : 'bg-foreground'
                            }`}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="leading-5">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                      <Button disabled className="w-full" size="lg">
                        {t('currentPlan')}
                      </Button>
                    ) : (
                      <SubscribeButton
                        productId={product.id}
                        className={`w-full ${isPremium
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600'
                          : 'bg-foreground hover:bg-foreground/90'
                          }`}
                      >
                        {t('upgrade')}
                      </SubscribeButton>
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
      </main>
    </div>
  )
}

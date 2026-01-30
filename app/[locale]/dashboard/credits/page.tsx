import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { CreditsList } from "@/components/credits/credits-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@/lib/i18n/navigation"
import { getTranslations } from "next-intl/server"
import { getSelectedAccountId, getAccountPermissions } from "@/lib/utils/account-context"
import { PageHeader } from "@/components/dashboard/page-header"
import { checkCreditLimit } from "@/lib/limit-utils"
import { Lock } from "lucide-react"

export default async function CreditsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const selectedAccountId = (await getSelectedAccountId()) || user.id
  const permissions = await getAccountPermissions(selectedAccountId, "credits")
  const isSharedAccount = selectedAccountId !== user.id

  const { data: credits } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", selectedAccountId)
    .order("created_at", { ascending: false })

  const totalDebt = credits?.reduce((sum, credit) => sum + Number(credit.remaining_amount), 0) || 0
  const activeCredits = credits?.filter((c) => c.status === "active").length || 0
  const monthlyPayment = credits?.reduce((sum, credit) => sum + (Number(credit.monthly_payment) || 0), 0) || 0

  const t = await getTranslations("Credits");

  // Check limit
  const { allowed: canAdd } = await checkCreditLimit(selectedAccountId)

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
        tier={(profile?.subscription_tier as "free" | "pro") || "free"}
      />
      <main className="container mx-auto p-6">
        <PageHeader
          title={t("title")}
          description={t("description")}
          currentUserId={user.id}
          currentUserName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
          currentUserEmail={user.email || ""}
          selectedAccountId={selectedAccountId}
          isSharedAccount={isSharedAccount}
          permissions={permissions}
          actions={
            (!isSharedAccount || permissions.create) ? (
              (canAdd || isSharedAccount) ? (
                <Button asChild>
                  <Link href="/dashboard/credits/new">{t("newCredit")}</Link>
                </Button>
              ) : (
                <Button asChild variant="default" className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                  <Link href="/dashboard/upgrade" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {t("upgradeToadd")}
                  </Link>
                </Button>
              )
            ) : null
          }
        />

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t("totalDebt")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t("activeCredits")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeCredits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t("totalMonthlyPayment")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        <CreditsList credits={credits || []} userId={selectedAccountId} permissions={permissions} />
      </main>
    </div>
  )
}

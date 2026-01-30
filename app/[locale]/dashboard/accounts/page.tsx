import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AccountsList } from "@/components/accounts/accounts-list"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/navigation"
import { getTranslations } from "next-intl/server"
import { getSelectedAccountId, getAccountPermissions } from "@/lib/utils/account-context"
import { PageHeader } from "@/components/dashboard/page-header"
import { formatCurrency } from "@/lib/utils/currency"
import { checkAccountLimit } from "@/lib/limit-utils"
import { Lock } from "lucide-react"

export default async function AccountsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const selectedAccountId = (await getSelectedAccountId()) || user.id
  const permissions = await getAccountPermissions(selectedAccountId, "accounts")
  const isSharedAccount = selectedAccountId !== user.id

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", selectedAccountId)
    .order("created_at", { ascending: false })

  // Check account limits
  const { allowed, limit } = await checkAccountLimit(user.id)

  // Use profile tier or fallback to free
  const tier = (profile?.subscription_tier as "free" | "pro" | "premium") || "free"

  const totalBalance = accounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0

  const t = await getTranslations("Accounts")

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
        tier={tier === "premium" ? "pro" : tier === "pro" ? "pro" : "free"}
      />
      <main className="container mx-auto p-6">
        <PageHeader
          title={t("title")}
          description={t("totalBalance", { balance: formatCurrency(totalBalance) })}
          currentUserId={user.id}
          currentUserName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
          currentUserEmail={user.email || ""}
          selectedAccountId={selectedAccountId}
          isSharedAccount={isSharedAccount}
          permissions={permissions}
          actions={
            allowed ? (
              <Button asChild>
                <Link href="/dashboard/accounts/new">{t("newAccount")}</Link>
              </Button>
            ) : (
              <Button asChild variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                <Link href="/dashboard/upgrade" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {t("upgradeToCreate")}
                </Link>
              </Button>
            )
          }
        />

        <AccountsList
          accounts={accounts || []}
          userId={selectedAccountId}
          permissions={permissions}
          limit={limit}
          tier={tier}
        />
      </main>
    </div>
  )
}

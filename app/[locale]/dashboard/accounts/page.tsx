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

  const totalBalance = accounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0

  const t = await getTranslations("Accounts");

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
          description={t("totalBalance", { balance: formatCurrency(totalBalance) })}
          currentUserId={user.id}
          currentUserName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
          currentUserEmail={user.email || ""}
          selectedAccountId={selectedAccountId}
          isSharedAccount={isSharedAccount}
          permissions={permissions}
          actions={
            <Button asChild>
              <Link href="/dashboard/accounts/new">{t("newAccount")}</Link>
            </Button>
          }
        />

        <AccountsList accounts={accounts || []} userId={selectedAccountId} permissions={permissions} />
      </main>
    </div>
  )
}

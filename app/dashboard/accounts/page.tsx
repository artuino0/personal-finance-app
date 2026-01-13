import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AccountsList } from "@/components/accounts/accounts-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSelectedAccountId, getAccountPermissions } from "@/lib/utils/account-context"
import { PageHeader } from "@/components/dashboard/page-header"

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

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto p-6">
        <PageHeader
          title="Cuentas"
          description={`Balance total: $${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          currentUserId={user.id}
          currentUserName={profile?.full_name || user.email || "Usuario"}
          currentUserEmail={user.email || ""}
          selectedAccountId={selectedAccountId}
          isSharedAccount={isSharedAccount}
          permissions={permissions}
          actions={
            <Button asChild>
              <Link href="/dashboard/accounts/new">+ Nueva Cuenta</Link>
            </Button>
          }
        />

        <AccountsList accounts={accounts || []} userId={selectedAccountId} permissions={permissions} />
      </main>
    </div>
  )
}

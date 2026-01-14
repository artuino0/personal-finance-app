import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { TransactionsList } from "@/components/transactions/transactions-list"
import { TransactionsFilter } from "@/components/transactions/transactions-filter"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSelectedAccountId, getAccountPermissions } from "@/lib/utils/account-context"
import { PageHeader } from "@/components/dashboard/page-header"

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; account?: string; category?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const selectedAccountId = (await getSelectedAccountId()) || user.id
  const permissions = await getAccountPermissions(selectedAccountId, "transactions")
  const isSharedAccount = selectedAccountId !== user.id

  let query = supabase
    .from("transactions")
    .select("*, account_id, accounts(name, color), categories(name, color, icon)")
    .eq("user_id", selectedAccountId)
    .order("date", { ascending: false })

  if (params.type) {
    query = query.eq("type", params.type)
  }
  if (params.account) {
    query = query.eq("account_id", params.account)
  }
  if (params.category) {
    query = query.eq("category_id", params.category)
  }

  const { data: transactions } = await query

  const { data: accounts } = await supabase.from("accounts").select("id, name").eq("user_id", selectedAccountId)

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("user_id", selectedAccountId)

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
      />
      <main className="container mx-auto p-6">
        <PageHeader
          title="Transacciones"
          description={`${transactions?.length || 0} transacciones registradas`}
          currentUserId={user.id}
          currentUserName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
          currentUserEmail={user.email || ""}
          selectedAccountId={selectedAccountId}
          isSharedAccount={isSharedAccount}
          permissions={permissions}
          actions={
            <Button asChild>
              <Link href="/dashboard/transactions/new">+ Nueva Transacción</Link>
            </Button>
          }
        />

        <TransactionsFilter accounts={accounts || []} categories={categories || []} />

        <TransactionsList transactions={transactions || []} userId={selectedAccountId} permissions={permissions} />
      </main>
    </div>
  )
}

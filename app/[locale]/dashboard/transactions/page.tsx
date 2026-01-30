import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { TransactionsClient } from "@/components/transactions/transactions-client"
import { TransactionsFilter } from "@/components/transactions/transactions-filter"
import { getSelectedAccountId, getAccountPermissions } from "@/lib/utils/account-context"
import { getTranslations, getLocale } from "next-intl/server"
import { PageHeader } from "@/components/dashboard/page-header"
import { NewTransactionButton } from "@/components/transactions/new-transaction-button"

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; account?: string; category?: string; page?: string; pageSize?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const locale = await getLocale()

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

  // Pagination
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Get total count
  let countQuery = supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", selectedAccountId)

  if (params.type) {
    countQuery = countQuery.eq("type", params.type)
  }
  if (params.account) {
    countQuery = countQuery.eq("account_id", params.account)
  }
  if (params.category) {
    countQuery = countQuery.eq("category_id", params.category)
  }

  const { count } = await countQuery

  // Get paginated transactions
  let query = supabase
    .from("transactions")
    .select("*, account_id, accounts(name, color), global_categories(id, name_en, name_es, color, icon, type)")
    .eq("user_id", selectedAccountId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to)

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

  const localizedTransactions = transactions?.map((t: any) => ({
    ...t,
    categories: t.global_categories
      ? {
        ...t.global_categories,
        name: locale === "es" ? t.global_categories.name_es : t.global_categories.name_en,
      }
      : null,
  }))

  const { data: accounts } = await supabase.from("accounts").select("id, name").eq("user_id", selectedAccountId)

  const { data: globalCategories } = await supabase
    .from("global_categories")
    .select("id, name_en, name_es, type, color, icon")
    .eq("is_active", true)
    .order("name_es")

  const categories = globalCategories?.map((cat) => ({
    id: cat.id,
    name: locale === "es" ? cat.name_es : cat.name_en,
    type: cat.type,
    color: cat.color,
    icon: cat.icon,
  }))

  const t = await getTranslations("Transactions")

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
          description={t("registeredTransactions", { count: count || 0 })}
          currentUserId={user.id}
          currentUserName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
          currentUserEmail={user.email || ""}
          selectedAccountId={selectedAccountId}
          isSharedAccount={isSharedAccount}
          permissions={permissions}
          actions={
            <NewTransactionButton label={t("newTransaction")} locale={locale} />
          }
        />

        <TransactionsFilter accounts={accounts || []} categories={categories || []} />

        <TransactionsClient
          initialTransactions={localizedTransactions || []}
          totalCount={count || 0}
          userId={selectedAccountId}
          permissions={permissions}
        />
      </main>
    </div>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { TransactionsList } from "@/components/transactions/transactions-list"
import { TransactionsFilter } from "@/components/transactions/transactions-filter"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

  // Build query
  let query = supabase
    .from("transactions")
    .select("*, account_id, accounts(name, color), categories(name, color, icon)")
    .eq("user_id", user.id)
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

  // Get accounts and categories for filters
  const { data: accounts } = await supabase.from("accounts").select("id, name").eq("user_id", user.id)

  const { data: categories } = await supabase.from("categories").select("id, name, type").eq("user_id", user.id)

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transacciones</h1>
            <p className="text-slate-600">{transactions?.length || 0} transacciones registradas</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/transactions/new">+ Nueva Transacción</Link>
          </Button>
        </div>

        <TransactionsFilter accounts={accounts || []} categories={categories || []} />

        <TransactionsList transactions={transactions || []} userId={user.id} />
      </main>
    </div>
  )
}

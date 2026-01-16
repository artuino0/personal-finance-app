import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { getTranslations } from "next-intl/server"

export default async function NewTransactionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: accounts } = await supabase.from("accounts").select("*").eq("user_id", user.id)

  let { data: categories } = await supabase.from("categories").select("*").eq("user_id", user.id).order("name")

  // If user has no categories, fetch from global_categories
  if (!categories || categories.length === 0) {
    const { data: globalCategories } = await supabase
      .from("global_categories")
      .select("id, name, type, color, icon")
      .eq("is_active", true)
      .order("name")

    // Map global categories to match the categories structure
    categories = (globalCategories || []).map((gc) => ({
      id: gc.id,
      name: gc.name,
      type: gc.type,
      color: gc.color,
      icon: gc.icon,
      user_id: user.id,
      is_custom: false,
      global_category_id: gc.id,
      created_at: new Date().toISOString(),
    }))
  }

  const t = await getTranslations("Transactions")

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user.email || "Usuario"}
        userAvatar={user.user_metadata?.avatar_url}
      />
      <main className="container mx-auto max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{t("newTransaction")}</h1>
          <p className="text-slate-600">{t("newTransactionDesc")}</p>
        </div>

        <TransactionForm userId={user.id} accounts={accounts || []} categories={categories || []} />
      </main>
    </div>
  )
}

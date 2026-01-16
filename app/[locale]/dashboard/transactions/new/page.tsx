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

  const { data: categories } = await supabase.from("categories").select("*").eq("user_id", user.id).order("name")

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

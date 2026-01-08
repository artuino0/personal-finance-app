import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { TransactionForm } from "@/components/transactions/transaction-form"

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === "new") {
    redirect("/dashboard/transactions/new")
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: transaction } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!transaction) {
    redirect("/dashboard/transactions")
  }

  const { data: accounts } = await supabase.from("accounts").select("*").eq("user_id", user.id)

  const { data: categories } = await supabase.from("categories").select("*").eq("user_id", user.id)

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Editar Transacción</h1>
          <p className="text-slate-600">Actualiza la información de la transacción</p>
        </div>

        <TransactionForm
          userId={user.id}
          accounts={accounts || []}
          categories={categories || []}
          transaction={transaction}
        />
      </main>
    </div>
  )
}

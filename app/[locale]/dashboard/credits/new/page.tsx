import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { CreditForm } from "@/components/credits/credit-form"

export default async function NewCreditPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Nuevo Crédito</h1>
          <p className="text-slate-600">Registra un nuevo préstamo o crédito</p>
        </div>

        <CreditForm userId={user.id} />
      </main>
    </div>
  )
}

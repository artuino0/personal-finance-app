import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AccountForm } from "@/components/accounts/account-form"

export default async function NewAccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Nueva Cuenta</h1>
          <p className="text-slate-600">Agrega una nueva cuenta bancaria o de efectivo</p>
        </div>

        <AccountForm userId={user.id} />
      </main>
    </div>
  )
}

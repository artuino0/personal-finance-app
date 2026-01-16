import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AccountForm } from "@/components/accounts/account-form"

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === "new") {
    redirect("/dashboard/accounts/new")
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: account } = await supabase.from("accounts").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!account) {
    redirect("/dashboard/accounts")
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Editar Cuenta</h1>
          <p className="text-slate-600">Actualiza la información de tu cuenta</p>
        </div>

        <AccountForm userId={user.id} account={account} />
      </main>
    </div>
  )
}

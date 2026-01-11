import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AccountsList } from "@/components/accounts/accounts-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AccountsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const totalBalance = accounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cuentas</h1>
            <p className="text-slate-600">
              Balance total: ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/accounts/new">+ Nueva Cuenta</Link>
          </Button>
        </div>

        <AccountsList accounts={accounts || []} userId={user.id} />
      </main>
    </div>
  )
}

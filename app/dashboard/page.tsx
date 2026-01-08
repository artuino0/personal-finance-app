import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { BalanceOverview } from "@/components/dashboard/balance-overview"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get accounts
  const { data: accounts } = await supabase.from("accounts").select("*").eq("user_id", user.id)

  // Calculate total balance
  const totalBalance = accounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0

  // Get recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, accounts(name), categories(name, color, icon)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(5)

  // Get monthly income/expense
  const { data: monthlyData } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id)
    .gte("date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const monthlyIncome =
    monthlyData?.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const monthlyExpense =
    monthlyData?.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0) || 0

  // Get upcoming credit payments
  const { data: credits } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("due_date", { ascending: true })
    .limit(3)

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-slate-600">Bienvenido de nuevo, {profile?.full_name || "Usuario"}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalBalance.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-600 mt-1">{accounts?.length || 0} cuentas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +${monthlyIncome.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-600 mt-1">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -${monthlyExpense.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-600 mt-1">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ahorro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${(monthlyIncome - monthlyExpense).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-600 mt-1">Este mes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <MonthlyChart userId={user.id} />
          <BalanceOverview accounts={accounts || []} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RecentTransactions transactions={transactions || []} />
          <UpcomingPayments credits={credits || []} />
        </div>
      </main>
    </div>
  )
}

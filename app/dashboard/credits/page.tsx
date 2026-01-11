import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { CreditsList } from "@/components/credits/credits-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function CreditsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: credits } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const totalDebt = credits?.reduce((sum, credit) => sum + Number(credit.remaining_amount), 0) || 0
  const activeCredits = credits?.filter((c) => c.status === "active").length || 0
  const monthlyPayment = credits?.reduce((sum, credit) => sum + (Number(credit.monthly_payment) || 0), 0) || 0

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Créditos y Préstamos</h1>
            <p className="text-slate-600">Gestiona tus deudas y obligaciones financieras</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/credits/new">+ Nuevo Crédito</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Créditos Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeCredits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Pago Mensual Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        <CreditsList credits={credits || []} userId={user.id} />
      </main>
    </div>
  )
}

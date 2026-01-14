import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { CreditsList } from "@/components/credits/credits-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getSelectedAccountId, getAccountPermissions } from "@/lib/utils/account-context"
import { PageHeader } from "@/components/dashboard/page-header"

export default async function CreditsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const selectedAccountId = (await getSelectedAccountId()) || user.id
  const permissions = await getAccountPermissions(selectedAccountId, "credits")
  const isSharedAccount = selectedAccountId !== user.id

  const { data: credits } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", selectedAccountId)
    .order("created_at", { ascending: false })

  const totalDebt = credits?.reduce((sum, credit) => sum + Number(credit.remaining_amount), 0) || 0
  const activeCredits = credits?.filter((c) => c.status === "active").length || 0
  const monthlyPayment = credits?.reduce((sum, credit) => sum + (Number(credit.monthly_payment) || 0), 0) || 0

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
      />
      <main className="container mx-auto p-6">
        <PageHeader
          title="Créditos y Préstamos"
          description="Gestiona tus deudas y obligaciones financieras"
          currentUserId={user.id}
          currentUserName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
          currentUserEmail={user.email || ""}
          selectedAccountId={selectedAccountId}
          isSharedAccount={isSharedAccount}
          permissions={permissions}
          actions={
            <Button asChild>
              <Link href="/dashboard/credits/new">+ Nuevo Crédito</Link>
            </Button>
          }
        />

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

        <CreditsList credits={credits || []} userId={selectedAccountId} permissions={permissions} />
      </main>
    </div>
  )
}

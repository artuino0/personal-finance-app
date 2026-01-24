import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ServicesList } from "@/components/services/services-list"
import { getSelectedAccountId, getAccountPermissions } from "@/lib/utils/account-context"
import { PageHeader } from "@/components/dashboard/page-header"

import { getTranslations } from "next-intl/server"

export default async function ServicesPage() {
  const t = await getTranslations("Services")
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const selectedAccountId = (await getSelectedAccountId()) || user.id
  const permissions = await getAccountPermissions(selectedAccountId, "services")
  const isSharedAccount = selectedAccountId !== user.id

  const { data: services } = await supabase
    .from("recurring_services")
    .select("*, accounts(name)")
    .eq("user_id", selectedAccountId)
    .order("next_payment_date", { ascending: true })

  const activeServices = services?.filter((s) => s.is_active) || []
  const inactiveServices = services?.filter((s) => !s.is_active) || []

  const totalMonthly = activeServices.reduce((sum, service) => {
    if (service.frequency === "monthly") return sum + Number(service.amount)
    if (service.frequency === "yearly") return sum + Number(service.amount) / 12
    if (service.frequency === "biweekly") return sum + Number(service.amount) * 2
    if (service.frequency === "weekly") return sum + Number(service.amount) * 4
    return sum
  }, 0)

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
        tier={(profile?.subscription_tier as "free" | "pro") || "free"}
      />
      <main className="container mx-auto p-6">
        <PageHeader
          title={t("title")}
          description={t("description")}
          currentUserId={user.id}
          currentUserName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
          currentUserEmail={user.email || ""}
          selectedAccountId={selectedAccountId}
          isSharedAccount={isSharedAccount}
          permissions={permissions}
          actions={
            <Button className="gap-2">
              <Link href="/dashboard/services/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("newService")}
              </Link>
            </Button>
          }
        />

        <div className="mb-6 rounded-lg border bg-background p-6">
          <div className="text-center">
            <p className="text-sm text-foreground/60">{t("monthlyExpense")}</p>
            <p className="font-bold text-foreground/80 text-3xl">
              ${totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 font-semibold text-lg">{t("activeServices", { count: activeServices.length })}</h2>
            <ServicesList services={activeServices} userId={selectedAccountId} />
          </div>

          {inactiveServices.length > 0 && (
            <div>
              <h2 className="mb-4 font-semibold text-lg">{t("inactiveServices", { count: inactiveServices.length })}</h2>
              <ServicesList services={inactiveServices} userId={selectedAccountId} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

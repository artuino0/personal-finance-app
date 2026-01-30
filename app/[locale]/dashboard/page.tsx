import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { BalanceOverview } from "@/components/dashboard/balance-overview"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"
import { DashboardClientWrapper } from "@/components/dashboard/dashboard-client-wrapper"
import { formatCurrency } from "@/lib/utils/currency"
import { ReportGeneratorDialog } from "@/components/reports/report-generator-dialog"
import { AccountSelector } from "@/components/dashboard/account-selector"
import { cookies } from "next/headers"
import { getTranslations, getLocale } from "next-intl/server"
import { DashboardTour } from "@/components/dashboard/dashboard-tour"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const cookieStore = await cookies()
  const selectedAccountId = cookieStore.get("selected_account_id")?.value || user.id
  const locale = await getLocale()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  // Get the profile of the account we're viewing (could be own or shared)
  const { data: selectedProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", selectedAccountId)
    .maybeSingle()

  const isViewingOwnAccount = selectedAccountId === user.id

  let displayName = "Usuario"
  if (isViewingOwnAccount) {
    displayName = profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"
  } else {
    // Viewing someone else's account (shared)
    if (selectedProfile?.full_name) {
      displayName = selectedProfile.full_name
    } else {
      // Fallback: try to get from auth metadata
      const { data: ownerUser } = await supabase.auth.admin.getUserById(selectedAccountId)
      if (ownerUser?.user?.user_metadata?.full_name) {
        displayName = ownerUser.user.user_metadata.full_name
      } else if (ownerUser?.user?.user_metadata?.name) {
        displayName = ownerUser.user.user_metadata.name
      } else if (ownerUser?.user?.email) {
        displayName = ownerUser.user.email.split("@")[0]
      } else {
        displayName = "Usuario Compartido"
      }
    }
  }

  const { data: accounts } = await supabase.from("accounts").select("*").eq("user_id", selectedAccountId)

  // Calculate total balance
  const totalBalance = accounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, accounts(name), global_categories(id, name_en, name_es, color, icon, type)")
    .eq("user_id", selectedAccountId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5)

  const localizedTransactions = transactions?.map((t: any) => ({
    ...t,
    categories: t.global_categories
      ? {
        ...t.global_categories,
        name: locale === "es" ? t.global_categories.name_es : t.global_categories.name_en,
      }
      : null,
  }))

  const { data: monthlyData } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", selectedAccountId)
    .gte("date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const monthlyIncome =
    monthlyData?.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const monthlyExpense =
    monthlyData?.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const { data: credits } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", selectedAccountId)
    .eq("status", "active")
    .order("due_date", { ascending: true })
    .limit(3)

  const { data: services } = await supabase
    .from("recurring_services")
    .select("*")
    .eq("user_id", selectedAccountId)
    .eq("is_active", true)
    .order("next_payment_date", { ascending: true })
    .limit(5)

  const t = await getTranslations("Dashboard")

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={
          profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Usuario"
        }
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
        tier={(profile?.subscription_tier as "free" | "pro") || "free"}
      />
      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-slate-600">
              {isViewingOwnAccount
                ? t("welcome", { name: profile?.full_name || "Usuario" })
                : t("viewingFinancesOf", { name: displayName })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <AccountSelector
              currentUserId={user.id}
              currentUserName={profile?.full_name || user.email || "Usuario"}
              currentUserEmail={user.email || ""}
              selectedAccountId={selectedAccountId}
            />
            <ReportGeneratorDialog />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("totalBalance")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatCurrency(totalBalance)}</div>
              <p className="text-xs text-slate-600 mt-1">{t("accountsCount", { count: accounts?.length || 0 })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("monthlyIncome")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+${formatCurrency(monthlyIncome)}</div>
              <p className="text-xs text-slate-600 mt-1">{t("thisMonth")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("monthlyExpenses")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">-${formatCurrency(monthlyExpense)}</div>
              <p className="text-xs text-slate-600 mt-1">{t("thisMonth")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("savings")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${formatCurrency(monthlyIncome - monthlyExpense)}</div>
              <p className="text-xs text-slate-600 mt-1">{t("thisMonth")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <MonthlyChart userId={selectedAccountId} />
          <BalanceOverview accounts={accounts || []} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RecentTransactions transactions={localizedTransactions || []} />
          <DashboardClientWrapper
            credits={credits || []}
            services={services || []}
            locale={locale}
          />
        </div>
      </main>
      <DashboardTour tourId="dashboard" />
    </div>
  )
}

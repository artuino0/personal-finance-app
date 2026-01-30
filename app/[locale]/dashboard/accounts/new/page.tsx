import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AccountForm } from "@/components/accounts/account-form"
import { checkAccountLimit } from "@/lib/limit-utils"
import { getTranslations } from "next-intl/server"

export default async function NewAccountPage() {
  const t = await getTranslations("Accounts")
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  /* New - Limit Check */
  const { allowed } = await checkAccountLimit(user.id)

  if (!allowed) {
    redirect("/dashboard/upgrade")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const tier = (profile?.subscription_tier as "free" | "pro" | "premium") || "free"

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user.email || "Usuario"}
        userAvatar={profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture}
        tier={tier === "premium" ? "pro" : tier === "pro" ? "pro" : "free"}
      />
      <main className="container mx-auto max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{t("newAccountTitle")}</h1>
          <p className="text-slate-600">{t("newAccountDesc")}</p>
        </div>

        <AccountForm userId={user.id} />
      </main>
    </div>
  )
}

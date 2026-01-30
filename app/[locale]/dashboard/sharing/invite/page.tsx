import { redirect } from "@/lib/i18n/navigation"
import { createClient } from "@/lib/supabase/server"
import { checkSharedUserLimit } from "@/lib/limit-utils"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InviteForm } from "@/components/sharing/invite-form"
import { getTranslations } from "next-intl/server"

export default async function InvitePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations("Sharing")
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: "/auth/login", locale })
  }

  const { allowed } = await checkSharedUserLimit(user!.id)

  if (!allowed) {
    redirect({ href: "/dashboard/upgrade", locale })
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

  const tier = (profile?.subscription_tier as "free" | "pro" | "premium") || "free"

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user!.email || "Usuario"}
        userAvatar={profile?.avatar_url || user!.user_metadata?.avatar_url || user!.user_metadata?.picture}
        tier={tier === "premium" ? "pro" : tier === "pro" ? "pro" : "free"}
      />
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{t("inviteTitle")}</h1>
          <p className="text-slate-600">{t("inviteDesc")}</p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>{t("newInvitation")}</CardTitle>
              <CardDescription>{t("newInvitationDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <InviteForm userId={user!.id} userEmail={user!.email || ""} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

import { redirect } from "@/lib/i18n/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditShareForm } from "@/components/sharing/edit-share-form"
import { getTranslations } from "next-intl/server"

export default async function EditSharePage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params
  const t = await getTranslations("Sharing")

  if (id === "new" || id === "invite") {
    redirect({ href: "/dashboard/sharing/invite", locale })
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: "/auth/login", locale })
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

  const { data: share } = await supabase
    .from("account_shares")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user!.id)
    .single()

  if (!share) {
    redirect({ href: "/dashboard/sharing", locale })
  }

  const { data: permissions } = await supabase.from("share_permissions").select("*").eq("share_id", share.id)

  share.share_permissions = permissions || []

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user!.user_metadata?.full_name || user!.email || "Usuario"}
        userAvatar={user!.user_metadata?.avatar_url || user!.user_metadata?.picture}
      />
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{t("editPermissions")}</h1>
          <p className="text-slate-600">{t("sharedWith")}: {share.shared_with_email}</p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>{t("managePermissions")}</CardTitle>
              <CardDescription>{t("managePermissionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <EditShareForm share={share} userId={user!.id} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

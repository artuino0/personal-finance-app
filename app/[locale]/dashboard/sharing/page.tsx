import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@/lib/i18n/navigation"
import { SharesList } from "@/components/sharing/shares-list"
import { InvitationsList } from "@/components/sharing/invitations-list"
import { AcceptInvitationModal } from "@/components/sharing/accept-invitation-modal"
import { getTranslations } from "next-intl/server"

export default async function SharingPage() {
  const supabase = await createClient()

  // ... (auth and data fetching logic remains same)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: activeShares } = await supabase
    .from("account_shares")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .order("shared_at", { ascending: false })

  // ... (activeShares logic)
  if (activeShares && activeShares.length > 0) {
    for (const share of activeShares) {
      const { data: permissions } = await supabase.from("share_permissions").select("*").eq("share_id", share.id)
      const { data: sharedProfile } = await supabase.from("profiles").select("full_name").eq("id", share.shared_with_id).maybeSingle()
      let displayName = share.shared_with_email.split("@")[0]
      if (sharedProfile?.full_name) {
        displayName = sharedProfile.full_name
      } else {
        const { data: userData } = await supabase.auth.admin.getUserById(share.shared_with_id)
        if (userData?.user?.user_metadata?.full_name) displayName = userData.user.user_metadata.full_name
        else if (userData?.user?.user_metadata?.name) displayName = userData.user.user_metadata.name
      }
      share.share_permissions = permissions || []
      share.profiles = { full_name: displayName }
    }
  }

  const { data: sharedWithMe } = await supabase
    .from("account_shares")
    .select("*")
    .eq("shared_with_id", user.id)
    .eq("is_active", true)
    .order("shared_at", { ascending: false })

  // ... (sharedWithMe logic)
  if (sharedWithMe && sharedWithMe.length > 0) {
    for (const share of sharedWithMe) {
      const { data: permissions } = await supabase.from("share_permissions").select("*").eq("share_id", share.id)
      const { data: ownerProfile } = await supabase.from("profiles").select("full_name").eq("id", share.owner_id).maybeSingle()
      let displayName = "Usuario"
      if (ownerProfile?.full_name) {
        displayName = ownerProfile.full_name
      } else {
        const { data: userData } = await supabase.auth.admin.getUserById(share.owner_id)
        if (userData?.user?.user_metadata?.full_name) displayName = userData.user.user_metadata.full_name
        else if (userData?.user?.user_metadata?.name) displayName = userData.user.user_metadata.name
        else if (userData?.user?.email) displayName = userData.user.email.split("@")[0]
      }
      share.share_permissions = permissions || []
      share.profiles = { full_name: displayName }
    }
  }

  const { data: pendingInvitations } = await supabase
    .from("share_invitations")
    .select("*")
    .eq("owner_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  const { data: receivedInvitations } = await supabase
    .from("share_invitations")
    .select("*")
    .eq("invited_email", user.email)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // ... (receivedInvitations logic)
  if (receivedInvitations && receivedInvitations.length > 0) {
    for (const invitation of receivedInvitations) {
      const { data: ownerProfile } = await supabase.from("profiles").select("full_name").eq("id", invitation.owner_id).single()
      invitation.profiles = ownerProfile || { full_name: "Usuario" }
    }
  }

  const hasPendingInvitations =
    (pendingInvitations && pendingInvitations.length > 0) || (receivedInvitations && receivedInvitations.length > 0)
  const hasOnlyOneInvitationType =
    (pendingInvitations && pendingInvitations.length > 0) !== (receivedInvitations && receivedInvitations.length > 0)

  const t = await getTranslations("Sharing")

  return (
    <div className="min-h-screen bg-secondary/30">
      <AcceptInvitationModal />
      <DashboardNav
        userName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
      />
      <main className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="mb-6 space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
          </div>
          <Button asChild className="w-full md:w-auto">
            <Link href="/dashboard/sharing/invite">{t("inviteUser")}</Link>
          </Button>
        </div>

        <div className="space-y-6">
          {/* Shares section - stack on mobile */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{t("sharedByMe")}</CardTitle>
                <CardDescription className="text-xs">{t("sharedByMeDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <SharesList shares={activeShares || []} userId={user.id} type="outgoing" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{t("sharedWithMe")}</CardTitle>
                <CardDescription className="text-xs">{t("sharedWithMeDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <SharesList shares={sharedWithMe || []} userId={user.id} type="incoming" />
              </CardContent>
            </Card>
          </div>

          {/* Invitations section - always full width on mobile */}
          {hasPendingInvitations && (
            <div className={`grid gap-6 ${hasOnlyOneInvitationType ? "" : "lg:grid-cols-2"}`}>
              {pendingInvitations && pendingInvitations.length > 0 && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{t("sentInvitations")}</CardTitle>
                    <CardDescription className="text-xs">{t("sentInvitationsDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InvitationsList invitations={pendingInvitations} type="sent" userId={user.id} />
                  </CardContent>
                </Card>
              )}

              {receivedInvitations && receivedInvitations.length > 0 && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{t("receivedInvitations")}</CardTitle>
                    <CardDescription className="text-xs">
                      {t("receivedInvitationsDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InvitationsList invitations={receivedInvitations} type="received" userId={user.id} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { SharesList } from "@/components/sharing/shares-list"
import { InvitationsList } from "@/components/sharing/invitations-list"
import { AcceptInvitationModal } from "@/components/sharing/accept-invitation-modal"

export default async function SharingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  console.log("[v0] Current user ID:", user.id)
  console.log("[v0] Current user email:", user.email)

  // Get active shares (people I've shared with)
  const { data: activeShares, error: sharesError } = await supabase
    .from("account_shares")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  console.log("[v0] Active shares (outgoing):", activeShares)
  console.log("[v0] Shares error:", sharesError)

  // Get permissions for each share
  if (activeShares) {
    for (const share of activeShares) {
      const { data: permissions } = await supabase.from("share_permissions").select("*").eq("share_id", share.id)
      share.share_permissions = permissions || []

      // Get profile of shared_with user
      const { data: sharedProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", share.shared_with_id)
        .single()
      share.profiles = sharedProfile
    }
  }

  // Get pending invitations I've sent
  const { data: pendingInvitations } = await supabase
    .from("share_invitations")
    .select("*")
    .eq("owner_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Get invitations I've received
  const { data: receivedInvitations } = await supabase
    .from("share_invitations")
    .select("*")
    .eq("invited_email", user.email)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Get owner profiles for received invitations
  if (receivedInvitations) {
    for (const invitation of receivedInvitations) {
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", invitation.owner_id)
        .single()
      invitation.profiles = ownerProfile
    }
  }

  // Get shares where I'm the recipient
  const { data: sharedWithMe, error: sharedError } = await supabase
    .from("account_shares")
    .select("*")
    .eq("shared_with_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  console.log("[v0] Shared with me (incoming):", sharedWithMe)
  console.log("[v0] Shared with me error:", sharedError)

  // Get permissions and owner profile for each share
  if (sharedWithMe) {
    for (const share of sharedWithMe) {
      const { data: permissions } = await supabase.from("share_permissions").select("*").eq("share_id", share.id)
      share.share_permissions = permissions || []

      // Get profile of owner
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", share.owner_id)
        .single()
      share.profiles = ownerProfile
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <AcceptInvitationModal />
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Compartir Finanzas</h1>
            <p className="text-slate-600">Gestiona el acceso compartido a tus finanzas</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/sharing/invite">+ Invitar Usuario</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>He Compartido Con</CardTitle>
              <CardDescription>Personas que tienen acceso a mis finanzas</CardDescription>
            </CardHeader>
            <CardContent>
              <SharesList shares={activeShares || []} userId={user.id} type="outgoing" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compartido Conmigo</CardTitle>
              <CardDescription>Finanzas de otros usuarios a las que tengo acceso</CardDescription>
            </CardHeader>
            <CardContent>
              <SharesList shares={sharedWithMe || []} userId={user.id} type="incoming" />
            </CardContent>
          </Card>
        </div>

        {pendingInvitations && pendingInvitations.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Invitaciones Enviadas</CardTitle>
              <CardDescription>Invitaciones pendientes de aceptación</CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationsList invitations={pendingInvitations} type="sent" userId={user.id} />
            </CardContent>
          </Card>
        )}

        {receivedInvitations && receivedInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Invitaciones Recibidas</CardTitle>
              <CardDescription>Invitaciones para acceder a las finanzas de otros usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationsList invitations={receivedInvitations} type="received" userId={user.id} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

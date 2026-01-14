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

  // Get active shares (people I've shared with)
  const { data: activeShares } = await supabase
    .from("account_shares")
    .select("*, share_permissions(*), profiles!account_shares_shared_with_id_fkey(full_name)")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

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
    .select("*, profiles!share_invitations_owner_id_fkey(full_name)")
    .eq("invited_email", user.email)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Get shares where I'm the recipient
  const { data: sharedWithMe } = await supabase
    .from("account_shares")
    .select("*, share_permissions(*), profiles!account_shares_owner_id_fkey(full_name)")
    .eq("shared_with_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

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
          <Card className="mt-6">
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

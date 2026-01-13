import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditShareForm } from "@/components/sharing/edit-share-form"

export default async function EditSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === "new" || id === "invite") {
    redirect("/dashboard/sharing/invite")
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get share details
  const { data: share } = await supabase
    .from("account_shares")
    .select("*, share_permissions(*), profiles!account_shares_shared_with_id_fkey(full_name)")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single()

  if (!share) {
    redirect("/dashboard/sharing")
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Editar Permisos</h1>
          <p className="text-slate-600">Compartido con: {share.profiles?.full_name || share.shared_with_email}</p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Gestionar Permisos</CardTitle>
              <CardDescription>Actualiza los permisos de acceso o desactiva el acceso compartido</CardDescription>
            </CardHeader>
            <CardContent>
              <EditShareForm share={share} userId={user.id} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

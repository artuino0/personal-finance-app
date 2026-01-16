import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InviteForm } from "@/components/sharing/invite-form"

export default async function InvitePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Invitar Usuario</h1>
          <p className="text-slate-600">Comparte el acceso a tus finanzas con otra persona</p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Nueva Invitación</CardTitle>
              <CardDescription>
                Ingresa el correo electrónico del usuario y selecciona los permisos que deseas compartir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InviteForm userId={user.id} userEmail={user.email || ""} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

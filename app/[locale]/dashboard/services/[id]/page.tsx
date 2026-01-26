import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ServiceForm } from "@/components/services/service-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/lib/i18n/navigation"

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === "new") {
    redirect("/dashboard/services/new")
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: service } = await supabase
    .from("recurring_services")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!service) {
    redirect("/dashboard/services")
  }

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, type")
    .eq("user_id", user.id)
    .order("name")

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto max-w-2xl p-6">
        <Link href="/dashboard/services">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>

        <h1 className="mb-6 font-bold text-3xl">Editar Servicio</h1>

        <ServiceForm userId={user.id} accounts={accounts || []} service={service} />
      </main>
    </div>
  )
}

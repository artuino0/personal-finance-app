import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ServicesList } from "@/components/services/services-list"

export default async function ServicesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: services } = await supabase
    .from("recurring_services")
    .select("*, accounts(name)")
    .eq("user_id", user.id)
    .order("next_payment_date", { ascending: true })

  const activeServices = services?.filter((s) => s.is_active) || []
  const inactiveServices = services?.filter((s) => !s.is_active) || []

  const totalMonthly = activeServices.reduce((sum, service) => {
    if (service.frequency === "monthly") return sum + Number(service.amount)
    if (service.frequency === "yearly") return sum + Number(service.amount) / 12
    if (service.frequency === "biweekly") return sum + Number(service.amount) * 2
    if (service.frequency === "weekly") return sum + Number(service.amount) * 4
    return sum
  }, 0)

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-bold text-3xl">Servicios Recurrentes</h1>
            <p className="text-slate-600">Gestiona tus suscripciones y pagos recurrentes</p>
          </div>
          <Link href="/dashboard/services/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Servicio
            </Button>
          </Link>
        </div>

        <div className="mb-6 rounded-lg border bg-background p-6">
          <div className="text-center">
            <p className="text-sm text-foreground/60">Gasto Mensual Estimado</p>
            <p className="font-bold text-foreground/80 text-3xl">
              ${totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 font-semibold text-lg">Servicios Activos ({activeServices.length})</h2>
            <ServicesList services={activeServices} userId={user.id} />
          </div>

          {inactiveServices.length > 0 && (
            <div>
              <h2 className="mb-4 font-semibold text-lg">Servicios Inactivos ({inactiveServices.length})</h2>
              <ServicesList services={inactiveServices} userId={user.id} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

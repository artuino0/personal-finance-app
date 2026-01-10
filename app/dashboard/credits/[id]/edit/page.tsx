import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { CreditForm } from "@/components/credits/credit-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditCreditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: credit } = await supabase.from("credits").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!credit) {
    redirect("/dashboard/credits")
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav userName={profile?.full_name || user.email || "Usuario"} />
      <main className="container mx-auto max-w-2xl p-6">
        <Link href={`/dashboard/credits/${id}`}>
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>

        <h1 className="mb-6 font-bold text-3xl">Editar Crédito</h1>

        <CreditForm userId={user.id} credit={credit} />
      </main>
    </div>
  )
}

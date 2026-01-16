import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { CreditDetails } from "@/components/credits/credit-details"
import { getAccountPermissions } from "@/lib/utils/account-context"

export default async function CreditDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === "new") {
    redirect("/dashboard/credits/new")
  }

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

  const { data: payments } = await supabase
    .from("credit_payments")
    .select("*")
    .eq("credit_id", id)
    .eq("user_id", user.id)
    .order("payment_date", { ascending: false })

  const rawPermissions = await getAccountPermissions(user.id, "credits")
  const permissions = {
    canView: rawPermissions.view,
    canEdit: rawPermissions.edit,
    canDelete: rawPermissions.delete,
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
      />
      <main className="container mx-auto max-w-4xl p-6">
        <CreditDetails credit={credit} payments={payments || []} userId={user.id} permissions={permissions} />
      </main>
    </div>
  )
}

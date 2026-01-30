import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ServiceForm } from "@/components/services/service-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Crown, AlertCircle } from "lucide-react"
import { Link } from "@/lib/i18n/navigation"
import { checkServiceLimit } from "@/lib/limit-utils"
import { Card, CardContent } from "@/components/ui/card"
import { getTranslations } from "next-intl/server"

export default async function NewServicePage() {
  const t = await getTranslations("Services")
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check limit before loading other data
  const { allowed: canAdd, limit } = await checkServiceLimit(user.id)

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
            {t("back")}
          </Button>
        </Link>

        {!canAdd ? (
          <div className="mt-8 space-y-6">
            <h1 className="mb-6 font-bold text-3xl">{t("newService")}</h1>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-amber-100 p-4">
                    <Crown className="h-8 w-8 text-amber-600" />
                  </div>
                  <h2 className="mb-2 font-bold text-xl text-amber-800">{t("limitReachedTitle")}</h2>
                  <p className="mb-6 max-w-md text-amber-700">
                    {t("limitReachedDescription", { limit: limit ?? 0 })}
                  </p>
                  <Button asChild size="lg" className="gap-2 bg-amber-600 hover:bg-amber-700">
                    <Link href="/dashboard/upgrade">
                      <Crown className="h-4 w-4" />
                      {t("upgradePlan")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <h1 className="mb-6 font-bold text-3xl">{t("newService")}</h1>
            <ServiceForm userId={user.id} accounts={accounts || []} />
          </>
        )}
      </main>
    </div>
  )
}

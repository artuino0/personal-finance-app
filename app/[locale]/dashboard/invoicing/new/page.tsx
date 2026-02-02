import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { PageHeader } from "@/components/dashboard/page-header"
import { InvoiceWizard } from "@/components/invoicing/invoice-wizard"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Link } from "@/lib/i18n/navigation"

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Invoicing" })

  return {
    title: t("newInvoice"),
  }
}

export default async function NewInvoicePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  // Check if CSD certificates are configured
  const { data: config } = await supabase
    .from("facturapi_config")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  const isConfigured = config && config.certificate_file_path && config.key_file_path

  const t = await getTranslations("Invoicing")

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <DashboardNav
          userName={
            profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Usuario"
          }
          userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
          tier={(profile?.subscription_tier as "free" | "pro") || "free"}
        />
        <main className="container mx-auto p-6 max-w-5xl">
          <div className="mb-6">
            <Link
              href="/dashboard/invoicing"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Link>
          </div>

          <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <CardTitle className="text-orange-900 dark:text-orange-100">
                    {t("configurationRequired")}
                  </CardTitle>
                  <CardDescription className="text-orange-700 dark:text-orange-300">
                    {t("uploadCSDToStart")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="border-orange-600 text-orange-600">
                  {t("goToProfile")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={
          profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Usuario"
        }
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
        tier={(profile?.subscription_tier as "free" | "pro") || "free"}
      />
      <main className="container mx-auto p-6 max-w-5xl">
        <div className="mb-6">
          <Link
            href="/dashboard/invoicing"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("newInvoice")}</CardTitle>
            <CardDescription>Completa los datos para emitir una factura electrónica CFDI 4.0</CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceWizard userId={user.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

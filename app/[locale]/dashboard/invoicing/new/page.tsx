import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { PageHeader } from "@/components/dashboard/page-header"
import { InvoiceWizard } from "@/components/invoicing/invoice-wizard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
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

  // Check if Facturapi is configured
  const { data: config } = await supabase
    .from("facturapi_config")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const isConfigured = config && config.api_key

  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <PageHeader title="Nueva Factura" />

        <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <CardTitle className="text-orange-900 dark:text-orange-100">
                  Configuración Requerida
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  Configura Facturapi en tu perfil antes de crear facturas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="border-orange-600 text-orange-600">
                Ir a Perfil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Nueva Factura" description="Emite una factura electrónica paso a paso" />

      <InvoiceWizard userId={user.id} />
    </div>
  )
}

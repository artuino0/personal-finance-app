import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Download, AlertCircle } from "lucide-react"
import { Link } from "@/lib/i18n/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Invoicing" })

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function InvoicingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get profile for nav
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const tier = (profile?.subscription_tier as "free" | "pro" | "premium") || "free"

  // Check if CSD is configured
  const { data: config } = await supabase
    .from("facturapi_config")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  // Get invoices
  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      `
      *,
      client:invoice_clients(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Check if CSD certificates are configured
  const isConfigured = config && config.certificate_file_path && config.key_file_path

  const t = await getTranslations("Invoicing")

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
        tier={tier === "premium" ? "pro" : tier === "pro" ? "pro" : "free"}
      />
      <main className="container mx-auto p-6">
        <PageHeader
          title={t("title")}
          description={t("description")}
          currentUserId={user.id}
          currentUserName={profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
          currentUserEmail={user.email || ""}
          actions={
            isConfigured ? (
              <Link href="/dashboard/invoicing/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
              </Link>
            ) : null
          }
        />

        <div className="space-y-6">
          {/* Configuration Warning */}
          {!isConfigured && (
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
                    <FileText className="h-4 w-4 mr-2" />
                    {t("goToProfile")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Invoices List */}
          {isConfigured && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t("invoicesList")}</h2>

              {!invoices || invoices.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("noInvoices")}</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      Comienza emitiendo tu primera factura electrónica CFDI 4.0
                    </p>
                    <Link href="/dashboard/invoicing/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("createFirstInvoice")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {invoices.map((invoice: any) => (
                    <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-lg">
                                {invoice.folio || `Borrador ${invoice.id.slice(0, 8)}`}
                              </CardTitle>
                              <Badge
                                variant={
                                  invoice.status === "stamped"
                                    ? "default"
                                    : invoice.status === "canceled"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {invoice.status === "stamped"
                                  ? "Timbrada"
                                  : invoice.status === "canceled"
                                    ? "Cancelada"
                                    : "Borrador"}
                              </Badge>
                            </div>
                            <CardDescription>
                              Cliente: {invoice.client?.legal_name || "N/A"}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">${invoice.total.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(invoice.created_at).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      {invoice.status === "stamped" && (
                        <CardContent>
                          <div className="flex gap-2">
                            {invoice.xml_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={invoice.xml_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-2" />
                                  XML
                                </a>
                              </Button>
                            )}
                            {invoice.pdf_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-2" />
                                  PDF
                                </a>
                              </Button>
                            )}
                          </div>
                          {invoice.uuid && (
                            <p className="text-xs text-muted-foreground mt-2">
                              UUID: {invoice.uuid}
                            </p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

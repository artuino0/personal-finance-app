"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { InvoiceData } from "../invoice-wizard"
import { ChevronLeft, FileCheck, Download } from "lucide-react"

interface SummaryStepProps {
  userId: string
  invoiceData: InvoiceData
  onBack: () => void
}

export function SummaryStep({ userId, invoiceData, onBack }: SummaryStepProps) {
  const t = useTranslations("Invoicing")
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const [isStamping, setIsStamping] = useState(false)

  const totals = invoiceData.products.reduce(
    (acc, product) => ({
      subtotal: acc.subtotal + product.subtotal,
      tax: acc.tax + product.tax,
      total: acc.total + product.total,
    }),
    { subtotal: 0, tax: 0, total: 0 }
  )

  const handleStamp = async () => {
    setIsStamping(true)

    try {
      // Create invoice record
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          client_id: invoiceData.client?.id,
          payment_form: invoiceData.payment_form,
          payment_method: invoiceData.payment_method,
          currency: invoiceData.currency,
          subtotal: totals.subtotal,
          tax: totals.tax,
          total: totals.total,
          status: "draft",
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create invoice items
      const items = invoiceData.products.map((product) => ({
        invoice_id: invoice.id,
        product_key: product.product_key,
        description: product.description,
        unit_key: product.unit_key,
        quantity: product.quantity,
        unit_price: product.unit_price,
        tax_rate: product.tax_rate,
        subtotal: product.subtotal,
        tax: product.tax,
        total: product.total,
      }))

      const { error: itemsError } = await supabase.from("invoice_items").insert(items)

      if (itemsError) throw itemsError

      // Call Facturapi API
      const response = await fetch("/api/facturapi/stamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoice.id,
          client: invoiceData.client,
          products: invoiceData.products,
          payment_form: invoiceData.payment_form,
          payment_method: invoiceData.payment_method,
          currency: invoiceData.currency,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al timbrar")
      }

      const result = await response.json()

      // Update invoice with facturapi data
      await supabase
        .from("invoices")
        .update({
          status: "stamped",
          facturapi_id: result.facturapi_id,
          folio: result.folio,
          uuid: result.uuid,
          xml_url: result.xml_url,
          pdf_url: result.pdf_url,
        })
        .eq("id", invoice.id)

      toast({
        title: t("success"),
        description: t("invoiceStamped"),
      })

      router.push("/dashboard/invoicing")
      router.refresh()
    } catch (error) {
      console.error("Error stamping invoice:", error)
      toast({
        title: t("error"),
        description: t("invoiceStampError"),
        variant: "destructive",
      })
    } finally {
      setIsStamping(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileCheck className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">{t("step4")}</h2>
      </div>

      <Card className="p-6 space-y-6">
        {/* Client Info */}
        <div>
          <h3 className="font-semibold mb-3 text-primary">{t("client")}</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">RFC:</span> {invoiceData.client?.rfc}
            </div>
            <div>
              <span className="font-medium">{t("clientName")}:</span>{" "}
              {invoiceData.client?.legal_name}
            </div>
            <div>
              <span className="font-medium">{t("clientRegimen")}:</span>{" "}
              {t(`regimens.${invoiceData.client?.tax_regime}` as any)}
            </div>
            <div>
              <span className="font-medium">{t("clientZipCode")}:</span>{" "}
              {invoiceData.client?.zip_code}
            </div>
            <div>
              <span className="font-medium">{t("clientUsoCFDI")}:</span>{" "}
              {t(`usoCFDI.${invoiceData.client?.cfdi_use}` as any)}
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <h3 className="font-semibold mb-3 text-primary">{t("products")}</h3>
          <div className="space-y-3">
            {invoiceData.products.map((product, index) => (
              <div key={index} className="border-l-2 border-primary pl-3">
                <div className="font-medium">{product.description}</div>
                <div className="text-sm text-muted-foreground">
                  {product.quantity} x ${product.unit_price.toFixed(2)} = $
                  {product.subtotal.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  IVA ({product.tax_rate}%): ${product.tax.toFixed(2)}
                </div>
                <div className="text-sm font-semibold">
                  Total: ${product.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div>
          <h3 className="font-semibold mb-3 text-primary">{t("paymentConditions")}</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">{t("paymentForm")}:</span>{" "}
              {t(`paymentForms.${invoiceData.payment_form}` as any)}
            </div>
            <div>
              <span className="font-medium">{t("paymentMethod")}:</span>{" "}
              {invoiceData.payment_method === "PUE"
                ? t("paymentMethodPUE")
                : t("paymentMethodPPD")}
            </div>
            <div>
              <span className="font-medium">{t("currency")}:</span> {invoiceData.currency}
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span>{t("subtotal")}:</span>
              <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>{t("iva")}:</span>
              <span className="font-semibold">${totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-primary border-t pt-2">
              <span>{t("total")}:</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        <Button
          type="button"
          onClick={handleStamp}
          disabled={isStamping}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <FileCheck className="h-4 w-4 mr-2" />
          {isStamping ? t("stamping") : t("stamp")}
        </Button>
      </div>
    </div>
  )
}

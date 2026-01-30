import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { invoice_id, client, products, payment_form, payment_method, currency } = body

    // Get Facturapi config
    const { data: config, error: configError } = await supabase
      .from("facturapi_config")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (configError || !config || !config.api_key) {
      return NextResponse.json(
        { error: "Facturapi no está configurado. Ve a tu perfil para configurarlo." },
        { status: 400 }
      )
    }

    // Prepare Facturapi request
    const facturapiData = {
      customer: {
        legal_name: client.legal_name,
        tax_id: client.rfc,
        tax_system: client.tax_regime,
        address: {
          zip: client.zip_code,
        },
      },
      items: products.map((product: any) => ({
        product: {
          description: product.description,
          product_key: product.product_key,
          unit_key: product.unit_key,
          unit_name: "Unidad",
          price: product.unit_price,
        },
        quantity: product.quantity,
        taxes: [
          {
            type: "IVA",
            rate: product.tax_rate / 100,
          },
        ],
      })),
      payment_form: payment_form,
      payment_method: payment_method,
      currency: currency,
      use: client.cfdi_use,
    }

    // Call Facturapi API
    const response = await fetch("https://www.facturapi.io/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.api_key}`,
      },
      body: JSON.stringify(facturapiData),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Facturapi error:", error)
      return NextResponse.json(
        { error: error.message || "Error al comunicarse con Facturapi" },
        { status: response.status }
      )
    }

    const facturapiInvoice = await response.json()

    // Return invoice data
    return NextResponse.json({
      success: true,
      facturapi_id: facturapiInvoice.id,
      folio: facturapiInvoice.folio_number,
      uuid: facturapiInvoice.uuid,
      xml_url: facturapiInvoice.verification_url,
      pdf_url: facturapiInvoice.pdf_url,
    })
  } catch (error) {
    console.error("Error in stamp route:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Get Facturapi API key from environment
    const facturapiApiKey = process.env.FACTURAPI_API_KEY
    if (!facturapiApiKey) {
      return NextResponse.json({ error: "Facturapi no configurado en el servidor" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const catalog = searchParams.get("catalog")

    if (!catalog) {
      return NextResponse.json({ error: "Catálogo no especificado" }, { status: 400 })
    }

    // Map catalog names to Facturapi endpoints
    const catalogEndpoints: Record<string, string> = {
      regimenes: "tax_systems",
      usos_cfdi: "cfdi_uses",
      formas_pago: "payment_forms",
      unidades: "units",
      productos: "product_keys",
    }

    const endpoint = catalogEndpoints[catalog]
    if (!endpoint) {
      return NextResponse.json({ error: "Catálogo no válido" }, { status: 400 })
    }

    // Call Facturapi API
    const response = await fetch(`https://www.facturapi.io/v2/catalogs/${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${facturapiApiKey}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Facturapi catalog error:", errorData)
      return NextResponse.json({ error: "Error al obtener catálogo de Facturapi" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching catalog:", error)
    return NextResponse.json({ error: "Error al obtener catálogo" }, { status: 500 })
  }
}

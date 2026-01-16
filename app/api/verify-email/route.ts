import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verificar que el usuario esté autenticado
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Buscar usuario por email usando la función RPC
    const { data, error } = await supabase.rpc("get_user_by_email", {
      user_email: email.toLowerCase(),
    })

    if (error) {
      console.error("[Kountly] Error al buscar usuario:", error)
      return NextResponse.json({ error: "Error al verificar el email" }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        exists: false,
        user: null,
      })
    }

    // Verificar que no sea el mismo usuario
    if (data[0].user_id === currentUser.id) {
      return NextResponse.json({ error: "No puedes compartir contigo mismo" }, { status: 400 })
    }

    return NextResponse.json({
      exists: true,
      user: {
        id: data[0].user_id,
        email: data[0].email,
        name: data[0].full_name || "Usuario",
      },
    })
  } catch (error) {
    console.error("[Kountly] Error en verify-email:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

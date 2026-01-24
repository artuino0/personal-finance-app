import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        // Fetch last 5 analysis reports for the user
        const { data: history, error: historyError } = await supabase
            .from("ai_analysis_history")
            .select("id, created_at, response, tier, period_start, period_end")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5)

        if (historyError) {
            console.error("Error fetching AI history:", historyError)
            return NextResponse.json(
                { error: "Error al obtener el historial" },
                { status: 500 }
            )
        }

        return NextResponse.json({ history: history || [] })
    } catch (error) {
        console.error("Unexpected error in AI history endpoint:", error)
        return NextResponse.json(
            { error: "Error inesperado al obtener el historial" },
            { status: 500 }
        )
    }
}

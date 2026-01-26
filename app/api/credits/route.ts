import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Verify user is authenticated
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Parse request body
        const body = await request.json()
        const {
            name,
            type,
            total_amount,
            remaining_amount,
            monthly_payment,
            total_installments,
            paid_installments,
            payment_day,
            interest_rate,
            start_date,
            due_date,
            end_date,
            user_id,
        } = body

        // Verify the user_id matches the authenticated user
        if (user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Insert credit into database
        const { data: credit, error: insertError } = await supabase
            .from("credits")
            .insert({
                user_id,
                name,
                type,
                total_amount,
                remaining_amount,
                monthly_payment,
                total_installments,
                paid_installments,
                payment_day,
                interest_rate,
                start_date,
                due_date,
                end_date,
                status: "active",
            })
            .select()
            .single()

        if (insertError) {
            console.error("[Credits API] Insert error:", insertError)
            return NextResponse.json({ error: "Failed to create credit", details: insertError.message }, { status: 500 })
        }

        return NextResponse.json(credit, { status: 201 })
    } catch (error) {
        console.error("[Credits API] Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

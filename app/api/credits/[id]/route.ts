import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const { id } = await params

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
        } = body

        // Verify the credit belongs to the user
        const { data: existingCredit, error: fetchError } = await supabase
            .from("credits")
            .select("user_id")
            .eq("id", id)
            .single()

        if (fetchError || !existingCredit) {
            return NextResponse.json({ error: "Credit not found" }, { status: 404 })
        }

        if (existingCredit.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Update credit in database
        const { data: credit, error: updateError } = await supabase
            .from("credits")
            .update({
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
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single()

        if (updateError) {
            console.error("[Credits API] Update error:", updateError)
            return NextResponse.json({ error: "Failed to update credit", details: updateError.message }, { status: 500 })
        }

        return NextResponse.json(credit, { status: 200 })
    } catch (error) {
        console.error("[Credits API] Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const { id } = await params

        // Verify the credit belongs to the user
        const { data: existingCredit, error: fetchError } = await supabase
            .from("credits")
            .select("user_id")
            .eq("id", id)
            .single()

        if (fetchError || !existingCredit) {
            return NextResponse.json({ error: "Credit not found" }, { status: 404 })
        }

        if (existingCredit.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Delete credit from database
        const { error: deleteError } = await supabase.from("credits").delete().eq("id", id)

        if (deleteError) {
            console.error("[Credits API] Delete error:", deleteError)
            return NextResponse.json({ error: "Failed to delete credit", details: deleteError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error("[Credits API] Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

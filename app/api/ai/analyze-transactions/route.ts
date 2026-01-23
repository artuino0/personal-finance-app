import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import {
    type AnalysisRequest,
    type AnalysisResponse,
    type Transaction,
    SYSTEM_PROMPT,
    buildPrompt,
    validateResponse,
} from "@/lib/ai-prompts"

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
    try {
        // 1. Parse request body (only period, no tier)
        const body = await request.json()
        const { period } = body

        // 2. Authenticate user
        const supabase = await createClient()

        // Debug: Check if auth works
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error("Auth Error in API:", authError)
            console.log("User in API:", user)
            return NextResponse.json({ error: "Unauthorized", details: authError?.message }, { status: 401 })
        }

        // 3. Fetch user profile to get subscription tier
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("subscription_tier")
            .eq("id", user.id)
            .single()

        if (profileError || !profile) {
            console.error("Error fetching user profile:", profileError)
            return NextResponse.json(
                { error: "Failed to fetch user profile" },
                { status: 500 }
            )
        }

        const tier = profile.subscription_tier as "free" | "pro"

        // 4. Determine date range
        let startDate: string
        let endDate: string

        if (period === "monthly" || !period) {
            // Current month
            const now = new Date()
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                .toISOString()
                .split("T")[0]
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                .toISOString()
                .split("T")[0]
        } else if (period.start && period.end) {
            // Custom range
            startDate = period.start
            endDate = period.end
        } else {
            return NextResponse.json(
                { error: "Invalid period. Use 'monthly' or provide {start, end} dates" },
                { status: 400 }
            )
        }

        // 5. Fetch user's transactions
        const { data: transactions, error: transactionsError } = await supabase
            .from("transactions")
            .select(
                `
        id,
        type,
        amount,
        description,
        date,
        category:global_categories(name),
        account:accounts(name)
      `
            )
            .eq("user_id", user.id)
            .gte("date", startDate)
            .lte("date", endDate)
            .order("date", { ascending: true })

        if (transactionsError) {
            console.error("Error fetching transactions:", transactionsError)
            return NextResponse.json(
                { error: "Failed to fetch transactions" },
                { status: 500 }
            )
        }

        // 6. Transform transactions to expected format
        const formattedTransactions: Transaction[] = transactions.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            description: t.description,
            date: t.date,
            category: t.category?.name || "Sin categoría",
            account_name: t.account?.name || "Cuenta desconocida",
        }))

        // Check if user has transactions
        if (formattedTransactions.length === 0) {
            return NextResponse.json(
                {
                    error: "No transactions found for the specified period",
                    period: { start: startDate, end: endDate },
                },
                { status: 404 }
            )
        }

        // 7. For Pro tier, fetch previous period data for comparisons
        let previousPeriodData = null
        if (tier === "pro") {
            const periodStart = new Date(startDate)
            const periodEnd = new Date(endDate)
            const periodDays = Math.ceil(
                (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
            )

            const prevStartDate = new Date(periodStart)
            prevStartDate.setDate(prevStartDate.getDate() - periodDays)
            const prevEndDate = new Date(periodStart)
            prevEndDate.setDate(prevEndDate.getDate() - 1)

            const { data: prevTransactions } = await supabase
                .from("transactions")
                .select("type, amount")
                .eq("user_id", user.id)
                .gte("date", prevStartDate.toISOString().split("T")[0])
                .lte("date", prevEndDate.toISOString().split("T")[0])

            if (prevTransactions && prevTransactions.length > 0) {
                const prevIncome = prevTransactions
                    .filter((t: any) => t.type === "income")
                    .reduce((sum: number, t: any) => sum + Number(t.amount), 0)
                const prevExpenses = prevTransactions
                    .filter((t: any) => t.type === "expense")
                    .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

                previousPeriodData = {
                    totalIncome: prevIncome,
                    totalExpenses: prevExpenses,
                    netBalance: prevIncome - prevExpenses,
                }
            }
        }

        // 8. Build prompt
        const userPrompt = buildPrompt(
            tier,
            formattedTransactions,
            { start: startDate, end: endDate },
            previousPeriodData
        )

        // 9. Call Claude Haiku API
        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307", // Corrected model name
            max_tokens: tier === "free" ? 1024 : 2048,
            temperature: 0.3, // Lower temperature for more consistent, factual responses
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
        })

        // 10. Parse and validate response
        const responseText = message.content[0].type === "text" ? message.content[0].text : ""

        let analysisResult: AnalysisResponse
        try {
            analysisResult = JSON.parse(responseText)
        } catch (parseError) {
            console.error("Failed to parse AI response:", responseText)
            return NextResponse.json(
                { error: "Invalid AI response format" },
                { status: 500 }
            )
        }

        // Validate response structure
        if (!validateResponse(analysisResult, tier)) {
            console.error("AI response validation failed:", analysisResult)
            return NextResponse.json(
                { error: "AI response does not match expected format" },
                { status: 500 }
            )
        }

        // 11. Return analysis result
        return NextResponse.json({
            success: true,
            analysis: analysisResult,
            metadata: {
                transactionCount: formattedTransactions.length,
                period: { start: startDate, end: endDate },
                tier,
                model: "claude-3-haiku-20240307",
                tokensUsed: {
                    input: message.usage.input_tokens,
                    output: message.usage.output_tokens,
                },
            },
        })
    } catch (error: any) {
        console.error("AI Analysis API Error:", error)

        // Handle specific Anthropic errors
        if (error.status === 401) {
            return NextResponse.json(
                { error: "Invalid Anthropic API key" },
                { status: 500 }
            )
        }

        if (error.status === 429) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Please try again later." },
                { status: 429 }
            )
        }

        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}

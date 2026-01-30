import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import dns from "node:dns"

dns.setDefaultResultOrder("ipv4first")
import Anthropic from "@anthropic-ai/sdk"
import {
    type AnalysisRequest,
    type AnalysisResponse,
    type Transaction,
    getSystemPrompt,
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
        const { period, locale = "es" } = body

        // 2. Authenticate user
        const supabase = await createClient()

        // Debug: Check if auth works
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser()

        if (authError || !user) {
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

        // NEW: Check Rate Limit (Rolling Window)
        const now = new Date()
        const checkDate = new Date(now)

        if (tier === "free") {
            // Free: 1 month rolling window
            checkDate.setMonth(checkDate.getMonth() - 1)
        } else {
            // Pro: 1 week rolling window
            checkDate.setDate(checkDate.getDate() - 7)
        }

        const { count: historyCount } = await supabase
            .from("ai_analysis_history")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("created_at", checkDate.toISOString());

        if (historyCount && historyCount > 0) {
            const waitMsg = tier === "free" ? "un mes" : "una semana"
            return NextResponse.json(
                { error: `Has alcanzado tu límite de reportes. Puedes generar uno nuevo cada ${waitMsg}.` },
                { status: 429 }
            )
        }

        // NEW: Fetch Historical Context
        const { data: lastAnalysis } = await supabase
            .from("ai_analysis_history")
            .select("response")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        let previousContext = undefined;
        if (lastAnalysis?.response) {
            const lastResponse = lastAnalysis.response as any;
            previousContext = {
                summary: lastResponse.summary,
                insights: lastResponse.insights || [],
                recommendations: lastResponse.recommendations || []
            }
        }

        // 8. Build prompt
        const userPrompt = buildPrompt(
            tier,
            formattedTransactions,
            { start: startDate, end: endDate },
            previousPeriodData,
            previousContext as any,
            locale
        )

        // 9. Call Claude Haiku API
        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: tier === "free" ? 2000 : 4000,
            temperature: 0.3,
            system: getSystemPrompt(locale),
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

        // NEW: Save History
        const { error: saveError } = await supabase.from("ai_analysis_history").insert({
            user_id: user.id,
            prompt: userPrompt,
            response: analysisResult,
            tier: tier,
            period_start: startDate,
            period_end: endDate,
            tokens_used: {
                input: message.usage.input_tokens,
                output: message.usage.output_tokens,
            }
        });

        if (saveError) {
            console.error("Failed to save analysis history:", saveError);
            // We don't fail the request, just log it
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

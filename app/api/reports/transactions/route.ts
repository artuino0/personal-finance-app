import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const accountId = searchParams.get("accountId")

    if (!startDate || !endDate) {
        return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // 1. Fetch accounts (filtered if accountId is provided)
        let accountsQuery = supabase
            .from("accounts")
            .select("id, name, currency, type")
            .eq("user_id", user.id)

        if (accountId && accountId !== "all") {
            accountsQuery = accountsQuery.eq("id", accountId)
        }

        const { data: accounts, error: accountsError } = await accountsQuery

        if (accountsError) throw accountsError

        // 2. Fetch transactions for these accounts within range
        const accountIds = accounts.map((a) => a.id)

        // We fetch all transactions for valid accounts in range
        const { data: transactions, error: transactionsError } = await supabase
            .from("transactions")
            .select(`
        id,
        description,
        amount,
        type,
        date,
        created_at,
        account_id,
        category:global_categories(name)
      `)
            .in("account_id", accountIds)
            .gte("date", startDate)
            .lte("date", endDate)
            .order("date", { ascending: true })

        if (transactionsError) throw transactionsError

        // 3. Group and Aggregate Data
        const groupedData = accounts.map((account) => {
            // Filter transactions for this account
            const accountTransactions = transactions.filter((t) => t.account_id === account.id)

            // Calculate subtotal (Income - Expense)
            // Assuming 'income' adds and 'expense'/'transfer' subtracts or handled logic?
            // Usually transfers might be excluded or handled differently. For simple balance:
            // Income is +, Expense is -. Transfer depends on if it's in or out, but usually stored as amount.
            // Let's assume schema stores amount as positive and 'type' determines sign.

            const subtotal = accountTransactions.reduce((acc, t) => {
                if (t.type === 'income') return acc + Number(t.amount)
                if (t.type === 'expense') return acc - Number(t.amount)
                // For transfers, if it is a transaction record in this account:
                // If it's a transfer OUT, it's usually negative. 
                // We'll treat 'transfer' as negative (money leaving) for now unless logic dictates otherwise.
                // Ideally transfers have pairs, but here we just see records.
                return acc - Number(t.amount)
            }, 0)

            return {
                account,
                transactions: accountTransactions,
                subtotal
            }
        })

        // 4. Calculate Grand Total (sum of subtotals)
        // Note: mixing currencies makes this tricky. We'll just sum raw numbers for now 
        // or maybe separating by currency is better. The user didn't specify, but let's assume one currency or sum raw.
        const grandTotal = groupedData.reduce((acc, group) => acc + group.subtotal, 0)

        return NextResponse.json({
            groupedData,
            grandTotal,
            period: { start: startDate, end: endDate }
        })

    } catch (error: any) {
        console.error("Report API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

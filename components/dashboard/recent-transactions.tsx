"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/navigation"
import { useTranslations, useFormatter } from "next-intl"

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  date: string
  accounts: { name: string } | null
  categories: { name: string; color: string | null } | null
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const t = useTranslations("Dashboard")
  const format = useFormatter()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("recentTransactions")}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/transactions">{t("viewAll")}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-600">{t("noTransactions")}</p>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: transaction.categories?.color || "#e2e8f0" }}
                  >
                    {transaction.type === "income" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {transaction.description || transaction.categories?.name || t("noDescription")}
                    </p>
                    <p className="text-xs text-slate-600">
                      {transaction.accounts?.name} •{" "}
                      {(() => {
                        const [year, month, day] = transaction.date.split("-").map(Number)
                        const date = new Date(year, month - 1, day)
                        return format.dateTime(date, { year: 'numeric', month: 'numeric', day: 'numeric' })
                      })()}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                >
                  {transaction.type === "income" ? "+" : "-"}$
                  {format.number(Number(transaction.amount), { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

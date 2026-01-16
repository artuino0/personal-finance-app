"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  color?: string
}

interface BalanceOverviewProps {
  accounts: Account[]
}

export function BalanceOverview({ accounts }: BalanceOverviewProps) {
  const t = useTranslations("Dashboard")
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("balanceOverview")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <p className="text-sm text-slate-600">{t("noAccounts")}</p>
          ) : (
            accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: account.color || "#64748b" }}
                  >
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{account.name}</p>
                    <p className="text-xs text-slate-600 capitalize">{account.type.replace("_", " ")}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  ${Number(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

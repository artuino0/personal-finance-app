"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Link } from "@/lib/i18n/navigation"
import { useTranslations, useFormatter } from "next-intl"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatCurrencyWithSymbol } from "@/lib/utils/currency"
import { Lock } from "lucide-react"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  color?: string | null
  created_at: string
}

interface AccountsListProps {
  accounts: Account[]
  userId: string
  permissions?: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
  limit: number | null
  tier: string
}

export function AccountsList({ accounts, userId, permissions, limit, tier }: AccountsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations("Accounts")
  const format = useFormatter()

  const canEdit = permissions?.edit ?? true
  const canDelete = permissions?.delete ?? true

  const handleDelete = async (accountId: string) => {
    const { error } = await supabase.from("accounts").delete().eq("id", accountId).eq("user_id", userId)

    if (error) {
      console.error("[v0] Error deleting account:", error)
      return
    }

    router.refresh()
  }

  const getAccountTypeLabel = (type: string) => {
    // This mapping uses the translation keys directly
    const types: Record<string, string> = {
      checking: t("types.checking"),
      savings: t("types.savings"),
      credit_card: t("types.credit_card"),
      cash: t("types.cash"),
      investment: t("types.investment"),
    }
    return types[type] || type
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-slate-600 mb-4">{t("noAccounts")}</p>
          {permissions?.create !== false && (
            <Button asChild>
              <Link href="/dashboard/accounts/new">{t("createFirstAccount")}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // Determine which accounts are locked based on limit
  // We want to keep the OLDEST accounts active (first created), and lock the newer ones if they exceed limit?
  // OR keep the NEWEST active? 
  // Standard practice: if you have 5 accounts and limit is 3, you usually get to keep access to N accounts.
  // The user didn't specify, but "bloquee el contenido de las otras cuentas" implies some remain visible.
  // Let's assume we show the first N created accounts (Oldest) as active to be consistent with "limit reached = can't create more".
  // So if I have accounts A, B, C, D, E (created in that order). Limit 3. A, B, C are active. D, E are locked.

  // Sort by created_at ascending to identify the "first" N allowed accounts
  const sortedAccounts = [...accounts].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedAccounts.map((account, index) => {
        const isLocked = limit !== null && index >= limit

        if (isLocked) {
          return (
            <Card key={account.id} className="relative overflow-hidden border-dashed border-2">
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px] p-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{t("accountLocked")}</h3>
                <p className="text-sm text-muted-foreground mb-3">{t("upgradeToView")}</p>
                <Button asChild size="sm" variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                  <Link href="/dashboard/upgrade">
                    {t("upgradePlan")}
                  </Link>
                </Button>
              </div>

              <CardContent className="pt-6 filter blur-[4px] select-none pointer-events-none opacity-50">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: account.color || "#64748b" }}
                  >
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{account.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{getAccountTypeLabel(account.type)}</p>
                <p className="text-2xl font-bold text-foreground">
                  $***,***.**
                </p>
                <p className="text-xs text-slate-600 mt-1">{account.currency}</p>
              </CardContent>
            </Card>
          )
        }

        return (
          <Card key={account.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: account.color || "#64748b" }}
                >
                  {account.name.charAt(0).toUpperCase()}
                </div>
                {(canEdit || canDelete) && (
                  <div className="flex gap-2">
                    {canEdit && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/accounts/${account.id}`}>{t("edit")}</Link>
                      </Button>
                    )}
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            {t("delete")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("confirmDeleteDescription")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(account.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t("delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{account.name}</h3>
              <p className="text-sm text-slate-600 mb-3">{getAccountTypeLabel(account.type)}</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrencyWithSymbol(Number(account.balance))}
              </p>
              <p className="text-xs text-slate-600 mt-1">{account.currency}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

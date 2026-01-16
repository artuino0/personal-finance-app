"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Edit, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react"

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  date: string
  account_id: string
  accounts: { name: string; color: string | null } | null
  categories: { name: string; color: string | null; icon: string | null } | null
}

interface TransactionsListProps {
  transactions: Transaction[]
  userId: string
  permissions?: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
}

export function TransactionsList({ transactions, userId, permissions }: TransactionsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations("Transactions")
  const format = useFormatter()

  const canEdit = permissions?.edit ?? true
  const canDelete = permissions?.delete ?? true

  const handleDelete = async (transactionId: string, amount: number, accountId: string, type: string) => {
    // Delete transaction
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId)
      .eq("user_id", userId)

    if (deleteError) {
      console.error("[v0] Error deleting transaction:", deleteError)
      return
    }

    // Update account balance
    const { data: account } = await supabase.from("accounts").select("balance").eq("id", accountId).single()

    if (account) {
      const newBalance = type === "income" ? Number(account.balance) - amount : Number(account.balance) + amount

      await supabase.from("accounts").update({ balance: newBalance }).eq("id", accountId)
    }

    router.refresh()
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-slate-600 mb-4">{t("noTransactions")}</p>
          {permissions?.create !== false && (
            <Button asChild>
              <Link href="/dashboard/transactions/new">{t("createFirstTransaction")}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">{t("history")}</h2>
          <span className="text-sm text-muted-foreground">{t("transactionCount", { count: transactions.length })}</span>
        </div>
      </div>
      <div className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/60">
              <TableHead className="w-[50px] pl-5"></TableHead>
              <TableHead className="w-[100px]">{t("date")}</TableHead>
              <TableHead className="w-[250px] min-w-[200px]">{t("description")}</TableHead>
              <TableHead>{t("category")}</TableHead>
              <TableHead>{t("account")}</TableHead>
              <TableHead className="text-right">{t("amount")}</TableHead>
              {(canEdit || canDelete) && <TableHead className="text-right pr-5">{t("actions")}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-muted/50 border-b border-border/60">
                <TableCell className="pl-5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-700">
                  {(() => {
                    const [year, month, day] = transaction.date.split("-").map(Number)
                    const date = new Date(year, month - 1, day)
                    return format.dateTime(date, { year: 'numeric', month: 'short', day: 'numeric' })
                  })()}
                </TableCell>
                <TableCell
                  className="max-w-[250px] truncate font-medium"
                  title={transaction.description || t("noDescription")}
                >
                  {transaction.description || t("noDescription")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full ring-1 ring-offset-1 ring-slate-200"
                      style={{ backgroundColor: transaction.categories?.color || "#64748b" }}
                    />
                    <span className="text-slate-600">{transaction.categories?.name || t("noCategory")}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">{transaction.accounts?.name}</TableCell>
                <TableCell
                  className={`text-right font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {transaction.type === "income" ? "+" : "-"}$
                  {format.number(Number(transaction.amount), { minimumFractionDigits: 2 })}
                </TableCell>
                {(canEdit || canDelete) && (
                  <TableCell className="text-right pr-5">
                    <div className="flex justify-end gap-2">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title={t("edit")}
                          className="h-8 w-8 text-slate-500 hover:text-primary"
                        >
                          <Link href={`/dashboard/transactions/${transaction.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {canDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-red-600"
                              title={t("delete")}
                            >
                              <Trash2 className="h-4 w-4" />
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
                                onClick={() =>
                                  handleDelete(
                                    transaction.id,
                                    Number(transaction.amount),
                                    transaction.account_id,
                                    transaction.type,
                                  )
                                }
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {t("delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

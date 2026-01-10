"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
}

export function TransactionsList({ transactions, userId }: TransactionsListProps) {
  const router = useRouter()
  const supabase = createClient()

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
          <p className="text-slate-600 mb-4">No hay transacciones registradas</p>
          <Button asChild>
            <Link href="/dashboard/transactions/new">Crear mi primera transacción</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Historial</h2>
          <span className="text-sm text-muted-foreground">{transactions.length} transacciones</span>
        </div>
      </div>
      <div className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/60">
              <TableHead className="w-[50px] pl-5"></TableHead>
              <TableHead className="w-[100px]">Fecha</TableHead>
              <TableHead className="w-[250px] min-w-[200px]">Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right pr-5">Acciones</TableHead>
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
                    const dayStr = String(day).padStart(2, "0")
                    const monthStr = String(month).padStart(2, "0")
                    return `${dayStr}/${monthStr}/${year}`
                  })()}
                </TableCell>
                <TableCell className="max-w-[250px] truncate font-medium" title={transaction.description || "Sin descripción"}>
                  {transaction.description || "Sin descripción"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full ring-1 ring-offset-1 ring-slate-200"
                      style={{ backgroundColor: transaction.categories?.color || "#64748b" }}
                    />
                    <span className="text-slate-600">{transaction.categories?.name || "Sin categoría"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">{transaction.accounts?.name}</TableCell>
                <TableCell
                  className={`text-right font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {transaction.type === "income" ? "+" : "-"}$
                  {Number(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right pr-5">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild title="Editar" className="h-8 w-8 text-slate-500 hover:text-primary">
                      <Link href={`/dashboard/transactions/${transaction.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la transacción y se actualizará el balance de
                            la cuenta.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

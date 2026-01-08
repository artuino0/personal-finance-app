"use client"

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

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  date: string
  account_id: string // Added account_id to interface
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
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                style={{ backgroundColor: transaction.categories?.color || "#64748b" }}
              >
                {transaction.type === "income" ? "↑" : "↓"}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {transaction.description || transaction.categories?.name || "Sin descripción"}
                </h3>
                <p className="text-sm text-slate-600">
                  {transaction.accounts?.name} • {new Date(transaction.date).toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <p className={`text-lg font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {transaction.type === "income" ? "+" : "-"}$
                {Number(transaction.amount).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/transactions/${transaction.id}`}>Editar</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará la transacción y se actualizará el balance de la
                        cuenta.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          handleDelete(
                            transaction.id,
                            Number(transaction.amount),
                            transaction.account_id, // Using actual account_id instead of name
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

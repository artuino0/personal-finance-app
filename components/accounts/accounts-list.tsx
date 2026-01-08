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

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  color?: string | null
}

interface AccountsListProps {
  accounts: Account[]
  userId: string
}

export function AccountsList({ accounts, userId }: AccountsListProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (accountId: string) => {
    const { error } = await supabase.from("accounts").delete().eq("id", accountId).eq("user_id", userId)

    if (error) {
      console.error("[v0] Error deleting account:", error)
      return
    }

    router.refresh()
  }

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      checking: "Cuenta Corriente",
      savings: "Cuenta de Ahorros",
      credit_card: "Tarjeta de Crédito",
      cash: "Efectivo",
      investment: "Inversión",
    }
    return types[type] || type
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-slate-600 mb-4">No tienes cuentas registradas</p>
          <Button asChild>
            <Link href="/dashboard/accounts/new">Crear mi primera cuenta</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <Card key={account.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: account.color || "#64748b" }}
              >
                {account.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/accounts/${account.id}`}>Editar</Link>
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
                        Esta acción no se puede deshacer. Se eliminará la cuenta y todas sus transacciones asociadas.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(account.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{account.name}</h3>
            <p className="text-sm text-slate-600 mb-3">{getAccountTypeLabel(account.type)}</p>
            <p className="text-2xl font-bold text-slate-900">
              ${Number(account.balance).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-1">{account.currency}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

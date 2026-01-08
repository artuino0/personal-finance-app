"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Account {
  id: string
  name: string
  balance: number
}

interface Category {
  id: string
  name: string
  type: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  date: string
  account_id: string
  category_id: string | null
}

interface TransactionFormProps {
  userId: string
  accounts: Account[]
  categories: Category[]
  transaction?: Transaction
}

export function TransactionForm({ userId, accounts, categories, transaction }: TransactionFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    type: transaction?.type || "expense",
    amount: transaction?.amount?.toString() || "",
    description: transaction?.description || "",
    date: transaction?.date || new Date().toISOString().split("T")[0],
    account_id: transaction?.account_id || "",
    category_id: transaction?.category_id || "",
  })

  const filteredCategories = categories.filter((cat) => cat.type === formData.type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const amount = Number.parseFloat(formData.amount)
      const data = {
        user_id: userId,
        type: formData.type,
        amount,
        description: formData.description || null,
        date: formData.date,
        account_id: formData.account_id,
        category_id: formData.category_id || null,
      }

      if (transaction) {
        // Update existing transaction
        const { error: updateError } = await supabase
          .from("transactions")
          .update(data)
          .eq("id", transaction.id)
          .eq("user_id", userId)

        if (updateError) throw updateError

        // Update account balance (revert old and apply new)
        const account = accounts.find((a) => a.id === formData.account_id)
        if (account) {
          const oldAmount = transaction.type === "income" ? -transaction.amount : transaction.amount
          const newAmount = formData.type === "income" ? amount : -amount
          const balanceChange = oldAmount + newAmount

          await supabase
            .from("accounts")
            .update({ balance: Number(account.balance) + balanceChange })
            .eq("id", formData.account_id)
        }
      } else {
        // Create new transaction
        const { error: insertError } = await supabase.from("transactions").insert([data])

        if (insertError) throw insertError

        // Update account balance
        const account = accounts.find((a) => a.id === formData.account_id)
        if (account) {
          const newBalance =
            formData.type === "income" ? Number(account.balance) + amount : Number(account.balance) - amount

          await supabase.from("accounts").update({ balance: newBalance }).eq("id", formData.account_id)
        }
      }

      router.push("/dashboard/transactions")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Gasto</TabsTrigger>
              <TabsTrigger value="income">Ingreso</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Cuenta</Label>
            <Select
              value={formData.account_id}
              onValueChange={(value) => setFormData({ ...formData, account_id: value })}
              required
            >
              <SelectTrigger id="account">
                <SelectValue placeholder="Selecciona una cuenta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Añade una nota sobre esta transacción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Guardando..." : transaction ? "Actualizar Transacción" : "Crear Transacción"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

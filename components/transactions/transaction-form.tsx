"use client"

import type React from "react"
import { useTranslations } from "next-intl"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsIOS } from "@/lib/hooks/use-is-ios"

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
  const isIOS = useIsIOS()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("Transactions")

  // Find category by name if provided
  const categoryNameParam = searchParams.get("categoryName")
  const categoryIdParam = searchParams.get("categoryId")

  let initialCategoryId = transaction?.category_id || categoryIdParam || ""

  if (!initialCategoryId && categoryNameParam) {
    const foundCategory = categories.find(
      (c) => c.name.toLowerCase() === categoryNameParam.toLowerCase() && c.type === (transaction?.type || "expense"),
    )
    if (foundCategory) {
      initialCategoryId = foundCategory.id
    }
  }

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState({
    type: transaction?.type || "expense",
    amount: transaction?.amount?.toString() || searchParams.get("amount") || "",
    description: transaction?.description || searchParams.get("description") || "",
    date: transaction?.date || searchParams.get("date") || getLocalDateString(),
    account_id: transaction?.account_id || searchParams.get("accountId") || "",
    category_id: initialCategoryId,
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
      setError(error instanceof Error ? error.message : t("genericError"))
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
              <TabsTrigger value="expense">{t("expense")}</TabsTrigger>
              <TabsTrigger value="income">{t("income")}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="amount">{t("amount")}</Label>
            <CurrencyInput
              id="amount"
              placeholder="0.00"
              value={formData.amount}
              onValueChange={(value) => setFormData({ ...formData, amount: value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">{t("account")}</Label>
            {isIOS ? (
              <NativeSelect
                id="account"
                value={formData.account_id}
                onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                placeholder={t("selectAccount")}
                required
              >
                {accounts.map((account) => (
                  <NativeSelectItem key={account.id} value={account.id}>
                    {account.name}
                  </NativeSelectItem>
                ))}
              </NativeSelect>
            ) : (
              <Select
                value={formData.account_id}
                onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                required
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder={t("selectAccount")} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t("category")}</Label>
            {isIOS ? (
              <NativeSelect
                id="category"
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                placeholder={t("selectCategory")}
              >
                {filteredCategories.map((category) => (
                  <NativeSelectItem key={category.id} value={category.id}>
                    {category.name}
                  </NativeSelectItem>
                ))}
              </NativeSelect>
            ) : (
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{t("date")}</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("descriptionOptional")}</Label>
            <Textarea
              id="description"
              placeholder={t("descriptionPlaceholder")}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? t("saving") : transaction ? t("updateTransaction") : t("createTransaction")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t("cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card >
  )
}

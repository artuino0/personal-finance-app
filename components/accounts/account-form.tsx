"use client"

import type React from "react"
import { useTranslations } from "next-intl"

import { useState } from "react"
import { useRouter } from "@/lib/i18n/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  color?: string | null
}

interface AccountFormProps {
  userId: string
  account?: Account
}



const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

export function AccountForm({ userId, account }: AccountFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("Accounts")

  const [formData, setFormData] = useState({
    name: account?.name || "",
    type: account?.type || "checking",
    balance: account?.balance?.toString() || "0",
    currency: account?.currency || "USD",
    color: account?.color || COLORS[0],
  })

  // We need to define types inside helper or useTranslations return value
  const ACCOUNT_TYPES = [
    { value: "checking", label: t("types.checking") },
    { value: "savings", label: t("types.savings") },
    { value: "credit_card", label: t("types.credit_card") },
    { value: "cash", label: t("types.cash") },
    { value: "investment", label: t("types.investment") },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const data = {
        user_id: userId,
        name: formData.name,
        type: formData.type,
        balance: Number.parseFloat(formData.balance),
        currency: formData.currency,
        color: formData.color,
      }

      if (account) {
        const { error } = await supabase.from("accounts").update(data).eq("id", account.id).eq("user_id", userId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("accounts").insert([data])

        if (error) throw error
      }

      router.push("/dashboard/accounts")
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
          <div className="space-y-2">
            <Label htmlFor="name">{t("accountName")}</Label>
            <Input
              id="name"
              placeholder={t("namePlaceholder")}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t("accountType")}</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">{t("initialBalance")}</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">{t("currency")}</Label>
            <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - Dólar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("color")}</Label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-10 w-10 rounded-lg border-2 transition-all ${formData.color === color ? "border-slate-900 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? t("saving") : account ? t("updateAccount") : t("createAccount")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t("cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

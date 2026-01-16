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
import { CurrencyInput } from "@/components/ui/currency-input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useTranslations } from "next-intl"

interface Account {
  id: string
  name: string
  type: string
}

interface Service {
  id: string
  name: string
  category: string
  amount: number
  frequency: string
  payment_day: number
  next_payment_date: string
  account_id: string | null
  notes: string | null
  is_active: boolean
}

interface ServiceFormProps {
  userId: string
  accounts: Account[]
  service?: Service
}

export function ServiceForm({ userId, accounts, service }: ServiceFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations("Services")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: service?.name || "",
    category: service?.category || "utilities",
    amount: service?.amount.toString() || "0",
    frequency: service?.frequency || "monthly",
    payment_day: service?.payment_day.toString() || "1",
    next_payment_date: service?.next_payment_date || new Date().toISOString().split("T")[0],
    account_id: service?.account_id || "",
    notes: service?.notes || "",
    is_active: service?.is_active ?? true,
  })

  // Dynamic labels based on translations
  const CATEGORIES = [
    { value: "utilities", label: t("categories.utilities") },
    { value: "subscriptions", label: t("categories.subscriptions") },
    { value: "insurance", label: t("categories.insurance") },
    { value: "rent", label: t("categories.rent") },
    { value: "other", label: t("categories.other") },
  ]

  const FREQUENCIES = [
    { value: "weekly", label: t("frequencies.weekly") },
    { value: "biweekly", label: t("frequencies.biweekly") },
    { value: "monthly", label: t("frequencies.monthly") },
    { value: "yearly", label: t("frequencies.yearly") },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const data = {
        user_id: userId,
        name: formData.name,
        category: formData.category,
        amount: Number.parseFloat(formData.amount),
        frequency: formData.frequency,
        payment_day: Number.parseInt(formData.payment_day),
        next_payment_date: formData.next_payment_date,
        account_id: formData.account_id || null,
        notes: formData.notes || null,
        is_active: formData.is_active,
      }

      if (service) {
        const { error } = await supabase.from("recurring_services").update(data).eq("id", service.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("recurring_services").insert([data])
        if (error) throw error
      }

      router.push("/dashboard/services")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t("form.genericError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input
              id="name"
              placeholder={t("form.placeholderName")}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t("form.category")}</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">{t("form.amount")}</Label>
              <CurrencyInput
                id="amount"
                placeholder="0.00"
                value={formData.amount}
                onValueChange={(value) => setFormData({ ...formData, amount: value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">{t("form.frequency")}</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment_day">{t("form.paymentDay")}</Label>
              <Input
                id="payment_day"
                type="number"
                min="1"
                max="31"
                value={formData.payment_day}
                onChange={(e) => setFormData({ ...formData, payment_day: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_payment_date">{t("form.nextPaymentDate")}</Label>
              <Input
                id="next_payment_date"
                type="date"
                value={formData.next_payment_date}
                onChange={(e) => setFormData({ ...formData, next_payment_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_id">{t("form.paymentAccount")}</Label>
            <Select
              value={formData.account_id}
              onValueChange={(value) => setFormData({ ...formData, account_id: value })}
            >
              <SelectTrigger id="account_id">
                <SelectValue placeholder={t("form.placeholderAccount")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("form.none")}</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("form.notes")}</Label>
            <Textarea
              id="notes"
              placeholder={t("form.placeholderNotes")}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="is_active" className="cursor-pointer">
                {t("form.active")}
              </Label>
              <p className="text-xs text-slate-600">{t("form.activeDesc")}</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? t("form.saving") : service ? t("form.update") : t("form.save")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t("form.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput } from "@/components/ui/currency-input"

interface Credit {
  id: string
  name: string
  type: string
  total_amount: number
  remaining_amount: number
  interest_rate: number | null
  monthly_payment: number | null
  due_date: string | null
  start_date: string
  end_date: string | null
  payment_day: number | null
  total_installments: number | null
  paid_installments: number
  status: string
}

interface CreditFormProps {
  userId: string
  creditToEdit?: Credit
  onSuccess?: () => void
}

export function CreditForm({ userId, creditToEdit, onSuccess }: CreditFormProps) {
  const router = useRouter()
  const t = useTranslations("Credits")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [includeDateCalculation, setIncludeDateCalculation] = useState(false)

  // Initial state for form fields
  const [formData, setFormData] = useState({
    name: creditToEdit?.name || "",
    type: creditToEdit?.type || "loan",
    total_amount: creditToEdit?.total_amount?.toString() || "",
    remaining_amount: creditToEdit?.remaining_amount?.toString() || "",
    interest_rate: creditToEdit?.interest_rate?.toString() || "",
    start_date: creditToEdit?.start_date ? new Date(creditToEdit.start_date).toISOString().split("T")[0] : "",
    due_date: creditToEdit?.due_date ? new Date(creditToEdit.due_date).toISOString().split("T")[0] : "",
    end_date: creditToEdit?.end_date ? new Date(creditToEdit.end_date).toISOString().split("T")[0] : "",
    monthly_payment: creditToEdit?.monthly_payment?.toString() || "",
    // Auto calculation fields
    total_months: "",
    months_paid: "",
    payment_day: "",
  })

  // Credit types constant moved inside component for translation
  const CREDIT_TYPES = [
    { value: "loan", label: t("types.loan") },
    { value: "credit_card", label: t("types.credit_card") },
    { value: "mortgage", label: t("types.mortgage") },
    { value: "personal_loan", label: t("types.personal_loan") },
  ]

  const calculateDates = () => {
    if (!formData.total_months || !formData.months_paid || !formData.payment_day) return

    const totalMonths = Number.parseInt(formData.total_months)
    const monthsPaid = Number.parseInt(formData.months_paid)
    const paymentDay = Number.parseInt(formData.payment_day)
    const today = new Date()

    // Calculate start date: today - monthsPaid months
    const startDate = new Date(today.getFullYear(), today.getMonth() - monthsPaid, paymentDay)

    // Calculate next due date: next occurrence of paymentDay
    let nextDueDate = new Date(today.getFullYear(), today.getMonth(), paymentDay)
    if (nextDueDate < today) {
      nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay)
    }

    // Calculate end date: startDate + totalMonths months
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + totalMonths, paymentDay)

    setFormData((prev) => ({
      ...prev,
      start_date: startDate.toISOString().split("T")[0],
      due_date: nextDueDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    }))
  }

  // Effect to recalculate dates when auto-calc fields change
  useEffect(() => {
    if (includeDateCalculation) {
      calculateDates()
    }
  }, [formData.total_months, formData.months_paid, formData.payment_day, includeDateCalculation]) //Corrected dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const url = creditToEdit ? `/api/credits/${creditToEdit.id}` : "/api/credits"
      const method = creditToEdit ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          user_id: userId,
          remaining_amount: formData.remaining_amount || formData.total_amount,
        }),
      })

      if (!response.ok) throw new Error("Failed to save credit")

      router.refresh()
      if (onSuccess) onSuccess()
      else router.push("/dashboard/credits")
    } catch (err) {
      setError(t("genericError"))
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-sm">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("creditName")}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder={t("namePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">{t("creditType")}</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CREDIT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total_amount">{t("totalAmount")}</Label>
            <Input
              id="total_amount"
              type="number"
              step="0.01"
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              required
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remaining_amount">{t("remainingAmount")}</Label>
            <Input
              id="remaining_amount"
              type="number"
              step="0.01"
              value={formData.remaining_amount}
              onChange={(e) => setFormData({ ...formData, remaining_amount: e.target.value })}
              placeholder={t("leaveEmptyTotal")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthly_payment">{t("monthlyPayment")}</Label>
            <Input
              id="monthly_payment"
              type="number"
              step="0.01"
              value={formData.monthly_payment}
              onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interest_rate">{t("interestRateLabel")}</Label>
            <Input
              id="interest_rate"
              type="number"
              step="0.01"
              value={formData.interest_rate}
              onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
              placeholder="0.0"
            />
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-date"
              checked={includeDateCalculation}
              onCheckedChange={(checked: boolean | "indeterminate") => setIncludeDateCalculation(!!checked)}
            />
            <Label htmlFor="auto-date" className="font-medium">{t("autoDateCalc")}</Label>
          </div>

          {includeDateCalculation && (
            <div className="grid gap-4 mt-2 slide-in-from-top-2 animate-in fade-in duration-300">
              <div className="text-sm text-muted-foreground mb-2">
                {t("autoCalcHelp")}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_months">{t("totalMonths")}</Label>
                  <Input
                    id="total_months"
                    type="number"
                    value={formData.total_months}
                    onChange={(e) => setFormData({ ...formData, total_months: e.target.value })}
                    placeholder="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="months_paid">{t("monthsPaid")}</Label>
                  <Input
                    id="months_paid"
                    type="number"
                    value={formData.months_paid}
                    onChange={(e) => setFormData({ ...formData, months_paid: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_day">{t("paymentDay")}</Label>
                  <Input
                    id="payment_day"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.payment_day}
                    onChange={(e) => setFormData({ ...formData, payment_day: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">
              {t("startDateLabel", {
                calculated: includeDateCalculation ? t("calculatedMasculine") : ""
              })}
            </Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
              disabled={includeDateCalculation}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">
              {t("nextDueDateLabel", {
                calculated: includeDateCalculation ? t("calculatedMasculine") : ""
              })}
            </Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              disabled={includeDateCalculation}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">
              {t("endDateLabel", {
                calculated: includeDateCalculation ? t("calculatedMasculine") : ""
              })}
            </Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              disabled={includeDateCalculation}
            />
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? t("saving") : creditToEdit ? t("updateCredit") : t("createCredit")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => (onSuccess ? onSuccess() : router.push("/dashboard/credits"))}
          className="flex-1"
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  )
}

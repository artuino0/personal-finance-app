"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "@/lib/i18n/navigation"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator } from "lucide-react"

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

  // Initial state for form fields
  const [formData, setFormData] = useState({
    name: creditToEdit?.name || "",
    type: creditToEdit?.type || "loan",
    total_amount: creditToEdit?.total_amount?.toString() || "",
    monthly_payment: creditToEdit?.monthly_payment?.toString() || "",
    total_months: creditToEdit?.total_installments?.toString() || "",
    months_paid: creditToEdit?.paid_installments?.toString() || "0",
    payment_day: creditToEdit?.payment_day?.toString() || "",
    interest_rate: creditToEdit?.interest_rate?.toString() || "",
  })

  // Track which field was last modified to determine what to calculate
  const [lastModified, setLastModified] = useState<'total' | 'monthly' | 'months' | null>(null)

  // Credit types constant moved inside component for translation
  const CREDIT_TYPES = [
    { value: "loan", label: t("types.loan") },
    { value: "credit_card", label: t("types.credit_card") },
    { value: "mortgage", label: t("types.mortgage") },
    { value: "personal_loan", label: t("types.personal_loan") },
  ]

  // Auto-calculate total, monthly payment, or total months based on the other two values
  useEffect(() => {
    const total = parseFloat(formData.total_amount) || 0
    const monthly = parseFloat(formData.monthly_payment) || 0
    const months = parseInt(formData.total_months) || 0

    // Count how many fields have values
    const filledFields = [
      formData.total_amount ? 'total' : null,
      formData.monthly_payment ? 'monthly' : null,
      formData.total_months ? 'months' : null
    ].filter(Boolean)

    // Only auto-calculate when exactly 2 fields are filled
    if (filledFields.length === 2) {
      // Calculate based on which field is empty
      if (!formData.monthly_payment && total > 0 && months > 0) {
        const calculatedMonthly = (total / months).toFixed(2)
        setFormData((prev) => ({ ...prev, monthly_payment: calculatedMonthly }))
      } else if (!formData.total_months && total > 0 && monthly > 0) {
        const calculatedMonths = Math.ceil(total / monthly).toString()
        setFormData((prev) => ({ ...prev, total_months: calculatedMonths }))
      } else if (!formData.total_amount && months > 0 && monthly > 0) {
        const calculatedTotal = (months * monthly).toFixed(2)
        setFormData((prev) => ({ ...prev, total_amount: calculatedTotal }))
      }
    }
    // When all 3 fields are filled, recalculate the one that wasn't last modified
    else if (filledFields.length === 3 && lastModified) {
      if (lastModified === 'total' && monthly > 0 && months > 0) {
        // User modified total, recalculate it based on monthly * months
        const calculatedTotal = (months * monthly).toFixed(2)
        if (calculatedTotal !== formData.total_amount) {
          setFormData((prev) => ({ ...prev, total_amount: calculatedTotal }))
        }
      } else if (lastModified === 'monthly' && total > 0 && months > 0) {
        // User modified monthly, recalculate total
        const calculatedTotal = (months * monthly).toFixed(2)
        if (calculatedTotal !== formData.total_amount) {
          setFormData((prev) => ({ ...prev, total_amount: calculatedTotal }))
        }
      } else if (lastModified === 'months' && total > 0 && monthly > 0) {
        // User modified months, recalculate total
        const calculatedTotal = (months * monthly).toFixed(2)
        if (calculatedTotal !== formData.total_amount) {
          setFormData((prev) => ({ ...prev, total_amount: calculatedTotal }))
        }
      }
    }
  }, [formData.total_amount, formData.monthly_payment, formData.total_months, lastModified])

  // Calculate dates and progress
  const calculateDatesAndProgress = () => {
    const totalMonths = parseInt(formData.total_months) || 0
    const monthsPaid = parseInt(formData.months_paid) || 0
    const paymentDay = parseInt(formData.payment_day) || 1
    const today = new Date()

    if (totalMonths === 0) return { start_date: "", due_date: "", end_date: "", remaining_amount: formData.total_amount, progress: 0 }

    // Calculate start date: today - monthsPaid months
    const startDate = new Date(today.getFullYear(), today.getMonth() - monthsPaid, paymentDay)

    // Calculate next due date: next occurrence of paymentDay
    let nextDueDate = new Date(today.getFullYear(), today.getMonth(), paymentDay)
    if (nextDueDate < today) {
      nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay)
    }

    // Calculate end date: startDate + totalMonths months
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + totalMonths, paymentDay)

    // Calculate remaining amount
    const total = parseFloat(formData.total_amount) || 0
    const monthly = parseFloat(formData.monthly_payment) || 0
    const remainingAmount = Math.max(0, total - (monthly * monthsPaid))
    const progress = total > 0 ? ((monthsPaid / totalMonths) * 100).toFixed(0) : "0"

    return {
      start_date: startDate.toISOString().split("T")[0],
      due_date: nextDueDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      remaining_amount: remainingAmount.toFixed(2),
      progress: parseInt(progress)
    }
  }

  const calculatedValues = calculateDatesAndProgress()

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
          name: formData.name,
          type: formData.type,
          total_amount: parseFloat(formData.total_amount) || 0,
          remaining_amount: parseFloat(calculatedValues.remaining_amount) || 0,
          monthly_payment: parseFloat(formData.monthly_payment) || 0,
          total_installments: parseInt(formData.total_months) || 0,
          paid_installments: parseInt(formData.months_paid) || 0,
          payment_day: parseInt(formData.payment_day) || null,
          interest_rate: parseFloat(formData.interest_rate) || null,
          start_date: calculatedValues.start_date,
          due_date: calculatedValues.due_date,
          end_date: calculatedValues.end_date,
          user_id: userId,
        }),
      })

      if (!response.ok) throw new Error("Failed to save credit")

      router.refresh()
      if (onSuccess) onSuccess()
      else router.push("/dashboard/credits" as any)
    } catch (err) {
      setError(t("genericError"))
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-sm">
      <div className="grid gap-6">
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

        <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">{t("autoCalculation")}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{t("autoCalculationHelp")}</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_amount">{t("totalAmount")}</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => {
                  setFormData({ ...formData, total_amount: e.target.value })
                  setLastModified('total')
                }}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_payment">{t("monthlyPayment")}</Label>
              <Input
                id="monthly_payment"
                type="number"
                step="0.01"
                value={formData.monthly_payment}
                onChange={(e) => {
                  setFormData({ ...formData, monthly_payment: e.target.value })
                  setLastModified('monthly')
                }}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_months">{t("totalMonths")}</Label>
              <Input
                id="total_months"
                type="number"
                value={formData.total_months}
                onChange={(e) => {
                  setFormData({ ...formData, total_months: e.target.value })
                  setLastModified('months')
                }}
                placeholder="12"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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

        {/* Preview of calculated values */}
        {(formData.total_amount || formData.monthly_payment || formData.total_months) && (
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-semibold text-sm mb-3">{t("calculatedPreview")}</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">{t("progress")}:</span>
                <span className="ml-2 font-medium">{calculatedValues.progress}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("remainingAmount")}:</span>
                <span className="ml-2 font-medium">${calculatedValues.remaining_amount}</span>
              </div>
              {calculatedValues.start_date && (
                <>
                  <div>
                    <span className="text-muted-foreground">{t("startDate")}:</span>
                    <span className="ml-2 font-medium">{new Date(calculatedValues.start_date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("nextDueDate")}:</span>
                    <span className="ml-2 font-medium">{new Date(calculatedValues.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">{t("estimatedEndDate")}:</span>
                    <span className="ml-2 font-medium">{new Date(calculatedValues.end_date).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
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

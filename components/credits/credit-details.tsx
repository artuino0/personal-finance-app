"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, Link } from "@/lib/i18n/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useTranslations } from "next-intl"
import { Trash2 } from "lucide-react"

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
  status: string
}

interface Payment {
  id: string
  amount: number
  payment_date: string
}

interface CreditDetailsProps {
  credit: Credit
  payments: Payment[]
  userId: string
  permissions: {
    canView: boolean
    canEdit: boolean
    canDelete: boolean
  }
}

export function CreditDetails({ credit, payments, userId, permissions }: CreditDetailsProps) {
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const t = useTranslations("Credits")

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/credits/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creditId: credit.id,
          amount: Number.parseFloat(amount),
          date: new Date().toISOString(),
          userId,
        }),
      })

      if (!response.ok) throw new Error("Failed to register payment")

      router.refresh()
      setAmount("")
    } catch (error) {
      console.error("Error registering payment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete"))) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/credits/${credit.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete credit")

      router.push("/dashboard/credits" as any)
      router.refresh()
    } catch (error) {
      console.error("Error deleting credit:", error)
      alert(t("deleteError"))
    } finally {
      setIsDeleting(false)
    }
  }

  const getCreditTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      loan: t("types.loan"),
      credit_card: t("types.credit_card"),
      mortgage: t("types.mortgage"),
      personal_loan: t("types.personal_loan"),
    }
    return types[type] || type
  }

  const progress =
    ((Number(credit.total_amount) - Number(credit.remaining_amount)) / Number(credit.total_amount)) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("creditDetails")}</h2>
        <div className="flex gap-2">
          {permissions.canEdit && (
            <Button asChild variant="outline">
              <Link href={`/dashboard/credits/${credit.id}/edit`}>{t("edit")}</Link>
            </Button>
          )}
          {permissions.canDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? t("deleting") : t("delete")}
            </Button>
          )}
          <Button asChild variant="ghost">
            <Link href="/dashboard/credits">{t("back")}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("generalInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{credit.name}</h3>
              <p className="text-sm text-slate-500">{getCreditTypeLabel(credit.type)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">{t("totalAmount")}</p>
                <p className="text-xl font-bold">
                  ${Number(credit.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">{t("remainingAmount")}</p>
                <p className="text-xl font-bold text-red-600">
                  ${Number(credit.remaining_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">{t("paymentProgress")}</span>
                <span className="font-medium">{t("progressPaid", { progress: progress.toFixed(0) })}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">{t("interestRate")}</p>
                <p className="font-medium">{t("annualRate", { rate: credit.interest_rate ?? 0 })}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">{t("startDate")}</p>
                <p className="font-medium">{new Date(credit.start_date).toLocaleDateString("en-US")}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">{t("monthlyPayment")}</p>
                <p className="font-medium">
                  ${(credit.monthly_payment || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">{t("nextDueDate")}</p>
                <p className="font-medium">
                  {credit.due_date ? new Date(credit.due_date).toLocaleDateString("en-US") : t("noDate")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {permissions.canEdit && (
            <Card>
              <CardHeader>
                <CardTitle>{t("registerPayment")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">{t("paymentAmount")}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? t("processing") : t("registerPayment")}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t("paymentHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">{t("noPayments")}</p>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">
                          ${Number(payment.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-500">{new Date(payment.payment_date).toLocaleDateString("en-US")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-600 font-medium">{t("totalPaid")}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

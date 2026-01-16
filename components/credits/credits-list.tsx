"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Link } from "@/lib/i18n/navigation"
import { useTranslations } from "next-intl"

interface Credit {
  id: string
  name: string
  type: string
  total_amount: number
  remaining_amount: number
  interest_rate: number | null
  monthly_payment: number | null
  due_date: string | null
  status: string
}

interface CreditsListProps {
  credits: Credit[]
  userId: string
  permissions: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
}

export function CreditsList({ credits, userId, permissions }: CreditsListProps) {
  const t = useTranslations("Credits")

  const getCreditTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      loan: t("types.loan"),
      credit_card: t("types.credit_card"),
      mortgage: t("types.mortgage"),
      personal_loan: t("types.personal_loan"),
    }
    return types[type] || type
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      paid: "bg-blue-100 text-blue-800",
      defaulted: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-slate-100 text-slate-800"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: t("active"),
      paid: t("paid"),
      defaulted: t("defaulted"),
    }
    return labels[status] || status
  }

  if (credits.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-slate-600 mb-4">{t("noCredits")}</p>
          <Button asChild>
            <Link href="/dashboard/credits/new">{t("createFirstCredit")}</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {credits.map((credit) => {
        const progress =
          ((Number(credit.total_amount) - Number(credit.remaining_amount)) / Number(credit.total_amount)) * 100

        return (
          <Card key={credit.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{credit.name}</h3>
                  <p className="text-sm text-slate-600">{getCreditTypeLabel(credit.type)}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(credit.status)}`}>
                  {getStatusLabel(credit.status)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">{t("paymentProgress")}</span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">{t("total")}</p>
                    <p className="text-sm font-semibold">
                      ${Number(credit.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{t("remaining")}</p>
                    <p className="text-sm font-semibold text-red-600">
                      ${Number(credit.remaining_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">{t("monthlyPayment")}</p>
                    <p className="text-sm font-semibold">
                      ${(credit.monthly_payment || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{t("nextDueDate")}</p>
                    <p className="text-sm font-semibold">
                      {credit.due_date ? new Date(credit.due_date).toLocaleDateString("en-US") : t("noDate")}
                    </p>
                  </div>
                </div>

                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href={`/dashboard/credits/${credit.id}`}>{t("viewDetails")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

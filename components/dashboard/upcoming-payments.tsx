"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CreditCard, Repeat } from "lucide-react"

interface Credit {
  id: string
  name: string
  monthly_payment: number | null
  due_date: string | null
}

interface Service {
  id: string
  name: string
  amount: number
  next_payment_date: string
  frequency: string
}

interface UpcomingPaymentsProps {
  credits: Credit[]
  services: Service[]
}

export function UpcomingPayments({ credits, services }: UpcomingPaymentsProps) {
  // Combine and sort payments by date
  const allPayments = [
    ...credits.map((c) => ({
      id: c.id,
      name: c.name,
      amount: c.monthly_payment || 0,
      date: c.due_date || "",
      type: "credit" as const,
    })),
    ...services.map((s) => ({
      id: s.id,
      name: s.name,
      amount: s.amount,
      date: s.next_payment_date,
      type: "service" as const,
    })),
  ]
    .filter((p) => p.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  const getDaysUntil = (dateString: string) => {
    const today = new Date()
    const paymentDate = new Date(dateString)
    const diffTime = paymentDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Próximos Pagos</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/services">Servicios</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/credits">Créditos</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allPayments.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-4">No tienes pagos pendientes</p>
          ) : (
            allPayments.map((payment) => {
              const daysUntil = getDaysUntil(payment.date)
              const isUrgent = daysUntil >= 0 && daysUntil <= 7

              return (
                <div
                  key={`${payment.type}-${payment.id}`}
                  className={`flex items-center justify-between p-3 rounded-lg border ${isUrgent ? "border-orange-200 bg-orange-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${payment.type === "credit" ? "bg-blue-100" : "bg-purple-100"}`}
                    >
                      {payment.type === "credit" ? (
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Repeat className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{payment.name}</p>
                      <p className="text-xs text-slate-600">
                        {daysUntil === 0
                          ? "Vence hoy"
                          : daysUntil === 1
                            ? "Vence mañana"
                            : daysUntil > 0
                              ? `En ${daysUntil} días`
                              : `Vencido hace ${Math.abs(daysUntil)} días`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${payment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {payment.type === "credit" ? "Crédito" : "Servicio"}
                    </Badge>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

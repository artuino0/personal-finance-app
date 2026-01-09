"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Credit {
  id: string
  name: string
  monthly_payment: number | null
  due_date: string | null
}

interface UpcomingPaymentsProps {
  credits: Credit[]
}

export function UpcomingPayments({ credits }: UpcomingPaymentsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Próximos Pagos</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/credits">Ver todos</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {credits.length === 0 ? (
            <p className="text-sm text-slate-600">No tienes pagos pendientes</p>
          ) : (
            credits.map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-3 rounded-lg ">
                <div>
                  <p className="text-sm font-medium text-foreground">{credit.name}</p>
                  <p className="text-xs text-slate-600">
                    Vence: {credit.due_date ? new Date(credit.due_date).toLocaleDateString("en-US") : "Sin fecha"}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  ${credit.monthly_payment?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

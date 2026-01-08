"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

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
}

export function CreditDetails({ credit, payments, userId }: CreditDetailsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")

  const progress = ((Number(credit.total_amount) - Number(credit.remaining_amount)) / Number(credit.total_amount)) * 100

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const amount = Number.parseFloat(paymentAmount)

      // Insert payment record
      const { error: paymentError } = await supabase.from("credit_payments").insert([
        {
          credit_id: credit.id,
          user_id: userId,
          amount,
          payment_date: new Date().toISOString().split("T")[0],
        },
      ])

      if (paymentError) throw paymentError

      // Update credit remaining amount
      const newRemainingAmount = Number(credit.remaining_amount) - amount
      const newStatus = newRemainingAmount <= 0 ? "paid" : "active"

      const { error: updateError } = await supabase
        .from("credits")
        .update({
          remaining_amount: Math.max(0, newRemainingAmount),
          status: newStatus,
        })
        .eq("id", credit.id)

      if (updateError) throw updateError

      setPaymentAmount("")
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Error processing payment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{credit.name}</h1>
          <p className="text-slate-600">Detalles del crédito</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/credits">Volver</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Monto Total</p>
                <p className="text-lg font-semibold">
                  ${Number(credit.total_amount).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Restante</p>
                <p className="text-lg font-semibold text-red-600">
                  ${Number(credit.remaining_amount).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-2">Progreso del pago</p>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-slate-600 mt-1">{progress.toFixed(1)}% pagado</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Pago Mensual</p>
                <p className="text-base font-semibold">
                  ${(credit.monthly_payment || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Tasa de Interés</p>
                <p className="text-base font-semibold">{credit.interest_rate || 0}% anual</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Fecha de Inicio</p>
                <p className="text-base font-semibold">{new Date(credit.start_date).toLocaleDateString("es-ES")}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Próximo Vencimiento</p>
                <p className="text-base font-semibold">
                  {credit.due_date ? new Date(credit.due_date).toLocaleDateString("es-ES") : "Sin fecha"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registrar Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment_amount">Monto del Pago</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading || credit.status === "paid"} className="w-full">
                {isLoading ? "Procesando..." : "Registrar Pago"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-slate-600 mb-2">Total pagado</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalPaid.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">No hay pagos registrados</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3  rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">
                      ${Number(payment.amount).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(payment.payment_date).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

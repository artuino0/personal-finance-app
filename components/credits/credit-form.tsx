"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  credit?: Credit
}

const CREDIT_TYPES = [
  { value: "loan", label: "Préstamo" },
  { value: "credit_card", label: "Tarjeta de Crédito" },
  { value: "mortgage", label: "Hipoteca" },
  { value: "personal_loan", label: "Préstamo Personal" },
]

export function CreditForm({ userId, credit }: CreditFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: credit?.name || "",
    type: credit?.type || "loan",
    total_amount: credit?.total_amount.toString() || "",
    remaining_amount: credit?.remaining_amount.toString() || "",
    interest_rate: credit?.interest_rate?.toString() || "",
    monthly_payment: credit?.monthly_payment?.toString() || "",
    payment_day: credit?.payment_day?.toString() || "",
    total_installments: credit?.total_installments?.toString() || "",
    paid_installments: credit?.paid_installments.toString() || "0",
    start_date: credit?.start_date || "",
    due_date: credit?.due_date || "",
    end_date: credit?.end_date || "",
  })

  useEffect(() => {
    if (formData.total_installments && formData.paid_installments && formData.payment_day) {
      const totalMonths = Number.parseInt(formData.total_installments)
      const paidMonths = Number.parseInt(formData.paid_installments)
      const paymentDay = Number.parseInt(formData.payment_day)

      const today = new Date()

      // Calcular fecha de inicio (meses atrás desde hoy)
      const startDate = new Date(today)
      startDate.setMonth(startDate.getMonth() - paidMonths)
      startDate.setDate(paymentDay)

      // Calcular próximo vencimiento
      const nextDueDate = new Date(today)
      nextDueDate.setDate(paymentDay)
      if (nextDueDate <= today) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1)
      }

      // Calcular fecha final (meses restantes desde hoy)
      const remainingMonths = totalMonths - paidMonths
      const endDate = new Date(today)
      endDate.setMonth(endDate.getMonth() + remainingMonths)
      endDate.setDate(paymentDay)

      setFormData((prev) => ({
        ...prev,
        start_date: startDate.toISOString().split("T")[0],
        due_date: nextDueDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      }))
    }
  }, [formData.total_installments, formData.paid_installments, formData.payment_day])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const data = {
        user_id: userId,
        name: formData.name,
        type: formData.type,
        total_amount: Number.parseFloat(formData.total_amount),
        remaining_amount: Number.parseFloat(formData.remaining_amount || formData.total_amount),
        interest_rate: formData.interest_rate ? Number.parseFloat(formData.interest_rate) : null,
        monthly_payment: formData.monthly_payment ? Number.parseFloat(formData.monthly_payment) : null,
        payment_day: formData.payment_day ? Number.parseInt(formData.payment_day) : null,
        total_installments: formData.total_installments ? Number.parseInt(formData.total_installments) : null,
        paid_installments: Number.parseInt(formData.paid_installments || "0"),
        due_date: formData.due_date || null,
        start_date: formData.start_date || new Date().toISOString().split("T")[0],
        end_date: formData.end_date || null,
        status: credit?.status || "active",
      }

      if (credit) {
        const { error } = await supabase.from("credits").update(data).eq("id", credit.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("credits").insert([data])
        if (error) throw error
      }

      router.push("/dashboard/credits")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Crédito</Label>
            <Input
              id="name"
              placeholder="Ej: Préstamo Banco XYZ"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Crédito</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger id="type">
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

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="total_amount">Monto Total</Label>
              <CurrencyInput
                id="total_amount"
                placeholder="0.00"
                value={formData.total_amount}
                onValueChange={(value) => setFormData({ ...formData, total_amount: value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remaining_amount">Monto Restante</Label>
              <CurrencyInput
                id="remaining_amount"
                placeholder="0.00"
                value={formData.remaining_amount}
                onValueChange={(value) => setFormData({ ...formData, remaining_amount: value })}
              />
              <p className="text-xs text-slate-600">Dejar vacío para usar el monto total</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interest_rate">Tasa de Interés (% anual)</Label>
              <Input
                id="interest_rate"
                type="number"
                step="0.01"
                placeholder="5.00"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_payment">Pago Mensual</Label>
              <CurrencyInput
                id="monthly_payment"
                placeholder="0.00"
                value={formData.monthly_payment}
                onValueChange={(value) => setFormData({ ...formData, monthly_payment: value })}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-slate-50 p-4">
            <h3 className="mb-4 font-semibold">Cálculo Automático de Fechas</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="total_installments">Total de Meses</Label>
                <Input
                  id="total_installments"
                  type="number"
                  min="1"
                  placeholder="12"
                  value={formData.total_installments}
                  onChange={(e) => setFormData({ ...formData, total_installments: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paid_installments">Meses Pagados</Label>
                <Input
                  id="paid_installments"
                  type="number"
                  min="0"
                  placeholder="5"
                  value={formData.paid_installments}
                  onChange={(e) => setFormData({ ...formData, paid_installments: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_day">Día de Pago (1-31)</Label>
                <Input
                  id="payment_day"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="26"
                  value={formData.payment_day}
                  onChange={(e) => setFormData({ ...formData, payment_day: e.target.value })}
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Completa estos campos para calcular automáticamente las fechas de inicio, próximo pago y fin del crédito
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha de Inicio {formData.start_date && "(Calculada)"}</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Próximo Vencimiento {formData.due_date && "(Calculado)"}</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha Final {formData.end_date && "(Calculada)"}</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Guardando..." : credit ? "Actualizar Crédito" : "Crear Crédito"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

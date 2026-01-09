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

interface CreditFormProps {
  userId: string
}

const CREDIT_TYPES = [
  { value: "loan", label: "Préstamo" },
  { value: "credit_card", label: "Tarjeta de Crédito" },
  { value: "mortgage", label: "Hipoteca" },
  { value: "personal_loan", label: "Préstamo Personal" },
]

export function CreditForm({ userId }: CreditFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    type: "loan",
    total_amount: "",
    remaining_amount: "",
    interest_rate: "",
    monthly_payment: "",
    due_date: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  })

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
        due_date: formData.due_date || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: "active",
      }

      const { error } = await supabase.from("credits").insert([data])

      if (error) throw error

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

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Próximo Vencimiento</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha Final</Label>
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
              {isLoading ? "Guardando..." : "Crear Crédito"}
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

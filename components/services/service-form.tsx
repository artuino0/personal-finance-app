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

const CATEGORIES = [
  { value: "utilities", label: "Servicios (luz, agua, gas)" },
  { value: "subscriptions", label: "Suscripciones (Netflix, Spotify)" },
  { value: "insurance", label: "Seguros" },
  { value: "rent", label: "Renta/Alquiler" },
  { value: "other", label: "Otro" },
]

const FREQUENCIES = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
]

export function ServiceForm({ userId, accounts, service }: ServiceFormProps) {
  const router = useRouter()
  const supabase = createClient()
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
            <Label htmlFor="name">Nombre del Servicio</Label>
            <Input
              id="name"
              placeholder="Ej: Netflix, Luz, Internet"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
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
              <Label htmlFor="amount">Monto</Label>
              <CurrencyInput
                id="amount"
                placeholder="0.00"
                value={formData.amount}
                onValueChange={(value) => setFormData({ ...formData, amount: value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frecuencia</Label>
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
              <Label htmlFor="payment_day">Día de Pago (1-31)</Label>
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
              <Label htmlFor="next_payment_date">Próxima Fecha de Pago</Label>
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
            <Label htmlFor="account_id">Cuenta de Pago (Opcional)</Label>
            <Select
              value={formData.account_id}
              onValueChange={(value) => setFormData({ ...formData, account_id: value })}
            >
              <SelectTrigger id="account_id">
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre este servicio"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="is_active" className="cursor-pointer">
                Servicio Activo
              </Label>
              <p className="text-xs text-slate-600">Los servicios inactivos no aparecen en próximos pagos</p>
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
              {isLoading ? "Guardando..." : service ? "Actualizar Servicio" : "Crear Servicio"}
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

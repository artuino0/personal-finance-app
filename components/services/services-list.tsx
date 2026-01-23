"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Zap, Tv, Shield, Home, MoreHorizontal, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslations, useFormatter } from "next-intl"

interface Service {
  id: string
  name: string
  category: string
  amount: number
  frequency: string
  payment_day: number
  next_payment_date: string
  account_id: string | null
  is_active: boolean
  accounts?: { name: string } | null
}

interface ServicesListProps {
  services: Service[]
  userId: string
}

const CATEGORY_ICONS = {
  utilities: Zap,
  subscriptions: Tv,
  insurance: Shield,
  rent: Home,
  other: MoreHorizontal,
}

const CATEGORY_LABELS = {
  utilities: "Servicios",
  subscriptions: "Suscripciones",
  insurance: "Seguros",
  rent: "Renta",
  other: "Otro",
}

const FREQUENCY_LABELS = {
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
  yearly: "Anual",
}

export function ServicesList({ services, userId }: ServicesListProps) {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations("Services")
  const format = useFormatter()

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    await supabase
      .from("recurring_services")
      .update({ is_active: !currentStatus })
      .eq("id", serviceId)
      .eq("user_id", userId)

    router.refresh()
  }

  const handleDelete = async (serviceId: string, serviceName: string) => {
    if (!confirm(t("actions.deleteConfirm", { name: serviceName }))) return

    await supabase.from("recurring_services").delete().eq("id", serviceId).eq("user_id", userId)

    router.refresh()
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[200px] items-center justify-center">
          <p className="text-slate-500">{t("empty")}</p>
        </CardContent>
      </Card>
    )
  }

  const getDaysUntilPayment = (nextPaymentDate: string) => {
    const today = new Date()
    const paymentDate = new Date(nextPaymentDate)
    const diffTime = paymentDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const Icon = CATEGORY_ICONS[service.category as keyof typeof CATEGORY_ICONS]
        const daysUntil = getDaysUntilPayment(service.next_payment_date)

        return (
          <Card key={service.id} className={!service.is_active ? "opacity-60" : ""}>
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-xs text-slate-600">
                      {t(`categories.${service.category}` as any)}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        const d = new Date()
                        const year = d.getFullYear()
                        const month = String(d.getMonth() + 1).padStart(2, "0")
                        const day = String(d.getDate()).padStart(2, "0")
                        const today = `${year}-${month}-${day}`

                        router.push(
                          `/dashboard/transactions/new?description=${encodeURIComponent(service.name)}&amount=${service.amount}&date=${today}&accountId=${service.account_id || ""}&categoryName=${encodeURIComponent("Servicios")}`,
                        )
                      }}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      {t("actions.registerPayment")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/services/${service.id}`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("actions.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(service.id, service.is_active)}>
                      {service.is_active ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          {t("actions.deactivate")}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {t("actions.activate")}
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(service.id, service.name)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("actions.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-2xl">
                    ${format.number(service.amount, { minimumFractionDigits: 2 })}
                  </span>
                  <Badge variant="secondary">
                    {t(`frequencies.${service.frequency}` as any)}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{t("nextPayment")}:</span>
                    <span className="font-medium">
                      {format.dateTime(new Date(service.next_payment_date + "T00:00:00"), {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  {daysUntil >= 0 && daysUntil <= 7 && service.is_active && (
                    <Badge variant="destructive" className="w-full justify-center">
                      {daysUntil === 0 ? t("dueToday") : t("dueInDays", { days: daysUntil })}
                    </Badge>
                  )}
                  {service.accounts && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{t("account")}:</span>
                      <span className="font-medium">{service.accounts.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

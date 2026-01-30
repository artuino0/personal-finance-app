"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { ChevronLeft, CreditCard } from "lucide-react"

interface PaymentStepProps {
  initialPaymentForm: string
  initialPaymentMethod: string
  initialCurrency: string
  onPaymentSaved: (payment_form: string, payment_method: string, currency: string) => void
  onBack: () => void
}

export function PaymentStep({
  initialPaymentForm,
  initialPaymentMethod,
  initialCurrency,
  onPaymentSaved,
  onBack,
}: PaymentStepProps) {
  const t = useTranslations("Invoicing")

  const [paymentForm, setPaymentForm] = useState(initialPaymentForm)
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod)
  const [currency, setCurrency] = useState(initialCurrency)

  const handleContinue = () => {
    onPaymentSaved(paymentForm, paymentMethod, currency)
  }

  const paymentForms = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "08",
    "12",
    "13",
    "14",
    "15",
    "17",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "99",
  ]

  const currencies = [
    { code: "MXN", name: "Peso Mexicano" },
    { code: "USD", name: "Dólar Americano" },
    { code: "EUR", name: "Euro" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">{t("step3")}</h2>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <h3 className="font-semibold mb-4">{t("paymentConditions")}</h3>

          {/* Payment Form */}
          <div className="space-y-3 mb-6">
            <Label htmlFor="payment_form">{t("paymentForm")}</Label>
            <Select value={paymentForm} onValueChange={setPaymentForm}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={t("paymentFormPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {paymentForms.map((form) => (
                  <SelectItem key={form} value={form}>
                    {t(`paymentForms.${form}` as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 mb-6">
            <Label>{t("paymentMethod")}</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="PUE" id="pue" />
                <Label htmlFor="pue" className="flex-1 cursor-pointer font-normal">
                  <div className="font-medium">{t("paymentMethodPUE")}</div>
                  <div className="text-sm text-muted-foreground">
                    Pago completo al momento de la emisión
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="PPD" id="ppd" />
                <Label htmlFor="ppd" className="flex-1 cursor-pointer font-normal">
                  <div className="font-medium">{t("paymentMethodPPD")}</div>
                  <div className="text-sm text-muted-foreground">
                    {t("paymentMethodPPDNote")}
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Currency */}
          <div className="space-y-3">
            <Label htmlFor="currency">{t("currency")}</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        <Button type="button" onClick={handleContinue} className="flex-1">
          {t("continue")}
        </Button>
      </div>
    </div>
  )
}

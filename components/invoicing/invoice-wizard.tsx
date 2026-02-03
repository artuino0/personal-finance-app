"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, FileCheck } from "lucide-react"
import { ClientStep } from "./steps/client-step"
import { ProductsStep } from "./steps/products-step"
import { PaymentStep } from "./steps/payment-step"
import { SummaryStep } from "./steps/summary-step"

export interface InvoiceClient {
  id?: string
  rfc: string
  legal_name: string
  tax_regime: string
  zip_code: string
  cfdi_use: string
}

export interface InvoiceProduct {
  id?: string
  product_key: string
  description: string
  unit_key: string
  quantity: number
  unit_price: number
  tax_rate: number
  subtotal: number
  tax: number
  total: number
}

export interface InvoiceData {
  client: InvoiceClient | null
  products: InvoiceProduct[]
  payment_form: string
  payment_method: string
  currency: string
}

const STEPS = [
  { id: 1, key: "client" },
  { id: 2, key: "products" },
  { id: 3, key: "payment" },
  { id: 4, key: "summary" },
]

export function InvoiceWizard({ userId }: { userId: string }) {
  const t = useTranslations("Invoicing")
  const [currentStep, setCurrentStep] = useState(1)
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    client: null,
    products: [],
    payment_form: "03",
    payment_method: "PUE",
    currency: "MXN",
  })

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClientSaved = (client: InvoiceClient) => {
    setInvoiceData({ ...invoiceData, client })
    handleNext()
  }

  const handleProductsSaved = (products: InvoiceProduct[]) => {
    setInvoiceData({ ...invoiceData, products })
    handleNext()
  }

  const handlePaymentSaved = (
    payment_form: string,
    payment_method: string,
    currency: string
  ) => {
    setInvoiceData({ ...invoiceData, payment_form, payment_method, currency })
    handleNext()
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors ${
                currentStep >= step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.id}
            </div>
            <div className="ml-3 flex-1">
              <p
                className={`text-sm font-medium ${
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {t(`step${step.id}` as any)}
              </p>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-4 h-0.5 flex-1 ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-6">
        {currentStep === 1 && (
          <ClientStep
            userId={userId}
            initialClient={invoiceData.client}
            onClientSaved={handleClientSaved}
            onBack={() => {}}
          />
        )}

        {currentStep === 2 && (
          <ProductsStep
            userId={userId}
            initialProducts={invoiceData.products}
            onProductsSaved={handleProductsSaved}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <PaymentStep
            initialPaymentForm={invoiceData.payment_form}
            initialPaymentMethod={invoiceData.payment_method}
            initialCurrency={invoiceData.currency}
            onPaymentSaved={handlePaymentSaved}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && (
          <SummaryStep
            userId={userId}
            invoiceData={invoiceData}
            onBack={handleBack}
          />
        )}
      </Card>
    </div>
  )
}

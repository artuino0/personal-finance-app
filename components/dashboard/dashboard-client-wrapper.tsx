"use client"

import { useState } from "react"
import { UpcomingPayments } from "./upcoming-payments"
import { TransactionDrawer } from "@/components/transactions/transaction-drawer"

interface DashboardClientWrapperProps {
  credits: any[]
  services: any[]
  locale: string
}

export function DashboardClientWrapper({ credits, services, locale }: DashboardClientWrapperProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [prefilledData, setPrefilledData] = useState<{
    description: string
    amount: string
  } | null>(null)

  const handlePaymentClick = (payment: { name: string; amount: number; type: string }) => {
    // Get today's date in local YYYY-MM-DD format
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const currentDate = `${year}-${month}-${day}`

    setPrefilledData({
      description: `Pago ${payment.type}: ${payment.name}`,
      amount: payment.amount.toString(),
    })
    setIsDrawerOpen(true)
  }

  return (
    <>
      <UpcomingPayments 
        credits={credits} 
        services={services} 
        onPaymentClick={handlePaymentClick}
      />
      
      <TransactionDrawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open)
          if (!open) setPrefilledData(null)
        }}
        locale={locale}
        prefilledData={prefilledData}
      />
    </>
  )
}

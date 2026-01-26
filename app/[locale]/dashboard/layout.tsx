import type React from "react"
import { FloatingActionButton } from "@/components/dashboard/floating-action-button"
import { PaymentSuccessModal } from "@/components/dashboard/payment-success-modal"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingActionButton />
      <PaymentSuccessModal />
    </>
  )
}

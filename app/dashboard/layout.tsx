import type React from "react"
import { FloatingActionButton } from "@/components/dashboard/floating-action-button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingActionButton />
    </>
  )
}

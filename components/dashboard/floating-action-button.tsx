"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { TransactionDrawer } from "@/components/transactions/transaction-drawer"

export function FloatingActionButton() {
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || "es"
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Don't show on certain pages
  if (
    pathname?.includes("/new") ||
    pathname?.includes("/edit") ||
    pathname?.includes("/auth") ||
    pathname?.includes("/sharing")
  ) {
    return null
  }

  return (
    <>
      <Button
        onClick={() => setDrawerOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 md:h-16 md:w-16"
        aria-label="Nueva transacción"
      >
        <Plus className="h-6 w-6 md:h-7 md:w-7" />
      </Button>
      
      <TransactionDrawer 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen}
        locale={locale}
      />
    </>
  )
}

"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { TransactionDrawer } from "@/components/transactions/transaction-drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl"

export function FloatingActionButton() {
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || "es"
  const [drawerOpen, setDrawerOpen] = useState(false)
  const t = useTranslations("Dashboard")

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id="tour-new-transaction"
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 md:h-16 md:w-16"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">{t("newTransaction")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="mb-2">
          <DropdownMenuItem onClick={() => setDrawerOpen(true)}>
            {t("newTransaction")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TransactionDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        locale={locale}
      />
    </>
  )
}

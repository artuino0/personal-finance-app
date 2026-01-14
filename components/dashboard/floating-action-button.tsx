"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function FloatingActionButton() {
  const pathname = usePathname()

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
    <Button
      asChild
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 md:h-16 md:w-16"
    >
      <Link href="/dashboard/transactions/new" aria-label="Nueva transacción">
        <Plus className="h-6 w-6 md:h-7 md:w-7" />
      </Link>
    </Button>
  )
}

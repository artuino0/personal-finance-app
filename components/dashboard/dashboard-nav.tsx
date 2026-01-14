"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ReportGeneratorDialog } from "@/components/reports/report-generator-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

interface DashboardNavProps {
  userName: string
  userAvatar?: string
  userEmail?: string
}

export function DashboardNav({ userName, userAvatar }: DashboardNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/accounts", label: "Cuentas" },
    { href: "/dashboard/transactions", label: "Transacciones" },
    { href: "/dashboard/services", label: "Servicios" },
    { href: "/dashboard/credits", label: "Créditos" },
    { href: "/dashboard/sharing", label: "Compartir" },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="text-left">FindexApp</SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-muted ${
                      pathname === item.href ? "bg-muted text-foreground" : "text-slate-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <ReportGeneratorDialog>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex items-center rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-muted w-full"
                  >
                    Reportes
                  </button>
                </ReportGeneratorDialog>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="text-xl font-bold text-foreground">
            FindexApp
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  pathname === item.href ? "text-foreground" : "text-slate-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <ReportGeneratorDialog>
              <span className="text-sm font-medium text-slate-700 hover:text-foreground cursor-pointer">Reportes</span>
            </ReportGeneratorDialog>
          </div>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 rounded-full pl-1 pr-4 py-1 hover:bg-muted/50 transition-all h-auto"
            >
              <div className="overflow-hidden flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm">
                {userAvatar ? (
                  <img src={userAvatar || "/placeholder.svg"} alt={userName} className="h-full w-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden md:inline text-sm font-medium">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Configuración</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardNavProps {
  userName: string
  userAvatar?: string
  userEmail?: string
}

export function DashboardNav({ userName, userAvatar }: DashboardNavProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 border-b border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/accounts">Cuentas</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/transactions">Transacciones</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/services">Servicios</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/credits">Créditos</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/dashboard" className="text-xl font-bold text-foreground">
            FindexApp
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/dashboard/accounts" className="text-sm font-medium text-slate-700 hover:text-foreground">
              Cuentas
            </Link>
            <Link href="/dashboard/transactions" className="text-sm font-medium text-slate-700 hover:text-foreground">
              Transacciones
            </Link>
            <Link href="/dashboard/services" className="text-sm font-medium text-slate-700 hover:text-foreground">
              Servicios
            </Link>
            <Link href="/dashboard/credits" className="text-sm font-medium text-slate-700 hover:text-foreground">
              Créditos
            </Link>
          </div>
        </div>

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

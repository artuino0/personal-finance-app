"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
  Menu,
  Sparkles,
  Gem,
  Crown,
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Repeat,
  CreditCard,
  Users,
  FileText,
  Receipt
} from "lucide-react"
import { Link, useRouter, usePathname } from "@/lib/i18n/navigation"
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
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/language-switcher"

interface DashboardNavProps {
  userName: string
  userAvatar?: string
  userEmail?: string
  tier?: "free" | "pro" | "premium"
}

export function DashboardNav({ userName, userAvatar, tier = "free" }: DashboardNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false)
  const t = useTranslations("DashboardNav")

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const handleOpenReports = () => {
    setOpen(false) // Close the Sheet
    setReportsDialogOpen(true) // Open the Reports Dialog
  }

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/dashboard/accounts", label: t("accounts"), icon: Wallet },
    { href: "/dashboard/transactions", label: t("transactions"), icon: ArrowLeftRight },
    { href: "/dashboard/services", label: t("services"), icon: Repeat },
    { href: "/dashboard/credits", label: t("credits"), icon: CreditCard },
    { href: "/dashboard/invoicing", label: t("invoicing"), icon: Receipt },
    { href: "/dashboard/sharing", label: t("sharing"), icon: Users },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("menu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] flex flex-col">
              <SheetHeader>
                <SheetTitle className="text-left font-bold text-xl">Kountly</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 flex-1 overflow-y-auto py-6">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-slate-700 hover:bg-muted hover:text-foreground"
                        }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-slate-500"}`} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                <button
                  onClick={handleOpenReports}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:bg-muted hover:text-foreground w-full"
                >
                  <FileText className="h-5 w-5 text-slate-500" />
                  <span>{t("reports")}</span>
                </button>
              </div>

              {/* Pro Upgrade Banner - Only for Free Tier */}
              {tier === "free" && (
                <div className="mt-auto border-t pt-4 pb-2 px-3">
                  <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-4 shadow-lg">
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <Gem className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-white/90 uppercase tracking-wide">Upgrade to Pro</span>
                      </div>

                      <p className="text-sm font-medium text-white mb-3 leading-relaxed">
                        Desbloquea funciones premium y lleva tus finanzas al siguiente nivel
                      </p>

                      <Button
                        onClick={() => {
                          setOpen(false)
                          router.push("/dashboard/upgrade")
                        }}
                        className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold shadow-md transition-all hover:scale-105"
                        size="sm"
                      >
                        Ver Planes Pro
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="text-xl font-bold text-foreground">
            Kountly
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                id={item.href === "/dashboard/sharing" ? "tour-nav-sharing" : undefined}
                className={`text-sm font-medium transition-colors hover:text-foreground ${pathname === item.href ? "text-foreground" : "text-slate-700"
                  }`}
              >
                {item.label}
              </Link>
            ))}
            <ReportGeneratorDialog>
              <span id="tour-nav-reports" className="text-sm font-medium text-slate-700 hover:text-foreground cursor-pointer">{t("reports")}</span>
            </ReportGeneratorDialog>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            id="tour-ai-button"
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all duration-300 hover:scale-105"
            title="AI Financial Assistant"
            onClick={() => router.push("/dashboard/aisistant")}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </Button>
          {/* User Menu */}
          <div id="tour-user-menu">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 rounded-full pl-1 pr-4 py-1 hover:bg-muted/50 transition-all h-auto"
                >
                  <div className="relative">
                    <div className={`overflow-hidden flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm ${tier === "premium" ? "ring-2 ring-purple-500" : tier === "pro" ? "ring-2 ring-yellow-400" : ""
                      }`}>
                      {userAvatar ? (
                        <img src={userAvatar || "/placeholder.svg"} alt={userName} className="h-full w-full object-cover" />
                      ) : (
                        userName.charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* Premium Tier Badge - Purple Crown */}
                    {tier === "premium" && (
                      <div className="absolute -bottom-1 -right-1.5 h-5 w-5 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 border-2 border-purple-300 flex items-center justify-center shadow-lg">
                        <Crown className="h-2 w-2 text-white" />
                      </div>
                    )}
                    {/* Pro Tier Badge - Golden Diamond */}
                    {tier === "pro" && (
                      <div className="absolute -bottom-1 -right-1.5 h-5 w-5 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 border-2 border-yellow-300 flex items-center justify-center shadow-lg">
                        <Gem className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">{t("profile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Reports Dialog - rendered outside Sheet to prevent unmounting */}
      <ReportGeneratorDialog
        open={reportsDialogOpen}
        onOpenChange={setReportsDialogOpen}
      />
    </nav>
  )
}

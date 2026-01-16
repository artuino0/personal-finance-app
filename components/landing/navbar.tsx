"use client"

import { Link, useRouter, usePathname } from "@/lib/i18n/navigation"
import { Button } from "@/components/ui/button"
import { useTranslations, useLocale } from "next-intl"
import { useEffect } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function Navbar() {
    const t = useTranslations("Navbar")
    const router = useRouter()
    const pathname = usePathname()
    const currentLocale = useLocale()

    useEffect(() => {
        const storedLocale = localStorage.getItem("locale")
        const targetLocale = storedLocale || (navigator.language.startsWith("en") ? "en" : "es")

        if (targetLocale !== currentLocale && (targetLocale === "en" || targetLocale === "es")) {
            router.replace(pathname, { locale: targetLocale })
        }
    }, [currentLocale, pathname, router])

    const handleLanguageChange = (locale: string) => {
        localStorage.setItem("locale", locale)
        router.replace(pathname, { locale })
    }

    const navLinks = [
        { href: "#features", label: t("features") },
        { href: "#pricing", label: t("pricing") },
        { href: "#about", label: t("about") },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl mx-auto items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                        <span>Kountly</span>
                    </Link>
                </div>

                <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
                    {navLinks.map((link) => (
                        <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Globe className="h-4 w-4" />
                                <span className="sr-only">Switch language</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleLanguageChange("es")}>
                                Español
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
                                English
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link
                        href="/auth/login"
                        className="text-sm font-medium underline-offset-4 hover:underline transition-colors hover:text-foreground text-muted-foreground border rounded-md px-4 py-2"
                    >
                        {t("login")}
                    </Link>
                    <Button asChild className="hidden sm:flex rounded-md font-medium shadow-sm">
                        <Link href="/auth/signup">
                            {t("signup")}
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}

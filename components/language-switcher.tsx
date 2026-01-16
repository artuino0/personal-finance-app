"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter, usePathname } from "@/lib/i18n/navigation"
import { useEffect } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const t = useTranslations("LanguageSwitcher")

    useEffect(() => {
        const storedLocale = localStorage.getItem("locale")
        const targetLocale = storedLocale || (navigator.language.startsWith("en") ? "en" : "es")

        if (targetLocale !== locale && (targetLocale === "en" || targetLocale === "es")) {
            router.replace(pathname, { locale: targetLocale })
        }
    }, [locale, pathname, router])

    const handleLanguageChange = (newLocale: string) => {
        localStorage.setItem("locale", newLocale)
        router.replace(pathname, { locale: newLocale })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">Switch language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLanguageChange("es")}>
                    Español {locale === "es" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
                    English {locale === "en" && "✓"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

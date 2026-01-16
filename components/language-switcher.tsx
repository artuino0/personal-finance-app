"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/lib/i18n/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const handleLocaleChange = (newLocale: string) => {
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
                <DropdownMenuItem onClick={() => handleLocaleChange("es")}>
                    Español {locale === "es" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLocaleChange("en")}>
                    English {locale === "en" && "✓"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

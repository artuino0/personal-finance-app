"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
    const router = useRouter()

    useEffect(() => {
        const storedLocale = localStorage.getItem("locale")
        if (storedLocale && (storedLocale === "en" || storedLocale === "es")) {
            router.replace(`/${storedLocale}`)
            return
        }

        const browserLang = navigator.language
        const targetLocale = browserLang.startsWith("en") ? "en" : "es"
        router.replace(`/${targetLocale}`)
    }, [router])

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    )
}

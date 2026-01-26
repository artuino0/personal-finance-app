"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { startCheckoutSession } from "@/app/actions/stripe"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

interface SubscribeButtonProps {
    productId: string
    className?: string
    children: React.ReactNode
}

export function SubscribeButton({ productId, className, children }: SubscribeButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const t = useTranslations("Upgrade")

    const handleSubscribe = async () => {
        try {
            setIsLoading(true)
            const url = await startCheckoutSession(productId)
            if (url) {
                window.location.href = url
            }
        } catch (error) {
            console.error("Error starting checkout:", error)
            // Ideally show a toast here
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            className={className}
            size="lg"
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("processing")}
                </>
            ) : (
                children
            )}
        </Button>
    )
}

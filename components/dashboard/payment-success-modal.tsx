"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, PartyPopper } from "lucide-react"
import confetti from "canvas-confetti"
import { useTranslations } from "next-intl"

export function PaymentSuccessModal() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)
    const t = useTranslations("PaymentSuccess")

    useEffect(() => {
        if (searchParams.get("payment") === "success") {
            setOpen(true)

            // Trigger confetti
            const duration = 3 * 1000
            const animationEnd = Date.now() + duration
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

            const randomInRange = (min: number, max: number) => {
                return Math.random() * (max - min) + min
            }

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now()

                if (timeLeft <= 0) {
                    return clearInterval(interval)
                }

                const particleCount = 50 * (timeLeft / duration)

                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                })
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                })
            }, 250)

            return () => clearInterval(interval)
        }
    }, [searchParams])

    const handleClose = () => {
        setOpen(false)
        // Remove query params
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete("payment")
        newParams.delete("session_id")
        router.replace(`?${newParams.toString()}`)
        router.refresh() // Refresh to potentially update subscription status if webhook processed
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                </div>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                        {t("title")}
                    </DialogTitle>
                    <DialogDescription className="text-center text-base pt-2">
                        {t("description")}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 my-2">
                    {t("webhookNote")}
                </div>
                <DialogFooter className="sm:justify-center">
                    <Button onClick={handleClose} size="lg" className="w-full sm:w-auto">
                        {t("continue")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

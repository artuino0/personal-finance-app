"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2, Sparkles, AlertTriangle, Lightbulb, CheckCircle2, Clock, ArrowUp, Zap } from "lucide-react"
import type { AnalysisResponse } from "@/lib/ai-prompts"
import { formatCurrencyWithSymbol } from "@/lib/utils/currency"
import { AiHistoryModal } from "./ai-history-modal"
import { Link } from "@/lib/i18n/navigation"
import { useTranslations, useLocale } from "next-intl"

interface AiAssistantViewProps {
    tier: "free" | "pro"
    initialAnalysis?: AnalysisResponse
    lastReportDate?: string
    serverTime?: string
}

export function AiAssistantView({ tier, initialAnalysis, lastReportDate, serverTime }: AiAssistantViewProps) {
    const t = useTranslations("AiAssistant")
    const locale = useLocale()
    const [isLoading, setIsLoading] = useState(false)
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(initialAnalysis || null)
    const [error, setError] = useState<string | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
    const [timeRemainingWithPro, setTimeRemainingWithPro] = useState<string | null>(null)
    const [isTimerReady, setIsTimerReady] = useState(false)
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [currentLastReportDate, setCurrentLastReportDate] = useState<string | undefined>(lastReportDate)

    // Update countdown timer
    useEffect(() => {
        if (!currentLastReportDate || !serverTime) {
            setTimeRemaining(null)
            setTimeRemainingWithPro(null)
            setIsTimerReady(true)
            return
        }

        // Calculate offset between client time and server time
        // serverTime is "now" on server when page rendered.
        // We use this to adjust our calculations.
        const serverDate = new Date(serverTime)
        const clientDate = new Date()
        const timeOffset = serverDate.getTime() - clientDate.getTime()

        const updateTimer = () => {
            const now = new Date()
            const adjustedNow = new Date(now.getTime() + timeOffset) // Current server time approximation

            const nextDate = new Date(currentLastReportDate)

            if (tier === "free") {
                // Free: 1 month rolling window
                nextDate.setMonth(nextDate.getMonth() + 1)
            } else {
                // Pro: 1 week rolling window
                nextDate.setDate(nextDate.getDate() + 7)
            }

            const diff = nextDate.getTime() - adjustedNow.getTime()

            if (diff <= 0) {
                setTimeRemaining(null)
                setTimeRemainingWithPro(null)
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            if (days > 0) {
                const dayLabel = days === 1 ? t("day") : t("days")
                setTimeRemaining(t("updatesIn", { count: days, unit: dayLabel }))
            } else if (hours > 0) {
                const hourLabel = hours === 1 ? t("hour") : t("hours")
                setTimeRemaining(t("updatesIn", { count: hours, unit: hourLabel }))
            } else {
                const minuteLabel = minutes === 1 ? t("minute") : t("minutes")
                setTimeRemaining(t("updatesIn", { count: minutes, unit: minuteLabel }))
            }

            // Calculate time with Pro (1 week instead of 1 month) for free users
            if (tier === "free") {
                const nextDatePro = new Date(currentLastReportDate)
                nextDatePro.setDate(nextDatePro.getDate() + 7)
                const diffPro = nextDatePro.getTime() - adjustedNow.getTime()

                if (diffPro > 0) {
                    const daysPro = Math.floor(diffPro / (1000 * 60 * 60 * 24))
                    const hoursPro = Math.floor((diffPro % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

                    if (daysPro > 0) {
                        const dayLabel = daysPro === 1 ? t("day") : t("days")
                        setTimeRemainingWithPro(`${daysPro} ${dayLabel}`)
                    } else if (hoursPro > 0) {
                        const hourLabel = hoursPro === 1 ? t("hour") : t("hours")
                        setTimeRemainingWithPro(`${hoursPro} ${hourLabel}`)
                    } else {
                        setTimeRemainingWithPro(t("minutes"))
                    }
                } else {
                    setTimeRemainingWithPro(t("availableNow"))
                }
            }
        }

        updateTimer() // Initial check
        setIsTimerReady(true) // Mark timer as ready after first calculation
        const interval = setInterval(updateTimer, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [currentLastReportDate, serverTime, tier, t])

    const handleAnalyze = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch("/api/ai/analyze-transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    period: "monthly",
                    locale: locale
                }),
            })

            const data = await response.json()

            if (response.status === 429) {
                const errorMessage = data.error || "Has alcanzado el límite de reportes gratuitos. Intenta el próximo mes."
                throw new Error(errorMessage)
            }

            if (!response.ok) {
                const errorMessage = data.details
                    ? `${data.error}: ${data.details}`
                    : data.error || "Error al analizar transacciones"
                throw new Error(errorMessage)
            }

            setAnalysis(data.analysis)
            // Update lastReportDate to current time to trigger cooldown
            setCurrentLastReportDate(new Date().toISOString())
        } catch (err: any) {
            console.error(err)
            setError(err.message || "Ocurrió un error inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    if (!analysis && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-center">{t("title")}</h2>
                <p className="text-muted-foreground text-center max-w-md">
                    {t("description")}
                </p>
                <Button
                    onClick={handleAnalyze}
                    size="lg"
                    className="mt-4"
                    disabled={!isTimerReady || !!timeRemaining}
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {!isTimerReady ? t("loading") : (timeRemaining || t("generateFirstAnalysis"))}
                </Button>
                {error && (
                    <div className="p-4 mt-4 text-sm text-red-500 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}
            </div>
        )
    }

    const getFinancialScoreMessage = (score: number) => {
        if (score >= 80) return t("scoreExcellent")
        if (score >= 60) return t("scoreGood")
        return t("scoreNeedsWork")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold">{t("financialAnalysis")}</h2>
                    <p className="text-sm text-muted-foreground">
                        {analysis?.period ? t("period", { start: analysis.period.start, end: analysis.period.end }) : t("currentMonthSummary")}
                    </p>
                </div>
                {!isLoading && (
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        <Button
                            onClick={() => setShowHistoryModal(true)}
                            variant="outline"
                            size="sm"
                            className="px-2 sm:px-3"
                        >
                            <Clock className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">{t("history")}</span>
                        </Button>
                        {/* Desktop button - shows full text */}
                        <Button
                            onClick={handleAnalyze}
                            variant="outline"
                            size="sm"
                            disabled={!isTimerReady || !!timeRemaining}
                            className="hidden sm:flex px-2 sm:px-3"
                        >
                            <Sparkles className="w-4 h-4 sm:mr-2" />
                            <span>{!isTimerReady ? t("loading") : (timeRemaining || t("update"))}</span>
                        </Button>
                        {/* Mobile button - with popover for time remaining */}
                        {timeRemaining ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="sm:hidden px-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span>⏱</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto max-w-[280px] p-0" align="end">
                                    {tier === "free" && timeRemainingWithPro ? (
                                        <div className="p-4 space-y-3">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-muted-foreground">{timeRemaining}</p>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-semibold text-primary">{timeRemainingWithPro} {t("withPro")}</span>
                                                </div>
                                            </div>
                                            <Link href="/dashboard/profile">
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white border-0 transition-all duration-300 hover:scale-105"
                                                >
                                                    <ArrowUp className="w-3 h-3 mr-1" />
                                                    {t("upgradeToPro")}
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="p-3">
                                            <p className="text-sm font-medium">{timeRemaining}</p>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                        ) : (
                            <Button
                                onClick={handleAnalyze}
                                variant="outline"
                                size="sm"
                                disabled={!isTimerReady}
                                className="sm:hidden px-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>{!isTimerReady ? "..." : "↻"}</span>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <AiHistoryModal
                open={showHistoryModal}
                onOpenChange={setShowHistoryModal}
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">{t("analyzing")}</p>
                </div>
            ) : analysis ? (
                <div className="space-y-6">
                    {/* Score Card */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="col-span-full md:col-span-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between text-lg">
                                    {t("financialHealth")}
                                    <Badge variant={analysis.financialScore >= 70 ? "default" : "secondary"}>
                                        {analysis.financialScore}/100
                                    </Badge>
                                </CardTitle>
                                <CardDescription>{t("scoreBasedOnHabits")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Progress value={analysis.financialScore} className="h-3 mb-2" />
                                <p className="text-xs text-muted-foreground">
                                    {getFinancialScoreMessage(analysis.financialScore)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">{t("totalExpenses")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrencyWithSymbol(analysis.summary.totalExpenses)}</div>
                                <p className="text-xs text-muted-foreground">{analysis.summary.transactionCount} {t("transactions")}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">{t("netBalance")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${analysis.summary.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {analysis.summary.netBalance >= 0 ? "+" : ""}{formatCurrencyWithSymbol(analysis.summary.netBalance)}
                                </div>
                                <p className="text-xs text-muted-foreground">{t("incomeVsExpenses")}</p>
                            </CardContent>
                        </Card>
                    </div >

                    <Tabs defaultValue="insights" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                            <TabsTrigger value="insights">{t("insights")}</TabsTrigger>
                            <TabsTrigger value="recommendations">{t("recommendations")}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="insights" className="mt-4 space-y-4">
                            {analysis.insights.map((insight, index) => (
                                <Card key={index}>
                                    <CardContent className="flex items-start gap-4 p-4">
                                        <div className="p-2 mt-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                            <Lightbulb className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">{t("observation", { number: index + 1 })}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {typeof insight === 'string' ? insight : (locale === 'es' ? insight.es : insight.en)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {analysis.insights.length === 0 && (
                                <div className="text-center text-muted-foreground p-8">{t("noInsights")}</div>
                            )}
                        </TabsContent>

                        <TabsContent value="recommendations" className="mt-4 space-y-4">
                            {analysis.recommendations.map((rec, index) => (
                                <Card key={index}>
                                    <CardContent className="flex items-start gap-4 p-4">
                                        <div className="p-2 mt-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">{t("recommendation", { number: index + 1 })}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {typeof rec === 'string' ? rec : (locale === 'es' ? rec.es : rec.en)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {analysis.recommendations.length === 0 && (
                                <div className="text-center text-muted-foreground p-8">{t("noRecommendations")}</div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {
                        analysis.tier === 'pro' && (analysis as any).alerts && (
                            <div className="mt-6">
                                <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    {t("importantAlerts")}
                                </h3>
                                <div className="space-y-3">
                                    {(analysis as any).alerts.map((alert: any, index: number) => (
                                        <div key={index} className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-sm">
                                            {typeof alert === 'string' ? alert : (locale === 'es' ? alert.es : alert.en)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }
                </div >
            ) : null
            }
        </div >
    )
}

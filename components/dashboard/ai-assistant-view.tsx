"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Sparkles, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react"
import type { AnalysisResponse } from "@/lib/ai-prompts"
import { formatCurrencyWithSymbol } from "@/lib/utils/currency"

interface AiAssistantViewProps {
    tier: "free" | "pro"
    initialAnalysis?: AnalysisResponse
    lastReportDate?: string
    serverTime?: string
}

export function AiAssistantView({ tier, initialAnalysis, lastReportDate, serverTime }: AiAssistantViewProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(initialAnalysis || null)
    const [error, setError] = useState<string | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<string | null>(null)

    // Update countdown timer
    useEffect(() => {
        if (!lastReportDate || !serverTime) {
            setTimeRemaining(null)
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

            const nextDate = new Date(lastReportDate)

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
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            if (days > 0) {
                setTimeRemaining(`Actualiza en ${days} días`)
            } else if (hours > 0) {
                setTimeRemaining(`Actualiza en ${hours} horas`)
            } else {
                setTimeRemaining(`Actualiza en ${minutes} minutos`)
            }
        }

        updateTimer() // Initial check
        const interval = setInterval(updateTimer, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [lastReportDate, serverTime, tier])

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
                    period: "monthly"
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
            // Ideally we would update lastReportDate here too to reset the timer,
            // but for simplicity we rely on the API 429 to be the ultimate guard.
            // Client-side visual update:
            // setLastReportDate(new Date().toISOString()) -- We can't easily update props. 
            // We could use a local state for lastReportDate initialized from props.
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
                <h2 className="text-2xl font-bold text-center">Tu Asistente Financiero AI</h2>
                <p className="text-muted-foreground text-center max-w-md">
                    Analiza tus transacciones mensuales, recibe insights personalizados y descubre oportunidades de ahorro con el poder de la Inteligencia Artificial.
                </p>
                <Button
                    onClick={handleAnalyze}
                    size="lg"
                    className="mt-4"
                    disabled={!!timeRemaining}
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {timeRemaining || "Genera tu primer análisis mensual"}
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
        if (score >= 80) return "¡Excelente! Mantienes tus finanzas bajo control."
        if (score >= 60) return "Vas bien, pero hay áreas de mejora."
        return "Necesitas ajustar algunos hábitos financieros."
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Análisis Financiero</h2>
                    <p className="text-sm text-muted-foreground">
                        {analysis?.period ? `Periodo: ${analysis.period.start} - ${analysis.period.end}` : "Resumen del mes actual"}
                    </p>
                </div>
                {!isLoading && (
                    <Button
                        onClick={handleAnalyze}
                        variant="outline"
                        size="sm"
                        disabled={!!timeRemaining}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {timeRemaining || "Actualizar"}
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">Analizando tus transacciones...</p>
                </div>
            ) : analysis ? (
                <div className="space-y-6">
                    {/* Score Card */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="col-span-full md:col-span-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between text-lg">
                                    Salud Financiera
                                    <Badge variant={analysis.financialScore >= 70 ? "default" : "secondary"}>
                                        {analysis.financialScore}/100
                                    </Badge>
                                </CardTitle>
                                <CardDescription>Puntaje basado en tus hábitos</CardDescription>
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
                                <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrencyWithSymbol(analysis.summary.totalExpenses)}</div>
                                <p className="text-xs text-muted-foreground">{analysis.summary.transactionCount} transacciones</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${analysis.summary.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {analysis.summary.netBalance >= 0 ? "+" : ""}{formatCurrencyWithSymbol(analysis.summary.netBalance)}
                                </div>
                                <p className="text-xs text-muted-foreground">Ingresos vs Gastos</p>
                            </CardContent>
                        </Card>
                    </div >

                    <Tabs defaultValue="insights" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                            <TabsTrigger value="insights">Insights</TabsTrigger>
                            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
                        </TabsList>

                        <TabsContent value="insights" className="mt-4 space-y-4">
                            {analysis.insights.map((insight, index) => (
                                <Card key={index}>
                                    <CardContent className="flex items-start gap-4 p-4">
                                        <div className="p-2 mt-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                            <Lightbulb className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">Observación {index + 1}</h4>
                                            <p className="text-sm text-muted-foreground">{insight}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {analysis.insights.length === 0 && (
                                <div className="text-center text-muted-foreground p-8">No hay insights disponibles por ahora.</div>
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
                                            <h4 className="font-semibold text-sm mb-1">Recomendación {index + 1}</h4>
                                            <p className="text-sm text-muted-foreground">{rec}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {analysis.recommendations.length === 0 && (
                                <div className="text-center text-muted-foreground p-8">No hay recomendaciones disponibles por ahora.</div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {
                        analysis.tier === 'pro' && (analysis as any).alerts && (
                            <div className="mt-6">
                                <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    Alertas Importantes
                                </h3>
                                <div className="space-y-3">
                                    {(analysis as any).alerts.map((alert: string, index: number) => (
                                        <div key={index} className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-sm">
                                            {alert}
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

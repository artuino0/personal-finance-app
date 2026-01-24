"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronDown, ChevronUp, Calendar, TrendingUp } from "lucide-react"
import type { AnalysisResponse } from "@/lib/ai-prompts"
import { formatCurrencyWithSymbol } from "@/lib/utils/currency"

interface HistoryItem {
    id: string
    created_at: string
    response: AnalysisResponse
    tier: string
    period_start: string | null
    period_end: string | null
}

interface AiHistoryModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AiHistoryModal({ open, onOpenChange }: AiHistoryModalProps) {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    // Fetch history when modal opens
    const handleOpenChange = async (newOpen: boolean) => {
        onOpenChange(newOpen)

        if (newOpen && history.length === 0) {
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetch("/api/ai/history")
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || "Error al cargar el historial")
                }

                setHistory(data.history)
            } catch (err: any) {
                console.error(err)
                setError(err.message || "Error al cargar el historial")
            } finally {
                setIsLoading(false)
            }
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Historial de Análisis
                    </DialogTitle>
                    <DialogDescription>
                        Tus últimos 5 reportes de análisis financiero
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Cargando historial...</p>
                    </div>
                ) : error ? (
                    <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-md">
                        {error}
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No hay reportes anteriores disponibles.</p>
                        <p className="text-sm mt-2">Genera tu primer análisis para comenzar.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((item) => (
                            <Card key={item.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {item.tier === "pro" ? "Pro" : "Gratis"}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(item.created_at)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 text-primary" />
                                                    <span className="text-sm font-medium">
                                                        Salud: {item.response.financialScore}/100
                                                    </span>
                                                </div>
                                                {item.response.summary && (
                                                    <span className="text-sm text-muted-foreground">
                                                        Gastos: {formatCurrencyWithSymbol(item.response.summary.totalExpenses)}
                                                    </span>
                                                )}
                                            </div>

                                            {item.response.period && (
                                                <p className="text-xs text-muted-foreground">
                                                    Periodo: {item.response.period.start} - {item.response.period.end}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpand(item.id)}
                                        >
                                            {expandedId === item.id ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>

                                    {expandedId === item.id && (
                                        <div className="mt-4 pt-4 border-t space-y-4">
                                            {item.response.insights && item.response.insights.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2">Observaciones</h4>
                                                    <ul className="space-y-2">
                                                        {item.response.insights.map((insight, idx) => (
                                                            <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                                                                {insight}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {item.response.recommendations && item.response.recommendations.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2">Recomendaciones</h4>
                                                    <ul className="space-y-2">
                                                        {item.response.recommendations.map((rec, idx) => (
                                                            <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-green-200 dark:border-green-800">
                                                                {rec}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {item.response.tier === 'pro' && (item.response as any).alerts && (item.response as any).alerts.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2">Alertas</h4>
                                                    <ul className="space-y-2">
                                                        {(item.response as any).alerts.map((alert: string, idx: number) => (
                                                            <li key={idx} className="text-sm text-amber-600 dark:text-amber-400 pl-4 border-l-2 border-amber-200 dark:border-amber-800">
                                                                {alert}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { pdf } from "@react-pdf/renderer"
import { TransactionReportPDF } from "@/components/reports/transaction-report-pdf"
import { DateRange } from "react-day-picker"

interface ReportGeneratorDialogProps {
    children?: React.ReactNode
    triggerClassName?: string
}

export function ReportGeneratorDialog({ children, triggerClassName }: ReportGeneratorDialogProps) {
    const supabase = createClient()
    const [date, setDate] = useState<DateRange | undefined>()
    const [selectedAccountId, setSelectedAccountId] = useState("all")
    const [accounts, setAccounts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [loadingAccounts, setLoadingAccounts] = useState(true)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (open) {
            const fetchAccounts = async () => {
                const { data } = await supabase.from("accounts").select("id, name")
                if (data) setAccounts(data)
                setLoadingAccounts(false)
            }
            fetchAccounts()
        }
    }, [open])

    const handleGenerateReport = async () => {
        if (!date?.from || !date?.to) return

        setIsLoading(true)

        try {
            const params = new URLSearchParams({
                startDate: date.from.toISOString(),
                endDate: date.to.toISOString(),
                accountId: selectedAccountId,
            })

            const res = await fetch(`/api/reports/transactions?${params}`)
            if (!res.ok) throw new Error("Error fetching report data")

            const data = await res.json()

            // Generate PDF blob
            const blob = await pdf(<TransactionReportPDF data={data} />).toBlob()

            // Create download link
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `reporte-${format(new Date(), "yyyyMMdd")}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            // Close modal after download
            setTimeout(() => setOpen(false), 300)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className={triggerClassName}>
                        <FileText className="mr-2 h-4 w-4" />
                        Reportes
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Generar Reporte</DialogTitle>
                    <DialogDescription>
                        Selecciona el rango de fechas y la cuenta para generar tu reporte.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Rango de Fechas</label>
                        <div className="grid gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                                                    {format(date.to, "LLL dd, y", { locale: es })}
                                                </>
                                            ) : (
                                                format(date.from, "LLL dd, y", { locale: es })
                                            )
                                        ) : (
                                            <span>Seleccionar fechas</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={1}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Cuenta</label>
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId} disabled={loadingAccounts}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas las cuentas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las cuentas</SelectItem>
                                {accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleGenerateReport}
                        disabled={!date?.from || !date?.to || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...
                            </>
                        ) : (
                            "Generar Reporte"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

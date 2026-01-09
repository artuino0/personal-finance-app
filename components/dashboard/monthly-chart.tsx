"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MonthlyChartProps {
  userId: string
}

export function MonthlyChart({ userId }: MonthlyChartProps) {
  const [data, setData] = useState<{ month: string; ingresos: number; gastos: number }[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        const { data: transactions } = await supabase
          .from("transactions")
          .select("type, amount")
          .eq("user_id", userId)
          .gte("date", startDate.toISOString())
          .lte("date", endDate.toISOString())

        const income =
          transactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0) || 0
        const expense =
          transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0) || 0

        months.push({
          month: date.toLocaleDateString("en-US", { month: "short" }),
          ingresos: income,
          gastos: expense,
        })
      }
      setData(months)
    }

    fetchData()
  }, [userId, supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos vs Gastos (Últimos 6 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ingresos" fill="#10b981" />
            <Bar dataKey="gastos" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

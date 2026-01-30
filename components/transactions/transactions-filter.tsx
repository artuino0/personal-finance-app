"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { ListFilter } from "lucide-react"
import { useTranslations } from "next-intl"

interface Account {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  type: string
}

interface TransactionsFilterProps {
  accounts: Account[]
  categories: Category[]
}

export function TransactionsFilter({ accounts, categories }: TransactionsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations("Transactions")

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard/transactions?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/dashboard/transactions")
  }

  return (
    <Card className="mb-6" id="tour-filters">
      <CardContent className="pt-6">
        <div className="md:hidden">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ListFilter className="h-4 w-4" />
            {isOpen ? t("hideFilters") : t("showFilters")}
          </Button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 items-end ${isOpen ? "grid" : "hidden md:grid"}`}>
          <div>
            <label className="text-sm font-medium mb-2 block">{t("type")}</label>
            <Select value={searchParams.get("type") || "all"} onValueChange={(value) => updateFilter("type", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                <SelectItem value="income">{t("income")}</SelectItem>
                <SelectItem value="expense">{t("expense")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t("account")}</label>
            <Select
              value={searchParams.get("account") || "all"}
              onValueChange={(value) => updateFilter("account", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("allAccounts")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allAccounts")}</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t("category")}</label>
            <Select
              value={searchParams.get("category") || "all"}
              onValueChange={(value) => updateFilter("category", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("allAccounts")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allAccounts")}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={clearFilters} className="w-full">
            {t("clearFilters")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

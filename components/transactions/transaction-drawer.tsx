"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { createClient } from "@/lib/supabase/client"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TransactionForm } from "./transaction-form"

interface Account {
  id: string
  name: string
  balance: number
}

interface Category {
  id: string
  name: string
  type: string
}

interface TransactionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: string
}

export function TransactionDrawer({ open, onOpenChange, locale }: TransactionDrawerProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const t = useTranslations("Transactions")

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      setUserId(user.id)

      const [accountsData, categoriesData] = await Promise.all([
        supabase.from("accounts").select("*").eq("user_id", user.id),
        supabase.rpc("get_localized_categories", { user_locale: locale }),
      ])

      if (accountsData.data) setAccounts(accountsData.data)
      if (categoriesData.data) setCategories(categoriesData.data)
      
      setIsLoading(false)
    }

    if (open) {
      loadData()
    }
  }, [open, locale])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl">{t("newTransaction")}</SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : userId ? (
          <div className="pb-6">
            <TransactionForm 
              userId={userId} 
              accounts={accounts} 
              categories={categories}
              onSuccess={() => onOpenChange(false)}
            />
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">{t("loginRequired")}</p>
        )}
      </SheetContent>
    </Sheet>
  )
}

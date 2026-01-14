"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users } from "lucide-react"

interface AccountOption {
  id: string
  name: string
  email: string
  isOwn: boolean
}

interface AccountSelectorProps {
  currentUserId: string
  currentUserName: string
  currentUserEmail: string
  selectedAccountId?: string
}

export function AccountSelector({
  currentUserId,
  currentUserName,
  currentUserEmail,
  selectedAccountId,
}: AccountSelectorProps) {
  const router = useRouter()
  const supabase = createClient()
  const [accounts, setAccounts] = useState<AccountOption[]>([])
  const [selectedId, setSelectedId] = useState(selectedAccountId || currentUserId)

  useEffect(() => {
    loadAccounts()
  }, [currentUserId])

  const loadAccounts = async () => {
    try {
      const { data: sharedAccounts } = await supabase
        .from("account_shares")
        .select("owner_id, shared_with_email")
        .eq("shared_with_id", currentUserId)
        .eq("is_active", true)

      console.log("[v0] Shared accounts loaded:", sharedAccounts)

      const options: AccountOption[] = [
        {
          id: currentUserId,
          name: currentUserName,
          email: currentUserEmail,
          isOwn: true,
        },
      ]

      if (sharedAccounts) {
        for (const share of sharedAccounts) {
          const { data: ownerProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", share.owner_id)
            .single()

          options.push({
            id: share.owner_id,
            name: ownerProfile?.full_name || "Usuario",
            email: share.shared_with_email,
            isOwn: false,
          })
        }
      }

      setAccounts(options)
    } catch (error) {
      console.error("[v0] Error loading shared accounts:", error)
    }
  }

  const handleAccountChange = async (accountId: string) => {
    setSelectedId(accountId)

    try {
      await fetch("/api/set-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Error setting account:", error)
    }
  }

  const selectedAccount = accounts.find((acc) => acc.id === selectedId)

  if (accounts.length <= 1) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground hidden md:inline">Cuenta de:</span>
      <Select value={selectedId} onValueChange={handleAccountChange}>
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue>
            <div className="flex items-center gap-2">
              {selectedAccount?.isOwn ? (
                <span className="font-medium">{selectedAccount.name}</span>
              ) : (
                <>
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedAccount?.name}</span>
                </>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex items-center gap-2">
                {!account.isOwn && <Users className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <p className="font-medium">{account.name}</p>
                  {!account.isOwn && <p className="text-xs text-muted-foreground">Compartido</p>}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

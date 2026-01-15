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
      console.log("[v0] Loading accounts for user:", currentUserId)

      const { data: sharedAccounts, error } = await supabase
        .from("account_shares")
        .select("owner_id, shared_with_email")
        .eq("shared_with_id", currentUserId)
        .eq("is_active", true)

      console.log("[v0] Shared accounts query result:", sharedAccounts)
      console.log("[v0] Shared accounts query error:", error)

      const options: AccountOption[] = [
        {
          id: currentUserId,
          name: "Mis Finanzas",
          email: currentUserEmail,
          isOwn: true,
        },
      ]

      if (sharedAccounts) {
        for (const share of sharedAccounts) {
          console.log("[v0] Loading shared account - owner_id:", share.owner_id)

          // Fetch OWNER's profile (not shared_with)
          const { data: ownerProfile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", share.owner_id)
            .maybeSingle()

          console.log("[v0] Owner profile query result:", ownerProfile)
          console.log("[v0] Owner profile query error:", profileError)

          let displayName = "Usuario"
          let ownerEmail = share.shared_with_email // fallback

          if (ownerProfile?.full_name) {
            // Use owner's name from profile
            displayName = ownerProfile.full_name
            console.log("[v0] Using owner profile name:", displayName)
            if (displayName.length > 15) {
              displayName = displayName.substring(0, 12) + "..."
            }
            displayName = `Finanzas de ${displayName}`
          } else {
            console.log("[v0] No profile found, trying auth metadata")
            const { data: ownerUser } = await supabase.auth.admin.getUserById(share.owner_id)
            console.log("[v0] Owner user from auth:", ownerUser?.user?.email, ownerUser?.user?.user_metadata)
            if (ownerUser?.user?.email) {
              ownerEmail = ownerUser.user.email
              const emailUser = ownerEmail.split("@")[0]
              displayName = `Finanzas de ${emailUser.substring(0, 10)}...`
              console.log("[v0] Using email fallback:", displayName)
            }
          }

          options.push({
            id: share.owner_id,
            name: displayName,
            email: ownerEmail,
            isOwn: false,
          })
        }
      }

      setAccounts(options)
    } catch (error) {
      console.error("Error loading shared accounts:", error)
    }
  }

  const handleAccountChange = async (accountId: string) => {
    setSelectedId(accountId)

    try {
      const response = await fetch("/api/set-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error setting account:", error)
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

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "@/lib/i18n/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, CheckCircle2, XCircle, Mail, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

interface InviteFormProps {
  userId: string
  userEmail: string
}

export function InviteForm({ userId }: InviteFormProps) {
  const router = useRouter()
  const t = useTranslations("Sharing")
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [userExists, setUserExists] = useState<boolean | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [foundUserId, setFoundUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<"email" | "permissions">("email")

  // RESOURCES array moved inside or translated dynamically
  const RESOURCES = [
    { id: "accounts", label: t("resources.accounts.label"), description: t("resources.accounts.description") },
    { id: "transactions", label: t("resources.transactions.label"), description: t("resources.transactions.description") },
    { id: "credits", label: t("resources.credits.label"), description: t("resources.credits.description") },
    { id: "services", label: t("resources.services.label"), description: t("resources.services.description") },
    { id: "categories", label: t("resources.categories.label"), description: t("resources.categories.description") },
  ]

  const [permissions, setPermissions] = useState<
    Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>
  >({
    accounts: { view: true, create: false, edit: false, delete: false },
    transactions: { view: true, create: false, edit: false, delete: false },
    credits: { view: true, create: false, edit: false, delete: false },
    services: { view: true, create: false, edit: false, delete: false },
    categories: { view: true, create: false, edit: false, delete: false },
  })

  const handleCheckEmail = async () => {
    if (!email) return

    setIsCheckingEmail(true)
    setError(null)
    setUserExists(null)
    setUserName(null)
    setUserAvatar(null)
    setFoundUserId(null)

    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || t("errorVerify"))
        return
      }

      if (result.exists) {
        setUserExists(true)
        setUserName(result.user.name)
        setUserAvatar(result.user.avatar_url)
        setFoundUserId(result.user.id)
      } else {
        setUserExists(false)
      }
    } catch (err) {
      console.error("[v0] Error checking email:", err)
      setError(t("errorVerify"))
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleNextStep = () => {
    if (email && userExists !== null) {
      setCurrentStep("permissions")
    }
  }

  const togglePermission = (resource: string, permission: "view" | "create" | "edit" | "delete") => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [permission]: !prev[resource][permission],
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Get current user profile for email
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).single()

      const inviterName = profile?.full_name || "Un usuario"

      // Generate unique token
      const token = crypto.randomUUID()

      const { data: invitation, error: inviteError } = await supabase
        .from("share_invitations")
        .insert({
          owner_id: userId,
          invited_email: email.toLowerCase(),
          permissions: permissions,
          status: "pending",
          invitation_token: token,
        })
        .select()
        .single()

      if (inviteError) throw inviteError

      const emailResponse = await fetch("/api/send-invitation-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitedEmail: email.toLowerCase(),
          inviterName: inviterName,
          token: token,
          userExists: userExists,
          permissions: permissions,
        }),
      })

      if (!emailResponse.ok) {
        console.error("[v0] Failed to send email, but invitation was created")
        // Don't fail the entire operation if email fails
      } else {
        console.log("[v0] Invitation email sent successfully")
      }

      router.push("/dashboard/sharing")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("errorGeneric"))
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStep === "email") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setUserExists(null)
                setUserName(null)
                setFoundUserId(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleCheckEmail()
                }
              }}
            />
            <Button type="button" onClick={handleCheckEmail} disabled={!email || isCheckingEmail}>
              {isCheckingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : t("verify")}
            </Button>
          </div>
        </div>

        {userExists === true && (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm animate-in fade-in-50 slide-in-from-bottom-2">
            <div className="p-4 flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12 border-3 border-green-500">
                  <AvatarImage src={userAvatar || undefined} alt={userName || email} />
                  <AvatarFallback className="bg-primary/5 text-primary text-lg font-medium">
                    {((userName || email || "?")[0]).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white dark:border-background">
                  <Check className="h-3 w-3" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-semibold text-base truncate">{userName || "Usuario"}</h4>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 h-5 px-1.5 text-[10px] uppercase tracking-wide font-bold">
                    {t("foundBadge")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{email}</p>
              </div>
            </div>
          </div>
        )}

        {userExists === false && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20 text-card-foreground shadow-sm animate-in fade-in-50 slide-in-from-bottom-2">
            <div className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0 border-2 border-orange-200 dark:border-orange-800">
                <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-semibold text-base text-orange-900 dark:text-orange-100 truncate">{t("userNotFound")}</h4>
                  <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-100 h-5 px-1.5 text-[10px] uppercase tracking-wide font-bold">
                    {t("inviteBadge")}
                  </Badge>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300 truncate">
                  {t("userNotFoundDesc")}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500 flex items-center gap-2"><XCircle className="h-4 w-4" /> {error}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            {t("cancel")}
          </Button>
          <Button type="button" onClick={handleNextStep} disabled={!email || userExists === null} className="flex-1">
            {t("next")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-card p-4 flex items-center gap-4">
        <Avatar className="h-10 w-10 border border-primary/10">
          <AvatarImage src={userAvatar || undefined} />
          <AvatarFallback className="bg-primary/5 text-primary">
            {((userName || email || "?")[0]).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{t("invitingTo")}</p>
          <p className="font-semibold">{userName || email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <Label>{t("accessPermissions")}</Label>
        {RESOURCES.map((resource) => (
          <Card key={resource.id}>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{resource.label}</h4>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${resource.id}-view`}
                      checked={permissions[resource.id].view}
                      onCheckedChange={() => togglePermission(resource.id, "view")}
                    />
                    <label htmlFor={`${resource.id}-view`} className="text-sm cursor-pointer">
                      {t("permissions.view")}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${resource.id}-create`}
                      checked={permissions[resource.id].create}
                      onCheckedChange={() => togglePermission(resource.id, "create")}
                    />
                    <label htmlFor={`${resource.id}-create`} className="text-sm cursor-pointer">
                      {t("permissions.create")}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${resource.id}-edit`}
                      checked={permissions[resource.id].edit}
                      onCheckedChange={() => togglePermission(resource.id, "edit")}
                    />
                    <label htmlFor={`${resource.id}-edit`} className="text-sm cursor-pointer">
                      {t("permissions.edit")}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${resource.id}-delete`}
                      checked={permissions[resource.id].delete}
                      onCheckedChange={() => togglePermission(resource.id, "delete")}
                    />
                    <label htmlFor={`${resource.id}-delete`} className="text-sm cursor-pointer">
                      {t("permissions.delete")}
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => setCurrentStep("email")} className="flex-1">
          {t("back")}
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("sendInvitation")}
        </Button>
      </div>
    </form>
  )
}

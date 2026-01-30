"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "@/lib/i18n/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useTranslations } from "next-intl"

interface EditShareFormProps {
  share: {
    id: string
    share_permissions: Array<{
      id: string
      resource_type: string
      can_view: boolean
      can_create: boolean
      can_edit: boolean
      can_delete: boolean
    }>
  }
  userId: string
}

const RESOURCES = [
  { id: "accounts" },
  { id: "transactions" },
  { id: "credits" },
  { id: "services" },
  { id: "categories" },
]

export function EditShareForm({ share }: EditShareFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations("Sharing")
  const tCommon = useTranslations("Common")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [permissions, setPermissions] = useState<
    Record<string, { id: string; view: boolean; create: boolean; edit: boolean; delete: boolean }>
  >(
    share.share_permissions.reduce(
      (acc, perm) => ({
        ...acc,
        [perm.resource_type]: {
          id: perm.id,
          view: perm.can_view,
          create: perm.can_create,
          edit: perm.can_edit,
          delete: perm.can_delete,
        },
      }),
      {},
    ),
  )

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
      // Update permissions
      for (const [resource, perms] of Object.entries(permissions)) {
        const { error: updateError } = await supabase
          .from("share_permissions")
          .update({
            can_view: perms.view,
            can_create: perms.create,
            can_edit: perms.edit,
            can_delete: perms.delete,
          })
          .eq("id", perms.id)

        if (updateError) throw updateError
      }

      router.push("/dashboard/sharing")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tCommon("error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivate = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("account_shares").update({ is_active: false }).eq("id", share.id)

      if (error) throw error

      router.push("/dashboard/sharing")
      router.refresh()
    } catch (err) {
      console.error("[v0] Error deactivating share:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label>{t("accessPermissions")}</Label>
        {RESOURCES.map((resource) => (
          <Card key={resource.id}>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{t(`resources.${resource.id}.label`)}</h4>
                  <p className="text-sm text-muted-foreground">{t(`resources.${resource.id}.description`)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${resource.id}-view`}
                      checked={permissions[resource.id]?.view || false}
                      onCheckedChange={() => togglePermission(resource.id, "view")}
                    />
                    <label htmlFor={`${resource.id}-view`} className="text-sm cursor-pointer">
                      {t("permissions.view")}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${resource.id}-create`}
                      checked={permissions[resource.id]?.create || false}
                      onCheckedChange={() => togglePermission(resource.id, "create")}
                    />
                    <label htmlFor={`${resource.id}-create`} className="text-sm cursor-pointer">
                      {t("permissions.create")}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${resource.id}-edit`}
                      checked={permissions[resource.id]?.edit || false}
                      onCheckedChange={() => togglePermission(resource.id, "edit")}
                    />
                    <label htmlFor={`${resource.id}-edit`} className="text-sm cursor-pointer">
                      {t("permissions.edit")}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${resource.id}-delete`}
                      checked={permissions[resource.id]?.delete || false}
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

      <div className="flex flex-col gap-3">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("saveChanges")}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" className="w-full" disabled={isLoading}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t("deactivateShare")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deactivateShareTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("deactivateShareDesc")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeactivate} className="bg-destructive text-white">
                {t("deactivateConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button type="button" variant="outline" onClick={() => router.back()}>
          {tCommon("cancel")}
        </Button>
      </div>
    </form>
  )
}

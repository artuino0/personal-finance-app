"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Share {
  id: string
  owner_id: string
  shared_with_id: string
  shared_with_email: string
  is_active: boolean
  shared_at: string
  profiles?: {
    full_name: string
  }
  share_permissions: Array<{
    resource_type: string
    can_view: boolean
    can_create: boolean
    can_edit: boolean
    can_delete: boolean
  }>
}

interface SharesListProps {
  shares: Share[]
  userId: string
  type: "outgoing" | "incoming"
}

export function SharesList({ shares, type }: SharesListProps) {
  if (shares.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">
          {type === "outgoing"
            ? "No has compartido tus finanzas con nadie"
            : "Nadie ha compartido sus finanzas contigo"}
        </p>
      </div>
    )
  }

  const getPermissionBadges = (permissions: Share["share_permissions"]) => {
    const resourceLabels: Record<string, string> = {
      accounts: "Cuentas",
      transactions: "Transacciones",
      credits: "Créditos",
      services: "Servicios",
      categories: "Categorías",
    }

    const activeResources = permissions.filter((p) => p.can_view)
    return activeResources.map((p) => {
      const level = p.can_delete ? "Total" : p.can_edit ? "Editar" : p.can_create ? "Crear" : "Ver"
      return { resource: resourceLabels[p.resource_type] || p.resource_type, level }
    })
  }

  return (
    <div className="space-y-3">
      {shares.map((share) => {
        const permissions = getPermissionBadges(share.share_permissions)
        const displayName =
          type === "incoming"
            ? share.profiles?.full_name || "Usuario"
            : share.profiles?.full_name || share.shared_with_email.split("@")[0]

        const displayEmail =
          type === "incoming"
            ? null // Don't show email for incoming shares if we have the name
            : share.shared_with_email

        return (
          <Card key={share.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate max-w-[180px]">{displayName}</p>
                      {share.is_active ? (
                        <Badge variant="default" className="text-xs shrink-0">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs shrink-0">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    {displayEmail && <p className="text-xs text-muted-foreground mt-1 truncate">{displayEmail}</p>}
                  </div>
                  {type === "outgoing" && (
                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" asChild>
                      <Link href={`/dashboard/sharing/${share.id}`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Compartido {formatDistanceToNow(new Date(share.shared_at), { addSuffix: true, locale: es })}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {permissions.map((p) => (
                    <div key={p.resource} className="flex items-center gap-1.5 text-xs">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="font-medium truncate">{p.resource}:</span>
                      <span className="text-muted-foreground">{p.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

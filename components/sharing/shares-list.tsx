"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Eye, Edit, Trash2, Plus } from "lucide-react"
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
    const activeResources = permissions.filter((p) => p.can_view)
    return activeResources.map((p) => {
      const level = p.can_delete ? "Total" : p.can_edit ? "Edición" : p.can_create ? "Crear" : "Ver"
      return { resource: p.resource_type, level }
    })
  }

  return (
    <div className="space-y-3">
      {shares.map((share) => {
        const permissions = getPermissionBadges(share.share_permissions)
        return (
          <Card key={share.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{share.profiles?.full_name || share.shared_with_email}</p>
                    {share.is_active ? (
                      <Badge variant="secondary" className="text-xs">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Compartido {formatDistanceToNow(new Date(share.shared_at), { addSuffix: true, locale: es })}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {permissions.map((p) => (
                      <Badge key={p.resource} variant="outline" className="text-xs capitalize">
                        {p.resource === "accounts" && <Eye className="h-3 w-3 mr-1" />}
                        {p.resource === "transactions" && <Edit className="h-3 w-3 mr-1" />}
                        {p.resource === "credits" && <Plus className="h-3 w-3 mr-1" />}
                        {p.resource === "services" && <Settings className="h-3 w-3 mr-1" />}
                        {p.resource === "categories" && <Trash2 className="h-3 w-3 mr-1" />}
                        {p.resource}: {p.level}
                      </Badge>
                    ))}
                  </div>
                </div>
                {type === "outgoing" && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/sharing/${share.id}`}>
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

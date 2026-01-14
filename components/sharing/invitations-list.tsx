"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Check, X, Trash2, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Invitation {
  id: string
  owner_id: string
  invited_email: string
  invitation_token: string
  status: string
  permissions: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>
  created_at: string
  expires_at: string
}

interface InvitationsListProps {
  invitations: Invitation[]
  type: "sent" | "received"
  userId: string
}

export function InvitationsList({ invitations, type, userId }: InvitationsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [ownerNames, setOwnerNames] = useState<Record<string, string>>({})

  useEffect(() => {
    if (type === "received" && invitations.length > 0) {
      const fetchOwnerNames = async () => {
        const ownerIds = [...new Set(invitations.map((inv) => inv.owner_id))]
        const { data } = await supabase.from("profiles").select("id, full_name").in("id", ownerIds)

        if (data) {
          const namesMap = data.reduce(
            (acc, profile) => {
              acc[profile.id] = profile.full_name
              return acc
            },
            {} as Record<string, string>,
          )
          setOwnerNames(namesMap)
        }
      }
      fetchOwnerNames()
    }
  }, [invitations, type])

  const handleAccept = async (invitation: Invitation) => {
    setLoading(invitation.id)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      const { data: share, error: shareError } = await supabase
        .from("account_shares")
        .insert({
          owner_id: invitation.owner_id,
          shared_with_id: userId,
          shared_with_email: user.email || invitation.invited_email,
          is_active: true,
        })
        .select()
        .single()

      if (shareError) throw shareError

      const permissionsToInsert = Object.entries(invitation.permissions).map(([resource, perms]) => ({
        share_id: share.id,
        resource_type: resource,
        can_view: perms.view,
        can_create: perms.create,
        can_edit: perms.edit,
        can_delete: perms.delete,
      }))

      const { error: permsError } = await supabase.from("share_permissions").insert(permissionsToInsert)

      if (permsError) throw permsError

      const { error: updateError } = await supabase
        .from("share_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id)

      if (updateError) throw updateError

      router.refresh()
    } catch (error) {
      console.error("[v0] Error accepting invitation:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (invitationId: string) => {
    setLoading(invitationId)
    try {
      const { error } = await supabase.from("share_invitations").update({ status: "rejected" }).eq("id", invitationId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Error rejecting invitation:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleCancel = async (invitationId: string) => {
    setLoading(invitationId)
    try {
      const { error } = await supabase.from("share_invitations").delete().eq("id", invitationId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Error canceling invitation:", error)
    } finally {
      setLoading(null)
    }
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No hay invitaciones {type === "sent" ? "enviadas" : "recibidas"}</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Enviado</TableHead>
            <TableHead>Recursos</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const resourceCount = Object.values(invitation.permissions).filter((p) => p.view).length
            return (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">
                  {type === "sent" ? invitation.invited_email : ownerNames[invitation.owner_id] || "Usuario"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendiente
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true, locale: es })}
                </TableCell>
                <TableCell>
                  {resourceCount} {resourceCount === 1 ? "recurso" : "recursos"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {type === "received" ? (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAccept(invitation)}
                          disabled={loading === invitation.id}
                        >
                          {loading === invitation.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Aceptar
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(invitation.id)}
                          disabled={loading === invitation.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancel(invitation.id)}
                        disabled={loading === invitation.id}
                      >
                        {loading === invitation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

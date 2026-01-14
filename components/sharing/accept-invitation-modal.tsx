"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Invitation {
  id: string
  owner_id: string
  invited_email: string
  permissions: any
  status: string
  invitation_token: string
}

export function AcceptInvitationModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [ownerName, setOwnerName] = useState<string>("")

  const token = searchParams.get("accept")

  useEffect(() => {
    if (token) {
      loadInvitation()
    }
  }, [token])

  const loadInvitation = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("share_invitations")
      .select("*")
      .eq("invitation_token", token)
      .eq("status", "pending")
      .single()

    if (error || !data) {
      toast({
        title: "Error",
        description: "Invitación no encontrada o ya procesada",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    setInvitation(data)

    // Fetch owner profile separately
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", data.owner_id).single()

    if (profile) {
      setOwnerName(profile.full_name)
    }

    setOpen(true)
    setLoading(false)
  }

  const handleAccept = async () => {
    if (!invitation || processing) return // Added processing check

    setProcessing(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para aceptar la invitación",
        variant: "destructive",
      })
      setProcessing(false)
      return
    }

    try {
      const { data, error } = await supabase.rpc("accept_share_invitation", {
        p_invitation_token: invitation.invitation_token,
        p_user_id: user.id,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data?.success) {
        throw new Error(data?.error || "No se pudo aceptar la invitación")
      }

      toast({
        title: "¡Éxito!",
        description: "Invitación aceptada correctamente",
      })

      setOpen(false)

      // Remove the accept parameter from URL
      router.push("/dashboard/sharing")
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Error accepting invitation:", err)
      toast({
        title: "Error",
        description: err.message || "No se pudo aceptar la invitación",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!invitation) return

    setProcessing(true)
    const supabase = createClient()

    const { error } = await supabase.from("share_invitations").update({ status: "rejected" }).eq("id", invitation.id)

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo rechazar la invitación",
        variant: "destructive",
      })
      setProcessing(false)
      return
    }

    toast({
      title: "Invitación rechazada",
      description: "Has rechazado la invitación",
    })

    setOpen(false)
    setProcessing(false)

    // Remove the accept parameter from URL
    router.push("/dashboard/sharing")
    router.refresh()
  }

  const getPermissionBadge = (resource: string, perms: any) => {
    const actions = []
    if (perms.view) actions.push("Ver")
    if (perms.create) actions.push("Crear")
    if (perms.edit) actions.push("Editar")
    if (perms.delete) actions.push("Eliminar")

    return actions.length > 0 ? actions.join(", ") : "Sin permisos"
  }

  if (!token || loading) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Invitación para Compartir Finanzas
          </DialogTitle>
          <DialogDescription>{ownerName || "Un usuario"} te ha invitado a ver sus finanzas</DialogDescription>
        </DialogHeader>

        {invitation && (
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold">Permisos otorgados:</h4>
              <div className="space-y-2">
                {Object.entries(invitation.permissions).map(([resource, perms]: [string, any]) => (
                  <div key={resource} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="font-medium capitalize">
                      {resource === "accounts"
                        ? "Cuentas"
                        : resource === "transactions"
                          ? "Transacciones"
                          : resource === "credits"
                            ? "Créditos"
                            : resource === "services"
                              ? "Servicios"
                              : resource}
                    </span>
                    <Badge variant="secondary">{getPermissionBadge(resource, perms)}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              Al aceptar, podrás ver y gestionar las finanzas de este usuario según los permisos otorgados.
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReject} disabled={processing}>
            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
            Rechazar
          </Button>
          <Button onClick={handleAccept} disabled={processing}>
            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Aceptar Invitación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface InviteFormProps {
  userId: string
  userEmail: string
}

const RESOURCES = [
  { id: "accounts", label: "Cuentas", description: "Ver y gestionar cuentas bancarias" },
  { id: "transactions", label: "Transacciones", description: "Ver y crear transacciones" },
  { id: "credits", label: "Créditos", description: "Ver y gestionar créditos/préstamos" },
  { id: "services", label: "Servicios", description: "Ver y gestionar servicios recurrentes" },
  { id: "categories", label: "Categorías", description: "Ver y gestionar categorías" },
]

export function InviteForm({ userId }: InviteFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [userExists, setUserExists] = useState<boolean | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [foundUserId, setFoundUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<"email" | "permissions">("email")

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
        setError(result.error || "Error al verificar el email")
        return
      }

      if (result.exists) {
        setUserExists(true)
        setUserName(result.user.name)
        setFoundUserId(result.user.id)
      } else {
        setUserExists(false)
      }
    } catch (err) {
      console.error("[v0] Error checking email:", err)
      setError("Error al verificar el email")
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
      // Create invitation
      const { data: invitation, error: inviteError } = await supabase
        .from("share_invitations")
        .insert({
          owner_id: userId,
          invited_email: email.toLowerCase(),
          permissions: permissions,
          status: "pending",
        })
        .select()
        .single()

      if (inviteError) throw inviteError

      // If user exists, we can create the share immediately (they just need to accept)
      if (userExists && invitation) {
        // TODO: Send email notification
        console.log("[v0] Invitation created:", invitation.id)
      }

      router.push("/dashboard/sharing")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStep === "email") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
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
              {isCheckingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
            </Button>
          </div>
        </div>

        {userExists === true && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="flex items-center gap-3 pt-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Usuario encontrado</p>
                <p className="text-sm text-green-700 dark:text-green-300">{userName || email}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {userExists === false && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">Usuario no registrado</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Este usuario deberá registrarse en FindexApp para aceptar la invitación
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-md bg-orange-100 dark:bg-orange-900 p-3">
                <Mail className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                <p className="text-xs text-orange-800 dark:text-orange-200">
                  Se enviará un correo de invitación con un enlace para registrarse
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancelar
          </Button>
          <Button type="button" onClick={handleNextStep} disabled={!email || userExists === null} className="flex-1">
            Siguiente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-md bg-muted/50 p-4">
        <p className="text-sm font-medium">Invitando a: {userName || email}</p>
      </div>

      <div className="space-y-4">
        <Label>Permisos de Acceso</Label>
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
                      Ver
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${resource.id}-create`}
                      checked={permissions[resource.id].create}
                      onCheckedChange={() => togglePermission(resource.id, "create")}
                    />
                    <label htmlFor={`${resource.id}-create`} className="text-sm cursor-pointer">
                      Crear
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${resource.id}-edit`}
                      checked={permissions[resource.id].edit}
                      onCheckedChange={() => togglePermission(resource.id, "edit")}
                    />
                    <label htmlFor={`${resource.id}-edit`} className="text-sm cursor-pointer">
                      Editar
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${resource.id}-delete`}
                      checked={permissions[resource.id].delete}
                      onCheckedChange={() => togglePermission(resource.id, "delete")}
                    />
                    <label htmlFor={`${resource.id}-delete`} className="text-sm cursor-pointer">
                      Eliminar
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
          Atrás
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Invitación"}
        </Button>
      </div>
    </form>
  )
}

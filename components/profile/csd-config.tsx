"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import { FileText, Lock, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CSDConfigProps {
  userId: string
  initialConfig?: {
    certificate_file_path?: string
    key_file_path?: string
    certificate_expiry?: string
  } | null
}

export function CSDConfig({ userId, initialConfig }: CSDConfigProps) {
  const supabase = createClient()
  const t = useTranslations("Profile")
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [certificatePassword, setCertificatePassword] = useState("")
  const [certificateExpiry, setCertificateExpiry] = useState(
    initialConfig?.certificate_expiry || ""
  )
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [keyFile, setKeyFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let certificatePath = initialConfig?.certificate_file_path
      let keyPath = initialConfig?.key_file_path

      // Upload certificate if new file selected
      if (certificateFile) {
        const certExt = certificateFile.name.split(".").pop()
        const certFileName = `cert-${Date.now()}.${certExt}`
        const certFilePath = `${userId}/${certFileName}`

        const { error: uploadCertError } = await supabase.storage
          .from("invoice-certificates")
          .upload(certFilePath, certificateFile, { upsert: true })

        if (uploadCertError) throw uploadCertError

        certificatePath = certFilePath
      }

      // Upload key if new file selected
      if (keyFile) {
        const keyExt = keyFile.name.split(".").pop()
        const keyFileName = `key-${Date.now()}.${keyExt}`
        const keyFilePath = `${userId}/${keyFileName}`

        const { error: uploadKeyError } = await supabase.storage
          .from("invoice-certificates")
          .upload(keyFilePath, keyFile, { upsert: true })

        if (uploadKeyError) throw uploadKeyError

        keyPath = keyFilePath
      }

      // Save configuration to database
      const { error: configError } = await supabase
        .from("facturapi_config")
        .upsert({
          user_id: userId,
          certificate_file_path: certificatePath,
          key_file_path: keyPath,
          certificate_password: certificatePassword || null,
          certificate_expiry: certificateExpiry || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (configError) throw configError

      toast({
        title: t("success"),
        description: t("csdConfigured"),
      })

      // Clear file inputs and password
      setCertificateFile(null)
      setKeyFile(null)
      setCertificatePassword("")
    } catch (error) {
      console.error("Error saving CSD config:", error)
      toast({
        title: t("error"),
        description: t("csdConfigError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>{t("csdConfig")}</CardTitle>
            <CardDescription>{t("csdConfigDesc")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Certificate Upload */}
          <div className="space-y-2">
            <Label htmlFor="certificate" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t("uploadCertificate")}
            </Label>
            <Input
              id="certificate"
              type="file"
              accept=".cer"
              onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
              className="h-11"
            />
            {initialConfig?.certificate_file_path && !certificateFile && (
              <p className="text-xs text-muted-foreground">
                Actual: {initialConfig.certificate_file_path.split("/").pop()}
              </p>
            )}
          </div>

          {/* Key Upload */}
          <div className="space-y-2">
            <Label htmlFor="key" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {t("uploadKey")}
            </Label>
            <Input
              id="key"
              type="file"
              accept=".key"
              onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
              className="h-11"
            />
            {initialConfig?.key_file_path && !keyFile && (
              <p className="text-xs text-muted-foreground">
                Actual: {initialConfig.key_file_path.split("/").pop()}
              </p>
            )}
          </div>

          {/* Certificate Password */}
          <div className="space-y-2">
            <Label htmlFor="certificate_password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {t("certificatePassword")}
            </Label>
            <Input
              id="certificate_password"
              type="password"
              value={certificatePassword}
              onChange={(e) => setCertificatePassword(e.target.value)}
              placeholder={t("certificatePasswordPlaceholder")}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Por seguridad, la contraseña NO se almacena. Ingrésala cada vez que actualices los certificados.
            </p>
          </div>

          {/* Certificate Expiry */}
          <div className="space-y-2">
            <Label htmlFor="certificate_expiry" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("certificateExpiry")}
            </Label>
            <Input
              id="certificate_expiry"
              type="date"
              value={certificateExpiry}
              onChange={(e) => setCertificateExpiry(e.target.value)}
              className="h-11"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t("uploadingFiles") : t("saveCSD")}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {t("csdNote")}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

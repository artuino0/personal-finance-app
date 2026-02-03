"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { InvoiceClient } from "../invoice-wizard"
import { UserPlus, Users } from "lucide-react"

interface ClientStepProps {
  userId: string
  initialClient: InvoiceClient | null
  onClientSaved: (client: InvoiceClient) => void
  onBack: () => void
}

export function ClientStep({ userId, initialClient, onClientSaved, onBack }: ClientStepProps) {
  const t = useTranslations("Invoicing")
  const { toast } = useToast()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [isNewClient, setIsNewClient] = useState(!initialClient?.id)
  const [existingClients, setExistingClients] = useState<InvoiceClient[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>("")

  // Form fields
  const [rfc, setRfc] = useState(initialClient?.rfc || "")
  const [legalName, setLegalName] = useState(initialClient?.legal_name || "")
  const [taxRegime, setTaxRegime] = useState(initialClient?.tax_regime || "")
  const [zipCode, setZipCode] = useState(initialClient?.zip_code || "")
  const [cfdiUse, setCfdiUse] = useState(initialClient?.cfdi_use || "")

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from("invoice_clients")
        .select("*")
        .eq("user_id", userId)
        .order("legal_name")

      if (error) throw error
      setExistingClients(data || [])
    } catch (error) {
      console.error("Error loading clients:", error)
    }
  }

  const regimens = ["601", "603", "605", "606", "607", "608", "610", "611", "612", "614", "615", "616", "620", "621", "622", "623", "624", "625", "626"]
  const cfdiUses = ["G01", "G02", "G03", "I01", "I02", "I03", "I04", "I05", "I06", "I07", "I08", "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "P01", "S01", "CP01", "CN01"]

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId)
    const client = existingClients.find((c) => c.id === clientId)
    if (client) {
      setRfc(client.rfc)
      setLegalName(client.legal_name)
      setTaxRegime(client.tax_regime)
      setZipCode(client.zip_code)
      setCfdiUse(client.cfdi_use)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isNewClient || !selectedClientId) {
        // Create new client
        const { data, error } = await supabase
          .from("invoice_clients")
          .insert({
            user_id: userId,
            rfc: rfc.toUpperCase(),
            legal_name: legalName,
            tax_regime: taxRegime,
            zip_code: zipCode,
            cfdi_use: cfdiUse,
          })
          .select()
          .single()

        if (error) throw error

        toast({
          title: t("success"),
          description: t("clientSaved"),
        })

        onClientSaved(data)
      } else {
        // Use existing client
        const client = existingClients.find((c) => c.id === selectedClientId)
        if (client) {
          onClientSaved(client)
        }
      }
    } catch (error) {
      console.error("Error saving client:", error)
      toast({
        title: t("error"),
        description: t("clientSaveError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("step1")}</h2>
      </div>

      {/* Client Selection Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={!isNewClient ? "default" : "outline"}
          onClick={() => setIsNewClient(false)}
          className="flex-1"
        >
          <Users className="h-4 w-4 mr-2" />
          {t("selectClient")}
        </Button>
        <Button
          type="button"
          variant={isNewClient ? "default" : "outline"}
          onClick={() => {
            setIsNewClient(true)
            setSelectedClientId("")
            setRfc("")
            setLegalName("")
            setTaxRegime("")
            setZipCode("")
            setCfdiUse("")
          }}
          className="flex-1"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {t("addNewClient")}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Existing Client Selector */}
        {!isNewClient && (
          <div className="space-y-2">
            <Label>{t("client")}</Label>
            <Select value={selectedClientId} onValueChange={handleClientSelect}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={t("selectClient")} />
              </SelectTrigger>
              <SelectContent>
                {existingClients.map((client) => (
                  <SelectItem key={client.id} value={client.id!}>
                    {client.legal_name} - {client.rfc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Client Form Fields */}
        {(isNewClient || selectedClientId) && (
          <>
            <div className="space-y-2">
              <Label htmlFor="rfc">{t("clientRFC")}</Label>
              <Input
                id="rfc"
                value={rfc}
                onChange={(e) => setRfc(e.target.value.toUpperCase())}
                placeholder={t("clientRFCPlaceholder")}
                required
                disabled={!isNewClient}
                className="h-11 uppercase"
                maxLength={13}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal_name">{t("clientName")}</Label>
              <Input
                id="legal_name"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder={t("clientNamePlaceholder")}
                required
                disabled={!isNewClient}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_regime">{t("clientRegimen")}</Label>
              <Select value={taxRegime} onValueChange={setTaxRegime} disabled={!isNewClient}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t("clientRegimenPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {regimens.map((regime) => (
                    <SelectItem key={regime} value={regime}>
                      {t(`regimens.${regime}` as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">{t("clientZipCode")}</Label>
              <Input
                id="zip_code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder={t("clientZipCodePlaceholder")}
                required
                disabled={!isNewClient}
                className="h-11"
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cfdi_use">{t("clientUsoCFDI")}</Label>
              <Select value={cfdiUse} onValueChange={setCfdiUse} disabled={!isNewClient}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t("clientUsoCFDIPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {cfdiUses.map((use) => (
                    <SelectItem key={use} value={use}>
                      {t(`usoCFDI.${use}` as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={
              isLoading ||
              (!isNewClient && !selectedClientId) ||
              (isNewClient && (!rfc || !legalName || !taxRegime || !zipCode || !cfdiUse))
            }
            className="flex-1"
          >
            {isLoading
              ? t("saving")
              : isNewClient
                ? t("saveClientAndContinue")
                : t("continue")}
          </Button>
        </div>
      </form>
    </div>
  )
}

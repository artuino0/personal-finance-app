"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslations } from "next-intl"
import { Camera, Gem, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Profile {
  id: string
  full_name: string | null
  created_at: string
  updated_at: string
  subscription_tier?: string
  avatar_url?: string | null
}

interface ProfileFormProps {
  userId: string
  userEmail: string
  initialProfile: Profile | null
}

export function ProfileForm({ userId, userEmail, initialProfile }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations("Profile")
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "")
  const [fullName, setFullName] = useState(initialProfile?.full_name || "")
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      // Update auth metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      })

      if (metadataError) throw metadataError

      toast({
        title: t("success"),
        description: t("profileUpdated"),
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: t("error"),
        description: t("updateError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("error"),
        description: t("invalidFileType"),
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t("error"),
        description: t("fileTooLarge"),
        variant: "destructive",
      })
      return
    }

    setIsUploadingAvatar(true)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId)

      if (updateError) throw updateError

      // Update auth metadata
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      })

      setAvatarUrl(publicUrl)

      toast({
        title: t("success"),
        description: t("avatarUpdated"),
      })

      router.refresh()
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: t("error"),
        description: t("uploadError"),
        variant: "destructive",
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: t("error"),
        description: t("passwordMismatch"),
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: t("error"),
        description: t("passwordTooShort"),
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      toast({
        title: t("success"),
        description: t("passwordChanged"),
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: t("error"),
        description: t("passwordChangeError"),
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const tier = (initialProfile?.subscription_tier as "free" | "pro") || "free"

  return (
    <div className="space-y-6">
      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("accountInfo")}</CardTitle>
              <CardDescription>{t("accountInfoDesc")}</CardDescription>
            </div>
            <Badge 
              variant={tier === "pro" ? "default" : "secondary"}
              className={tier === "pro" ? "bg-gradient-to-r from-yellow-400 to-amber-600" : ""}
            >
              {tier === "pro" ? (
                <>
                  <Gem className="h-3 w-3 mr-1" />
                  {t("proPlan")}
                </>
              ) : (
                t("freePlan")
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl || undefined} alt={fullName || userEmail} />
                  <AvatarFallback className="text-2xl">
                    {(fullName || userEmail).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />
                </label>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{fullName || t("noName")}</h3>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("memberSince", {
                    date: new Date(initialProfile?.created_at || Date.now()).toLocaleDateString(),
                  })}
                </p>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="full_name">{t("fullName")}</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("fullNamePlaceholder")}
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" value={userEmail} disabled />
              <p className="text-xs text-muted-foreground">{t("emailCannotChange")}</p>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("saving") : t("saveChanges")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>{t("security")}</CardTitle>
              <CardDescription>{t("securityDesc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">{t("newPassword")}</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("newPasswordPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">{t("confirmPassword")}</Label>
              <Input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("confirmPasswordPlaceholder")}
              />
            </div>

            <Button type="submit" disabled={isChangingPassword || !newPassword || !confirmPassword}>
              {isChangingPassword ? t("changing") : t("changePassword")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      {tier === "free" && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gem className="h-5 w-5 text-primary" />
              {t("upgradeToPro")}
            </CardTitle>
            <CardDescription>{t("upgradeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t("proFeature1")}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t("proFeature2")}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t("proFeature3")}
              </li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
              {t("upgradeNow")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

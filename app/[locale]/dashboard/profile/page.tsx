import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProfileForm } from "@/components/profile/profile-form"
import { getTranslations } from "next-intl/server"
import { PageHeader } from "@/components/dashboard/page-header"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  const t = await getTranslations("Profile")

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardNav
        userName={
          profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Usuario"
        }
        userAvatar={user.user_metadata?.avatar_url || user.user_metadata?.picture}
        tier={(profile?.subscription_tier as "free" | "pro") || "free"}
      />
      <main className="container mx-auto p-6 max-w-4xl">
        <PageHeader title={t("title")} subtitle={t("description")} />
        
        <ProfileForm 
          userId={user.id}
          userEmail={user.email || ""}
          initialProfile={profile}
        />
      </main>
    </div>
  )
}

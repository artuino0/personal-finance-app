import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { PageHeader } from "@/components/dashboard/page-header"
import { AiAssistantView } from "@/components/dashboard/ai-assistant-view"
import { getTranslations } from "next-intl/server"
import { getSelectedAccountId, getAccountPermissions } from "@/lib/utils/account-context"

export default async function AiSistantPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

    // Get selected account explicitly like in dashboard/page.tsx or use helper
    const selectedAccountId = (await getSelectedAccountId()) || user.id
    const permissions = await getAccountPermissions(selectedAccountId, "transactions") // Using generic permissions check
    const isSharedAccount = selectedAccountId !== user.id

    // Fallback for missing profile scenarios
    const userName = profile?.full_name || user.user_metadata?.full_name || user.email || "Usuario"
    const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture

    // Translations (using "Dashboard" namespace as fallback/standard)
    const t = await getTranslations("Dashboard")

    // Fetch latest analysis history (SERVER SIDE for security/time sync)
    const { data: lastReport } = await supabase
        .from("ai_analysis_history")
        .select("response, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

    // Calculate initial cooldown on server if needed, or just pass the date
    // We pass serverTime so client calculates diff against SERVER 'now', not client 'now'
    const serverTime = new Date().toISOString()

    return (
        <div className="min-h-screen bg-secondary/30">
            <DashboardNav
                userName={userName}
                userAvatar={userAvatar}
                tier={(profile?.subscription_tier as "free" | "pro") || "free"}
            />
            <main className="container mx-auto p-6">
                {/* 
                     We keep PageHeader for consistency, but we hardcode title for this specific AI page 
                     since we might not have a translation key for it yet.
                 */}
                <PageHeader
                    title="Asistente AI"
                    description="Tu experto financiero personal impulsado por inteligencia artificial"
                    currentUserId={user.id}
                    currentUserName={userName}
                    currentUserEmail={user.email || ""}
                    selectedAccountId={selectedAccountId}
                    isSharedAccount={isSharedAccount}
                    permissions={permissions}
                />

                <div className="mt-8">
                    <AiAssistantView
                        tier={(profile?.subscription_tier as "free" | "pro") || "free"}
                        initialAnalysis={lastReport?.response as any}
                        lastReportDate={lastReport?.created_at}
                        serverTime={serverTime}
                    />
                </div>
            </main>
        </div>
    )
}

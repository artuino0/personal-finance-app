import { createClient } from "@/lib/supabase/server"
import { TIER_LIMITS, SubscriptionTier, canAddService, canAddCredit, canAddAccount, canAddSharedUser } from "@/lib/tier-limits"

export type LimitCheckResult = {
    allowed: boolean
    count: number
    limit: number | null
    tier: SubscriptionTier
}

export async function checkServiceLimit(userId: string): Promise<LimitCheckResult> {
    const supabase = await createClient()

    // Get user profile for tier
    const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", userId)
        .single()

    const tier = (profile?.subscription_tier as SubscriptionTier) || "free"

    // Get count of active recurring services
    const { count } = await supabase
        .from("recurring_services")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_active", true)

    const currentCount = count || 0
    const allowed = canAddService(tier, currentCount)
    const limit = TIER_LIMITS[tier].recurringServices

    return { allowed, count: currentCount, limit, tier }
}

export async function checkCreditLimit(userId: string): Promise<LimitCheckResult> {
    const supabase = await createClient()

    // Get user profile for tier
    const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", userId)
        .single()

    const tier = (profile?.subscription_tier as SubscriptionTier) || "free"

    // Get count of active credits
    const { count } = await supabase
        .from("credits")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "active")

    const currentCount = count || 0
    const allowed = canAddCredit(tier, currentCount)
    const limit = TIER_LIMITS[tier].activeCredits

    return { allowed, count: currentCount, limit, tier }
}

export async function checkAccountLimit(userId: string): Promise<LimitCheckResult> {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", userId)
        .single()

    const tier = (profile?.subscription_tier as SubscriptionTier) || "free"

    const { count } = await supabase
        .from("accounts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

    const currentCount = count || 0
    const allowed = canAddAccount(tier, currentCount)
    const limit = TIER_LIMITS[tier].accounts

    return { allowed, count: currentCount, limit, tier }
}

export async function checkSharedUserLimit(userId: string): Promise<LimitCheckResult> {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", userId)
        .single()

    const tier = (profile?.subscription_tier as SubscriptionTier) || "free"

    const { count: activeSharesCount } = await supabase
        .from("account_shares")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId)
        .eq("is_active", true)

    const { count: pendingInvitesCount } = await supabase
        .from("share_invitations")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId)
        .eq("status", "pending")

    const currentCount = (activeSharesCount || 0) + (pendingInvitesCount || 0)
    const allowed = canAddSharedUser(tier, currentCount)
    const limit = TIER_LIMITS[tier].sharedUsers

    return { allowed, count: currentCount, limit, tier }
}

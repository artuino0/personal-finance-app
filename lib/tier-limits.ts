export type SubscriptionTier = 'free' | 'pro' | 'premium'

export interface TierLimits {
    accounts: number | null // null = unlimited
    sharedUsers: number
    recurringServices: number | null
    activeCredits: number | null
    aiAnalysesPerMonth: number | null
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
    free: {
        accounts: 3,
        sharedUsers: 0,
        recurringServices: 5,
        activeCredits: 2,
        aiAnalysesPerMonth: 1,
    },
    pro: {
        accounts: null, // unlimited
        sharedUsers: 1,
        recurringServices: null,
        activeCredits: null,
        aiAnalysesPerMonth: 4,
    },
    premium: {
        accounts: null,
        sharedUsers: 5,
        recurringServices: null,
        activeCredits: null,
        aiAnalysesPerMonth: null, // unlimited
    },
}

export function getTierLimits(tier: SubscriptionTier): TierLimits {
    return TIER_LIMITS[tier]
}

export function canAddAccount(tier: SubscriptionTier, currentCount: number): boolean {
    const limit = TIER_LIMITS[tier].accounts
    return limit === null || currentCount < limit
}

export function canAddSharedUser(tier: SubscriptionTier, currentCount: number): boolean {
    const limit = TIER_LIMITS[tier].sharedUsers
    return currentCount < limit
}

export function canAddService(tier: SubscriptionTier, currentCount: number): boolean {
    const limit = TIER_LIMITS[tier].recurringServices
    return limit === null || currentCount < limit
}

export function canAddCredit(tier: SubscriptionTier, currentCount: number): boolean {
    const limit = TIER_LIMITS[tier].activeCredits
    return limit === null || currentCount < limit
}

export function canRunAIAnalysis(tier: SubscriptionTier, currentMonthCount: number): boolean {
    const limit = TIER_LIMITS[tier].aiAnalysesPerMonth
    return limit === null || currentMonthCount < limit
}

export function getLimitMessage(
    feature: 'accounts' | 'sharedUsers' | 'recurringServices' | 'activeCredits' | 'aiAnalysesPerMonth',
    tier: SubscriptionTier
): string {
    const limit = TIER_LIMITS[tier][feature]

    if (limit === null) {
        return 'unlimited'
    }

    const featureNames = {
        accounts: 'accounts',
        sharedUsers: 'shared users',
        recurringServices: 'recurring services',
        activeCredits: 'active credits',
        aiAnalysesPerMonth: 'AI analyses per month',
    }

    return `${limit} ${featureNames[feature]}`
}

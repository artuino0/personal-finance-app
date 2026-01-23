/**
 * AI Financial Analysis - Prompt Engineering & Type Definitions
 * 
 * This module contains strict prompts and type definitions to ensure
 * Claude Haiku stays focused on financial analysis only.
 */

// ==================== TYPE DEFINITIONS ====================

export interface Transaction {
    id: string
    type: 'income' | 'expense' | 'transfer'
    amount: number
    description: string | null
    date: string
    category: string | null
    account_name: string
}

export interface AnalysisRequest {
    transactions: Transaction[]
    period: {
        start: string
        end: string
    }
    tier: 'free' | 'pro'
    userId: string
}

// Free Tier Response Structure
export interface FreeAnalysisResponse {
    tier: 'free'
    period: {
        start: string
        end: string
    }
    summary: {
        totalIncome: number
        totalExpenses: number
        netBalance: number
        transactionCount: number
    }
    insights: string[] // Max 3 insights
    recommendations: string[] // Max 2 recommendations
    financialScore: number // 0-100
}

// Pro Tier Response Structure
export interface ProAnalysisResponse {
    tier: 'pro'
    period: {
        start: string
        end: string
    }
    summary: {
        totalIncome: number
        totalExpenses: number
        netBalance: number
        transactionCount: number
        savingsRate: number // Percentage
    }
    detailedAnalysis: {
        spendingByCategory: Array<{
            category: string
            amount: number
            percentage: number
            trend: 'increasing' | 'decreasing' | 'stable'
        }>
        topExpenses: Array<{
            description: string
            amount: number
            date: string
            category: string
        }>
    }
    insights: string[] // Detailed insights
    recommendations: string[] // Actionable recommendations
    alerts: string[] // Important warnings or notifications
    financialScore: number // 0-100
    scoreBreakdown: {
        savingsScore: number
        spendingScore: number
        consistencyScore: number
    }
    predictions: {
        nextMonthExpenses: number
        sixMonthSavings: number
        confidence: 'low' | 'medium' | 'high'
    }
    comparisons: {
        vsLastMonth?: {
            incomeChange: number
            expenseChange: number
            savingsChange: number
        }
    }
}

export type AnalysisResponse = FreeAnalysisResponse | ProAnalysisResponse

// ==================== PROMPT TEMPLATES ====================

export const SYSTEM_PROMPT = `You are a financial analysis AI assistant specialized in personal finance. Your ONLY purpose is to analyze transaction data and provide financial insights.

CRITICAL RULES - YOU MUST FOLLOW THESE WITHOUT EXCEPTION:
1. You ONLY analyze financial transactions and provide financial insights
2. You NEVER engage in general conversation or answer non-financial questions
3. You ALWAYS respond in valid JSON format matching the exact schema provided
4. You NEVER make up or hallucinate transaction data
5. You base ALL insights strictly on the provided transaction data
6. You use clear, concise language in Spanish (MXN currency context)
7. You provide actionable, specific recommendations
8. If asked anything non-financial, respond with: {"error": "I only analyze financial data"}

Your analysis should be:
- Data-driven and factual
- Helpful and actionable
- Clear and concise
- Focused on improving the user's financial health`

export const FREE_TIER_PROMPT = `Analyze the following transactions and provide a FREE TIER analysis.

RESPONSE FORMAT - You MUST respond with EXACTLY this JSON structure:
{
  "tier": "free",
  "period": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "summary": {
    "totalIncome": number,
    "totalExpenses": number,
    "netBalance": number,
    "transactionCount": number
  },
  "insights": [
    "string (max 3 insights)"
  ],
  "recommendations": [
    "string (max 2 recommendations)"
  ],
  "financialScore": number (0-100)
}

FREE TIER LIMITATIONS:
- Maximum 3 insights
- Maximum 2 recommendations
- Basic summary only
- Simple financial score (0-100)

INSIGHTS should focus on:
- Spending patterns
- Income vs expenses ratio
- Notable transactions
- Basic trends

RECOMMENDATIONS should be:
- Actionable and specific
- Based on the data
- Focused on improvement

FINANCIAL SCORE (0-100) based on:
- Savings rate (income - expenses)
- Spending consistency
- Overall financial health

Transactions to analyze:
{{TRANSACTIONS}}

Period: {{START_DATE}} to {{END_DATE}}

Respond ONLY with valid JSON. No additional text.`

export const PRO_TIER_PROMPT = `Analyze the following transactions and provide a PRO TIER comprehensive analysis.

RESPONSE FORMAT - You MUST respond with EXACTLY this JSON structure:
{
  "tier": "pro",
  "period": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "summary": {
    "totalIncome": number,
    "totalExpenses": number,
    "netBalance": number,
    "transactionCount": number,
    "savingsRate": number
  },
  "detailedAnalysis": {
    "spendingByCategory": [
      {
        "category": "string",
        "amount": number,
        "percentage": number,
        "trend": "increasing" | "decreasing" | "stable"
      }
    ],
    "topExpenses": [
      {
        "description": "string",
        "amount": number,
        "date": "YYYY-MM-DD",
        "category": "string"
      }
    ]
  },
  "insights": ["string (detailed insights)"],
  "recommendations": ["string (actionable recommendations)"],
  "alerts": ["string (important warnings)"],
  "financialScore": number (0-100),
  "scoreBreakdown": {
    "savingsScore": number (0-100),
    "spendingScore": number (0-100),
    "consistencyScore": number (0-100)
  },
  "predictions": {
    "nextMonthExpenses": number,
    "sixMonthSavings": number,
    "confidence": "low" | "medium" | "high"
  },
  "comparisons": {
    "vsLastMonth": {
      "incomeChange": number (percentage),
      "expenseChange": number (percentage),
      "savingsChange": number (percentage)
    }
  }
}

PRO TIER FEATURES:
- Detailed spending breakdown by category
- Top expenses identification
- Trend analysis
- Intelligent alerts (e.g., "Gastas 2x más en comida que hace 3 meses")
- Financial score with breakdown
- Predictions for next month and 6 months
- Month-over-month comparisons

INSIGHTS should include:
- Deep spending pattern analysis
- Category-specific observations
- Unusual transactions or trends
- Opportunities for optimization

RECOMMENDATIONS should be:
- Highly specific and actionable
- Prioritized by impact
- Data-driven

ALERTS should highlight:
- Unusual spending spikes
- Budget concerns
- Positive achievements
- Important trends

PREDICTIONS should be:
- Based on historical data
- Realistic and conservative
- Include confidence level

Transactions to analyze:
{{TRANSACTIONS}}

Period: {{START_DATE}} to {{END_DATE}}

Previous period data (if available):
{{PREVIOUS_PERIOD_DATA}}

Respond ONLY with valid JSON. No additional text.`

// ==================== HELPER FUNCTIONS ====================

export function buildPrompt(
    tier: 'free' | 'pro',
    transactions: Transaction[],
    period: { start: string; end: string },
    previousPeriodData?: any
): string {
    const template = tier === 'free' ? FREE_TIER_PROMPT : PRO_TIER_PROMPT

    const transactionsJson = JSON.stringify(transactions, null, 2)
    const previousDataJson = previousPeriodData ? JSON.stringify(previousPeriodData, null, 2) : 'null'

    return template
        .replace('{{TRANSACTIONS}}', transactionsJson)
        .replace('{{START_DATE}}', period.start)
        .replace('{{END_DATE}}', period.end)
        .replace('{{PREVIOUS_PERIOD_DATA}}', previousDataJson)
}

export function validateResponse(response: any, tier: 'free' | 'pro'): boolean {
    if (!response || typeof response !== 'object') return false
    if (response.tier !== tier) return false

    // Basic validation
    if (!response.period || !response.summary || !response.insights || !response.recommendations) {
        return false
    }

    if (tier === 'free') {
        // Free tier specific validation
        if (response.insights.length > 3) return false
        if (response.recommendations.length > 2) return false
        if (typeof response.financialScore !== 'number') return false
    } else {
        // Pro tier specific validation
        if (!response.detailedAnalysis || !response.alerts || !response.predictions) {
            return false
        }
        if (!response.scoreBreakdown) return false
    }

    return true
}

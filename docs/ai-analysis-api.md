# AI Financial Analysis API - Usage Guide

## Overview
The AI Financial Analysis endpoint uses Claude Haiku to analyze user transactions and provide intelligent financial insights.

## Endpoint
\`\`\`
POST /api/ai/analyze-transactions
\`\`\`

## Authentication
Requires authenticated user session (Supabase Auth).

## Request Body

### Option 1: Monthly Analysis (Current Month)
\`\`\`json
{
  "period": "monthly"
}
\`\`\`

### Option 2: Custom Date Range
\`\`\`json
{
  "period": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  }
}
\`\`\`

> [!IMPORTANT]
> **Subscription Tier**: The tier (free/pro) is automatically determined from the user's profile in the database. Users cannot override this in the request for security reasons.

## Response Format

### Free Tier Response
\`\`\`json
{
  "success": true,
  "analysis": {
    "tier": "free",
    "period": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "summary": {
      "totalIncome": 50000,
      "totalExpenses": 35000,
      "netBalance": 15000,
      "transactionCount": 45
    },
    "insights": [
      "Tu tasa de ahorro es del 30%, ¡excelente trabajo!",
      "Tus gastos en comida representan el 25% de tus gastos totales",
      "Has mantenido un patrón de gastos consistente este mes"
    ],
    "recommendations": [
      "Considera reducir gastos en entretenimiento para aumentar tus ahorros",
      "Establece un presupuesto mensual de $40,000 para gastos variables"
    ],
    "financialScore": 78
  },
  "metadata": {
    "transactionCount": 45,
    "period": { "start": "2026-01-01", "end": "2026-01-31" },
    "tier": "free",
    "model": "claude-haiku-4",
    "tokensUsed": {
      "input": 1850,
      "output": 420
    }
  }
}
\`\`\`

### Pro Tier Response
\`\`\`json
{
  "success": true,
  "analysis": {
    "tier": "pro",
    "period": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "summary": {
      "totalIncome": 50000,
      "totalExpenses": 35000,
      "netBalance": 15000,
      "transactionCount": 45,
      "savingsRate": 30
    },
    "detailedAnalysis": {
      "spendingByCategory": [
        {
          "category": "Comida",
          "amount": 8750,
          "percentage": 25,
          "trend": "stable"
        },
        {
          "category": "Transporte",
          "amount": 5250,
          "percentage": 15,
          "trend": "increasing"
        }
      ],
      "topExpenses": [
        {
          "description": "Renta departamento",
          "amount": 12000,
          "date": "2026-01-01",
          "category": "Vivienda"
        }
      ]
    },
    "insights": [
      "Tu tasa de ahorro del 30% está por encima del promedio nacional",
      "Gastos en transporte aumentaron 15% vs. mes anterior",
      "Identificamos 3 suscripciones que podrías optimizar"
    ],
    "recommendations": [
      "Considera usar transporte público 2 días a la semana para ahorrar $1,500/mes",
      "Cancela suscripciones no utilizadas para ahorrar $500/mes",
      "Aumenta tu fondo de emergencia a 6 meses de gastos"
    ],
    "alerts": [
      "⚠️ Gastas 2x más en comida fuera que hace 3 meses",
      "✅ Has ahorrado $15,000 este mes, ¡sigue así!",
      "📊 Tus gastos están 5% por debajo de tu promedio"
    ],
    "financialScore": 78,
    "scoreBreakdown": {
      "savingsScore": 85,
      "spendingScore": 72,
      "consistencyScore": 77
    },
    "predictions": {
      "nextMonthExpenses": 36500,
      "sixMonthSavings": 90000,
      "confidence": "high"
    },
    "comparisons": {
      "vsLastMonth": {
        "incomeChange": 5,
        "expenseChange": -3,
        "savingsChange": 25
      }
    }
  },
  "metadata": {
    "transactionCount": 45,
    "period": { "start": "2026-01-01", "end": "2026-01-31" },
    "tier": "pro",
    "model": "claude-haiku-4",
    "tokensUsed": {
      "input": 2100,
      "output": 950
    }
  }
}
\`\`\`

## Error Responses

### No Transactions Found
\`\`\`json
{
  "error": "No transactions found for the specified period",
  "period": { "start": "2026-01-01", "end": "2026-01-31" }
}
\`\`\`

### Unauthorized
\`\`\`json
{
  "error": "Unauthorized"
}
\`\`\`

### Invalid Tier
\`\`\`json
{
  "error": "Invalid tier. Must be 'free' or 'pro'"
}
\`\`\`

## Cost Estimation

### Claude Haiku Pricing (Approximate)
- Input: $0.25 per million tokens
- Output: $1.25 per million tokens

### Typical Request Costs
- **Free Tier**: ~2000 input + 500 output tokens = ~$0.0011 USD (~$0.02 MXN)
- **Pro Tier**: ~2500 input + 1000 output tokens = ~$0.0019 USD (~$0.03 MXN)

### Monthly Cost per User
- Free Plan: 1 analysis/month = ~$0.02 MXN
- Pro Plan: 1 detailed analysis/month = ~$0.03 MXN

**Margin**: With Pro plan at $199 MXN/month, cost is $0.03 MXN = **99.98% margin** on AI feature

## Usage Example (Frontend)

\`\`\`typescript
async function getFinancialAnalysis(period: 'monthly' | { start: string; end: string } = 'monthly') {
  const response = await fetch('/api/ai/analyze-transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      period,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  const data = await response.json()
  return data.analysis
}

// Usage
const analysis = await getFinancialAnalysis('monthly')
console.log('Financial Score:', analysis.financialScore)
console.log('Tier:', analysis.tier) // Will be 'free' or 'pro' based on user's subscription
console.log('Insights:', analysis.insights)
if (analysis.tier === 'pro') {
  console.log('Predictions:', analysis.predictions)
}
\`\`\`

## Setup Instructions

1. **Get Anthropic API Key**:
   - Visit https://console.anthropic.com/
   - Create an account or sign in
   - Generate an API key

2. **Add to Environment Variables**:
   \`\`\`bash
   # .env.local
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   \`\`\`

3. **Restart Development Server**:
   \`\`\`bash
   pnpm dev
   \`\`\`

## Security Notes

- ✅ API key is server-side only (never exposed to client)
- ✅ User authentication required via Supabase
- ✅ Only user's own transactions are analyzed
- ✅ Strict prompt engineering prevents AI deviation
- ✅ Response validation ensures consistent format
- ✅ Rate limiting handled by Anthropic

## Next Steps (Frontend Integration)

When ready to build the frontend:
1. Create a dashboard component to display analysis
2. Add tier selection (Free vs Pro)
3. Implement date range picker for custom periods
4. Display insights, recommendations, and alerts
5. Show financial score with visual indicators
6. Add charts for spending breakdown (Pro tier)
7. Implement predictions timeline (Pro tier)

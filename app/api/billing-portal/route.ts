import { createBillingPortalSession } from '@/app/actions/stripe'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    await createBillingPortalSession()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.digest?.toString().startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Error creating billing portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}

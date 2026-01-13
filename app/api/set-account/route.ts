import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { accountId } = await request.json()

    const cookieStore = await cookies()

    // Set cookie with selected account ID
    cookieStore.set("selectedAccountId", accountId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error setting account:", error)
    return NextResponse.json({ error: "Failed to set account" }, { status: 500 })
  }
}

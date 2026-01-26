import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin, pathname } = new URL(request.url)
  const code = searchParams.get("code")

  // Extract locale from pathname (e.g., /es/auth/callback -> es)
  const localeMatch = pathname.match(/^\/(es|en)\//)
  const locale = localeMatch ? localeMatch[1] : "es"

  const next = searchParams.get("next") ?? `/${locale}/dashboard`

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth code exchange error:', error)
      return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
    }

    if (!error && data.user) {
      const userId = data.user.id
      const userName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split("@")[0] ||
        "Usuario"

      // Check if profile exists
      const { data: profile } = await supabase.from("profiles").select("id, full_name").eq("id", userId).single()

      if (!profile) {
        // Create profile if it doesn't exist
        await supabase.from("profiles").insert({ id: userId, full_name: userName })
      } else if (!profile.full_name || profile.full_name === "") {
        // Update profile if name is missing
        await supabase.from("profiles").update({ full_name: userName }).eq("id", userId)
      }

      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error`)
}

import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/navigation';
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const handleI18nRouting = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    const response = handleI18nRouting(request);

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    const localeMatch = pathname.match(/^\/(es|en)(\/|$)/)
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : ""

    const pathWithoutLocale = pathname.replace(/^\/(?:es|en)(?:\/|$)/, "/")

    if (pathWithoutLocale.startsWith("/dashboard") && !user) {
        const url = request.nextUrl.clone()
        const effectiveLocale = localeMatch ? localeMatch[1] : routing.defaultLocale;
        url.pathname = `/${effectiveLocale}/auth/login`
        return NextResponse.redirect(url)
    }
    if (
        (pathWithoutLocale.startsWith("/auth/login") || pathWithoutLocale.startsWith("/auth/signup")) &&
        user
    ) {
        const url = request.nextUrl.clone()
        const effectiveLocale = localeMatch ? localeMatch[1] : routing.defaultLocale;
        url.pathname = `/${effectiveLocale}/dashboard`
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: ['/', '/(es|en)/:path*']
};

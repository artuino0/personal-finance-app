import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/navigation';
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const handleI18nRouting = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    // 1. Run next-intl middleware first to handle routing and get the response
    const response = handleI18nRouting(request);

    // 2. Initialize Supabase client
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

    // 3. Refresh session and check auth
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Helper to determine active locale
    // We assume the locale is the first part of the path if it matches our supported locales
    const localeMatch = pathname.match(/^\/(es|en)(\/|$)/)
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : ""

    // Normalize path for checks (remove locale prefix)
    const pathWithoutLocale = pathname.replace(/^\/(?:es|en)(?:\/|$)/, "/")

    // Auth protection logic

    // Redirect unauthenticated users from protected routes
    if (pathWithoutLocale.startsWith("/dashboard") && !user) {
        const url = request.nextUrl.clone()
        // Redirect to login page preserving locale (or default to nothing if root)
        // If we rely on next-intl to handle the default locale from root, 
        // we should point to /{locale}/auth/login
        // If locale is missing (e.g. root redirect happens later), we might default to /auth/login
        // but the app structure likely demands a locale.

        // Fallback to 'es' if no locale found (though middleware matcher usually ensures one for subpaths)
        // Actually, if we are at /dashboard (no locale), next-intl middleware would have redirected unless it's the default locale.
        // Let's assume safely we append the detected locale or default.
        const effectiveLocale = localeMatch ? localeMatch[1] : routing.defaultLocale;
        url.pathname = `/${effectiveLocale}/auth/login`
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users from auth pages
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
    // Match only internationalized pathnames
    matcher: ['/', '/(es|en)/:path*']
};

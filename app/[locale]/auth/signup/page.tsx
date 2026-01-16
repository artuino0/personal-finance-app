"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useRouter } from "@/lib/i18n/navigation"
import { useLocale } from "next-intl"
import { useState } from "react"
import { Loader2, ArrowLeft } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const locale = useLocale()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error

      router.push("/auth/check-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  /* New Google Login Logic */
  const handleGoogleLogin = async () => {
    const supabase = createClient()

    // Ensure accurate URL handling by removing any trailing slash from the base URL
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, "")
    const redirectTo = `${appUrl}/${locale}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel - Form */}
      <div className="flex w-full flex-col justify-between bg-background p-8 lg:w-1/2 lg:p-12 xl:p-16">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">F</span>
            </div>
            <span>Kountly</span>
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Crear una cuenta</h1>
            <p className="text-muted-foreground">Comienza a tomar el control de tu futuro financiero</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Juan Pérez"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 border-input/60"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-input/60"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-input/60"
              />
            </div>
            {error && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}

            <Button type="submit" className="h-11 w-full text-base" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Registrarse"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O regístrate con</span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleLogin}
              className="h-11 w-full gap-2 border-input/60 bg-muted/20 hover:bg-muted/40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Google
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="group flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver al inicio
          </Link>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden w-1/2 flex-col justify-between bg-muted/30 p-12 lg:flex xl:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/50 backdrop-blur-[1px]"></div>
        <div className="grid gap-4 mt-auto relative z-10 max-w-lg">
          <h2 className="text-3xl font-bold tracking-tight">Únete a la mejor comunidad financiera</h2>
          <p className="text-lg text-muted-foreground">
            Descubre cómo miles de personas están alcanzando sus metas financieras más rápido con Kountly.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-[100px] dark:bg-blue-900/20"></div>
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-200/40 blur-[100px] dark:bg-purple-900/20"></div>
      </div>
    </div>
  )
}

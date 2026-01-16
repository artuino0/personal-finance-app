import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import NextTopLoader from "nextjs-toploader"
import "../../globals.css"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kountly - Gestión de Finanzas Personales",
  description: "Gestiona tus finanzas personales de forma sencilla. Controla ingresos, gastos, cuentas y créditos.",
  generator: "Kountly.app",
  icons: {
    icon: [
      {
        url: "/kountly.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/kountly.svg",
  },
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!["en", "es"].includes(locale)) {
    notFound()
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <NextTopLoader showSpinner={false} color="#000000" />
          {children}
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

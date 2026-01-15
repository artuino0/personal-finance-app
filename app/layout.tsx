import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import NextTopLoader from "nextjs-toploader"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FindexApp - Gestión de Finanzas Personales",
  description: "Gestiona tus finanzas personales de forma sencilla. Controla ingresos, gastos, cuentas y créditos.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/FindexFavicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/FindexFavicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <NextTopLoader showSpinner={false} color="#000000" />
        {children}
        <Analytics />
      </body>
    </html >
  )
}

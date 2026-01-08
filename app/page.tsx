import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container max-w-4xl px-6 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-4">FinanzasApp</h1>
        <p className="text-xl text-slate-600 mb-8 text-balance">
          La mejor forma de gestionar tus finanzas personales. Controla tus ingresos, gastos, cuentas y créditos en un
          solo lugar.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/signup">Comenzar Gratis</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

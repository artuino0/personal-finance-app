"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const sellingPoints = [
    "Seguro y Privado",
    "Reportes Detallados",
    "Multi-moneda"
]

export function Hero() {
    return (
        <section className="relative overflow-hidden pb-16 pt-16 md:pt-24 lg:pt-32">
            <div className="container mx-auto px-4 md:px-8">
                <div className="mx-auto flex max-w-4xl flex-col items-center text-center space-y-8">
                    <div className="inline-flex items-center rounded-full border bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                        <span className="mr-2 flex h-2 w-2 rounded-full bg-green-500"></span>
                        Tu libertad financiera comienza hoy
                    </div>

                    <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                        Controla tu dinero,
                        <br className="hidden md:block" />
                        <span className="text-muted-foreground"> asegura tu futuro.</span>
                    </h1>

                    <p className="max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
                        La plataforma integral para gestionar ingresos, gastos y presupuestos. Toma el control total de tus finanzas personales y toma mejores decisiones.
                    </p>

                    <div className="w-full pt-4">
                        <div className="flex w-full flex-col justify-center items-center gap-4 sm:w-auto sm:flex-row">
                            <Button asChild size="lg" className="h-12 w-full rounded-full px-8 text-base shadow-sm sm:w-auto">
                                <Link href="/auth/signup">
                                    Crear mi cuenta gratis
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-8 text-sm text-muted-foreground">
                        {sellingPoints.map((point) => (
                            <div key={point} className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span>{point}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full overflow-hidden opacity-20">
                <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-200 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-200 blur-[100px]"></div>
            </div>
        </section>
    )
}

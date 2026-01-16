"use client"

import { Wallet, PieChart, TrendingUp, Smartphone, Shield, CreditCard } from "lucide-react"

const features = [
    {
        name: "Control de Gastos",
        description: "Registra cada compra y categorízala automáticamente para saber exactamente a dónde va tu dinero.",
        icon: Wallet,
    },
    {
        name: "Presupuestos Inteligentes",
        description: "Define límites de gasto por categoría y recibe alertas cuando te estés acercando al tope.",
        icon: PieChart,
    },
    {
        name: "Gestión de Créditos",
        description: "Lleva un registro de tus deudas y fechas de pago para evitar intereses moratorios.",
        icon: CreditCard,
    },
    {
        name: "Reportes Detallados",
        description: "Visualiza tu evolución financiera con gráficos claros de ingresos vs. gastos mensuales.",
        icon: TrendingUp,
    },
    {
        name: "Acceso Móvil",
        description: "Tu información financiera sincronizada en todos tus dispositivos, disponible 24/7.",
        icon: Smartphone,
    },
    {
        name: "Seguridad Bancaria",
        description: "Tus datos están encriptados y seguros. Tu privacidad es nuestra prioridad número uno.",
        icon: Shield,
    },
]

export function Features() {
    return (
        <section id="features" className="bg-secondary/30 py-24">
            <div className="container mx-auto px-4 md:px-8">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        Todo lo que necesitas para dominar tus finanzas
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Kountly simplifica la administración de tu dinero. Deja de adivinar y empieza a construir tu patrimonio con datos reales.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={index}
                                className="rounded-2xl border bg-background p-8 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5 text-primary">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold">{feature.name}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

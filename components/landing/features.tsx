import { useTranslations } from "next-intl"
import { Wallet, PieChart, TrendingUp, Smartphone, Shield, CreditCard } from "lucide-react"

export function Features() {
    const t = useTranslations("Landing.Features")

    const features = [
        {
            name: t("items.control.name"),
            description: t("items.control.description"),
            icon: Wallet,
        },
        {
            name: t("items.budgets.name"),
            description: t("items.budgets.description"),
            icon: PieChart,
        },
        {
            name: t("items.credits.name"),
            description: t("items.credits.description"),
            icon: CreditCard,
        },
        {
            name: t("items.reports.name"),
            description: t("items.reports.description"),
            icon: TrendingUp,
        },
        {
            name: t("items.mobile.name"),
            description: t("items.mobile.description"),
            icon: Smartphone,
        },
        {
            name: t("items.security.name"),
            description: t("items.security.description"),
            icon: Shield,
        },
    ]

    return (
        <section id="features" className="bg-secondary/30 py-24">
            <div className="container mx-auto px-4 md:px-8">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        {t("title")}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t("subtitle")}
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

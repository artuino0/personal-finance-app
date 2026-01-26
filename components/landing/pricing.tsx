import Link from "next/link"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function Pricing() {
    const t = useTranslations("Landing.Pricing")

    const plans = [
        {
            key: "basic",
            name: t("plans.basic.name"),
            description: t("plans.basic.description"),
            price: "$0",
            priceNote: t("plans.basic.priceNote"),
            features: [
                t("plans.basic.features.0"),
                t("plans.basic.features.1"),
                t("plans.basic.features.2"),
                t("plans.basic.features.3"),
            ],
            ctaLabel: t("plans.basic.cta"),
            ctaLink: "/auth/signup",
            wrapperClass: "flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
            footerClass: "p-6 bg-muted/20",
        },
        {
            key: "pro",
            name: t("plans.pro.name"),
            description: t("plans.pro.description"),
            price: "$99",
            priceNote: t("plans.pro.priceNote"),
            features: [
                t("plans.pro.features.0"),
                t("plans.pro.features.1"),
                t("plans.pro.features.2"),
                t("plans.pro.features.3"),
                t("plans.pro.features.4"),
            ],
            ctaLabel: t("plans.pro.cta"),
            ctaLink: "/dashboard/upgrade",
            wrapperClass:
                "relative flex flex-col overflow-hidden rounded-xl border-2 border-primary bg-card text-card-foreground shadow-lg",
            footerClass: "p-6 bg-primary/5",
            badge: t("recommended"),
            badgeClass: "absolute top-0 right-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground",
        },
        {
            key: "premium",
            name: t("plans.premium.name"),
            description: t("plans.premium.description"),
            price: "$199",
            priceNote: t("plans.premium.priceNote"),
            features: [
                t("plans.premium.features.0"),
                t("plans.premium.features.1"),
                t("plans.premium.features.2"),
                t("plans.premium.features.3"),
                t("plans.premium.features.4"),
            ],
            ctaLabel: t("plans.premium.cta"),
            ctaLink: "/dashboard/upgrade",
            wrapperClass: "flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
            footerClass: "p-6 bg-muted/20",
        },
    ]

    return (
        <section id="pricing" className="bg-muted/30 py-20">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="mb-12 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {t("badge")}
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        {t("title")}
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {plans.map((plan) => (
                        <div key={plan.key} className={plan.wrapperClass}>
                            {plan.badge && (
                                <div className={plan.badgeClass}>
                                    {plan.badge}
                                </div>
                            )}

                            <div className="flex-1 p-6">
                                <h3 className={cn("text-2xl font-bold", plan.key === "pro" && "text-primary")}>
                                    {plan.name}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {plan.description}
                                </p>
                                <div className="mt-4 flex items-baseline text-3xl font-bold">
                                    {plan.price}
                                    <span className="ml-1 text-xl font-normal text-muted-foreground">{plan.priceNote}</span>
                                </div>

                                <ul className="mt-6 space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={cn("p-6", plan.footerClass)}>
                                <Link
                                    href={plan.ctaLink}
                                    className={cn(
                                        "inline-flex w-full items-center justify-center rounded-full px-8 py-3 text-base font-medium shadow-sm transition-colors",
                                        plan.key === "pro"
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "border border-input bg-background text-foreground hover:bg-accent/50"
                                    )}
                                >
                                    {plan.ctaLabel}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

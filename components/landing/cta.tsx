import Link from "next/link"
import { useTranslations } from "next-intl"

export function CTA() {
    const t = useTranslations("Landing.CTA")

    return (
        <section id="cta" className="bg-gradient-to-b from-background to-secondary/30 py-24">
            <div className="container mx-auto px-4 text-center md:px-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
                        {t("title")}
                    </h2>
                    <p className="text-balance text-lg md:text-xl text-muted-foreground">
                        {t("subtitle")}
                    </p>
                    <div className="pt-4">
                        <Link
                            href="/auth/signup"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                        >
                            {t("button")}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

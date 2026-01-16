import { useTranslations } from "next-intl"
import { Building2, Rocket, Trophy, Users } from "lucide-react"

export function About() {
    const t = useTranslations("Landing.About")

    return (
        <section id="about" className="bg-muted/30 py-24">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    <div className="space-y-6">
                        <div className="inline-flex items-center rounded-full border border-transparent bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {t("badge")}
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            {t("title")} <span className="text-primary">{t("titleHighligt")}</span>
                        </h2>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                            {t("description1")}
                        </p>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                            <strong>Kountly</strong> {t("description2")}
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="flex flex-col gap-1 rounded-lg border bg-background p-4 shadow-sm">
                                <span className="text-3xl font-bold text-primary">5+</span>
                                <span className="text-sm font-medium text-muted-foreground">{t("stats.exp")}</span>
                            </div>
                            <div className="flex flex-col gap-1 rounded-lg border bg-background p-4 shadow-sm">
                                <span className="text-3xl font-bold text-primary">10k+</span>
                                <span className="text-sm font-medium text-muted-foreground">{t("stats.users")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-4 rounded-xl border bg-background p-6 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Rocket className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">{t("values.innovation.title")}</h3>
                            <p className="text-muted-foreground">
                                {t("values.innovation.description")}
                            </p>
                        </div>
                        <div className="space-y-4 rounded-xl border bg-background p-6 shadow-sm sm:translate-y-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">{t("values.human.title")}</h3>
                            <p className="text-muted-foreground">
                                {t("values.human.description")}
                            </p>
                        </div>
                        <div className="space-y-4 rounded-xl border bg-background p-6 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">{t("values.quality.title")}</h3>
                            <p className="text-muted-foreground">
                                {t("values.quality.description")}
                            </p>
                        </div>
                        <div className="space-y-4 rounded-xl border bg-background p-6 shadow-sm sm:translate-y-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">{t("values.support.title")}</h3>
                            <p className="text-muted-foreground">
                                {t("values.support.description")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

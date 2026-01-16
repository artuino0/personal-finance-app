import Link from "next/link"
import { useTranslations } from "next-intl"

export function Footer() {
    const t = useTranslations("Landing.Footer")

    const columns = [
        {
            title: t("columns.product.title"),
            links: [
                { label: t("columns.product.links.features"), href: "#features" },
                { label: t("columns.product.links.pricing"), href: "#pricing" },
                { label: t("columns.product.links.security"), href: "#" },
                { label: t("columns.product.links.roadmap"), href: "#" },
            ],
        },
        {
            title: t("columns.company.title"),
            links: [
                { label: t("columns.company.links.about"), href: "#about" },
                { label: t("columns.company.links.blog"), href: "#" },
                { label: t("columns.company.links.careers"), href: "#" },
                { label: t("columns.company.links.contact"), href: "#" },
            ],
        },
        {
            title: t("columns.legal.title"),
            links: [
                { label: t("columns.legal.links.privacy"), href: "#" },
                { label: t("columns.legal.links.terms"), href: "#" },
                { label: t("columns.legal.links.cookies"), href: "#" },
            ],
        },
    ]

    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto px-4 py-12 md:px-8 md:py-16">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                            <span>Kountly</span>
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                            {t("description")}
                        </p>
                    </div>

                    {columns.map((column) => (
                        <div key={column.title}>
                            <h3 className="mb-4 font-semibold">{column.title}</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <a href={link.href} className="transition-colors hover:text-foreground">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row">
                    <p>{t("copyright")}</p>
                    <div className="flex gap-6">
                        <a href="#" className="transition-colors hover:text-foreground">
                            Twitter
                        </a>
                        <a href="#" className="transition-colors hover:text-foreground">
                            Instagram
                        </a>
                        <a href="#" className="transition-colors hover:text-foreground">
                            LinkedIn
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

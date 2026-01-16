"use client"

import Link from "next/link"

const columns = [
    {
        title: "Producto",
        links: [
            { label: "Funcionalidades", href: "#features" },
            { label: "Precios", href: "#pricing" },
            { label: "Seguridad", href: "#" },
            { label: "Mapa de ruta", href: "#" },
        ],
    },
    {
        title: "Compañía",
        links: [
            { label: "Nosotros", href: "#about" },
            { label: "Blog", href: "#" },
            { label: "Carreras", href: "#" },
            { label: "Contacto", href: "#" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacidad", href: "#" },
            { label: "Términos", href: "#" },
            { label: "Cookies", href: "#" },
        ],
    },
]

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto px-4 py-12 md:px-8 md:py-16">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                            <span>Kountly</span>
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                            La plataforma líder para la gestión de finanzas personales. Simplifica tu dinero hoy.
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
                    <p>© 2026 Kountly. Todos los derechos reservados.</p>
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

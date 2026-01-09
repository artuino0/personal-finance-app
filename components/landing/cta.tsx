"use client"

import Link from "next/link"

export function CTA() {
    return (
        <section id="cta" className="bg-gradient-to-b from-background to-secondary/30 py-24">
            <div className="container mx-auto px-4 text-center md:px-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
                        Empieza a construir tu patrimonio
                    </h2>
                    <p className="text-balance text-lg md:text-xl text-muted-foreground">
                        Únete a miles de usuarios que ya tomaron el control de su dinero hoy mismo.
                    </p>
                    <div className="pt-4">
                        <Link
                            href="/auth/signup"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                        >
                            Crear mi cuenta gratis
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

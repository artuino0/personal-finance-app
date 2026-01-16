"use client"

import { Building2, Rocket, Trophy, Users } from "lucide-react"

export function About() {
    return (
        <section id="about" className="bg-muted/30 py-24">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    <div className="space-y-6">
                        <div className="inline-flex items-center rounded-full border border-transparent bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            Desde 2019
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            Impulsando la transformación digital con <span className="text-primary">Dynamic Data</span>
                        </h2>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                            En DyDa (Dynamic Data) Software, nos dedicamos a crear soluciones tecnológicas que simplifican lo complejo. Fundada en 2019, nuestra misión ha sido empoderar a las pequeñas y medianas empresas con herramientas de software intuitivas y potentes.
                        </p>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                            <strong>Kountly</strong> nace de nuestra experiencia trabajando con cientos de negocios y personas que necesitaban una forma más eficiente de gestionar su economía. No solo escribimos código; construimos puentes digitales que hacen crecer tu patrimonio.
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="flex flex-col gap-1 rounded-lg border bg-background p-4 shadow-sm">
                                <span className="text-3xl font-bold text-primary">5+</span>
                                <span className="text-sm font-medium text-muted-foreground">Años de Experiencia</span>
                            </div>
                            <div className="flex flex-col gap-1 rounded-lg border bg-background p-4 shadow-sm">
                                <span className="text-3xl font-bold text-primary">10k+</span>
                                <span className="text-sm font-medium text-muted-foreground">Usuarios Activos</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-4 rounded-xl border bg-background p-6 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Rocket className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Innovación Constante</h3>
                            <p className="text-muted-foreground">
                                Nos mantenemos a la vanguardia tecnológica para ofrecerte siempre las mejores herramientas del mercado.
                            </p>
                        </div>
                        <div className="space-y-4 rounded-xl border bg-background p-6 shadow-sm sm:translate-y-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Enfoque Humano</h3>
                            <p className="text-muted-foreground">
                                La tecnología debe servir a las personas. Diseñamos pensando primero en la experiencia del usuario.
                            </p>
                        </div>
                        <div className="space-y-4 rounded-xl border bg-background p-6 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Calidad DyDa</h3>
                            <p className="text-muted-foreground">
                                Estándares de desarrollo de clase mundial que garantizan que tu plataforma esté siempre disponible.
                            </p>
                        </div>
                        <div className="space-y-4 rounded-xl border bg-background p-6 shadow-sm sm:translate-y-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Soporte Local</h3>
                            <p className="text-muted-foreground">
                                Entendemos el mercado local porque somos parte de él. Soporte real, en tu idioma y horario.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

import { createFileRoute, Link } from "@tanstack/react-router";


import { useDict } from "@/lib/i18n";
import { ArrowUpRight, CheckCircle2, Home as HomeIcon, Building2, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/renovation")({
  component: RenovationPage,
});

function RenovationPage() {
  const d = useDict();
  const r = d.renovation;

  const analysisAreas = [
    "Volumes et circulation",
    "Fonction de chaque zone",
    "Lumière et ambiance",
    "Rangements et mobilier",
    "Contraintes techniques",
    "État de l’existant",
    "Identité du lieu",
    "Besoins futurs",
  ];

  const integrateItems = [
    "Conception et plans",
    "Redistribution des espaces",
    "Rénovation",
    "Électricité et éclairage",
    "Plomberie",
    "Revêtements",
    "Peinture",
    "Menuiserie",
    "Agencement",
    "Mobilier sur-mesure",
    "Installation et finitions",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-20">
        {/* HERO */}
        <section className="space-y-6 max-w-4xl border-b border-border/60 pb-12">
          <span className="label-mono text-accent">{r.label}</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            {r.title}
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground font-light leading-relaxed">
            {r.subtitle}
          </p>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <span>{r.btnTalk}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* NOTRE APPROCHE */}
        <section className="space-y-8 border-t border-border/60 pt-16">
          <div className="space-y-3 max-w-3xl">
            <span className="label-mono text-accent">{r.approachLabel}</span>
            <h2 className="font-serif text-3xl font-bold">{r.approachTitle}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {r.approachSubtitle}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {analysisAreas.map((item, idx) => (
              <div key={idx} className="p-6 rounded-3xl border border-border/80 bg-card space-y-2">
                <span className="font-mono text-xs text-accent font-bold">0{idx + 1}</span>
                <h3 className="font-serif text-lg font-bold">{item}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* CE QUE NOUS POUVONS INTÉGRER */}
        <section className="space-y-8 border-t border-border/60 pt-16">
          <div className="space-y-3">
            <span className="label-mono text-accent">{r.integrateLabel}</span>
            <h2 className="font-serif text-3xl font-bold">{r.integrateTitle}</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {integrateItems.map((s, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/80">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-xs sm:text-sm font-semibold">{s}</span>
              </div>
            ))}
          </div>

          <div className="my-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-4">
  <h4 className="font-serif text-lg font-bold text-foreground">ORGANISATION DES PRESTATIONS POKIBOIS</h4>
  <div className="grid md:grid-cols-2 gap-4 text-xs">
    <div className="p-4 rounded-2xl bg-muted/50 space-y-1.5">
      <span className="font-bold text-foreground uppercase block font-mono">En propre par Pokibois</span>
      <p className="text-muted-foreground leading-relaxed">Conception architecturale, modélisation 3D, agencement sur-mesure, menuiserie d'art et stratégie digitale intégrée.</p>
    </div>
    <div className="p-4 rounded-2xl bg-muted/50 space-y-1.5">
      <span className="font-bold text-foreground uppercase block font-mono">Réseau d'artisans partenaires</span>
      <p className="text-muted-foreground leading-relaxed">Gros œuvre, électricité certifiée, plomberie et fluides sous la direction de chantier globale et unique Pokibois.</p>
    </div>
  </div>
</div>
        </section>

        {/* SECTEURS */}
        <section className="space-y-8 border-t border-border/60 pt-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-border/80 bg-card p-8 space-y-4">
              <HomeIcon className="h-8 w-8 text-primary" />
              <h3 className="font-serif text-2xl font-bold">{r.forPartTitle}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.forPartDesc}</p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card p-8 space-y-4">
              <Building2 className="h-8 w-8 text-accent" />
              <h3 className="font-serif text-2xl font-bold">{r.forProTitle}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.forProDesc}</p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card p-8 space-y-4">
              <Stethoscope className="h-8 w-8 text-primary" />
              <h3 className="font-serif text-2xl font-bold">{r.forHealthTitle}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.forHealthDesc}</p>
              <Link to="/healthcare" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline pt-2">
                <span>{r.btnHealth}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pt-8">
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 sm:p-12 space-y-6">
            <h2 className="font-serif text-3xl font-bold">{r.ctaTitle}</h2>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <span>{d.header.ctaTalk}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      
    </div>
  );
}

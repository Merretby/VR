import { createFileRoute, Link } from "@tanstack/react-router";


import { useDict } from "@/lib/i18n";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/fitout")({
  component: FitoutPage,
});

function FitoutPage() {
  const d = useDict();
  const f = d.fitout;

  const partItems = [
    "Cuisine", "Dressing", "Bibliothèque", "Rangement",
    "Meuble intégré", "Bureau", "Entrée", "Aménagement de petits espaces",
    "Mobilier sur-mesure"
  ];

  const proItems = [
    "Accueil", "Comptoir", "Bureau", "Rangement",
    "Mobilier de présentation", "Espace de vente", "Mobilier professionnel", "Agencement intégré"
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-20">
        {/* HERO */}
        <section className="space-y-6 max-w-4xl border-b border-border/60 pb-12">
          <span className="label-mono text-accent">{f.label}</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            {f.title}
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground font-light leading-relaxed">
            {f.subtitle}
          </p>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <span>{f.btnTalk}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* SECTEURS */}
        <section className="grid gap-12 lg:grid-cols-2 border-t border-border/60 pt-16">
          <div className="rounded-3xl border border-border/80 bg-card p-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-primary">{f.partTitle}</h2>
            <p className="text-xs text-muted-foreground">{f.partDesc}</p>
            <div className="grid gap-2.5 sm:grid-cols-2 pt-2">
              {partItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-accent">{f.proTitle}</h2>
            <p className="text-xs text-muted-foreground">{f.proDesc}</p>
            <div className="grid gap-2.5 sm:grid-cols-2 pt-2">
              {proItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DU BESOIN AU SUR-MESURE */}
        <section className="space-y-6 border-t border-border/60 pt-16">
          <div className="space-y-3 max-w-3xl">
            <span className="label-mono text-accent">{f.methodLabel}</span>
            <h2 className="font-serif text-3xl font-bold">{f.methodTitle}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {f.methodDesc}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              {f.methodGoal}
            </p>
          </div>

          <div className="my-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-4">
  <h4 className="font-serif text-lg font-bold text-foreground">MODALITÉS DE FABRICATION & INSTALLATION</h4>
  <div className="grid md:grid-cols-3 gap-4 text-xs">
    <div className="p-4 rounded-2xl bg-muted/50 space-y-1.5">
      <span className="font-bold text-foreground uppercase block font-mono">1. Atelier Français</span>
      <p className="text-muted-foreground">Fabrication sur-mesure avec essences de bois nobles certifiées éco-responsables.</p>
    </div>
    <div className="p-4 rounded-2xl bg-muted/50 space-y-1.5">
      <span className="font-bold text-foreground uppercase block font-mono">2. Contrôle Qualité</span>
      <p className="text-muted-foreground">Assemblage préalable à blanc en atelier pour garantir un ajustement au millimètre.</p>
    </div>
    <div className="p-4 rounded-2xl bg-muted/50 space-y-1.5">
      <span className="font-bold text-foreground uppercase block font-mono">3. Pose Sur Site</span>
      <p className="text-muted-foreground">Installation soignée par nos maîtres menuisiers qualifiés avec finition impeccable.</p>
    </div>
  </div>
</div>
        </section>

        {/* CTA */}
        <section className="text-center pt-8">
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 sm:p-12 space-y-6">
            <h2 className="font-serif text-3xl font-bold">{f.ctaTitle}</h2>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <span>{f.btnCta}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Layers, Hammer, Compass, CheckCircle2 } from "lucide-react";
import { useDict, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/space")({
  component: SpacePage,
});

function SpacePage() {
  const d = useDict();
  const { lang } = useI18n();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/60 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5 text-xs font-mono font-medium text-muted-foreground backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{lang === "fr" ? "ESPACE & ARCHITECTURE" : "SPACE & ARCHITECTURE"}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-3xl leading-tight">
            {lang === "fr" ? "Pôle Espace : Rénovation & Aménagement sur-mesure" : "Space Division: Renovation & Custom Fit-out"}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {lang === "fr"
              ? "Pokibois réinvente vos espaces physiques avec une vision globale et architecturale, combinant gros œuvre, réhabilitation lourde et mobilier haut de gamme."
              : "Pokibois reinvents your physical spaces with a comprehensive architectural vision, combining structural renovation and high-end custom joinery."}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/renovation"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-semibold text-background shadow-md hover:scale-105 transition-all duration-300"
            >
              <span>{lang === "fr" ? "Rénovation & Transformation" : "Renovation & Transformation"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/fitout"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-xs font-semibold text-foreground shadow-xs hover:bg-muted transition-all duration-300"
            >
              <span>{lang === "fr" ? "Aménagement & Sur-mesure" : "Fit-out & Custom-made"}</span>
              <Compass className="h-4 w-4 text-amber-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Dual Pillars Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="label-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest">
              {lang === "fr" ? "NOS DEUX DOMAINES D'INTERVENTION ESPACE" : "OUR TWO SPACE EXPERTISES"}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              {lang === "fr" ? "De la structure aux finitions d'art" : "From Core Structure to Artful Finishes"}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Pillar 1: Renovation */}
            <div className="rounded-3xl border border-border bg-card p-8 space-y-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  {lang === "fr" ? "01 — Rénovation & Transformation" : "01 — Renovation & Transformation"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {lang === "fr"
                    ? "Redéfinition architecturale complète des volumes, réhabilitation technique, mise aux normes ERP/PMR et redistribution fluide des espaces."
                    : "Complete architectural volume redefinition, technical rehabilitation, ERP/PMR compliance, and fluid space redistribution."}
                </p>
                <ul className="space-y-2 text-xs font-medium text-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{lang === "fr" ? "Étude de structure & plans de conception" : "Structural audit & architectural layout plans"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{lang === "fr" ? "Gros œuvre, électricité & réseaux techniques" : "Core renovation, certified electrics & plumbing"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{lang === "fr" ? "Conformité PMR, ARS & sécurité incendie" : "PMR, ARS & fire safety compliance"}</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-border/60">
                <Link
                  to="/renovation"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <span>{lang === "fr" ? "Découvrir la rénovation" : "Discover Renovation"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Pillar 2: Fit-out */}
            <div className="rounded-3xl border border-border bg-card p-8 space-y-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Hammer className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  {lang === "fr" ? "02 — Aménagement & Sur-mesure" : "02 — Fit-out & Custom-made"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {lang === "fr"
                    ? "Conception et fabrication en atelier de mobilier sur-mesure, banquettes, rangements toute hauteur, comptoirs d'accueil et agencements d'art."
                    : "Atelier design and manufacturing of custom cabinetry, booth seating, full-height storage, reception desks, and fine woodwork."}
                </p>
                <ul className="space-y-2 text-xs font-medium text-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{lang === "fr" ? "Menuiserie d'art & essences de bois certifiées" : "Artistic joinery & eco-certified woods"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{lang === "fr" ? "Agencement sur-mesure d'espaces professionnels" : "Custom fit-out for residential & commercial"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{lang === "fr" ? "Pose soignée par maîtres menuisiers" : "Precision installation by master craftsmen"}</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-border/60">
                <Link
                  to="/fitout"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <span>{lang === "fr" ? "Découvrir le sur-mesure" : "Discover Custom Fit-out"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

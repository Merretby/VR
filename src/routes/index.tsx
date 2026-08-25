import { createFileRoute, Link } from "@tanstack/react-router";

import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";

import { PROJECTS_DATA } from "@/lib/projectsData";
import { useDict, useI18n } from "@/lib/i18n";
import {
  ArrowRight,
  Sparkles,
  Layers,
  Laptop,
  CheckCircle2,
  Home as HomeIcon,
  ShoppingBag,
  Building2,
  Stethoscope,
  ArrowUpRight
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { lang } = useI18n();
  const d = useDict();
  const h = d.home;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-clip">
      

      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 border-b border-border/60 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-25 dark:opacity-30">
          <img
            src="/templates/living-room.jpg"
            alt="Pokibois Architecture & Aménagement"
            className="w-full h-full object-cover filter contrast-[1.05] brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary/80 px-4 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="label-mono text-[11px] tracking-widest">{h.heroBadge}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] text-foreground">
            {h.heroTitleA}<br />
            <span className="italic font-normal text-muted-foreground">{h.heroTitleB}</span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            {h.heroSubtitle}
          </p>

          <p className="text-xs sm:text-sm font-semibold text-foreground max-w-2xl mx-auto">
            {h.heroOneContact}
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
            >
              <span>{h.btnTalk}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 backdrop-blur-md px-7 py-4 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-secondary transition-all"
            >
              <span>{h.btnDiscoverProjects}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION : UN PROJET. UNE VISION GLOBALE. */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="label-mono text-accent">{h.posLabel}</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            {h.posTitle}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {h.posDesc1}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {h.posDesc2}
          </p>
        </div>

        {/* 3 WORLDS CARDS */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ESPACE */}
          <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold">{h.worldSpaceTitle}</h3>
              <p className="text-xs text-muted-foreground">{h.worldSpaceDesc}</p>
              <div className="border-t border-border/60 pt-4 space-y-2 text-xs font-semibold">
                <span className="label-mono text-muted-foreground">SERVICES</span>
                <p className="text-foreground">{h.worldSpaceServices}</p>
              </div>
            </div>
            <Link to="/renovation" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline">
              <span>{h.worldSpaceLink}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* DIGITAL */}
          <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                <Laptop className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold">{h.worldDigitalTitle}</h3>
              <p className="text-xs text-muted-foreground">{h.worldDigitalDesc}</p>
              <div className="border-t border-border/60 pt-4 space-y-2 text-xs font-semibold">
                <span className="label-mono text-muted-foreground">SERVICES</span>
                <p className="text-foreground">{h.worldDigitalServices}</p>
              </div>
            </div>
            <Link to="/digital" className="inline-flex items-center gap-2 text-xs font-bold text-accent hover:underline">
              <span>{h.worldDigitalLink}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* COMBINÉ */}
          <div className="rounded-3xl border border-primary/40 bg-primary/5 p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold">{h.worldCombinedTitle}</h3>
              <p className="text-xs text-muted-foreground">{h.worldCombinedDesc}</p>
              <div className="border-t border-border/60 pt-4 space-y-2 text-xs font-semibold">
                <span className="label-mono text-primary">SERVICES</span>
                <p className="text-foreground font-bold">{h.worldCombinedServices}</p>
              </div>
            </div>
            <Link to="/packages" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline">
              <span>{h.worldCombinedLink}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION : POUR QUI ? */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12 border-t border-border/60">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="label-mono text-accent">{h.forWhoLabel}</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            {h.forWhoTitle}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-3 shadow-xs">
            <HomeIcon className="h-8 w-8 text-primary" />
            <h3 className="font-serif text-xl font-bold">{h.forPartTitle}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{h.forPartDesc}</p>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-3 shadow-xs">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h3 className="font-serif text-xl font-bold">{h.forRetailTitle}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{h.forRetailDesc}</p>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-3 shadow-xs">
            <Building2 className="h-8 w-8 text-primary" />
            <h3 className="font-serif text-xl font-bold">{h.forOfficeTitle}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{h.forOfficeDesc}</p>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-3 shadow-xs">
            <Stethoscope className="h-8 w-8 text-primary" />
            <h3 className="font-serif text-xl font-bold">{h.forHealthTitle}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{h.forHealthDesc}</p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            to="/healthcare"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md hover:bg-primary/90"
          >
            <span>{h.btnDiscoverHealth}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* SECTION : POURQUOI POKIBOIS ? */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12 border-t border-border/60">
        <div className="space-y-4 max-w-3xl">
          <span className="label-mono text-accent">{h.diffLabel}</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            {h.diffTitle}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[h.diff1, h.diff2, h.diff3, h.diff4, h.diff5, h.diff6].map((pt, idx) => (
            <div key={idx} className="flex items-start gap-4 p-6 rounded-3xl border border-border/80 bg-card shadow-xs">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <span className="font-serif text-lg font-bold">{pt}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION : VOIR AVANT DE CONSTRUIRE */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12 border-t border-border/60">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="label-mono text-accent">{h.visuLabel}</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            {h.visuTitle}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {h.visuDesc1}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {h.visuDesc2}
          </p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6">
          <BeforeAfterSlider
            beforeImage="/showcase/luxury-before.jpg"
            afterImage="/templates/medical-cabinet.jpg"
            beforeLabel={h.visuBefore}
            afterLabel={h.visuAfter}
          />
        </div>

        <div className="text-center pt-2">
          <Link
            to="/digital"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md hover:bg-primary/90"
          >
            <span>{h.btnDiscoverDigital}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* SECTION : NOS RÉALISATIONS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12 border-t border-border/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="label-mono text-accent">{h.portfolioLabel}</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
              {h.portfolioTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {h.portfolioDesc}
            </p>
          </div>

          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-secondary"
          >
            <span>{h.btnSeeProjects}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="my-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-4">
  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
    <span>EXPERTISES & CHIFFRES CLÉS POKIBOIS</span>
  </div>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/60">
    <div className="space-y-1">
      <span className="font-serif text-2xl sm:text-3xl font-bold text-foreground block">150+</span>
      <span className="text-xs text-muted-foreground">Projets d'architecture & rénovation réalisés</span>
    </div>
    <div className="space-y-1">
      <span className="font-serif text-2xl sm:text-3xl font-bold text-foreground block">98%</span>
      <span className="text-xs text-muted-foreground">Taux de satisfaction globale client</span>
    </div>
    <div className="space-y-1">
      <span className="font-serif text-2xl sm:text-3xl font-bold text-foreground block">12 ans</span>
      <span className="text-xs text-muted-foreground">Savoir-faire combiné Espace & Digital</span>
    </div>
    <div className="space-y-1">
      <span className="font-serif text-2xl sm:text-3xl font-bold text-foreground block">100%</span>
      <span className="text-xs text-muted-foreground">Fabrication & sur-mesure sous contrôle Pokibois</span>
    </div>
  </div>
</div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS_DATA.slice(0, 3).map((proj) => {
            const titleStr = typeof proj.title === "object" ? proj.title[lang] : (proj.title || "");
            const catStr = typeof proj.category === "object" ? proj.category[lang] : (proj.category || "");
            const locStr = typeof proj.location === "object" ? proj.location[lang] : (proj.location || "");
            const imgStr = proj.image || proj.heroImage || "/templates/living-room.jpg";

            return (
              <Link
                key={proj.id}
                to="/projects"
                className="group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={imgStr} alt={titleStr} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400">{catStr}</span>
                  <h3 className="font-serif text-xl font-bold">{titleStr}</h3>
                  <p className="text-xs text-muted-foreground">{locStr}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 sm:p-16 text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
            {h.ctaFinalTitle}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            {h.ctaFinalDesc}
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-9 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-xl hover:bg-primary/90 hover:scale-105 transition-all"
            >
              <span>{h.btnTalk}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      
    </div>
  );
}

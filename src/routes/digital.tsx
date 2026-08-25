import { createFileRoute, Link } from "@tanstack/react-router";


import { useDict } from "@/lib/i18n";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/digital")({
  component: DigitalPage,
});

function DigitalPage() {
  const d = useDict();
  const dig = d.digital;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-20">
        {/* HERO */}
        <section className="space-y-6 max-w-4xl border-b border-border/60 pb-12">
          <span className="label-mono text-accent">{dig.label}</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            {dig.titleA}<br />
            <span className="italic font-normal text-muted-foreground">{dig.titleB}</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground font-light leading-relaxed">
            {dig.subtitle}
          </p>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <span>{dig.btnTalk}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* 5 DIGITAL SECTIONS */}
        <section className="space-y-12 border-t border-border/60 pt-16">
          {/* 1. IDENTITÉ DE MARQUE */}
          <div className="rounded-3xl border border-border/80 bg-card p-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold">{dig.sec1Title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {dig.sec1Desc}
            </p>
            
          </div>

          {/* 2. SITE WEB */}
          <div className="rounded-3xl border border-border/80 bg-card p-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold">{dig.sec2Title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {dig.sec2Desc}
            </p>
            
          </div>

          {/* 3. RÉSEAUX SOCIAUX */}
          <div className="rounded-3xl border border-border/80 bg-card p-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold">{dig.sec3Title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {dig.sec3Desc}
            </p>
            
          </div>

          {/* 4. OUTILS DIGITAUX */}
          <div className="rounded-3xl border border-border/80 bg-card p-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold">{dig.sec4Title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {dig.sec4Desc}
            </p>
            
          </div>

          {/* 5. 3D · 360° · IMMERSION */}
          <div className="rounded-3xl border border-border/80 bg-card p-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold">{dig.sec5Title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {dig.sec5Desc}
            </p>
            
          </div>
        </section>

        {/* POUR TOUS LES PROJETS */}
        <section className="rounded-3xl border border-border/80 bg-secondary/30 p-8 text-center space-y-3">
          <span className="label-mono text-accent">{dig.typoLabel}</span>
          <p className="font-serif text-xl font-bold">{dig.typoTitle}</p>
          <p className="text-xs text-muted-foreground font-semibold">{dig.typoDesc}</p>
        </section>

        {/* CTA */}
        <section className="text-center pt-4">
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 sm:p-12 space-y-6">
            <h2 className="font-serif text-3xl font-bold">{dig.ctaTitle}</h2>
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

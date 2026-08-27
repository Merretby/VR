import { createFileRoute, Link } from "@tanstack/react-router";
import { useDict, useI18n } from "@/lib/i18n";
import { ArrowUpRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/packages")({
  component: PackagesPage,
});

function PackagesPage() {
  const d = useDict();
  const { lang } = useI18n();
  const pkg = d.packages;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        
        {/* HERO */}
        <section className="space-y-5 max-w-4xl border-b border-border/60 pb-10">
          <span className="label-mono text-accent">{pkg.label}</span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
            {pkg.title}
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground font-normal leading-relaxed">
            {pkg.subtitle}
          </p>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md hover:bg-primary/90 hover:scale-105 transition-all"
            >
              <span>{pkg.btnTalk}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* 4 FORMULES CARDS */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* FORMULE 01 - DIGITAL */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-all">
            <div className="space-y-3.5">
              <span className="label-mono text-accent">{pkg.pkg1Label}</span>
              <h2 className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-foreground uppercase">{pkg.pkg1Title}</h2>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">{pkg.pkg1Desc}</p>
              
              <div className="border-t border-border/60 pt-3.5 space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block font-sans">PÉRIMÈTRE & SERVICES</span>
                <p className="text-xs font-medium text-foreground leading-relaxed">
                  {pkg.pkg1Scope}
                </p>
              </div>
              
              <p className="text-xs text-muted-foreground/90 leading-relaxed">{pkg.pkg1Ideal}</p>
            </div>
            
            <Link to="/contact" className="w-full text-center rounded-2xl bg-secondary py-3 text-xs font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-xs">
              {pkg.btnPkg1}
            </Link>
          </div>

          {/* FORMULE 02 - ESPACE */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-all">
            <div className="space-y-3.5">
              <span className="label-mono text-primary font-bold">{pkg.pkg2Label}</span>
              <h2 className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-foreground uppercase">{pkg.pkg2Title}</h2>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">{pkg.pkg2Desc}</p>
              
              <div className="border-t border-border/60 pt-3.5 space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block font-sans">PÉRIMÈTRE & SERVICES</span>
                <p className="text-xs font-medium text-foreground leading-relaxed">
                  {pkg.pkg2Scope}
                </p>
              </div>
              
              <p className="text-xs text-muted-foreground/90 leading-relaxed">{pkg.pkg2Ideal}</p>
            </div>
            
            <Link to="/contact" className="w-full text-center rounded-2xl bg-secondary py-3 text-xs font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-xs">
              {pkg.btnPkg2}
            </Link>
          </div>

          {/* FORMULE 03 - COMBINÉ (POPULAIRE) */}
          <div className="rounded-3xl border-2 border-primary/70 bg-primary/5 p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-md relative hover:shadow-lg transition-all">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="label-mono text-primary font-extrabold">{pkg.pkg3Label}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0C2D3B] px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase text-[#c8a870]">
                  <Sparkles className="h-2.5 w-2.5" />
                  {lang === "fr" ? "POPULAIRE" : "POPULAR"}
                </span>
              </div>
              <h2 className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-foreground uppercase">{pkg.pkg3Title}</h2>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">{pkg.pkg3Desc}</p>
              
              <div className="border-t border-primary/20 pt-3.5 space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-primary block font-sans">PÉRIMÈTRE & SERVICES</span>
                <p className="text-xs font-bold text-foreground leading-relaxed">
                  {pkg.pkg3Scope}
                </p>
              </div>
              
              <p className="text-xs text-muted-foreground/90 leading-relaxed">
                {lang === "fr" 
                  ? "Faire dialoguer l'espace et l'image pour raconter la même histoire."
                  : "Aligning space and image to tell the same cohesive story."}
              </p>
            </div>
            
            <Link to="/contact" className="w-full text-center rounded-2xl bg-primary text-primary-foreground py-3 text-xs font-bold shadow-md hover:bg-primary/90 transition-all">
              {pkg.btnPkg3}
            </Link>
          </div>

          {/* FORMULE 04 - CLÉ EN MAIN */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-all">
            <div className="space-y-3.5">
              <span className="label-mono text-accent">{pkg.pkg4Label}</span>
              <h2 className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-foreground uppercase">{pkg.pkg4Title}</h2>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">{pkg.pkg4Desc}</p>
              
              <div className="border-t border-border/60 pt-3.5 space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block font-sans">PÉRIMÈTRE & SERVICES</span>
                <p className="text-xs font-medium text-foreground leading-relaxed">
                  {pkg.pkg4Scope}
                </p>
              </div>
              
              <p className="text-xs text-muted-foreground/90 leading-relaxed">{pkg.pkg4Ideal}</p>
            </div>
            
            <Link to="/contact" className="w-full text-center rounded-2xl bg-secondary py-3 text-xs font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-xs">
              {pkg.btnPkg4}
            </Link>
          </div>
        </section>

        {/* ET SI VOUS NE SAVEZ PAS ENCORE ? */}
        <section className="rounded-3xl border border-border/80 bg-secondary/30 p-8 sm:p-12 space-y-5">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{pkg.notSureTitle}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl font-normal">
            {pkg.notSureDesc}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:scale-105"
          >
            <span>{d.header?.contact ?? "Parlons de votre projet"}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>

        {/* POUR LA SANTÉ */}
        <section className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-foreground">{pkg.healthTitle}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl font-normal">
            {pkg.healthDesc}
          </p>
          <Link
            to="/healthcare"
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <span>{pkg.btnHealth}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>

      </main>
    </div>
  );
}

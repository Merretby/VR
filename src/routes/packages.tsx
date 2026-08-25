import { createFileRoute, Link } from "@tanstack/react-router";


import { useDict } from "@/lib/i18n";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/packages")({
  component: PackagesPage,
});

function PackagesPage() {
  const d = useDict();
  const pkg = d.packages;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-20">
        {/* HERO */}
        <section className="space-y-6 max-w-4xl border-b border-border/60 pb-12">
          <span className="label-mono text-accent">{pkg.label}</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            {pkg.title}
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground font-light leading-relaxed">
            {pkg.subtitle}
          </p>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <span>{pkg.btnTalk}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* 4 FORMULES */}
        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* FORMULE 01 */}
          <div className="rounded-3xl border border-border/80 bg-card p-8 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <span className="label-mono text-accent">{pkg.pkg1Label}</span>
              <h2 className="font-serif text-2xl font-bold">{pkg.pkg1Title}</h2>
              <p className="text-xs text-muted-foreground">{pkg.pkg1Desc}</p>
              <p className="text-xs font-mono text-foreground border-t border-border/60 pt-3">
                {pkg.pkg1Scope}
              </p>
              <p className="text-xs italic text-muted-foreground">{pkg.pkg1Ideal}</p>
            </div>
            <Link to="/contact" className="w-full text-center rounded-2xl bg-secondary py-3 text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all">
              {pkg.btnPkg1}
            </Link>
          </div>

          {/* FORMULE 02 */}
          <div className="rounded-3xl border border-border/80 bg-card p-8 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <span className="label-mono text-primary">{pkg.pkg2Label}</span>
              <h2 className="font-serif text-2xl font-bold">{pkg.pkg2Title}</h2>
              <p className="text-xs text-muted-foreground">{pkg.pkg2Desc}</p>
              <p className="text-xs font-mono text-foreground border-t border-border/60 pt-3">
                {pkg.pkg2Scope}
              </p>
              <p className="text-xs italic text-muted-foreground">{pkg.pkg2Ideal}</p>
            </div>
            <Link to="/contact" className="w-full text-center rounded-2xl bg-secondary py-3 text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all">
              {pkg.btnPkg2}
            </Link>
          </div>

          {/* FORMULE 03 */}
          <div className="rounded-3xl border border-primary/40 bg-primary/5 p-8 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <span className="label-mono text-primary font-bold">{pkg.pkg3Label}</span>
              <h2 className="font-serif text-2xl font-bold">{pkg.pkg3Title}</h2>
              <p className="text-xs text-muted-foreground">{pkg.pkg3Desc}</p>
              <p className="text-xs font-mono text-foreground border-t border-border/60 pt-3">
                {pkg.pkg3Scope}
              </p>
            </div>
            <Link to="/contact" className="w-full text-center rounded-2xl bg-primary text-primary-foreground py-3 text-xs font-bold shadow-md hover:bg-primary/90">
              {pkg.btnPkg3}
            </Link>
          </div>

          {/* FORMULE 04 */}
          <div className="rounded-3xl border border-border/80 bg-card p-8 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <span className="label-mono text-accent">{pkg.pkg4Label}</span>
              <h2 className="font-serif text-2xl font-bold">{pkg.pkg4Title}</h2>
              <p className="text-xs text-muted-foreground">{pkg.pkg4Desc}</p>
              <p className="text-xs font-mono text-foreground border-t border-border/60 pt-3">
                {pkg.pkg4Scope}
              </p>
              <p className="text-xs italic text-muted-foreground">{pkg.pkg4Ideal}</p>
            </div>
            <Link to="/contact" className="w-full text-center rounded-2xl bg-secondary py-3 text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all">
              {pkg.btnPkg4}
            </Link>
          </div>
        </section>

        {/* ET SI VOUS NE SAVEZ PAS ENCORE ? */}
        <section className="rounded-3xl border border-border/80 bg-secondary/30 p-8 sm:p-12 space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">{pkg.notSureTitle}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {pkg.notSureDesc}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md hover:bg-primary/90"
          >
            <span>{d.header.ctaTalk}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>

        {/* POUR LA SANTÉ */}
        <section className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 space-y-4">
          <h2 className="font-serif text-2xl font-bold">{pkg.healthTitle}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
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

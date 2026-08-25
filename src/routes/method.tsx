import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";

import { useDict } from "@/lib/i18n";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/method")({
  component: MethodPage,
});

function MethodPage() {
  const d = useDict();
  const m = d.method;

  const steps = [
    { num: "01", title: m.s1Title, desc: m.s1Desc },
    { num: "02", title: m.s2Title, desc: m.s2Desc },
    { num: "03", title: m.s3Title, desc: m.s3Desc },
    { num: "04", title: m.s4Title, desc: m.s4Desc },
    { num: "05", title: m.s5Title, desc: m.s5Desc },
    { num: "06", title: m.s6Title, desc: m.s6Desc },
    { num: "07", title: m.s7Title, desc: m.s7Desc },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <AppHeader current="/method" />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-20">
        {/* HERO */}
        <section className="space-y-6 max-w-4xl border-b border-border/60 pb-12">
          <span className="label-mono text-accent">{m.label}</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            {m.title}
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground font-light leading-relaxed">
            {m.subtitle}
          </p>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <span>{m.btnTalk}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* 7 ETAPES */}
        <section className="space-y-8 border-t border-border/60 pt-16">
          <div className="space-y-3">
            <span className="label-mono text-accent">{m.stepsLabel}</span>
            <h2 className="font-serif text-3xl font-bold">{m.stepsTitle}</h2>
          </div>

          <div className="space-y-4">
            {steps.map((st) => (
              <div key={st.num} className="group rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs hover:border-primary/50 transition-all">
                <div className="flex items-center gap-6">
                  <div className="font-mono text-2xl font-bold text-accent group-hover:text-primary transition-colors">{st.num}</div>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold">{st.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">{st.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          
        </section>

        {/* UN SEUL INTERLOCUTEUR */}
        <section className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 space-y-4">
          <h2 className="font-serif text-2xl font-bold">{m.singleContactTitle}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {m.singleContactDesc}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            {m.singleContactGoal}
          </p>
        </section>

        {/* UNE MÉTHODE QUI S’ADAPTE */}
        <section className="space-y-8 border-t border-border/60 pt-16">
          <div className="space-y-3">
            <span className="label-mono text-accent">{m.adaptLabel}</span>
            <h2 className="font-serif text-3xl font-bold">{m.adaptTitle}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {m.adaptDesc}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 rounded-3xl border border-border bg-card space-y-2">
              <h3 className="font-serif text-lg font-bold">{m.houseTitle}</h3>
              <p className="text-xs text-muted-foreground">{m.houseDesc}</p>
            </div>
            <div className="p-6 rounded-3xl border border-border bg-card space-y-2">
              <h3 className="font-serif text-lg font-bold">{m.shopTitle}</h3>
              <p className="text-xs text-muted-foreground">{m.shopDesc}</p>
            </div>
            <div className="p-6 rounded-3xl border border-border bg-card space-y-2">
              <h3 className="font-serif text-lg font-bold">{m.officeTitle}</h3>
              <p className="text-xs text-muted-foreground">{m.officeDesc}</p>
            </div>
            <div className="p-6 rounded-3xl border border-border bg-card space-y-2">
              <h3 className="font-serif text-lg font-bold">{m.healthTitle}</h3>
              <p className="text-xs text-muted-foreground">{m.healthDesc}</p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <span>{m.btnProjects}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}

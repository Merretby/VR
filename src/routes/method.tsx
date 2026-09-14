import { createFileRoute, Link } from "@tanstack/react-router";

import { useDict } from "@/lib/i18n";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/method")({
  component: MethodPage,
});

function StepArtwork({ step }: { step: string }) {
  const palettes = {
    "01": {
      bg: ["#f7f1e7", "#e8d2b0"],
      accent: "#a67c4e",
      shape: "#d5b38a",
      line: "#6f5842",
    },
    "02": {
      bg: ["#f2eee8", "#d8c3a4"],
      accent: "#8b6a49",
      shape: "#efe5d4",
      line: "#56463a",
    },
    "03": {
      bg: ["#f8f1e6", "#cbb59b"],
      accent: "#a37246",
      shape: "#f2e3c8",
      line: "#5d4740",
    },
    "04": {
      bg: ["#f4efe8", "#d8c8b0"],
      accent: "#7a6347",
      shape: "#e5d3b3",
      line: "#584a3d",
    },
    "05": {
      bg: ["#f5f0ea", "#d7c1a2"],
      accent: "#8a6244",
      shape: "#d9b58d",
      line: "#4b3f38",
    },
    "06": {
      bg: ["#efe8df", "#d5b88d"],
      accent: "#775d44",
      shape: "#f5ebdd",
      line: "#483e36",
    },
    "07": {
      bg: ["#f4efe7", "#d5c0a3"],
      accent: "#816548",
      shape: "#e2c7a5",
      line: "#4e4139",
    },
  } as const;

  const palette = palettes[step as keyof typeof palettes] ?? palettes["01"];

  return (
    <svg viewBox="0 0 260 180" className="h-full w-full" role="img" aria-label={`Method step ${step} illustration`}>
      <defs>
        <linearGradient id={`bg-${step}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={palette.bg[0]} />
          <stop offset="100%" stopColor={palette.bg[1]} />
        </linearGradient>
      </defs>
      <rect width="260" height="180" rx="18" fill={`url(#bg-${step})`} />
      <rect x="26" y="28" width="208" height="126" rx="12" fill="#f7f3ee" opacity="0.78" stroke={palette.line} strokeWidth="2" />
      <rect x="40" y="44" width="80" height="70" rx="8" fill={palette.shape} opacity="0.95" />
      <rect x="130" y="44" width="88" height="52" rx="8" fill="#f0e9df" stroke={palette.line} strokeWidth="1.6" />
      <rect x="130" y="104" width="88" height="32" rx="8" fill="#e4d2b7" opacity="0.9" />
      <path d="M52 122 L84 122 M52 132 L92 132 M52 142 L72 142" stroke={palette.line} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M144 70 L175 70 M144 82 L198 82 M144 94 L186 94" stroke={palette.line} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M154 52 L170 52" stroke={palette.accent} strokeWidth="4" strokeLinecap="round" />
      <circle cx="204" cy="58" r="9" fill={palette.accent} opacity="0.7" />
      <rect x="24" y="150" width="212" height="4" rx="2" fill={palette.line} opacity="0.4" />
    </svg>
  );
}

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
                <div className="flex items-center gap-6 flex-1">
                  <div className="font-mono text-2xl font-bold text-accent group-hover:text-primary transition-colors">{st.num}</div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold">{st.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">{st.desc}</p>
                  </div>
                </div>
                <div className="w-full sm:w-[220px] shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted/40 shadow-sm">
                  <div className="aspect-[13/8] w-full">
                    <StepArtwork step={st.num} />
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

      
    </div>
  );
}

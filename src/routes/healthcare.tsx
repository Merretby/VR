import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";


import { useDict } from "@/lib/i18n";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/healthcare")({
  component: HealthcarePage,
});

function HealthcarePage() {
  const d = useDict();
  const hc = d.healthcare;

  const stakes = [
    { title: hc.stk1Title, desc: hc.stk1Desc },
    { title: hc.stk2Title, desc: hc.stk2Desc },
    { title: hc.stk3Title, desc: hc.stk3Desc },
    { title: hc.stk4Title, desc: hc.stk4Desc },
    { title: hc.stk5Title, desc: hc.stk5Desc },
  ];

    const medicalList = hc.medicalList || [
    "Accueil et secrétariat", "Salle d’attente", "Salles de consultation",
    "Circulations", "Rangement", "Mobilier sur-mesure", "Éclairage",
    "Ambiance", "Identité du cabinet", "Présence digitale"
  ];

  const dentalList = hc.dentalList || [
    "Accueil", "Attente", "Salles de soins", "Organisation autour du fauteuil",
    "Rangements", "Circulations", "Mobilier", "Ambiance",
    "Identité du cabinet", "Présence digitale"
  ];

  const labList = hc.labList || [
    "Accueil", "Attente", "Prélèvement", "Circulations",
    "Rangements", "Mobilier professionnel", "Zones techniques selon périmètre",
    "Signalétique", "Identité", "Présence digitale"
  ];

  const faqs = hc.faqs || [
    { q: "Pouvez-vous transformer un cabinet existant ?", a: "Oui. Le projet peut partir d’un local existant, d’une rénovation ou d’un nouveau local à aménager, selon votre situation." },
    { q: "Pouvez-vous gérer l’espace et l’identité du cabinet ?", a: "Oui. Avec l’approche COMBINÉ, l’aménagement et l’univers digital peuvent être pensés ensemble." },
    { q: "Pourquoi utiliser la 3D ?", a: "Parce qu’elle permet de comprendre les volumes, les circulations, les matériaux et l’ambiance avant de réaliser le projet." },
    { q: "Prenez-vous en charge les contraintes réglementaires ?", a: "Les exigences applicables doivent être vérifiées selon le projet et les responsabilités de chaque intervenant." }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-20">
        {/* HERO */}
        <section className="space-y-6 max-w-4xl border-b border-border/60 pb-12">
          <span className="label-mono text-accent">{hc.label}</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            {hc.title}
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground font-light leading-relaxed">
            {hc.subtitle}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            {hc.tagline}
          </p>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <span>{hc.btnTalk}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* POURQUOI UNE APPROCHE SPÉCIFIQUE ? */}
        <section className="space-y-6 border-t border-border/60 pt-16 max-w-3xl">
          <h2 className="font-serif text-3xl font-bold">{hc.whyTitle}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {hc.whyDesc1}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {hc.whyDesc2}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            {hc.whyGoal}
          </p>
        </section>

        {/* LES ENJEUX QUE NOUS PRENONS EN COMPTE */}
        <section className="space-y-8 border-t border-border/60 pt-16">
          <div className="space-y-3">
            <span className="label-mono text-accent">{hc.stakesLabel}</span>
            <h2 className="font-serif text-3xl font-bold">{hc.stakesTitle}</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stakes.map((stk, idx) => (
              <div key={idx} className="rounded-3xl border border-border/80 bg-card p-6 space-y-3">
                <span className="font-mono text-xs text-primary font-bold">0{idx + 1}</span>
                <h3 className="font-serif text-lg font-bold">{stk.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{stk.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-8 rounded-3xl bg-secondary/40 border border-border/80 text-center space-y-2">
            <p className="font-serif text-xl font-bold">{hc.stakesSummary}</p>
          </div>

          
        </section>

        {/* 01 — CABINETS MÉDICAUX */}
        <section className="rounded-3xl border border-border/80 bg-card p-8 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-primary">{hc.sec1Title}</h2>
          <p className="text-xs text-muted-foreground">{hc.sec1Desc}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {medicalList.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-foreground border-t border-border/60 pt-4">{hc.sec1Goal}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground">
            <span>{hc.btnSec1}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>

        {/* 02 — CABINETS DENTAIRES */}
        <section className="rounded-3xl border border-border/80 bg-card p-8 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-accent">{hc.sec2Title}</h2>
          <p className="text-xs text-muted-foreground">{hc.sec2Desc}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {dentalList.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          
          <p className="text-xs font-semibold text-foreground border-t border-border/60 pt-4">{hc.sec2Goal}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground">
            <span>{hc.btnSec2}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>

        {/* 03 — LABORATOIRES D’ANALYSES */}
        <section className="rounded-3xl border border-border/80 bg-card p-8 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-foreground">{hc.sec3Title}</h2>
          <p className="text-xs text-muted-foreground">{hc.sec3Desc}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {labList.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4 text-foreground shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          
          <p className="text-xs font-semibold text-foreground border-t border-border/60 pt-4">{hc.sec3Goal}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground">
            <span>{hc.btnSec3}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>

        {/* 04 — AUTRES PROFESSIONNELS DE SANTÉ */}
        <section className="rounded-3xl border border-border/80 bg-card p-8 space-y-4">
          <h2 className="font-serif text-2xl font-bold">{hc.sec4Title}</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hc.sec4Desc}
          </p>
          
        </section>

        {/* 12. LES TROIS UNIVERS POUR LA SANTÉ */}
        <section className="space-y-6 border-t border-border/60 pt-16">
          <span className="label-mono text-accent">{hc.universesLabel}</span>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="p-6 rounded-3xl border border-border bg-card space-y-2">
              <h3 className="font-serif text-xl font-bold">{hc.universesSpaceTitle}</h3>
              <p className="text-xs text-muted-foreground">{hc.universesSpaceDesc}</p>
            </div>
            <div className="p-6 rounded-3xl border border-border bg-card space-y-2">
              <h3 className="font-serif text-xl font-bold">{hc.universesDigitalTitle}</h3>
              <p className="text-xs text-muted-foreground">{hc.universesDigitalDesc}</p>
            </div>
            <div className="p-6 rounded-3xl border border-primary/40 bg-primary/5 space-y-2">
              <h3 className="font-serif text-xl font-bold">{hc.universesCombinedTitle}</h3>
              <p className="text-xs font-semibold text-foreground">{hc.universesCombinedDesc}</p>
            </div>
          </div>
        </section>

        {/* 13. NOTRE MÉTHODE POUR UN PROJET DE SANTÉ */}
        <section className="space-y-6 border-t border-border/60 pt-16">
          <span className="label-mono text-accent">{hc.methodLabel}</span>
          <div className="grid gap-3 sm:grid-cols-7 font-mono text-xs text-center">
            {[hc.m1, hc.m2, hc.m3, hc.m4, hc.m5, hc.m6, hc.m7].map((step, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-card border border-border space-y-1">
                <span className="text-accent font-bold block">0{idx + 1}</span>
                <span className="font-serif text-xs font-bold block">{step}</span>
              </div>
            ))}
          </div>
          
        </section>

        {/* 14. FAQ SANTÉ */}
        <section className="space-y-6 border-t border-border/60 pt-16 max-w-3xl mx-auto w-full">
          <h2 className="font-serif text-3xl font-bold text-center">{hc.faqTitle}</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-2">
                <h3 className="font-serif text-base font-bold">{f.q}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          
        </section>

        {/* 15. PREUVE / RÉFÉRENCES SANTÉ */}
        <section className="space-y-6 border-t border-border/60 pt-16">
          <h2 className="font-serif text-3xl font-bold">{hc.proofTitle}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">{hc.proofDesc}</p>
          
        </section>

        {/* CTA FINAL */}
        <section className="text-center pt-8">
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 sm:p-12 space-y-6">
            <h2 className="font-serif text-3xl font-bold max-w-2xl mx-auto">{hc.ctaTitle}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{hc.ctaDesc}</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <span>{hc.btnTalk}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      
    </div>
  );
}

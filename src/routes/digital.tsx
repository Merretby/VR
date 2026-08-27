import { createFileRoute, Link } from "@tanstack/react-router";
import { useDict, useI18n } from "@/lib/i18n";
import { ArrowUpRight, Palette, Globe, Share2, Cpu, Eye, CheckCircle2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/digital")({
  component: DigitalPage,
});

function DigitalPage() {
  const d = useDict();
  const { lang } = useI18n();
  const dig = d.digital;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-20">
        
        {/* HERO SECTION */}
        <section className="space-y-6 max-w-4xl border-b border-border/60 pb-12">
          {dig.label && <span className="label-mono text-accent">{dig.label}</span>}
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
            {dig.titleA}<br />
            <span className="italic font-normal text-muted-foreground">{dig.titleB}</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground font-normal leading-relaxed">
            {dig.subtitle}
          </p>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all"
            >
              <span>{dig.btnTalk}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* 5 DIGITAL SOLUTIONS CARDS (Title -> Picture -> Text) */}
        <section className="space-y-12">
          
          {/* 01. BRAND IDENTITY */}
          <div className="rounded-[2rem] border border-border/80 bg-card p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-300 grid gap-8 lg:grid-cols-12 items-center group">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-xs">
                  <Palette className="h-6 w-6" />
                </div>
                <div>
                  <span className="label-mono text-accent block text-[11px] font-bold tracking-widest">01 — BRAND & DESIGN</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{dig.sec1Title}</h2>
                </div>
              </div>

              {/* Mobile image preview */}
              <div className="lg:hidden relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-xs">
                <img
                  src="/moodboards/moodbord.jpg"
                  alt={dig.sec1Title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {dig.sec1Desc}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Univers visuel & Logo" : "Visual Identity & Logo"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Charte graphique complète" : "Complete Brand Guidelines"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Palette de matières & couleurs" : "Color & Material Swatches"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Papeterie & Signalétique" : "Stationery & Signage"}</span>
                </div>
              </div>
            </div>

            {/* Desktop Image */}
            <div className="hidden lg:block lg:col-span-6 relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-md">
              <img
                src="/moodboards/moodbord.jpg"
                alt={dig.sec1Title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* 02. WEBSITE */}
          <div className="rounded-[2rem] border border-border/80 bg-card p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-300 grid gap-8 lg:grid-cols-12 items-center group">
            {/* Desktop Image (Left) */}
            <div className="hidden lg:block lg:col-span-6 relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-md">
              <img
                src="/moodboards/moodbord-1.jpg"
                alt={dig.sec2Title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-xs">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <span className="label-mono text-accent block text-[11px] font-bold tracking-widest">02 — WEB & EXPERIENCES</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{dig.sec2Title}</h2>
                </div>
              </div>

              {/* Mobile image preview */}
              <div className="lg:hidden relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-xs">
                <img
                  src="/moodboards/moodbord-1.jpg"
                  alt={dig.sec2Title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {dig.sec2Desc}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Design UI/UX contemporain" : "Modern UI/UX Design"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Responsive & Ultra fluide" : "Fully Mobile Responsive"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Galeries & Visites 360°" : "Galleries & 360° Tours"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Prise de contact optimisée" : "Conversion & Contact Forms"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 03. SOCIAL MEDIA */}
          <div className="rounded-[2rem] border border-border/80 bg-card p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-300 grid gap-8 lg:grid-cols-12 items-center group">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-xs">
                  <Share2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="label-mono text-accent block text-[11px] font-bold tracking-widest">03 — SOCIAL & ENGAGEMENT</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{dig.sec3Title}</h2>
                </div>
              </div>

              {/* Mobile image preview */}
              <div className="lg:hidden relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-xs">
                <img
                  src="/moodboards/moodbord-2.jpg"
                  alt={dig.sec3Title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {dig.sec3Desc}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Grilles & Templates sur-mesure" : "Custom Grids & Templates"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Ligne éditoriale cohérente" : "Curated Editorial Tone"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Mise en valeur des chantiers" : "Project Reveal Highlights"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Engagement & Notoriété" : "Community & Reach"}</span>
                </div>
              </div>
            </div>

            {/* Desktop Image */}
            <div className="hidden lg:block lg:col-span-6 relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-md">
              <img
                src="/moodboards/moodbord-2.jpg"
                alt={dig.sec3Title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* 04. DIGITAL TOOLS */}
          <div className="rounded-[2rem] border border-border/80 bg-card p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-300 grid gap-8 lg:grid-cols-12 items-center group">
            {/* Desktop Image (Left) */}
            <div className="hidden lg:block lg:col-span-6 relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-md">
              <img
                src="/showcase/afterContemporary.png"
                alt={dig.sec4Title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-xs">
                  <Cpu className="h-6 w-6" />
                </div>
                <div>
                  <span className="label-mono text-accent block text-[11px] font-bold tracking-widest">04 — CUSTOM DIGITAL SOLUTIONS</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{dig.sec4Title}</h2>
                </div>
              </div>

              {/* Mobile image preview */}
              <div className="lg:hidden relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-xs">
                <img
                  src="/showcase/afterContemporary.png"
                  alt={dig.sec4Title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {dig.sec4Desc}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Configurateurs de matériaux" : "Material Configurators"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Outils de plans interactifs" : "Interactive Floor Plans"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Portails clients & Suivi" : "Client Portals & Progress"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Calculateurs d'estimations" : "Budget Calculators"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 05. 3D · 360° · IMMERSION */}
          <div className="rounded-[2rem] border border-border/80 bg-card p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-300 grid gap-8 lg:grid-cols-12 items-center group">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-xs">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <span className="label-mono text-accent block text-[11px] font-bold tracking-widest">05 — 3D & IMMERSIVE REALITY</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{dig.sec5Title}</h2>
                </div>
              </div>

              {/* Mobile image preview */}
              <div className="lg:hidden relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-xs">
                <img
                  src="/showcase/panorama_luxury.png"
                  alt={dig.sec5Title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {dig.sec5Desc}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Rendus 3D photoréalistes" : "Photorealistic 3D Renders"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Panoramas 360° interactifs" : "360° Interactive Panoramas"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Immersion Casque VR" : "VR Headset Immersion"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-[#c8a870] shrink-0" />
                  <span>{lang === "fr" ? "Validation éclairage & textures" : "Lighting & Texture Verification"}</span>
                </div>
              </div>
            </div>

            {/* Desktop Image */}
            <div className="hidden lg:block lg:col-span-6 relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-md">
              <img
                src="/showcase/panorama_luxury.png"
                alt={dig.sec5Title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

        </section>

        {/* POUR TOUS LES PROJETS */}
        <section className="rounded-3xl border border-border/80 bg-secondary/30 p-8 sm:p-10 text-center space-y-3">
          {dig.typoLabel && <span className="label-mono text-accent">{dig.typoLabel}</span>}
          <p className="font-serif text-xl sm:text-2xl font-bold text-foreground">{dig.typoTitle}</p>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl mx-auto">{dig.typoDesc}</p>
        </section>

        {/* CTA */}
        <section className="text-center pt-4">
          <div className="rounded-[2.5rem] border border-primary/30 bg-primary/5 p-8 sm:p-12 space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">{dig.ctaTitle}</h2>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all"
            >
              <span>{d.header?.contact ?? "Parlons de votre projet"}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}

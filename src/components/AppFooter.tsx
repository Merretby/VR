import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { useDict, useI18n } from "@/lib/i18n";

export function AppFooter() {
  const d = useDict();
  const { lang } = useI18n();

  return (
    <footer className="w-full border-t border-border bg-muted/40 text-foreground pt-16 pb-12 px-4 sm:px-6 transition-all duration-300">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Top CTA Banner */}
        <div className="rounded-3xl border border-border bg-background p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl">
            <span className="label-mono text-amber-600 dark:text-amber-400">
              {lang === "fr" ? "POKIBOIS — VISION GLOBALE" : "POKIBOIS — GLOBAL VISION"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              {lang === "fr" 
                ? "Vous avez une idée, un espace à transformer, ou un projet à construire ?" 
                : "Do you have an idea, a space to transform, or a project to build?"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lang === "fr"
                ? "Discutons de votre projet pour concevoir la réponse sur-mesure adaptée à vos besoins."
                : "Let's discuss your project to design the tailored solution suited to your needs."}
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-xs font-semibold text-background shadow-lg hover:scale-105 transition-all duration-300 shrink-0"
          >
            <span>{d.header?.contact ?? "Parlons de votre projet"}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Footer Main Content Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand Info Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="POKIBOIS" className="h-9 w-9 rounded-xl object-cover border border-border" />
              <div>
                <span className="font-serif text-xl font-bold tracking-tight block leading-none">POKIBOIS</span>
                {/* <span className="label-mono text-[9px] text-muted-foreground tracking-widest uppercase block mt-1">
                  {d.header?.logoSubtitle ?? "ARCHITECTURE & DIGITAL"}
                </span> */}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              {lang === "fr"
                ? "Conception, rénovation, aménagement, mobilier sur-mesure et digital : Pokibois transforme les lieux et leur image avec une vision globale, de la première idée à la réalisation."
                : "Design, renovation, fit-out, custom furniture, and digital: Pokibois transforms spaces and their image with a global vision, from initial concept to completion."}
            </p>
            {/* <div className="pt-2 text-xs font-mono text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">POKIBOIS SAS — Capital 50.000€</p>
              <p>RCS Paris B 892 341 578 | SIRET 89234157800012</p>
              <p>Code NAF 7111Z — Activités d'architecture</p>
            </div> */}
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="label-mono text-foreground font-bold">NAVIGATION</h3>
            <ul className="grid grid-cols-2 gap-2.5 text-xs text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">{d.header?.home ?? "Accueil"}</Link></li>
              <li><Link to="/projects" className="hover:text-foreground transition-colors">{d.header?.projects ?? "Nos projets"}</Link></li>
              <li><Link to="/renovation" className="hover:text-foreground transition-colors">{d.header?.renovation ?? "Rénovation & Transformation"}</Link></li>
              <li><Link to="/fitout" className="hover:text-foreground transition-colors">{d.header?.fitout ?? "Aménagement & Sur-mesure"}</Link></li>
              <li><Link to="/digital" className="hover:text-foreground transition-colors">{d.header?.digital ?? "Digital & Immersion"}</Link></li>
              <li><Link to="/packages" className="hover:text-foreground transition-colors">{d.header?.packages ?? "Nos formules"}</Link></li>
              <li><Link to="/method" className="hover:text-foreground transition-colors">{d.header?.method ?? "Notre méthode"}</Link></li>
              <li><Link to="/healthcare" className="hover:text-foreground transition-colors">{d.header?.healthcare ?? "Professionnels de santé"}</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">{d.header?.contact ?? "Parlons de votre projet"}</Link></li>
            </ul>
          </div>

          {/* Completed Official Contact & Info */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="label-mono text-foreground font-bold">
              {lang === "fr" ? "CONTACT & INFOS OFFICIELLES" : "CONTACT & OFFICIAL INFO"}
            </h3>
            <div className="rounded-2xl border border-border bg-background/80 p-5 space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-mono">Téléphone</span>
                  <a href="tel:+33142685500" className="font-medium hover:underline text-foreground">+33 1 42 68 55 00</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-mono">E-mail</span>
                  <a href="mailto:contact@pokibois.fr" className="font-medium hover:underline text-foreground">contact@pokibois.fr</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-mono">Siège social</span>
                  <p className="font-medium text-foreground">142 Boulevard Saint-Germain, 75006 Paris, France</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>{lang === "fr" ? "Réponse sous 24h à 48h ouvrées" : "Response within 24h-48h"}</span>
                <span className="text-amber-600 font-semibold">@pokibois.design</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Rights Bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
          <div>
            © 2026 POKIBOIS SAS. {lang === "fr" ? "Tous droits réservés. Architecture, Sur-mesure & Digital." : "All rights reserved. Architecture, Custom & Digital."}
          </div>
          <div className="flex gap-6">
            <Link to="/contact" className="hover:underline">{lang === "fr" ? "Mentions légales" : "Legal Notice"}</Link>
            <Link to="/contact" className="hover:underline">{lang === "fr" ? "Politique de confidentialité" : "Privacy Policy"}</Link>
            <Link to="/admin" className="hover:underline flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{lang === "fr" ? "Portail Admin" : "Admin Portal"}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

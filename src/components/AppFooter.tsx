import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useDict, useI18n } from "@/lib/i18n";

export function AppFooter() {
  const d = useDict();
  const { lang } = useI18n();

  return (
    <footer className="w-full bg-[#0C2D3B] text-white pt-10 pb-8 px-4 sm:px-6 transition-all duration-300 border-t border-[#13394a]">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Top Compact CTA Banner */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <span className="label-mono text-[#c8a870] text-[10px] tracking-widest block font-bold">
              {lang === "fr" ? "POKIBOIS — VISION GLOBALE" : "POKIBOIS — GLOBAL VISION"}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
              {lang === "fr" 
                ? "Vous avez une idée, un espace à transformer, ou un projet à construire ?" 
                : "Do you have an idea, a space to transform, or a project to build?"}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {lang === "fr"
                ? "Discutons de votre projet pour concevoir la réponse sur-mesure adaptée à vos besoins."
                : "Let's discuss your project to design the tailored solution suited to your needs."}
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[#c8a870] text-[#0C2D3B] px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 hover:bg-[#d9c195] transition-all duration-300 shrink-0"
          >
            <span>{d.header?.contact ?? "Parlons de votre projet"}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Footer Main Content Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 text-white">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo.jpg" alt="POKIBOIS" className="h-6.5 w-6.5 sm:h-7 sm:w-7 rounded-lg object-cover border border-white/20" />
              <div>
                <span className="font-sans text-[13px] sm:text-sm font-extrabold tracking-widest uppercase text-white block leading-none">
                  POKIBOIS
                </span>
              </div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed max-w-sm">
              {lang === "fr"
                ? "Conception, rénovation, aménagement, mobilier sur-mesure et digital : Pokibois transforme les lieux et leur image avec une vision globale, de la première idée à la réalisation."
                : "Design, renovation, fit-out, custom furniture, and digital: Pokibois transforms spaces and their image with a global vision, from initial concept to completion."}
            </p>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-4 space-y-2.5">
            <h3 className="label-mono text-[#c8a870] font-bold text-[11px] tracking-wider">NAVIGATION</h3>
            <ul className="grid grid-cols-2 gap-2 text-xs text-white/80">
              <li><Link to="/" className="hover:text-white transition-colors">{d.header?.home ?? "Accueil"}</Link></li>
              <li><Link to="/projects" className="hover:text-white transition-colors">{d.header?.projects ?? "Nos projets"}</Link></li>
              <li><Link to="/renovation" className="hover:text-white transition-colors">{d.header?.renovation ?? "Rénovation & Transformation"}</Link></li>
              <li><Link to="/fitout" className="hover:text-white transition-colors">{d.header?.fitout ?? "Aménagement & Sur-mesure"}</Link></li>
              <li><Link to="/digital" className="hover:text-white transition-colors">{d.header?.digital ?? "Digital & Immersion"}</Link></li>
              <li><Link to="/packages" className="hover:text-white transition-colors">{d.header?.packages ?? "Nos formules"}</Link></li>
              <li><Link to="/method" className="hover:text-white transition-colors">{d.header?.method ?? "Notre méthode"}</Link></li>
              <li><Link to="/healthcare" className="hover:text-white transition-colors">{d.header?.healthcare ?? "Professionnels de santé"}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{d.header?.contact ?? "Parlons de votre projet"}</Link></li>
            </ul>
          </div>

          {/* Official Contact & Info */}
          <div className="lg:col-span-4 space-y-2.5">
            <h3 className="label-mono text-[#c8a870] font-bold text-[11px] tracking-wider">
              {lang === "fr" ? "CONTACT & INFOS OFFICIELLES" : "CONTACT & OFFICIAL INFO"}
            </h3>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2.5 text-xs text-white">
              <div className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 text-[#c8a870] shrink-0" />
                <div>
                  <span className="text-[9px] text-white/60 uppercase block font-mono">Téléphone</span>
                  <a href="tel:+33142685500" className="font-medium hover:underline text-white">+33 1 42 68 55 00</a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 text-[#c8a870] shrink-0" />
                <div>
                  <span className="text-[9px] text-white/60 uppercase block font-mono">E-mail</span>
                  <a href="mailto:contact@pokibois.fr" className="font-medium hover:underline text-white">contact@pokibois.fr</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-3.5 w-3.5 text-[#c8a870] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-white/60 uppercase block font-mono">Siège social</span>
                  <p className="font-medium text-white">142 Boulevard Saint-Germain, 75006 Paris, France</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60 font-mono">
                <span>{lang === "fr" ? "Réponse sous 24h à 48h ouvrées" : "Response within 24h-48h"}</span>
                <span className="text-[#c8a870] font-semibold">@pokibois.design</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Rights Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/60 font-mono">
          <div>
            © 2026 POKIBOIS SAS. {lang === "fr" ? "Tous droits réservés. Architecture, Sur-mesure & Digital." : "All rights reserved. Architecture, Custom & Digital."}
          </div>
          <div className="flex gap-5">
            <Link to="/contact" className="hover:text-white transition-colors">{lang === "fr" ? "Mentions légales" : "Legal Notice"}</Link>
            <Link to="/contact" className="hover:text-white transition-colors">{lang === "fr" ? "Politique de confidentialité" : "Privacy Policy"}</Link>
            <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1 text-[#c8a870] font-semibold">
              <ShieldCheck className="h-3 w-3" />
              <span>{lang === "fr" ? "Portail Admin" : "Admin Portal"}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

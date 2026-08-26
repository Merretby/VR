import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Sparkles, Menu, X, Phone, Mail, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useDict, useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AppHeader() {
  const d = useDict();
  const { lang } = useI18n();
  const [spaceOpen, setSpaceOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSpaceOpen, setMobileSpaceOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setMobileSpaceOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-[100] w-full bg-[#f6f3ed] dark:bg-background border-b border-border/50 shadow-xs transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 py-2.5 sm:py-3 px-3 sm:px-6 lg:px-8">
          
          {/* Brand Logo */}
          {/* Brand Logo */}
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="relative overflow-hidden rounded-lg border border-border/70 bg-card p-0.5 shadow-xs transition-transform duration-200 group-hover:scale-105">
              <img
                src="/logo.jpg"
                alt="POKIBOIS"
                className="h-7 w-7 sm:h-7.5 sm:w-7.5 rounded-md object-cover"
              />
            </div>
            <div>
              <span className="font-sans text-[12px] sm:text-[13px] font-extrabold tracking-widest uppercase text-[#0C2D3B] dark:text-[#f0f6f8] block leading-none">
                POKIBOIS
              </span>
              {/* <span className="label-mono text-[7.5px] sm:text-[8.5px] text-[#5a7783] dark:text-[#8fa8b2] tracking-widest uppercase block mt-0.5">
                {d.header?.logoSubtitle ?? "ARCHITECTURE & DIGITAL"}
              </span> */}
            </div>
          </Link>

          {/* Center Pill Navigation Bar - Desktop only */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-border/70 bg-[#ece7de] dark:bg-muted/70 p-1.5 shadow-xs text-xs font-medium text-foreground whitespace-nowrap shrink-0">
            <Link
              to="/"
              activeProps={{ className: "bg-[#0c2d3b] text-white font-semibold shadow-xs" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-full px-4 py-2 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              {lang === "fr" ? "Accueil" : "Home"}
            </Link>

            <Link
              to="/projects"
              activeProps={{ className: "bg-[#0c2d3b] text-white font-semibold shadow-xs" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-full px-4 py-2 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              {lang === "fr" ? "Projets" : "Projects"}
            </Link>

            {/* Espace / Space Dropdown */}
            <div
              className="relative shrink-0"
              onMouseEnter={() => setSpaceOpen(true)}
              onMouseLeave={() => setSpaceOpen(false)}
            >
              <Link
                to="/space"
                activeProps={{ className: "bg-[#0c2d3b] text-white font-semibold shadow-xs" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>{lang === "fr" ? "Espace" : "Space"}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${spaceOpen ? "rotate-180 text-foreground" : ""}`} />
              </Link>

              {spaceOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-border/80 bg-background/95 p-2 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/renovation"
                    onClick={() => setSpaceOpen(false)}
                    activeProps={{ className: "bg-muted font-semibold text-foreground" }}
                    inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-muted/60" }}
                    className="flex flex-col gap-0.5 rounded-xl p-2.5 transition-colors"
                  >
                    <span className="text-xs font-medium">{lang === "fr" ? "Rénovation & Transformation" : "Renovation & Transformation"}</span>
                    <span className="text-[10px] text-muted-foreground">Architecture, structure & réhabilitation</span>
                  </Link>
                  <Link
                    to="/fitout"
                    onClick={() => setSpaceOpen(false)}
                    activeProps={{ className: "bg-muted font-semibold text-foreground" }}
                    inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-muted/60" }}
                    className="flex flex-col gap-0.5 rounded-xl p-2.5 transition-colors mt-1"
                  >
                    <span className="text-xs font-medium">{lang === "fr" ? "Aménagement & Sur-mesure" : "Fit-out & Custom-made"}</span>
                    <span className="text-[10px] text-muted-foreground">Agencement, menuiserie & mobilier</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/digital"
              activeProps={{ className: "bg-[#0c2d3b] text-white font-semibold shadow-xs" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-full px-4 py-2 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              Digital & Immersion
            </Link>

            <Link
              to="/packages"
              activeProps={{ className: "bg-[#0c2d3b] text-white font-semibold shadow-xs" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-full px-4 py-2 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              {lang === "fr" ? "Formules" : "Packages"}
            </Link>

            <Link
              to="/method"
              activeProps={{ className: "bg-[#0c2d3b] text-white font-semibold shadow-xs" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-full px-4 py-2 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              {lang === "fr" ? "Méthode" : "Method"}
            </Link>

            <Link
              to="/healthcare"
              activeProps={{ className: "bg-[#0c2d3b] text-white font-semibold shadow-xs" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-full px-4 py-2 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              {lang === "fr" ? "Professionnels de santé" : "Healthcare Professionals"}
            </Link>
          </nav>

          {/* Right Section: Language Switcher, Desktop CTA & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher />

            {/* Desktop CTA */}
            <Link
              to="/contact"
              className="hidden sm:inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#0c2d3b] px-4 lg:px-5 py-2 sm:py-2.5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-[#13394a] active:scale-95 shrink-0 whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#c8a870] animate-pulse" />
              <span>{lang === "fr" ? "Parlons de votre projet" : "Contact us"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-full bg-[#ece7de] dark:bg-muted text-foreground border border-border/80 shadow-xs transition-colors hover:bg-muted active:scale-95 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4 text-foreground" />
              ) : (
                <Menu className="h-4 w-4 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Navigation Modal Drawer - Rendered outside header to guarantee 100% viewport coverage */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[54px] sm:top-[61px] bottom-0 z-[9999] bg-[#f6f3ed] dark:bg-background lg:hidden flex flex-col justify-between p-5 overflow-y-auto border-t border-border shadow-2xl">
          <div className="space-y-2 py-2">
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center justify-between p-3.5 rounded-2xl text-base font-bold text-foreground hover:bg-muted/70 transition-colors"
            >
              <span>{lang === "fr" ? "Accueil" : "Home"}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              to="/projects"
              onClick={closeMenu}
              className="flex items-center justify-between p-3.5 rounded-2xl text-base font-bold text-foreground hover:bg-muted/70 transition-colors"
            >
              <span>{lang === "fr" ? "Nos Projets" : "Projects"}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            {/* Espace Accordion */}
            <div className="rounded-2xl border border-border/60 bg-muted/40 overflow-hidden">
              <div
                onClick={() => setMobileSpaceOpen(!mobileSpaceOpen)}
                className="flex items-center justify-between p-3.5 cursor-pointer text-base font-bold text-foreground"
              >
                <span>{lang === "fr" ? "Espace & Architecture" : "Space & Architecture"}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${mobileSpaceOpen ? "rotate-180" : ""}`} />
              </div>

              {mobileSpaceOpen && (
                <div className="px-3 pb-3 space-y-1.5 border-t border-border/40 pt-2 bg-background/60">
                  <Link
                    to="/space"
                    onClick={closeMenu}
                    className="block p-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    {lang === "fr" ? "Vue d'ensemble Espace" : "Space Overview"}
                  </Link>
                  <Link
                    to="/renovation"
                    onClick={closeMenu}
                    className="block p-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    {lang === "fr" ? "01 — Rénovation & Transformation" : "01 — Renovation & Transformation"}
                  </Link>
                  <Link
                    to="/fitout"
                    onClick={closeMenu}
                    className="block p-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    {lang === "fr" ? "02 — Aménagement & Sur-mesure" : "02 — Fit-out & Custom-made"}
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/digital"
              onClick={closeMenu}
              className="flex items-center justify-between p-3.5 rounded-2xl text-base font-bold text-foreground hover:bg-muted/70 transition-colors"
            >
              <span>Digital & Immersion</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              to="/packages"
              onClick={closeMenu}
              className="flex items-center justify-between p-3.5 rounded-2xl text-base font-bold text-foreground hover:bg-muted/70 transition-colors"
            >
              <span>{lang === "fr" ? "Nos Formules" : "Our Packages"}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              to="/method"
              onClick={closeMenu}
              className="flex items-center justify-between p-3.5 rounded-2xl text-base font-bold text-foreground hover:bg-muted/70 transition-colors"
            >
              <span>{lang === "fr" ? "Notre Méthode" : "Our Method"}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              to="/healthcare"
              onClick={closeMenu}
              className="flex items-center justify-between p-3.5 rounded-2xl text-base font-bold text-foreground hover:bg-muted/70 transition-colors"
            >
              <span>{lang === "fr" ? "Professionnels de santé" : "Healthcare Professionals"}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>

          {/* Bottom Drawer Actions */}
          <div className="pt-4 border-t border-border/60 space-y-3 mt-4">
            <Link
              to="/contact"
              onClick={closeMenu}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#0c2d3b] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-xl active:scale-98"
            >
              <Sparkles className="h-4 w-4 text-[#c8a870]" />
              <span>{lang === "fr" ? "Parlons de votre projet" : "Talk about my project"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1">
              <a href="tel:+33142685500" className="flex items-center gap-1.5 hover:text-foreground">
                <Phone className="h-3 w-3 text-[#0c2d3b]" />
                <span>+33 1 42 68 55 00</span>
              </a>
              <a href="mailto:contact@pokibois.fr" className="flex items-center gap-1.5 hover:text-foreground">
                <Mail className="h-3 w-3 text-[#0c2d3b]" />
                <span>contact@pokibois.fr</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

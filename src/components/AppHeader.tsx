import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import { useDict, useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AppHeader() {
  const d = useDict();
  const [spaceOpen, setSpaceOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full py-3 px-3 sm:px-6 bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative overflow-hidden rounded-xl border border-border bg-muted p-0.5 transition-transform duration-300 group-hover:scale-105">
            <img
              src="/logo.jpg"
              alt="POKIBOIS"
              className="h-9 w-9 rounded-lg object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <span className="font-serif text-lg font-bold tracking-tight text-foreground block leading-none">
              POKIBOIS
            </span>
            <span className="label-mono text-[9px] text-muted-foreground tracking-widest uppercase block mt-1">
              {d.header?.logoSubtitle ?? "ARCHITECTURE & DIGITAL"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Capsule - whitespace-nowrap prevents height jumps */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 rounded-full border border-border/80 bg-muted/60 p-1 shadow-xs backdrop-blur-md text-xs font-medium whitespace-nowrap shrink-0">
          <Link
            to="/"
            activeProps={{ className: "bg-foreground text-background font-semibold shadow-xs" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-background/50" }}
            className="rounded-full px-3 py-1.5 transition-all duration-200 whitespace-nowrap shrink-0"
          >
            {d.header?.home ?? "Accueil"}
          </Link>

          <Link
            to="/projects"
            activeProps={{ className: "bg-foreground text-background font-semibold shadow-xs" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-background/50" }}
            className="rounded-full px-3 py-1.5 transition-all duration-200 whitespace-nowrap shrink-0"
          >
            {d.header?.projects ?? "Projets"}
          </Link>

          {/* Espace Link + Dropdown */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setSpaceOpen(true)}
            onMouseLeave={() => setSpaceOpen(false)}
          >
            <Link
              to="/space"
              activeProps={{ className: "bg-foreground text-background font-semibold shadow-xs" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-background/50" }}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{d.header?.space ?? "Espace"}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${spaceOpen ? "rotate-180 text-foreground" : ""}`} />
            </Link>

            {spaceOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-border bg-background/95 p-2 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                <Link
                  to="/renovation"
                  onClick={() => setSpaceOpen(false)}
                  activeProps={{ className: "bg-muted font-semibold text-foreground" }}
                  inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-muted/60" }}
                  className="flex flex-col gap-0.5 rounded-xl p-2.5 transition-colors"
                >
                  <span className="text-xs font-medium">{d.header?.renovation ?? "Rénovation & Transformation"}</span>
                  <span className="text-[10px] text-muted-foreground">Architecture, structure & réhabilitation</span>
                </Link>
                <Link
                  to="/fitout"
                  onClick={() => setSpaceOpen(false)}
                  activeProps={{ className: "bg-muted font-semibold text-foreground" }}
                  inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-muted/60" }}
                  className="flex flex-col gap-0.5 rounded-xl p-2.5 transition-colors mt-1"
                >
                  <span className="text-xs font-medium">{d.header?.fitout ?? "Aménagement & Sur-mesure"}</span>
                  <span className="text-[10px] text-muted-foreground">Agencement, menuiserie & mobilier</span>
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/digital"
            activeProps={{ className: "bg-foreground text-background font-semibold shadow-xs" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-background/50" }}
            className="rounded-full px-3 py-1.5 transition-all duration-200 whitespace-nowrap shrink-0"
          >
            {d.header?.digital ?? "Digital"}
          </Link>

          <Link
            to="/packages"
            activeProps={{ className: "bg-foreground text-background font-semibold shadow-xs" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-background/50" }}
            className="rounded-full px-3 py-1.5 transition-all duration-200 whitespace-nowrap shrink-0"
          >
            {d.header?.packages ?? "Formules"}
          </Link>

          <Link
            to="/method"
            activeProps={{ className: "bg-foreground text-background font-semibold shadow-xs" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-background/50" }}
            className="rounded-full px-3 py-1.5 transition-all duration-200 whitespace-nowrap shrink-0"
          >
            {d.header?.method ?? "Méthode"}
          </Link>

          <Link
            to="/healthcare"
            activeProps={{ className: "bg-foreground text-background font-semibold shadow-xs" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-background/50" }}
            className="rounded-full px-3 py-1.5 transition-all duration-200 whitespace-nowrap shrink-0"
          >
            {d.header?.healthcare ?? "Santé"}
          </Link>
        </nav>

        {/* Right Section: Language Switcher & CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LanguageSwitcher />

          <Link
            to="/contact"
            className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-foreground px-4 sm:px-5 py-2 text-xs font-semibold text-background shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-foreground/90 active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">{d.header?.contact ?? "Parlons de votre projet"}</span>
            <span className="sm:hidden">Projet</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex lg:hidden overflow-x-auto gap-1.5 py-2 px-1 text-xs scrollbar-none border-t border-border/30 mt-2 whitespace-nowrap">
        <Link to="/" className="shrink-0 px-3 py-1 rounded-full bg-muted/80 text-foreground font-medium">Accueil</Link>
        <Link to="/projects" className="shrink-0 px-3 py-1 rounded-full text-muted-foreground">Projets</Link>
        <Link to="/renovation" className="shrink-0 px-3 py-1 rounded-full text-muted-foreground">Rénovation</Link>
        <Link to="/fitout" className="shrink-0 px-3 py-1 rounded-full text-muted-foreground">Sur-mesure</Link>
        <Link to="/digital" className="shrink-0 px-3 py-1 rounded-full text-muted-foreground">Digital</Link>
        <Link to="/packages" className="shrink-0 px-3 py-1 rounded-full text-muted-foreground">Formules</Link>
        <Link to="/method" className="shrink-0 px-3 py-1 rounded-full text-muted-foreground">Méthode</Link>
        <Link to="/healthcare" className="shrink-0 px-3 py-1 rounded-full text-muted-foreground">Santé</Link>
      </div>
    </header>
  );
}

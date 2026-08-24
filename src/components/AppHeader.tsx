import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import logo from "@/assets/logo.jpg";
import { Sparkles, Info, Compass, Layers, Palette, Mail, Camera, Menu, X } from "lucide-react";
import { useDict } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function AppHeader({ current }: { current?: string }) {
  const location = useLocation();
  const d = useDict();
  const activePath = current ?? location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: d.header.home, icon: Sparkles },
    { to: "/vr", label: d.header.realisations, icon: Compass },
    { to: "/plan", label: d.header.solutions, icon: Layers },
    { to: "/studio", label: d.header.designService, icon: Palette },
    { to: "/about", label: d.header.about, icon: Info },
    { to: "/contact", label: d.header.contact, icon: Mail },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full py-3 px-4 sm:px-6 transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border border-border/80 bg-background/90 px-4 py-2.5 shadow-sm backdrop-blur-md">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="relative overflow-hidden rounded-xl border border-border/80 shadow-xs transition-transform group-hover:scale-105">
            <img
              src={logo}
              alt="Pokibois"
              className="h-8 w-8 object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Pokibois
            </span>
          </div>
        </Link>

        {/* Center Floating Capsule Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-0.5 rounded-full bg-secondary/60 p-1 border border-border/60">
          {navItems.map((item) => {
            const isActive = activePath === item.to || (item.to !== "/" && activePath.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Action Area */}
        <div className="hidden lg:flex items-center gap-2">
          <LanguageSwitcher />

          <Link
            to="/capture"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md shrink-0"
          >
            <Camera className="h-4 w-4" />
            <span>{d.header.captureMyRoom}</span>
          </Link>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex lg:hidden items-center gap-2">
          <LanguageSwitcher />

          <Link
            to="/capture"
            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs"
          >
            <Camera className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold">Capture</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground border border-border/80 shadow-xs focus:outline-none active:scale-95 transition-transform"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 mx-auto max-w-7xl rounded-3xl border border-border/80 bg-background/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activePath === item.to || (item.to !== "/" && activePath.startsWith(item.to));
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-1 border-t border-border/60">
              <Link
                to="/capture"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-bold text-accent-foreground shadow-md"
              >
                <Camera className="h-4 w-4" />
                <span>{d.header.captureMyRoom}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

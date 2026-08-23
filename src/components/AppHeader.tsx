import { Link, useLocation } from "@tanstack/react-router";
import logo from "@/assets/logo.jpg";
import { Sparkles, Layers, Camera } from "lucide-react";
import { useDict } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function AppHeader({ current }: { current?: string }) {
  const location = useLocation();
  const d = useDict();
  const activePath = current ?? location.pathname;

  const navItems = [
    { to: "/", label: d.header.home, icon: Sparkles },
    { to: "/plan", label: d.header.floorPlan, icon: Layers },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full py-3 px-4 sm:px-6 transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-border/80 bg-background/85 px-4 py-2.5 shadow-sm backdrop-blur-md">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="relative overflow-hidden rounded-xl border border-border/80 shadow-xs transition-transform group-hover:scale-105">
            <img
              src={logo}
              alt="Roomcast Studio"
              className="h-8 w-8 object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Roomcast Studio
            </span>
          </div>
        </Link>

        {/* Center Floating Capsule Navigation */}
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-secondary/60 p-1 border border-border/60">
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

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {/* Capture My Room Button */}
          <Link
            to="/capture"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
          >
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">{d.header.captureMyRoom}</span>
          </Link>
        </div>

      </div>
    </header>
  );
}

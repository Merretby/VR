import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.jpg";

const steps = [
  { to: "/capture", label: "Capture" },
  { to: "/measurements", label: "Measure" },
  { to: "/plan", label: "Floor plan" },
  { to: "/studio", label: "3D Studio" },
] as const;

export function AppHeader({ current }: { current?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img
            src={logo}
            alt="Site Logo"
            className="h-8 w-8 rounded-lg object-cover border border-border/80 shadow-sm"
          />
          <span className="font-display text-sm font-semibold tracking-tight hidden sm:inline">
            Roomcast Studio
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
          {steps.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className={`rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap sm:px-3 sm:text-xs ${
                current === s.to
                  ? "bg-secondary text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

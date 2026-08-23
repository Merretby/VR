import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, d } = useI18n();

  return (
    <div
      role="group"
      aria-label={d.langSwitcher.label}
      className={`flex items-center rounded-full border border-border/80 bg-secondary/60 p-0.5 ${className ?? ""}`}
    >
      {(["en", "fr"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase transition-all ${
            lang === code
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {d.langSwitcher[code]}
        </button>
      ))}
    </div>
  );
}

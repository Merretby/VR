import { useI18n } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/80 p-1 shadow-xs backdrop-blur-md text-xs font-mono">
      <Globe className="h-3.5 w-3.5 text-muted-foreground ml-1.5 hidden sm:inline" />
      <button
        onClick={() => setLang("fr")}
        className={`rounded-full px-2.5 py-1 transition-all duration-200 cursor-pointer font-bold ${
          lang === "fr"
            ? "bg-foreground text-background shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Passer en français"
        aria-label="Passer en français"
      >
        FR
      </button>
      <button
        onClick={() => setLang("en")}
        className={`rounded-full px-2.5 py-1 transition-all duration-200 cursor-pointer font-bold ${
          lang === "en"
            ? "bg-foreground text-background shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Switch to English"
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}

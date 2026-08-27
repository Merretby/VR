import { useI18n } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 shadow-inner backdrop-blur-md text-xs font-mono text-white">
      <Globe className="h-3.5 w-3.5 text-white/70 ml-1.5 hidden sm:inline" />
      <button
        onClick={() => setLang("fr")}
        className={`rounded-full px-2.5 py-1 transition-all duration-200 cursor-pointer font-bold ${
          lang === "fr"
            ? "bg-[#c8a870] text-[#0C2D3B] shadow-xs"
            : "text-white/70 hover:text-white hover:bg-white/10"
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
            ? "bg-[#c8a870] text-[#0C2D3B] shadow-xs"
            : "text-white/70 hover:text-white hover:bg-white/10"
        }`}
        title="Switch to English"
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}

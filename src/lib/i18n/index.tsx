import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { en, format, LANG_STORAGE_KEY, type Dictionary, type Language } from "./en";
import { fr } from "./fr";

const DICTIONARIES: Record<Language, Dictionary> = { en, fr };

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  d: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLanguage(): Language | null {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    return stored === "en" || stored === "fr" ? stored : null;
  } catch {
    return null;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Start with "en" so SSR markup and first client render match; the stored
  // preference is applied right after hydration.
  const [lang, setLangState] = useState<Language>("fr");

  useEffect(() => {
    const stored = readStoredLanguage();
    if (stored && stored !== lang) setLangState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "fr";
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode) — keep in-memory only
    }
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang, d: DICTIONARIES[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}

/** Convenience hook returning only the active dictionary. */
export function useDict(): Dictionary {
  return useI18n().d;
}

export { format, type Dictionary, type Language };

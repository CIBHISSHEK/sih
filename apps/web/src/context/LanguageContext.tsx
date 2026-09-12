import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LandingLang } from "../pages/landingCopy";
import { TRANSLATIONS, type AppTranslations } from "../i18n/translations";

interface LanguageContextValue {
  lang: LandingLang;
  setLang: (lang: LandingLang) => void;
  t: AppTranslations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): LandingLang {
  try {
    const saved = localStorage.getItem("preferredLanguage");
    if (saved === "hi" || saved === "ta" || saved === "te" || saved === "en") return saved;
  } catch {
    // localStorage unavailable — fall through to default
  }
  return "en";
}

// Global, persisted, and reactive: set once (landing page, or the language
// picker on the register/farmer screens) and every farmer-facing screen
// re-renders in that language immediately — including after login, which is
// the part that was missing before (registration alone isn't enough, since
// returning farmers skip straight to /farmer).
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LandingLang>(readStoredLang);

  useEffect(() => {
    try {
      localStorage.setItem("preferredLanguage", lang);
    } catch {
      // non-critical
    }
  }, [lang]);

  // Pick up an external change to localStorage (e.g. another tab, or the
  // landing page setting it before this provider's first mount in a fresh
  // navigation) so the language a farmer picked always wins on next render.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "preferredLanguage" && e.newValue) {
        const v = e.newValue;
        if (v === "hi" || v === "ta" || v === "te" || v === "en") setLangState(v);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang: setLangState, t: TRANSLATIONS[lang] }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

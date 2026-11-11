"use client";

import * as React from "react";
import { LANGS, type Lang } from "./content";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = React.createContext<LangContextValue>({ lang: "node", setLang: () => {} });

/** The language chosen in any code panel — every other panel, install line and SDK row follows. */
export function useLang() {
  return React.useContext(LangContext);
}

const KEY = "relay-docs-lang";

/** Holds the selected language above the locale switch and remembers it for this browser. */
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("node");

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved && (LANGS as readonly string[]).includes(saved)) setLangState(saved as Lang);
    } catch {
      /* storage blocked: keep the default */
    }
  }, []);

  const setLang = React.useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* storage blocked */
    }
  }, []);

  const value = React.useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

"use client";

import * as React from "react";
import { PageTransition, startPageTransition } from "@vamos-ui/react/motion";

export type SiteLocale = "en" | "tr";

/** `?lang=tr` → "tr"; anything else → "en". */
function readLocale(): SiteLocale {
  return new URLSearchParams(window.location.search).get("lang") === "tr" ? "tr" : "en";
}

/**
 * Demo-only locale switch. Both language versions are rendered on the server (the blocks stay
 * server components); this island shows one and swaps on the navbar's EN/TR links without a
 * reload. In a real site, route per locale (`/en/…`, `/tr/…`) and render one version.
 */
export function LocaleSwitch({ en, tr }: { en: React.ReactNode; tr: React.ReactNode }) {
  const [locale, setLocale] = React.useState<SiteLocale>("en");

  React.useEffect(() => {
    setLocale(readLocale());
    const onPop = () => setLocale(readLocale());
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[hreflang]");
      const href = a?.getAttribute("href");
      if (!href?.startsWith("?lang=")) return;
      e.preventDefault();
      window.history.pushState(null, "", href);
      startPageTransition(() => setLocale(readLocale()), { scope: document.querySelector<HTMLElement>(".ag-site") });
      // The mobile menu is a native popover: close it after switching.
      document.querySelectorAll<HTMLElement>("[popover]").forEach((p) => {
        try { p.hidePopover(); } catch { /* not open */ }
      });
    };
    window.addEventListener("popstate", onPop);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <PageTransition pageKey={locale} lang={locale}>
      {locale === "tr" ? tr : en}
    </PageTransition>
  );
}

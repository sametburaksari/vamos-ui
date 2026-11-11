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
 * reload (a page transition, at the given motion level). In a real site, route per locale (`/en/…`, `/tr/…`) and render one version.
 */
export function LocaleSwitch({ en, tr, motion = "subtle" }: { en: React.ReactNode; tr: React.ReactNode; motion?: "full" | "subtle" | "off" }) {
  const [locale, setLocale] = React.useState<SiteLocale>("en");
  const scope = React.useRef<HTMLDivElement>(null);

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
      // The language switch cross-fades the page (View Transition), with a CSS fade fallback.
      startPageTransition(() => setLocale(readLocale()), { scope: scope.current });
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
    <div ref={scope} lang={locale} data-motion={motion}>
      <PageTransition pageKey={locale}>{locale === "tr" ? tr : en}</PageTransition>
    </div>
  );
}

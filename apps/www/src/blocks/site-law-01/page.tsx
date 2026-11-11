import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { LawSite, lawPages } from "./components/law-site";
import type * as React from "react";
import { LawType } from "./components/law-type";
import { lawMotion, lawMotionTokens } from "./components/motion";

/**
 * Business law firm, eight pages: home (sober split hero, the practice-area index with large
 * serif numerals and a live preview, approach, partners with bar admissions, insights, contact
 * with office hours), one page per practice area (`?page=practice-disputes`) and the team.
 * Corporate serif pairing, deep green accent on warm paper, solid, comfortable.
 *
 * Motion (subtle, retuned slower with shorter travel — a firm that does not hurry): the hero
 * settles in, section titles are set word by word, practice rows are laid down one after another
 * and the preview cross-fades between practices; partners, insights and the approach steps come
 * in calmly; links nudge their arrows.
 */
export default function SiteLaw01() {
  return (
    <SiteShell
      accent="#14532D"
      material="solid"
      density="comfortable"
      motion="subtle"
      style={lawMotionTokens as React.CSSProperties}
      pages={lawPages}
      className="min-h-dvh bg-[color-mix(in_oklch,var(--surface)_92%,var(--warning))] [--scene:color-mix(in_oklch,var(--surface)_92%,var(--warning))]"
    >
      <style>{lawMotion}</style>
      <LawType>
        <SiteShellLocale code="en">
          <LocaleProvider locale="en-GB">
            <LawSite locale="en" />
          </LocaleProvider>
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <LocaleProvider locale="tr-TR" messages={tr}>
            <LawSite locale="tr" />
          </LocaleProvider>
        </SiteShellLocale>
      </LawType>
    </SiteShell>
  );
}

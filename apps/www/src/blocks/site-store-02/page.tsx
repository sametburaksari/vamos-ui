import type * as React from "react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { DropProvider } from "./components/drop-provider";
import { StoreSite } from "./components/store-site";

/** Grotesk headings pushed to heavy, tight caps (tokens only). */
const heavyCaps = {
  "--display-weight": "800",
  "--display-tracking": "-0.03em",
  "--display-scale": "0.92",
} as React.CSSProperties;

/**
 * Streetwear store, three pages: home (drop ticker, the Drop 07 countdown as the hero with an
 * SMS/e-mail reminder and a calendar file, locked preview pieces with per-piece reminders, the
 * still-live Drop 06 in a dense grid with quick-add sizes and stock against the run, lookbook,
 * drop rules, FAQ), the archive (category / size / stock filters, sort) and a product page.
 * Signature: the live countdown — it ticks every second and unlocks the drop when it hits zero.
 * Dark, grotesk caps, solid, compact, one hot-pink accent.
 */
export default function SiteStore02() {
  return (
    <SiteShell accent="#FF2E88" theme="dark" font="grotesk" material="solid" density="compact" pages={["home", "archive", "product"]} className="min-h-dvh bg-scene [--container:var(--container-wide)] [&_[data-slot=image]]:my-0!" style={heavyCaps}>
      <DropProvider>
        <SiteShellLocale code="en">
          <StoreSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <StoreSite locale="tr" />
        </SiteShellLocale>
      </DropProvider>
    </SiteShell>
  );
}

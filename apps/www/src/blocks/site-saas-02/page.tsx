import type * as React from "react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { SaasSite } from "./components/saas-site";

/**
 * Corporate pairing with a twist: IBM Plex Sans for text, Plex Mono for display headings —
 * the site reads like the product's own query editor. Tokens only.
 */
const monoDisplay = {
  "--font-heading": "var(--ff-plex-mono, ui-monospace)",
  "--display-weight": "500",
  "--display-tracking": "-0.045em",
  "--display-scale": "0.78",
} as React.CSSProperties;

/**
 * Data / BI product site, three pages: home (live query console in the hero — metric, channel
 * and range change the chart, the headline numbers and the compiled SQL together — a 12-part
 * capability sheet, the metric layer, an alert feed, sourced figures, quotes, CTA), pricing
 * (plans, a seats × data-scanned estimator, full comparison, billing FAQ) and connectors
 * (filter by kind and status, search). Dark, solid, compact, one teal signal accent.
 */
export default function SiteSaas02() {
  return (
    <SiteShell accent="#2DD4BF" theme="dark" font="corporate" material="solid" density="compact" pages={["home", "pricing", "connectors"]} className="min-h-dvh bg-scene [--container:var(--container-wide)]" style={monoDisplay}>
      <SiteShellLocale code="en">
        <SaasSite locale="en" />
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <SaasSite locale="tr" />
      </SiteShellLocale>
    </SiteShell>
  );
}

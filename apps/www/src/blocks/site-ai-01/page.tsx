import { Toaster } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { createFontPairing, FontProvider } from "@vamos-ui/react/fonts";
import { AiSite } from "./components/ai-site";
import { ACCENT } from "./components/content";

/** A wide display grotesk for headlines, a neutral grotesk for text, a quiet mono for labels. */
const quillType = createFontPairing({ id: "quill", label: "Quill", heading: "Funnel Display", body: "Host Grotesk", mono: "Geist Mono", display: { weight: 600, tracking: "-0.035em", scale: 0.84 } });

/**
 * AI writing assistant, three pages: home (headline, the typing demo, before/after use cases,
 * integrations, security teaser, FAQ, CTA band), pricing (`?page=pricing`: plans with a
 * monthly/yearly switch, comparison, billing FAQ) and security (`?page=security`: data flow,
 * retention table, admin policy file, subprocessors, disclosure).
 * Signature: the scripted typing demo — pick a situation and tone, the rewrite types itself
 * out and lists what changed. Dark by default, coral accent, glass, display grotesk. EN / TR.
 */
export default function SiteAi01() {
  return (
    <SiteShell accent={ACCENT} theme="dark" material="glass" density="comfortable" pages={["home", "pricing", "security"]} className="min-h-dvh bg-scene">
      <FontProvider pairing={quillType}>
        <SiteShellLocale code="en">
          <AiSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <AiSite locale="tr" />
        </SiteShellLocale>
      </FontProvider>
      <Toaster />
    </SiteShell>
  );
}

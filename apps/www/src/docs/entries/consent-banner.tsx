import { ex, type DocEntry } from "../types";
import Demo from "../examples/consent-banner/demo";
import Box from "../examples/consent-banner/box";
import Preferences from "../examples/consent-banner/preferences";
import ConsentMode from "../examples/consent-banner/consent-mode";
import GateEmbed from "../examples/consent-banner/gate-embed";

const entry: DocEntry = {
  slug: "consent-banner",
  title: "Cookie / consent banner",
  group: "Site blocks",
  description:
    "Cookie consent for GDPR / ePrivacy and Turkey's KVKK, wired to Google Consent Mode v2. Not a modal: a labelled region that never blocks the page or steals focus, with “Reject all” and “Accept all” at equal size and weight on the first layer. Preferences open in a Dialog with one Switch per category, none pre-checked. Choices live in a first-party vb_consent cookie (6 months, versioned); getConsent / onConsent let other code wait for a category, and ConsentGate keeps maps and videos behind a facade. Without JS nothing renders and no non-essential cookie is set. Default texts are neutral templates — review them with counsel.",
  source: ["blocks/site/consent-banner.tsx", "blocks/site/shared/consent-island.tsx", "blocks/site/shared/consent.ts", "blocks/site/shared/consent-gate.tsx", "blocks/site/registry-2.ts", "styles/blocks.css"],
  basedOn: "Dialog + Switch",
  usage: `import { ConsentBanner, consentDefaultsScript, onConsent } from "@vamos-cms/ui/blocks";

// app/layout.tsx
<head><script dangerouslySetInnerHTML={{ __html: consentDefaultsScript({ version: 2 }) }} /></head>
<body>
  {children}
  <ConsentBanner version={2} policyLink={{ href: "/cookies" }} />
</body>

// anywhere on the client
onConsent("analytics", () => loadAnalytics());`,
  demo: ex("demo", "Bar", "consent-banner/demo.tsx", Demo),
  examples: [
    ex("box", "Box (Turkish)", "consent-banner/box.tsx", Box, "A 360px panel for the bottom-start corner, buttons stacked; zorunlu / işlevsel / analitik / pazarlama."),
    ex("preferences", "Preferences", "consent-banner/preferences.tsx", Preferences, "Open “Preferences”: Switches with descriptions, Necessary locked on, Reject / Accept / Save."),
    ex("consent-mode", "Google Consent Mode v2", "consent-banner/consent-mode.tsx", ConsentMode, "The head snippet sets everything to denied, then replays a stored choice before any Google tag loads. Each choice calls gtag('consent','update')."),
    ex("gate-embed", "ConsentGate for maps and video", "consent-banner/gate-embed.tsx", GateEmbed, "A static preview with one button; the iframe loads on click, or automatically once the category is granted. “Always load maps” grants functional for the site."),
  ],
  api: [
    {
      name: "ConsentBanner",
      props: [
        { name: "variant", type: '"bar" | "box"', default: '"bar"', description: "Bottom strip, or a corner panel." },
        { name: "text", type: "ReactNode | RichDoc", default: "neutral template", description: "The notice; rich text may contain links." },
        { name: "policyLink", type: "{ href; label? }", description: "Cookie policy link." },
        { name: "categories", type: '("necessary" | "functional" | "analytics" | "marketing")[]', default: "all four", description: "Necessary is always on." },
        { name: "version", type: "number", default: "1", description: "Bump when text or categories change: visitors are asked again." },
        { name: "position", type: '"bottom" | "bottom-start"', description: "Default bottom (bar) / bottom-start (box)." },
        { name: "regionMode", type: '"opt-in" | "notice"', default: '"opt-in"', description: "opt-in for GDPR/KVKK; notice only where the law allows." },
        { name: "contained / forceShow / defaultPreferencesOpen", type: "boolean", description: "Previews and builder canvases." },
        { name: "labels / locale", type: "Partial<Site2Labels> / string", description: "All banner and dialog strings (site2LabelsTr)." },
      ],
    },
    {
      name: "Consent helpers",
      props: [
        { name: "getConsent(category, version?)", type: "boolean", description: "Is the category granted now?" },
        { name: "onConsent(category, fn)", type: "() => void", description: "Runs fn once the category is granted (now or later). Returns unsubscribe." },
        { name: "writeConsent / readConsent / parseConsent(cookieHeader)", type: "functions", description: "The vb_consent record; parseConsent also works on the server." },
        { name: "openConsentPreferences()", type: "void", description: "Reopens the dialog (Footer's “Cookie settings” uses ConsentSettingsButton)." },
        { name: "consentDefaultsScript(opts) / <ConsentDefaults />", type: "string / element", description: "Consent Mode v2 defaults for <head>." },
      ],
    },
    {
      name: "ConsentGate",
      props: [
        { name: "src / title", type: "string", description: "Iframe URL and its accessible title." },
        { name: "category", type: "ConsentCategory", default: '"functional"', description: "Granted category that loads it automatically." },
        { name: "loadLabel / notice / rememberLabel", type: "string / ReactNode / string", description: "Button, provider notice, optional “always load” checkbox." },
        { name: "aspect / allow / defaultLoaded", type: "string / string / boolean", description: "Frame ratio, iframe allow list, load at once." },
        { name: "children", type: "ReactNode", description: "Static preview (decorative)." },
      ],
    },
  ],
  covers: ["Cookie / consent banner"],
};

export default entry;

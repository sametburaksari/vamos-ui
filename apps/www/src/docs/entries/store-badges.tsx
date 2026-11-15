import { ex, type DocEntry } from "../types";
import StoreBadgesDemo from "../examples/store-badges/demo";
import StoreBadgesVariants from "../examples/store-badges/variants";

const entry: DocEntry = {
  slug: "store-badges",
  title: "Store badges",
  group: "Navigation",
  description:
    "Download links for App Store and Google Play drawn from tokens with a generic icon and plain text — no store artwork to license — plus any other store, and an optional QR code shown on wide screens so a desktop visitor can jump to their phone.",
  source: ["components/store-badges.tsx"],
  usage: `import { StoreBadges } from "@vamos-ui/react";

<StoreBadges appStore={links.ios} googlePlay={links.android} qr="https://example.com/get-the-app" />`,
  demo: ex("demo", "Demo", "store-badges/demo.tsx", StoreBadgesDemo),
  examples: [
    ex("variants", "Outline, large, more stores, labels", "store-badges/variants.tsx", StoreBadgesVariants, "variant=\"outline\" on busy backgrounds, size=\"lg\" for heroes, stores for any other download, labels for the wording."),
  ],
  api: [
    { name: "StoreBadges", props: [
      { name: "appStore / googlePlay", type: "string", description: "Store links; a badge appears for each one given." },
      { name: "stores", type: "{ href, lead, name, icon? }[]", description: "More badges after the two above." },
      { name: "qr", type: "boolean | string", description: "QR code beside the badges on wide screens: a URL (a link that redirects to the right store is best) or true for the first store link." },
      { name: "variant", type: '"solid" | "outline"', default: '"solid"', description: "Inverted pills or bordered on the surface." },
      { name: "size", type: '"md" | "lg"', default: '"md"', description: "Badge and QR size." },
      { name: "labels", type: "Partial<StoreBadgesLabels>", description: 'Dictionary namespace "storeBadges": label, appStoreLead, appStoreName, googlePlayLead, googlePlayName, qr, qrCaption.' },
    ] },
  ],
  notes: [
    "Each badge is a plain link whose name is its visible text (\"Get it on Google Play\"); the list is named \"Get the app\".",
    "The stores' own badge artwork has usage rules. If your brand guidelines require it, replace the badges with the official files; this component never ships them.",
    "The QR code is hidden below the lg breakpoint, where the visitor is most likely already on a phone.",
  ],
  covers: [],
};

export default entry;

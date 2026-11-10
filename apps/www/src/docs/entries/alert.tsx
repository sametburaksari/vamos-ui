import { ex, type DocEntry } from "../types";
import AlertDemo from "../examples/alert/demo";
import AlertVariants from "../examples/alert/variants";
import AlertWithActions from "../examples/alert/with-actions";
import AlertBanner from "../examples/alert/banner";
import AlertFormError from "../examples/alert/form-error";

const entry: DocEntry = {
  slug: "alert",
  title: "Alert",
  group: "Overlays & feedback",
  description:
    "A persistent inline status message in a page, card or form: an unsaved revision, a missing tax ID, a filing deadline, a subscription banner. Six tones, three variants, optional actions and dismiss. Server-compatible.",
  source: ["components/alert.tsx"],
  usage: `import { Alert, Button } from "@vamos-ui/react";

<Alert tone="warning" title="Payroll filing due in 3 days" actions={<Button size="xs">Review</Button>}>
  Submit the November declaration before Dec 26.
</Alert>`,
  demo: ex("demo", "Tones", "alert/demo.tsx", AlertDemo),
  examples: [
    ex("variants", "Variants and sizes", "alert/variants.tsx", AlertVariants, "soft (default), outline, sm, and icon={false}."),
    ex("with-actions", "Actions and dismiss (CMS)", "alert/with-actions.tsx", AlertWithActions, "actions sit under the text; onDismiss adds a localized close button."),
    ex("banner", "Subscription banner", "alert/banner.tsx", AlertBanner, 'variant="banner": full width, no radius — under the top bar or at the top of a card.'),
    ex("form-error", "Form submit error", "alert/form-error.tsx", AlertFormError, 'An alert inserted after submit uses live="assertive" (role="alert") so it is announced.'),
  ],
  api: [
    { name: "Alert", props: [
      { name: "tone", type: '"neutral" | "info" | "success" | "warning" | "danger" | "accent"', default: '"neutral"', description: "Icon, title and tint colour. Body text stays --fg for contrast." },
      { name: "variant", type: '"soft" | "outline" | "banner"', default: '"soft"', description: "Tinted card, hairline only, or a full-width strip." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Padding, text and icon size." },
      { name: "title", type: "ReactNode", description: "Bold first line in the tone colour." },
      { name: "children", type: "ReactNode", description: "The message." },
      { name: "icon", type: "ReactNode | false", description: "Custom icon or none. Each tone has a default." },
      { name: "actions", type: "ReactNode", description: "Buttons or links — below the text, inline for banners." },
      { name: "onDismiss", type: "() => void", description: "Adds a close button (client components only)." },
      { name: "dismissLabel", type: "string", default: '"Dismiss"', description: "Accessible name of the close button (dictionary alert.dismiss)." },
      { name: "live", type: '"polite" | "assertive"', description: "For alerts inserted at runtime: polite → role=\"status\", assertive → role=\"alert\". Leave unset for static messages." },
    ] },
    { name: "AlertTitle / AlertDescription / AlertActions", props: [
      { name: "className", type: "string", description: "Compose your own layout inside an Alert with these parts." },
    ] },
  ],
  covers: ["Alert"],
};

export default entry;

import { ex, type DocEntry } from "../types";
import ButtonDemo from "../examples/button/demo";
import ButtonVariants from "../examples/button/variants";
import ButtonSizes from "../examples/button/sizes";
import ButtonWithIcon from "../examples/button/with-icon";
import IconButtonDemo from "../examples/button/icon-button";
import ButtonLoading from "../examples/button/loading";
import ButtonAsLink from "../examples/button/as-link";
import ButtonPill from "../examples/button/pill";
import ButtonAsLinkDisabled from "../examples/button/as-link-disabled";

const entry: DocEntry = {
  slug: "button",
  title: "Button",
  group: "Foundations",
  description: "Triggers an action. Eight variants, nine sizes, a loading state that keeps the layout stable, and the option to render as another element (asChild).",
  source: ["components/button.tsx", "components/spinner.tsx"],
  basedOn: "Radix Slot",
  usage: `import { Button } from "@vamos-cms/ui";

<Button variant="primary">Publish</Button>`,
  demo: ex("demo", "Demo", "button/demo.tsx", ButtonDemo),
  examples: [
    ex("variants", "Variants", "button/variants.tsx", ButtonVariants, "Use one primary per screen; keep the rest secondary or ghost."),
    ex("sizes", "Sizes", "button/sizes.tsx", ButtonSizes, "The md height comes from the --control-h token, so it follows the density axis."),
    ex("with-icon", "With icon", "button/with-icon.tsx", ButtonWithIcon, "Put the icon before the label; it is sized from the button size."),
    ex("icon-button", "Icon Button", "button/icon-button.tsx", IconButtonDemo, "For icon-only buttons. The label prop is required."),
    ex("loading", "Loading", "button/loading.tsx", ButtonLoading, "loading locks the button and sets aria-busy. The spinner replaces a leading icon; loadingText is shown and announced; loadingMode=\"replace\" keeps the width."),
    ex("as-link", "As link", "button/as-link.tsx", ButtonAsLink, "With asChild the styles are kept and the rendered element is your <Link>."),
    ex("as-link-disabled", "Link while loading or disabled", "button/as-link-disabled.tsx", ButtonAsLinkDisabled, "asChild links get aria-disabled, leave the tab order and ignore pointer clicks."),
    ex("pill", "Pill", "button/pill.tsx", ButtonPill, "Fully rounded — for website CTAs."),
  ],
  api: [
    { name: "Button", props: [
      { name: "variant", type: '"primary" | "secondary" | "solid" | "soft" | "ghost" | "danger" | "danger-ghost" | "link"', default: '"secondary"', description: "Visual weight." },
      { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl" | "icon-xs" | "icon-sm" | "icon" | "icon-lg"', default: '"md"', description: "Height and padding. md follows --control-h; xl is for website CTAs." },
      { name: "loading", type: "boolean", default: "false", description: "Spinner + click lock + aria-busy (data-loading)." },
      { name: "loadingText", type: "string", description: "Shown and announced while loading, e.g. \"Saving…\"." },
      { name: "loadingMode", type: '"inline" | "replace"', default: '"inline"', description: "inline: spinner before the label (replaces a leading icon). replace: label hidden, width kept." },
      { name: "asChild", type: "boolean", default: "false", description: "Pass the styles to the single child element (e.g. Next Link)." },
      { name: "block", type: "boolean", default: "false", description: "Full width." },
      { name: "pill", type: "boolean", default: "false", description: "Fully rounded corners." },
      { name: "type", type: '"button" | "submit" | "reset"', default: '"button"', description: "No accidental form submits." },
    ] },
    { name: "IconButton", props: [
      { name: "label", type: "string", description: "Required. Used as aria-label and title (Tooltip once it ships)." },
      { name: "size", type: '"xs" | "sm" | "md" | "lg"', default: '"md"', description: "Square size: 28 / 32 / --control-h / 48 px." },
      { name: "loading", type: "boolean", default: "false", description: "Spinner in place of the icon; size unchanged." },
      { name: "variant", type: "Button variant", default: '"ghost"', description: "Same variants as Button." },
    ] },
  ],
  covers: ["Button", "Icon Button"],
};

export default entry;

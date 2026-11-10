import { ex, type DocEntry } from "../types";
import SpinnerDemo from "../examples/spinner/demo";
import SpinnerInline from "../examples/spinner/inline";
import SpinnerRefresh from "../examples/spinner/refresh";
import SpinnerInButton from "../examples/spinner/button";

const entry: DocEntry = {
  slug: "spinner",
  title: "Spinner",
  group: "Foundations",
  description:
    "An indeterminate loading indicator: a thin track with a rotating, breathing arc. Decorative by default, announced politely when it has a label, and a slow pulse under reduced motion.",
  source: ["components/spinner.tsx", "styles/base.css"],
  usage: `import { Spinner } from "@vamos-cms/ui";

<Spinner label="Loading orders" />`,
  demo: ex("demo", "Sizes & tones", "spinner/demo.tsx", SpinnerDemo),
  examples: [
    ex("inline", "Inline status", "spinner/inline.tsx", SpinnerInline, "Next to visible text the spinner stays decorative — the text already says what is happening."),
    ex("refresh", "Delayed refresh (billing)", "spinner/refresh.tsx", SpinnerRefresh, "delay hides the spinner for the first few hundred ms with CSS only, so fast responses never flash."),
    ex("button", "In buttons", "spinner/button.tsx", SpinnerInButton, "Button loading uses Spinner, replaces a leading icon and sets aria-busy."),
  ],
  api: [{ name: "Spinner", props: [
    { name: "size", type: '"xs" | "sm" | "md" | "lg" | number', default: '"sm"', description: "12 / 16 / 20 / 28 px, or any pixel size." },
    { name: "tone", type: '"current" | "accent" | "muted"', default: '"current"', description: "currentColor, accent ink, or muted text colour." },
    { name: "label", type: "string", description: 'Accessible status text. Present → role="status" + aria-live="polite"; absent → aria-hidden.' },
    { name: "delay", type: "number", description: "ms before the spinner becomes visible." },
    { name: "...props", type: "SVGAttributes", description: "Passed to the <svg>." },
  ] }],
  covers: ["Spinner"],
};

export default entry;

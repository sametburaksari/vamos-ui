import { ex, type DocEntry } from "../types";
import TypographyDemo from "../examples/typography/demo";
import TypographyText from "../examples/typography/text";
import TypographyProse from "../examples/typography/prose";
import TypographyNumeric from "../examples/typography/numeric";
import TypographyPageHeader from "../examples/typography/page-header";

const entry: DocEntry = {
  slug: "typography",
  title: "Typography",
  group: "Foundations",
  description:
    "One typographic language bound to the data-font axis: Heading (level and size decoupled), Text with sizes, tones and truncation, Lead, Code, Blockquote, Numeric, and Prose for rich content from the editor or CMS. Server-compatible.",
  source: ["components/typography.tsx", "styles/forms.css"],
  usage: `import { Heading, Text, Prose } from "@vamos-cms/ui";

<Heading level={1} size="display">Dinner, <em>slowly</em>.</Heading>
<Text tone="muted">Last edited 3 minutes ago.</Text>
<Prose html={post.bodyHtml} />`,
  demo: ex("demo", "Heading scale × font presets", "typography/demo.tsx", TypographyDemo),
  examples: [
    ex("text", "Text", "typography/text.tsx", TypographyText, "Four sizes, tones, weights; truncate for one line, truncate={n} for a line clamp. The full text goes into title."),
    ex("prose", "Prose (article)", "typography/prose.tsx", TypographyProse, "Raw editor output styled by tokens: headings in the preset face, lists, quote, code, a table in a focusable scroll region (ProseTable). Sits on a surface, not on the glass scene."),
    ex("numeric", "Numbers", "typography/numeric.tsx", TypographyNumeric, "Numeric lines figures up (tabular); signOf colours a change. Format with createFormatter / useFormat first."),
    ex("page-header", "Admin page header", "typography/page-header.tsx", TypographyPageHeader, "level={1} for the outline, size=\"xl\" for the look — headings never skip a level for visual reasons."),
  ],
  api: [
    {
      name: "Heading",
      props: [
        { name: "level", type: "1 | 2 | 3 | 4 | 5 | 6", default: "2", description: "Semantic level (<h1>…<h6>)." },
        { name: "size", type: '"display" | "xl" | "lg" | "md" | "sm"', default: "from level", description: "56 / 44 / 32 px × --display-scale, 22, 17 px. display and xl use the heading face." },
        { name: "asChild", type: "boolean", description: "Apply the styles to the child element." },
      ],
    },
    {
      name: "Text",
      props: [
        { name: "as", type: '"p" | "span" | "div" | "label" | "small" | "strong" | "figcaption"', default: '"p"', description: "Element." },
        { name: "size", type: '"xs" | "sm" | "md" | "lg"', default: '"md"', description: "12 / 13 / 14 / 16 px." },
        { name: "tone", type: '"default" | "muted" | "subtle" | "accent" | "danger" | "success" | "warning" | "inherit"', default: '"default"', description: "Colour from tokens." },
        { name: "weight", type: '"regular" | "medium" | "semibold"', description: "Font weight." },
        { name: "truncate", type: "boolean | number", description: "true = one line with ellipsis; n = clamp to n lines." },
        { name: "tabular", type: "boolean", description: "Tabular figures." },
        { name: "asChild", type: "boolean", description: "Apply the styles to the child element." },
      ],
    },
    {
      name: "Prose",
      props: [
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Base size 14 / 16 / 18 px; everything inside scales in em." },
        { name: "html", type: "string", description: "Raw HTML (sanitize on the server first)." },
        { name: "fullWidth", type: "boolean", description: "Remove the --measure (64ch) cap." },
        { name: "asChild", type: "boolean", description: "Style your own element (e.g. <article>)." },
      ],
    },
    {
      name: "ProseTable",
      props: [{ name: "label", type: "string", description: "Required. Names the keyboard-scrollable region around a wide table." }],
    },
    {
      name: "Lead · Code · Blockquote · Numeric",
      props: [
        { name: "Blockquote attribution", type: "ReactNode", description: "Rendered as the figcaption." },
        { name: "Numeric mono", type: "boolean", description: "Code font instead of tabular UI figures." },
        { name: "Numeric signOf", type: "number", description: "Negative → danger, positive → success." },
      ],
    },
  ],
  notes: [
    "Headings use text-wrap: balance, paragraphs pretty; Prose hyphenates by the lang attribute and sets <q> quotes per language.",
    "<em> inside display headings follows the preset: italic in serif presets (editorial), upright in sans presets.",
  ],
  covers: ["Typography"],
};

export default entry;

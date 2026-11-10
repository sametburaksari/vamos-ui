import { ex, type DocEntry } from "../types";
import BlocksApiDemo from "../examples/blocks-api/demo";
import BlocksApiJsonPage from "../examples/blocks-api/json-page";
import BlocksApiSectionTheme from "../examples/blocks-api/section-theme";
import BlocksApiLocalized from "../examples/blocks-api/localized";
import BlocksApiDefineBlock from "../examples/blocks-api/define-block";
import BlocksApiHeadingEmphasis from "../examples/blocks-api/heading-emphasis";
import BlocksApiRichText from "../examples/blocks-api/rich-text";
import BlocksApiLint from "../examples/blocks-api/lint";
import BlocksApiJsonSchema from "../examples/blocks-api/json-schema";

const entry: DocEntry = {
  slug: "blocks-api",
  title: "Blocks API",
  group: "Site blocks",
  description:
    "The contract under every site block, in three layers. Layer 1: server-rendered primitives (Section, Container, SectionHeader, BlockHeading, BlockImage, BlockLink, RichText, createBlocks) that work in any React site with plain props. Layer 2: one zod schema per block (f.* fields, Localized<T>, defineBlock, registry, migrations, lintPage) for CMSs, editors and AI tools. Layer 3: BlockRenderer turns a stored VamosDoc into the page.",
  source: [
    "blocks/section.tsx",
    "blocks/section-header.tsx",
    "blocks/block-heading.tsx",
    "blocks/block-image.tsx",
    "blocks/block-link.tsx",
    "blocks/rich-text.tsx",
    "blocks/create-blocks.tsx",
    "blocks/schema/fields.ts",
    "blocks/schema/define-block.ts",
    "blocks/schema/types.ts",
    "render/block-renderer.tsx",
    "render/prepare.ts",
    "styles/blocks.css",
  ],
  basedOn: "zod v4 (layer 2 only)",
  usage: `// Layer 1 — any React / Next.js site, plain props
import { Section, Container, SectionHeader, BlockImage, createBlocks } from "@vamos-ui/react/blocks";

<Section theme={{ mode: "dark" }} headingId="intro">
  <Container>
    <SectionHeader title="Dinner, *slowly*." headingLevel={1} headingId="intro" />
  </Container>
</Section>

// Bind Next.js once (no context needed in Server Components)
export const { BlockImage, BlockLink, RichText, bind } = createBlocks({ Image: NextImage, Link: NextLink });

// Layer 2 — define a block once for site, editor and AI tooling
import { z, f, defineBlock, createRegistry } from "@vamos-ui/react/blocks/schema";
const faqBlock = defineBlock({ type: "faq", version: 1, title: "FAQ", category: "content",
  schema: z.object({ title: f.heading(), items: f.list(f.group({ q: f.text(), a: f.rich() })) }), component: Faq });

// Layer 3 — render stored JSON
import { BlockRenderer } from "@vamos-ui/react/render";
<BlockRenderer doc={page} registry={createRegistry([faqBlock])} locale="tr" fallbackLocales={["en"]} />`,
  demo: ex("demo", "A page in plain JSX", "blocks-api/demo.tsx", BlocksApiDemo),
  examples: [
    ex("json-page", "The same page as JSON", "blocks-api/json-page.tsx", BlocksApiJsonPage, "A VamosDoc through the async BlockRenderer: migrate, validate (bad fields are salvaged, not blanked), localize, resolve queries, render. The first page-title block gets the h1 automatically."),
    ex("section-theme", "Section theming", "blocks-api/section-theme.tsx", BlocksApiSectionTheme, "theme maps to subtree axes: mode, surface (scene · surface · surface-2 · accent · media), accent (built-in or oklch), material, density, rhythm. Media surfaces are forced dark under a scrim; accent surfaces invert the primary action."),
    ex("localized", "Localized content (tr with en fallback)", "blocks-api/localized.tsx", BlocksApiLocalized, "Fields store \"text\" or { en, tr }. localize() picks locale → base language → fallbacks → first, so components only ever see plain strings. Kit strings come from blockLabelsTr."),
    ex("define-block", "Define a block", "blocks-api/define-block.tsx", BlocksApiDefineBlock, "One definition for site, editor inspector and JSON tooling. Components receive plain, validated, localized props plus headingLevel, theme, anchor and adapters."),
    ex("heading-emphasis", "Heading *emphasis* × font presets", "blocks-api/heading-emphasis.tsx", BlocksApiHeadingEmphasis, "One starred span becomes <em>: italic serif in editorial, accent ink in sans presets. The schema rejects a second one; \\* is a literal star."),
    ex("rich-text", "RichText (server renderer)", "blocks-api/rich-text.tsx", BlocksApiRichText, "Renders the RichDoc format: paragraphs, h2–h4, lists, quotes, code, rules; bold, italic, underline, strike, code, highlight, sub/sup and links. Unsafe links render as text; runs sharing a link share one <a>."),
    ex("lint", "lintPage", "blocks-api/lint.tsx", BlocksApiLint, "Warnings, not locks: duplicate ids, a second h1, long or stock-phrase headings, two primary actions, violet custom accents, card-heavy pages, and per-locale translation completeness."),
    ex("json-schema", "Registry as JSON Schema", "blocks-api/json-schema.tsx", BlocksApiJsonSchema, "registry.toJSONSchema() — a tool definition for AI page drafts or an external builder. Field metadata travels under the vamos key."),
  ],
  api: [
    { name: "Section", props: [
      { name: "theme", type: "BlockTheme", description: "{ mode, surface, accent, material, density, rhythm, background } — mapped onto class/data-* so tokens cascade into the subtree." },
      { name: "as", type: '"section" | "div" | "header" | "footer" | "aside" | "article" | "nav"', default: '"section"', description: "Landmark element." },
      { name: "anchor", type: "string", description: "id / URL anchor (#menu)." },
      { name: "headingId", type: "string", description: "Sets aria-labelledby so the section is a named region." },
      { name: "blockId / blockType", type: "string", description: "Emitted as data-block-id / data-block-type in edit mode." },
      { name: "editMode", type: "boolean", default: "false", description: "Builder canvas attributes." },
      { name: "priority", type: "boolean", default: "false", description: "Eager-load the media background (above the fold)." },
      { name: "components", type: "BlockAdapters", description: "{ Image, Link } for the media background." },
    ] },
    { name: "Container", props: [
      { name: "size", type: '"content" | "wide" | "prose" | "full"', default: '"content"', description: "76rem / 90rem / 42rem / edge to edge; fluid --gutter padding." },
    ] },
    { name: "SectionHeader", props: [
      { name: "eyebrow", type: "ReactNode", description: "Small mono line above the title." },
      { name: "index", type: "string", description: "Index before the eyebrow (\"01\")." },
      { name: "title", type: "ReactNode", description: "A string supports one *emphasis*." },
      { name: "lead", type: "ReactNode", description: "Intro paragraph, capped at 64ch." },
      { name: "actions", type: "ReactNode", description: "Links/buttons; one primary at most." },
      { name: "align", type: '"start" | "split" | "center"', default: '"start"', description: "split: title 5–6 cols beside lead 6 cols on wide containers. center only for statement heroes / minimal CTAs." },
      { name: "size", type: '"m" | "l"', default: '"m"', description: "display-m (section h2) or display-l." },
      { name: "headingLevel", type: "1 | 2 | 3", default: "2", description: "Outline level (the renderer passes 1 to the page's first intro)." },
      { name: "headingId", type: "string", description: "Id for the title — pass the same to Section headingId." },
      { name: "editMode", type: "boolean", default: "false", description: "data-field attributes and an \"Add a title\" placeholder." },
    ] },
    { name: "BlockHeading", props: [
      { name: "text", type: "ReactNode", description: "Copy; strings parse one *emphasis* (\\* = literal star)." },
      { name: "level", type: "1–6", default: "2", description: "Outline level." },
      { name: "size", type: '"display-2xl" | "display-xl" | "display-l" | "display-m" | "h3"', default: '"display-m"', description: "Fluid --text-* scale, multiplied by the preset's --display-scale." },
      { name: "editMode / field", type: "boolean / string", description: "Placeholder + data-field in edit mode." },
    ] },
    { name: "BlockImage", props: [
      { name: "src / alt / width / height", type: "string / string / number / number", description: "Intrinsic size prevents layout shift. alt is required unless decorative." },
      { name: "decorative", type: "boolean", default: "false", description: "Renders alt=\"\"." },
      { name: "aspect", type: '"1:1" | "4:5" | "3:4" | "4:3" | "3:2" | "2:3" | "16:9" | "21:9" | number', description: "Fixed-ratio crop (cover)." },
      { name: "focal", type: "{ x: number; y: number }", description: "0..1 focal point → object-position." },
      { name: "fit", type: '"cover" | "contain"', default: '"cover"', description: "object-fit." },
      { name: "blurDataURL", type: "string", description: "Placeholder painted under the image." },
      { name: "sizes", type: "string", description: "Responsive sizes hint." },
      { name: "priority", type: "boolean", default: "false", description: "Eager + fetchpriority=high for the LCP image." },
      { name: "caption", type: "ReactNode", description: "Wraps in figure + figcaption." },
      { name: "imgClassName", type: "string", description: "Classes for the <img> (className goes on the frame)." },
      { name: "components", type: "BlockAdapters", description: "Uses components.Image (Next Image gets fill when cropped)." },
    ] },
    { name: "BlockLink", props: [
      { name: "href", type: "string", description: "Sanitised: javascript:, data: and unknown schemes render as plain text." },
      { name: "newTab", type: "boolean", default: "false", description: "target=_blank, rel=noopener noreferrer and an announced \"(opens in a new tab)\"." },
      { name: "appearance", type: '"primary" | "secondary" | "link"', description: "CTA styles. Primary inverts on accent surfaces." },
      { name: "size", type: '"md" | "lg" | "xl"', default: '"lg"', description: "Button size when appearance is set." },
      { name: "components", type: "BlockAdapters", description: "Internal paths use components.Link; external, mailto and tel stay <a>." },
    ] },
    { name: "RichText", props: [
      { name: "doc", type: "RichDoc | RichBlock[] | RichInline[] | string", description: "Strings: blank line = paragraph, newline = <br>." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "14 / 16 / 18 px base." },
      { name: "headingOffset", type: "0 | 1 | 2", default: "0", description: "Shift stored h2 → h3 inside a block whose title is h2." },
      { name: "fullWidth", type: "boolean", default: "false", description: "Remove the 64ch measure." },
      { name: "components / labels / locale", type: "BlockAdapters / Partial<BlockLabels> / string", description: "Link adapter and the new-tab string." },
    ] },
    { name: "createBlocks(options)", props: [
      { name: "Image / Link", type: "VamosImageComponent / VamosLinkComponent", description: "Framework bindings (Next Image / Link are compatible)." },
      { name: "labels", type: "Partial<BlockLabels>", description: "e.g. blockLabelsTr." },
      { name: "locale", type: "string", description: "Default Intl locale." },
      { name: "→ returns", type: "{ Section, SectionHeader, BlockHeading, BlockImage, BlockLink, RichText, SkipLink, bind, adapters }", description: "bind(Component) injects components/labels/locale into any block." },
    ] },
    { name: "defineBlock(def)", props: [
      { name: "type / version", type: "string / number", description: "Kebab-case, never renamed. Every version below the current needs migrate[n] (v n → n+1)." },
      { name: "title / category / region / keywords / icon", type: "string / BlockCategory / BlockRegion / string[] / string", description: "Inserter metadata. region default \"body\"." },
      { name: "schema", type: "z.ZodObject", description: "Props, built from f.* fields." },
      { name: "variants / defaultVariant / variantMeta", type: "readonly string[] / string / Record", description: "Stored on node.variant." },
      { name: "fields / slots", type: "FieldHints / Record<string, SlotSpec>", description: "Inspector hints; child-block slots { allow, min, max }." },
      { name: "migrate", type: "Record<number, (props, node) => unknown>", description: "Runs on read; content is never dropped." },
      { name: "supports", type: "{ anchor, theme, spacing, align, pageTitle }", description: "pageTitle: the first such block gets h1." },
      { name: "preview / examples", type: "{ props, variant, image } / (variant, locale) => props", description: "Realistic sample content; also the salvage source for invalid fields." },
      { name: "jsonLd / lint", type: "(props, ctx) => object | null / (props, node) => issues", description: "Merged into one @graph; block-specific lint rules." },
      { name: "component", type: "ComponentType<BlockComponentProps<P>>", description: "The same component on the site and in the editor canvas." },
    ] },
    { name: "f.* fields", props: [
      { name: "f.heading({ max })", type: "Localized<string>", description: "One *emphasis*, no emoji." },
      { name: "f.text({ max, multiline, localized })", type: "Localized<string>", description: "localized: false stores a plain string." },
      { name: "f.rich({ nodes, marks })", type: "Localized<RichDoc>", description: "Allow-listed nodes and marks." },
      { name: "f.image({ aspect }) / f.link() / f.cta()", type: "ImageRef / LinkRef / { link, style }", description: "alt or decorative required; unsafe hrefs rejected." },
      { name: "f.list(item, { min, max, itemLabel }) / f.group(shape)", type: "T[] / object", description: "Repeaters and nested groups." },
      { name: "f.select / f.toggle / f.number / f.icon / f.date", type: "enum / boolean / number / lucide name / YYYY-MM-DD", description: "f.icon uses a 150-name allow-list." },
      { name: "f.money / f.phone / f.address / f.hours", type: "{ amount: decimal string, currency } / E.164 / AddressValue / OpeningHours", description: "Structural, never localized." },
      { name: "f.query(resource, { into }) / f.embed({ allow }) / f.social()", type: "QueryValue / EmbedValue / SocialLink[]", description: "Queries are resolved by BlockRenderer resolvers into the prop `into`." },
    ] },
    { name: "BlockRenderer / renderDoc", props: [
      { name: "doc", type: "VamosDoc", description: "Stored page; { v: 1 } is accepted as an alias of { version: 1 }." },
      { name: "registry", type: "BlockRegistry", description: "createRegistry([...]) — pick only the blocks a site uses." },
      { name: "locale / fallbackLocales", type: "string / string[]", description: "Default doc.lang ?? doc.locales[0]; fallback to the doc's other locales, then en." },
      { name: "components / labels", type: "BlockAdapters / Partial<BlockLabels>", description: "Passed to every block." },
      { name: "resolvers", type: "Record<string, (query, ctx) => data>", description: "BlockRenderer only; run in parallel. A failure leaves the block's empty state." },
      { name: "editMode", type: "boolean", default: "false", description: "Keeps hidden/scheduled blocks, wraps blocks in display:contents data-block-id, shows placeholders." },
      { name: "dev", type: "boolean", default: "not production", description: "Unknown/invalid notices; production skips unknown blocks silently." },
      { name: "regions / mainId / jsonLd", type: "BlockRegion[] / string / boolean", description: "Which layout regions, a <main id> skip target, merged JSON-LD (default on)." },
      { name: "onIssue / now", type: "(issue) => void / Date", description: "Logging hook; clock for schedules." },
    ] },
  ],
  notes: [
    "Formats are frozen in docs/plan/BLOCK-FORMAT.md (BlockNode, VamosDoc, RichDoc). Changing them requires a doc migration.",
    "zod stays on the server: components import only types from @vamos-ui/react/blocks/schema.",
    "Sections are container-query contexts: blocks lay out by their own width (@2xl, @4xl, @6xl), so the same block works full width, in a column or in a builder iframe.",
    "The blocks title component is BlockHeading (the panel's Heading lives in Typography).",
  ],
  covers: [],
};

export default entry;

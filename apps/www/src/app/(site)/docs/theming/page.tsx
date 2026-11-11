import { AxisDemo } from "@/components/docs/axis-demo";
import { C, Callout, Code, DocPage, H2, H3, P, Table } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Theming", description: "Five independent theme axes — light/dark, glass/solid material, accent, density and font — set with HTML attributes on any subtree.", path: "/docs/theming/" });

const tokens: [string, string][] = [
  ["scene", "Page background behind every surface"],
  ["fg / fg-muted / fg-subtle", "Text: primary, secondary, tertiary"],
  ["surface / surface-2 / surface-border", "Card surface, nested tile, card border"],
  ["line", "Hairlines and dividers"],
  ["field / field-border / field-border-hover", "Inputs and other controls"],
  ["hover / selected", "Interactive row and item states"],
  ["skeleton / track", "Loading placeholders, slider and progress tracks"],
  ["popover / popover-border / overlay", "Floating layers and the dialog backdrop"],
  ["nav / nav-fg / nav-fg-strong / nav-hover / nav-active / nav-line / nav-sub", "Sidebar (dark in both themes)"],
  ["nav-popover / nav-popover-border", "Sidebar flyouts"],
  ["accent / accent-fg / accent-soft / accent-ink", "Accent fill, text on accent, tinted background, readable accent text"],
  ["ring", "Focus ring"],
  ["success / warning / danger / info", "Semantic status colours"],
  ["chart-1 … chart-6", "Chart series"],
];

export default function ThemingPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="Theming"
      description="Five independent axes, set as attributes. Change any of them on <html> or on a single section."
      toc={[
        { id: "axes", title: "The five axes" },
        { id: "theme", title: "Theme", sub: true },
        { id: "material", title: "Material", sub: true },
        { id: "accent", title: "Accent", sub: true },
        { id: "density", title: "Density", sub: true },
        { id: "font", title: "Font", sub: true },
        { id: "tokens", title: "Token reference" },
        { id: "custom-accent", title: "Custom accent" },
        { id: "sections", title: "Per-section theming" },
        { id: "rule", title: "The one rule" },
      ]}
      prev={{ href: "/docs/installation", title: "Installation" }}
      next={{ href: "/docs/localization", title: "Localization" }}
    >
      <H2 id="axes">The five axes</H2>
      <Table
        head={["Axis", "Attribute", "Values"]}
        rows={[
          ["Theme", <C key="a">class</C>, "light · dark"],
          ["Material", <C key="b">data-material</C>, "solid · glass"],
          ["Accent", <C key="c">data-accent</C>, "lime · ocean · ember · rose · graphite (or your own)"],
          ["Density", <C key="d">data-density</C>, "comfortable · compact"],
          ["Font", <C key="e">data-font</C>, "editorial · grotesk · corporate · system"],
        ]}
      />
      <P>Every demo below is the same markup. Only the attribute on the wrapper changes.</P>

      <H3 id="theme">Theme</H3>
      <AxisDemo axis="theme" />

      <H3 id="material">Material</H3>
      <P>Glass makes surfaces translucent with a backdrop blur. At most three blurred surfaces are on screen at once; nested layers stay opaque.</P>
      <AxisDemo axis="material" />

      <H3 id="accent">Accent</H3>
      <P>One source colour in OKLCH. Soft fills, readable text and the focus ring are derived from it.</P>
      <AxisDemo axis="accent" />

      <H3 id="density">Density</H3>
      <P>Changes <C>--radius</C>, <C>--control-h</C> and <C>--gap</C>. Compact suits data-heavy screens.</P>
      <AxisDemo axis="density" />

      <H3 id="font">Font</H3>
      <Table
        head={["Preset", "UI", "Headings", "Numbers"]}
        rows={[
          ["editorial", "Onest", "Instrument Serif", "JetBrains Mono"],
          ["grotesk", "Hanken Grotesk", "Bricolage Grotesque", "Geist Mono"],
          ["corporate", "IBM Plex Sans", "IBM Plex Sans", "IBM Plex Mono"],
          ["system", "System UI", "System UI", "System mono"],
        ]}
      />
      <P>Heading weight, tracking, size scale and the style of <C>&lt;em&gt;</C> change with the preset.</P>
      <AxisDemo axis="font" />

      <H2 id="tokens">Token reference</H2>
      <P>Components read only these semantic tokens. Each is available as a Tailwind colour, e.g. <C>bg-surface</C>, <C>text-fg-muted</C>, <C>border-line</C>.</P>
      <Table head={["Token", "Used for"]} rows={tokens.map(([t, u]) => [<C key={t}>{t}</C>, u])} />

      <H2 id="custom-accent">Custom accent</H2>
      <P>Skip the presets and set the four source values. Everything else is derived.</P>
      <Code lang="css" code={`:root {
  --accent-base: oklch(0.72 0.16 160);      /* fill */
  --accent-fg: oklch(0.18 0.02 160);        /* text on the fill */
  --accent-ink-light: oklch(0.48 0.12 160); /* readable accent text, light theme */
  --accent-ink-dark: oklch(0.82 0.13 160);  /* readable accent text, dark theme */
}`} />

      <H2 id="sections">Per-section theming</H2>
      <P>Axes are inherited, so a section can differ from the page. A dark hero on a light page:</P>
      <Code code={`<section className="dark" data-accent="ember">
  <h1>Dinner from 18:00</h1>
  <Button variant="primary">Book a table</Button>
</section>`} />

      <H2 id="rule">The one rule</H2>
      <Callout tone="warning" title="Never write dark: in a component">
        Read semantic tokens instead. A component that hard-codes <C>dark:bg-zinc-900</C> breaks every other axis and every
        section that sets its own theme.
      </Callout>
    </DocPage>
  );
}

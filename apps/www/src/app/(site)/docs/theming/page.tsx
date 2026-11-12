import { AxisDemo } from "@/components/docs/axis-demo";
import { C, Callout, Code, DocPage, H2, H3, P, Table } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Theming", description: "Six independent theme axes — light/dark, glass/solid material, accent, density, font and corners — set with HTML attributes on any subtree.", path: "/docs/theming/" });

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
      description="Six independent axes, set as attributes. Change any of them on <html> or on a single section."
      toc={[
        { id: "axes", title: "The six axes" },
        { id: "theme", title: "Theme", sub: true },
        { id: "material", title: "Material", sub: true },
        { id: "accent", title: "Accent", sub: true },
        { id: "density", title: "Density", sub: true },
        { id: "font", title: "Font", sub: true },
        { id: "corners", title: "Corners", sub: true },
        { id: "tokens", title: "Token reference" },
        { id: "custom-accent", title: "Custom accent" },
        { id: "sections", title: "Per-section theming" },
        { id: "rule", title: "The one rule" },
      ]}
      prev={{ href: "/docs/installation", title: "Installation" }}
      next={{ href: "/docs/localization", title: "Localization" }}
    >
      <H2 id="axes">The six axes</H2>
      <Table
        head={["Axis", "Attribute", "Values"]}
        rows={[
          ["Theme", <C key="a">class</C>, "light · dark"],
          ["Material", <C key="b">data-material</C>, "solid · glass"],
          ["Accent", <C key="c">data-accent</C>, "lime · ocean · ember · rose · graphite (or your own)"],
          ["Density", <C key="d">data-density</C>, "comfortable · compact"],
          ["Font", <C key="e">data-font</C>, "editorial · grotesk · corporate · system"],
          ["Corners", <C key="f">data-radius</C>, "default (no attribute) · sharp · round"],
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
      <P>Changes <C>--control-h</C>, <C>--gap</C>, table rows and the corner base (<C>--radius</C> 14px → 10px). Compact suits data-heavy screens.</P>
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

      <H3 id="corners">Corners</H3>
      <P>
        <C>data-radius=&quot;sharp&quot;</C> or <C>&quot;round&quot;</C> scales <C>--radius</C>; leave the attribute out for the default. It is its own axis, so it
        works with every accent, material and density, and on any subtree.
      </P>
      <Table
        head={["Value", "Comfortable", "Compact"]}
        rows={[
          ["default (no attribute)", "14px", "10px"],
          [<C key="s">sharp</C>, "6px", "4px"],
          [<C key="r">round</C>, "20px", "14px"],
        ]}
      />
      <Table
        head={["", "What"]}
        rows={[
          ["Follows the setting", <>Everything on <C>rounded-ui</C> / <C>rounded-ui-sm</C> / <C>rounded-ui-lg</C> or <C>var(--radius)</C>: buttons, inputs, selects, checkboxes, cards, dialogs, sheets, popovers, menus, tooltips, toasts, tabs, tables, square badges, calendars, chart tooltips and site blocks.</>],
          ["Stays round on purpose", <><C>rounded-full</C> shapes: pill badges and buttons, avatars, switches, radio dots, slider thumbs and progress bars, plus small fixed details such as chart bars and event chips.</>],
        ]}
      />
      <P>Give your own elements <C>rounded-ui*</C> classes so they follow too; never hard-code a corner radius.</P>
      <AxisDemo axis="radius" />

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

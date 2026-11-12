import { Badge } from "@vamos-ui/react";
import { A, C, DocPage, H2, P, Table, UL } from "@/components/docs/prose";
import { inventory } from "@/lib/catalog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Introduction", description: "What Vamos UI is: one React component kit for every admin panel and website, with six theme axes, business components, blocks, a CLI and an MCP server.", path: "/docs/" });

export default function IntroductionPage() {
  const all = inventory.flatMap((g) => g.items);
  const ready = all.filter((i) => i.status === "ready").length;
  const next = all.filter((i) => i.status === "next").length;

  return (
    <DocPage
      eyebrow="Docs"
      title="Introduction"
      description="Vamos UI is one component kit for every admin panel — CMS, CRM, HR, partner portals — and the websites around them."
      toc={[
        { id: "what", title: "What it is" },
        { id: "principles", title: "Principles" },
        { id: "inventory", title: "What's in the box" },
        { id: "different", title: "What makes it different" },
      ]}
      next={{ href: "/docs/installation", title: "Installation" }}
    >
      <H2 id="what">What it is</H2>
      <P>
        A set of React components built on Radix primitives and Tailwind CSS v4. You can install it as one npm package and
        receive updates by bumping a version, or copy single components into your project and own the code.
      </P>
      <P>
        The same kit builds a content dashboard, a sales pipeline, a leave calendar and a restaurant landing page. Visual
        identity comes from tokens, not from the component code, so one kit can look like many products.
      </P>

      <H2 id="principles">Principles</H2>
      <UL>
        <li><b className="text-fg">Six theme axes.</b> Mode, material (glass or solid), accent, density, font and corners are attributes on <C>&lt;html&gt;</C> or any subtree. Components never use <C>dark:</C>. See <A href="/docs/theming">Theming</A>.</li>
        <li><b className="text-fg">Not generic.</b> No default purple gradients, no emoji icons, no wall of identical cards. Typography and spacing do the work.</li>
        <li><b className="text-fg">Grouped by what a component is.</b> A calendar is the same in a CRM and an HR tool. Domain screens — post editor, pipeline, leave request — are <A href="/blocks">Blocks</A> built from the kit.</li>
        <li><b className="text-fg">Accessible by default.</b> Keyboard support, focus management and ARIA patterns are part of every component spec.</li>
        <li><b className="text-fg">English first, locales built in.</b> Built-in strings and number/date/currency formatting come from a locale. Turkish is the first extra locale. See <A href="/docs/localization">Localization</A>.</li>
      </UL>

      <H2 id="inventory">What&apos;s in the box</H2>
      <div className="flex flex-wrap gap-2">
        <Badge tone="success" size="md" dot>{ready} ready</Badge>
        <Badge tone="info" size="md">{next} next</Badge>
        <Badge size="md">{all.length} in total</Badge>
      </div>
      <Table
        head={["Group", "Components", "Ready"]}
        rows={inventory.map((g) => [g.group, String(g.items.length), String(g.items.filter((i) => i.status === "ready").length)])}
      />
      <P>The full list with status is on the <A href="/docs/components">Components</A> page.</P>

      <H2 id="different">What makes it different</H2>
      <Table
        head={["", "Vamos UI"]}
        rows={[
          ["Distribution", "One npm package, or copy single components with the vamos-ui CLI — and keep receiving fixes with diff/upgrade"],
          ["Theming", "Six independent axes (mode, material, accent, density, font, corners), switchable on any subtree"],
          ["Material", "Solid or Liquid Glass, with a blur budget so glass stays fast"],
          ["Scope", "Primitives, business components (data table, pickers, calendars, kanban, line items, flows) and site blocks"],
          ["Blocks", "Whole screens for panels, sign-in, settings and websites — built only from the kit"],
          ["Locale", "Locale provider, Intl formatting and locale packs (tax, IDs, holidays)"],
          ["Maturity", "Early (v0.2) — APIs can change until v1; see the changelog"],
        ]}
      />
    </DocPage>
  );
}

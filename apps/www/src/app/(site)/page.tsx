import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, Button } from "@vamos-ui/react";
import { inventory } from "@/lib/catalog";
import { blocks } from "@/blocks/registry";

const axes = [
  { name: "Theme", values: "light · dark", attr: 'class="dark"' },
  { name: "Material", values: "glass · solid", attr: 'data-material="glass"' },
  { name: "Accent", values: "lime · ocean · ember · rose · graphite", attr: 'data-accent="ocean"' },
  { name: "Density", values: "comfortable · compact", attr: 'data-density="compact"' },
  { name: "Font", values: "editorial · grotesk · corporate · system", attr: 'data-font="grotesk"' },
];

export default function Home() {
  const all = inventory.flatMap((g) => g.items);
  const ready = all.filter((i) => i.status === "ready").length;

  return (
    <main id="main" className="mx-auto max-w-[1440px] px-5">
      <section className="grid gap-10 pt-16 pb-12 lg:grid-cols-[1.05fr_1fr] lg:items-end">
        <div>
          <Badge tone="accent" size="md">v0.1 · early preview</Badge>
          <h1 className="mt-5 max-w-[14ch] font-display text-[length:calc(clamp(44px,6vw,76px)*var(--display-scale))] leading-[0.98]">
            One kit for every <em className="text-accent-ink">panel</em> and website.
          </h1>
        </div>
        <div className="max-w-[520px] lg:pb-2">
          <p className="text-[16.5px] leading-relaxed text-fg-muted">
            Components, blocks and whole app shells for CMS, CRM, HR and partner portals — and the sites around them.
            Copy the code or install the package. Switch the look with five attributes instead of rewriting classes.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button asChild variant="solid" size="lg"><Link href="/docs">Get started <ArrowRight /></Link></Button>
            <Button asChild size="lg"><Link href="/blocks">Browse blocks</Link></Button>
          </div>
          <div className="mt-6 flex gap-6 text-[13px] text-fg-subtle">
            <span><b className="font-mono text-fg tabular">{all.length}</b> components planned</span>
            <span><b className="font-mono text-fg tabular">{ready}</b> ready</span>
            <span><b className="font-mono text-fg tabular">{blocks.length}</b> blocks</span>
          </div>
        </div>
      </section>

      <section aria-label="Live preview" className="preview-stage overflow-hidden rounded-[22px] border border-line">
        <iframe src="/view/dashboard-01" title="Dashboard block preview" className="block h-[720px] w-full border-0" />
      </section>

      <section className="grid gap-12 py-20 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="font-display text-[length:calc(36px*var(--display-scale))] leading-[1.05]">Five axes. <em>Zero</em> rewrites.</h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-fg-muted">
            Components only read tokens. Set an attribute on <code className="font-mono text-[13px]">&lt;html&gt;</code> — or on any section —
            and everything below follows. Try the controls in the header.
          </p>
          <Link href="/docs/theming" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-accent-ink hover:underline">Read about theming <ArrowRight className="size-4" /></Link>
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {axes.map((a) => (
            <li key={a.name} className="grid gap-1 py-3.5 sm:grid-cols-[110px_1fr_auto] sm:items-center sm:gap-4">
              <span className="text-[14px] font-semibold">{a.name}</span>
              <span className="text-[13.5px] text-fg-muted">{a.values}</span>
              <code className="font-mono text-[12px] text-fg-subtle">{a.attr}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-px overflow-hidden rounded-ui-lg border border-line bg-line pb-px sm:grid-cols-3 mb-20">
        {[
          { t: "Grouped by what it is", d: "A calendar is the same calendar in a CRM, an HR tool or a CMS. Domain screens ship as blocks." },
          { t: "Yours to own — or to update", d: "Copy a component and edit it, or install the package and bump versions. Planned: diff and upgrade copied code." },
          { t: "English first, local by design", d: "Built-in strings come from a locale dictionary; numbers, money and dates go through Intl. Turkish is next." },
        ].map((f) => (
          <div key={f.t} className="bg-scene p-6">
            <h3 className="text-[15px] font-semibold">{f.t}</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-muted">{f.d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

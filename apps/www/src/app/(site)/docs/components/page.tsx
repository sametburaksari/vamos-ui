import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge, cn } from "@vamos-cms/ui";
import { inventory, recipes } from "@/lib/catalog";

export const metadata = { title: "Components · Vamos UI" };

export default function ComponentsIndex() {
  const all = inventory.flatMap((g) => g.items);
  const ready = all.filter((i) => i.status === "ready").length;

  return (
    <div className="max-w-[980px] pb-20">
      <div className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.14em] text-fg-subtle">@vamos-cms/ui · v0.1</div>
      <h1 className="font-display text-[length:calc(44px*var(--display-scale))] leading-[1.05]">Components</h1>
      <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-fg-muted">
        One component kit for every admin panel — CMS, CRM, HR, partner portals — and the websites around them.
        Every component follows five axes: theme, material (glass/solid), accent, density and font.
        Pick a component to see a live preview, the code, installation and the props table.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="success" size="md" dot>{ready} ready</Badge>
        <Badge size="md">{all.length} planned</Badge>
      </div>

      <div className="mt-10 grid gap-10">
        {inventory.map((g) => (
          <section key={g.group}>
            <h2 className="mb-3 flex items-baseline gap-3 border-b border-line pb-2">
              <span className="text-[17px] font-semibold tracking-[-0.01em]">{g.group}</span>
              <span className="text-[12.5px] text-fg-subtle tabular">{g.items.filter((i) => i.status === "ready").length}/{g.items.length}</span>
            </h2>
            <ul className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
              {g.items.map((i) => {
                const href = i.slug ? `/docs/components/${i.slug}` : null;
                const content = (
                  <>
                    <span className={cn("truncate", !href && "text-fg-subtle")}>{i.name}</span>
                    {!href && i.status === "next" && <span className="text-[10.5px] text-info">next</span>}
                    {href && <ArrowUpRight className="ms-auto size-3.5 text-fg-subtle opacity-0 transition group-hover:opacity-100" />}
                  </>
                );
                return (
                  <li key={i.name}>
                    {href ? (
                      <Link href={href} className="group flex items-center gap-2 border-b border-line py-2.5 text-[14px] font-medium hover:text-accent-ink">{content}</Link>
                    ) : (
                      <div className="flex items-center gap-2 border-b border-line py-2.5 text-[14px]">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section>
          <h2 className="mb-1 border-b border-line pb-2 text-[17px] font-semibold tracking-[-0.01em]">Recipes</h2>
          <p className="mb-4 mt-2 text-[13.5px] text-fg-muted">Domain screens built only from kit components. Copy one and adapt it.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <div key={r.area} className="surface rounded-ui p-4">
                <div className="mb-2 text-[13px] font-semibold">{r.area}</div>
                <ul className="grid gap-1 text-[13px] text-fg-subtle">{r.items.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Badge, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowUpRight } from "lucide-react";
import { Stagger } from "@vamos-ui/react/motion";
import { fill, kinds, licences, templateById, templates, type Kind } from "./content";
import { initialPreview, LivePreview, type PreviewState } from "./live-preview";
import { useShop } from "./shop-provider";

/** Hero: Ledger, live, with every control. */
export function HeroPreview() {
  const tpl = templateById("ledger");
  const [state, setState] = React.useState<PreviewState>(() => initialPreview(tpl));
  return <LivePreview template={tpl} state={state} onStateChange={setState} maxHeight={560} />;
}

const grid = {
  filter: { en: "Template type", tr: "Şablon türü" },
  all: { en: "All", tr: "Tümü" },
  from: { en: "from {price}", tr: "{price}’dan başlayan" },
  sales: { en: "{n} sold", tr: "{n} satış" },
  pages: { en: "{n} pages", tr: "{n} sayfa" },
  isNew: { en: "New", tr: "Yeni" },
  open: { en: "Open {name} and try it", tr: "{name} şablonunu aç ve dene" },
};

/** Template cards as artboards: the thumbnail is the template itself, rendered small. */
export function TemplateGrid() {
  const { c, select } = useShop();
  const { t, f, usd } = c;
  const [kind, setKind] = React.useState<Kind | "all">("all");
  const list = templates.filter((x) => kind === "all" || x.kind === kind);

  return (
    <div className="flex flex-col gap-8">
      <div className="-mx-(--gutter) overflow-x-auto px-(--gutter) scrollbar-none">
        <ToggleGroup type="single" value={kind} onValueChange={(v) => setKind((v || "all") as Kind | "all")} aria-label={t(grid.filter)} className="w-max">
          <ToggleGroupItem value="all">{t(grid.all)}</ToggleGroupItem>
          {kinds.map((k) => (
            <ToggleGroupItem key={k.id} value={k.id}>
              {t(k.label)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <Stagger asChild step={70}>
      <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((tpl) => (
          <li key={tpl.id} className="vm-enter min-w-0">
            <article className="group relative flex flex-col gap-3">
              <p className="tabular flex items-center justify-between font-mono text-[11px] text-fg-muted">
                <span>
                  {tpl.name} / {tpl.pages[0]!.path === "/" ? "home" : tpl.pages[0]!.path.slice(1)}
                </span>
                <span>1280 × 760</span>
              </p>
              <div className="overflow-hidden rounded-ui border border-line outline-2 outline-offset-4 outline-transparent transition-[outline-color] group-hover:outline-accent group-has-[a:focus-visible]:outline-ring">
                <LivePreview template={tpl} state={initialPreview(tpl)} variant="thumb" />
              </div>
              <div className="flex items-start justify-between gap-4 pt-1">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 font-display text-[1.35rem] leading-tight font-semibold tracking-[-0.02em] text-fg">
                    <a
                      href={sitePageHref("product")}
                      onClick={() => select(tpl.id)}
                      aria-label={fill(t(grid.open), { name: tpl.name })}
                      className="rounded-[2px] focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
                    >
                      {tpl.name}
                    </a>
                    {tpl.isNew ? (
                      <Badge tone="accent" size="sm">
                        {t(grid.isNew)}
                      </Badge>
                    ) : null}
                  </h3>
                  <p className="mt-1 text-small text-fg-muted">{t(tpl.tagline)}</p>
                </div>
                <ArrowUpRight aria-hidden className="mt-1 size-5 shrink-0 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-ink motion-reduce:transition-none rtl:-scale-x-100" />
              </div>
              <p className="tabular flex flex-wrap gap-x-4 gap-y-1 text-small">
                <span className="font-medium text-fg">{fill(t(grid.from), { price: usd(licences[0]!.price) })}</span>
                <span className="text-fg-muted">{fill(t(grid.pages), { n: tpl.pageCount })}</span>
                <span className="text-fg-muted">{fill(t(grid.sales), { n: f.number(tpl.sales) })}</span>
              </p>
            </article>
          </li>
        ))}
      </ul>
      </Stagger>
    </div>
  );
}

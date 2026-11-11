"use client";

import * as React from "react";
import { Badge, cn, Image, Select, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { BlockHeading, Container, Section } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { fill, photos, regions, residences, type Region } from "./content";
import { SlowReveal, useEstate } from "./estate-provider";
import { Facts } from "./home-parts";

const c = {
  eyebrow: { en: "The collection · Autumn 2026", tr: "Koleksiyon · Sonbahar 2026" },
  title: { en: "Five houses, *one at a time*", tr: "Beş ev, *birer birer*" },
  lead: { en: "Every house we offer, including one shown to registered buyers only. Prices are asking prices in euros; Turkish lira on request.", tr: "Sunduğumuz her ev; biri yalnızca kayıtlı alıcılara gösterilir. Fiyatlar avro cinsinden istenen fiyatlardır; Türk lirası talep üzerine." },
  filter: { en: "Setting", tr: "Konum" },
  sort: { en: "Order", tr: "Sıralama" },
  sortPriceDesc: { en: "Price, highest first", tr: "Fiyat, yüksekten" },
  sortPriceAsc: { en: "Price, lowest first", tr: "Fiyat, düşükten" },
  sortArea: { en: "Size, largest first", tr: "Büyüklük, büyükten" },
  sortYear: { en: "Newest first", tr: "En yeni önce" },
  count: { en: "{n} of {total} residences", tr: "{total} konuttan {n} tanesi" },
  off: { en: "Off-market", tr: "Piyasa dışı" },
  built: { en: "Built {year}", tr: "{year} yapımı" },
  view: { en: "View {name}", tr: "{name} inceleyin" },
  none: { en: "Nothing here this season. Register and we will write when one comes.", tr: "Bu sezon burada ev yok. Kaydolun, geldiğinde yazalım." },
};

type Sort = "price-desc" | "price-asc" | "area" | "year";

export function CollectionPage() {
  const { t, open } = useEstate();
  const [region, setRegion] = React.useState<Region | "all">("all");
  const [sort, setSort] = React.useState<Sort>("price-desc");

  const list = residences
    .filter((r) => region === "all" || r.region === region)
    .sort((a, b) => {
      const pa = a.price ? Number(a.price) : Infinity;
      const pb = b.price ? Number(b.price) : Infinity;
      if (sort === "price-desc") return pb - pa;
      if (sort === "price-asc") return (a.price ? pa : Infinity) - (b.price ? pb : Infinity);
      if (sort === "area") return b.area - a.area;
      return b.year - a.year;
    });

  return (
    <>
      <Section theme={{ mode: "dark" }} aria-labelledby="vc-col-title" className="relative isolate flex min-h-[34rem] flex-col justify-end overflow-hidden !pb-12">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image src={photos.cubic.src} width={photos.cubic.width} height={photos.cubic.height} alt="" priority sizes="100vw" className="size-full" imgClassName="size-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklch,var(--scene)_90%,transparent),color-mix(in_oklch,var(--scene)_40%,transparent)_60%,color-mix(in_oklch,var(--scene)_60%,transparent))]" />
        </div>
        <Container className="pt-36">
          <div className="grid gap-6 @4xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] @4xl:items-end">
            <div className="flex flex-col gap-5">
              <p className="text-small uppercase tracking-[0.22em] text-fg-muted">{t(c.eyebrow)}</p>
              <BlockHeading id="vc-col-title" level={1} size="display-xl" text={t(c.title)} className="text-fg" />
            </div>
            <p className="max-w-[46ch] text-fg-muted">{t(c.lead)}</p>
          </div>
        </Container>
      </Section>

      <Section aria-label={t(c.filter)} className="!pt-10">
        <Container>
          <div className="flex flex-col gap-4 border-b border-line pb-6 @3xl:flex-row @3xl:items-center @3xl:justify-between">
            <ToggleGroup aria-label={t(c.filter)} value={region} onValueChange={(v) => v && setRegion(v as Region | "all")} className="flex-wrap self-start">
              {regions.map((r) => (
                <ToggleGroupItem key={r.id} value={r.id}>
                  {t(r.label)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="flex items-center gap-4">
              <p className="text-small text-fg-muted tabular-nums" aria-live="polite">
                {fill(t(c.count), { n: list.length, total: residences.length })}
              </p>
              <Select
                aria-label={t(c.sort)}
                value={sort}
                onValueChange={(v) => v && setSort(v as Sort)}
                className="w-52"
                items={[
                  { value: "price-desc", label: t(c.sortPriceDesc) },
                  { value: "price-asc", label: t(c.sortPriceAsc) },
                  { value: "area", label: t(c.sortArea) },
                  { value: "year", label: t(c.sortYear) },
                ]}
              />
            </div>
          </div>

          {list.length === 0 ? <p className="py-16 text-fg-muted">{t(c.none)}</p> : null}

          <ol className="flex flex-col">
            {list.map((r, i) => (
              <li key={r.id} className="border-b border-line py-10 @4xl:py-14">
                <SlowReveal className={cn("grid gap-6 @4xl:grid-cols-2 @4xl:items-center @4xl:gap-14", i % 2 === 1 && "@4xl:[&>*:first-child]:order-2")}>
                  <button type="button" onClick={() => open(r.id)} className="group block overflow-hidden focus-ring" aria-label={fill(t(c.view), { name: r.name })}>
                    <Image src={r.hero.src} width={r.hero.width} height={r.hero.height} alt={t(r.hero.alt)} focal={r.hero.focal} aspect="3/2" sizes="(min-width: 1024px) 50vw, 100vw" imgClassName="transition-transform duration-[2400ms] ease-out motion-safe:group-hover:scale-[1.04]" />
                  </button>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-code text-small text-fg-subtle tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      {r.offMarket ? <Badge tone="accent">{t(c.off)}</Badge> : null}
                      <span className="text-small text-fg-muted">{fill(t(c.built), { year: r.year })}</span>
                    </div>
                    <h2 className="font-display text-display-m leading-none text-fg">{r.name}</h2>
                    <p className="text-fg-muted">{t(r.place)}</p>
                    <p className="max-w-[52ch] text-fg text-pretty">{t(r.line)}</p>
                    <Facts r={r} />
                    <button type="button" onClick={() => open(r.id)} className="mt-2 inline-flex items-center gap-2 self-start text-small font-medium text-fg underline decoration-line underline-offset-[6px] hover:decoration-current focus-ring rounded-[2px]">
                      {fill(t(c.view), { name: r.name })} <ArrowRight aria-hidden className="size-4" />
                    </button>
                  </div>
                </SlowReveal>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
}

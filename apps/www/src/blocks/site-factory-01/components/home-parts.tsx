"use client";

import * as React from "react";
import { Button } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { Drawing } from "./drawing";
import { copyFor, families, products, type SiteLocale } from "./content";

const c = {
  eyebrow: { en: "Precision components · Gebze, since 1987", tr: "Hassas parçalar · Gebze, 1987’den beri" },
  title: { en: "Parts that arrive *on the drawing*.", tr: "*Resimdeki gibi* gelen parçalar." },
  lead: {
    en: "Flanges, bearing housings, hydraulic fittings and shafts for machine builders in 31 countries. Every catalogue part ships with a datasheet and a 3.1 material certificate; custom parts with a first-article report.",
    tr: "31 ülkedeki makine üreticilerine flanş, rulman yatağı, hidrolik bağlantı ve mil. Her katalog parçası teknik föy ve 3.1 malzeme sertifikasıyla; özel parçalar ilk numune raporuyla gelir.",
  },
  catalogue: { en: "Open the catalogue", tr: "Kataloğu aç" },
  rfq: { en: "Send a drawing for a quote", tr: "Teklif için resim gönderin" },
  figure: { en: "Section and front view of weld-neck flange OC-WN16, DN100", tr: "OC-WN16 kaynak boyunlu flanşın kesit ve ön görünüşü, DN100" },
  dwg: { en: "Drawing", tr: "Resim no." },
  material: { en: "Material", tr: "Malzeme" },
  scale: { en: "Scale", tr: "Ölçek" },
  rev: { en: "Rev.", tr: "Rev." },
  famEyebrow: { en: "Catalogue", tr: "Katalog" },
  famTitle: { en: "Four families, *1,140 standard parts*", tr: "Dört aile, *1.140 standart parça*" },
  parts: { en: "{n} product lines", tr: "{n} ürün grubu" },
  part1: { en: "1 product line", tr: "1 ürün grubu" },
  see: { en: "Datasheets", tr: "Teknik föyler" },
};

const zones = ["A", "B", "C", "D"];
const cols = ["1", "2", "3", "4", "5", "6"];

function Emph({ text }: { text: string }) {
  return (
    <>
      {text.split("*").map((p, i) =>
        i % 2 ? (
          <span key={i} className="text-accent-ink">
            {p}
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
}

/** The home hero laid out as a drawing sheet: zone markers on the frame, a title block bottom-end. */
export function SheetHero({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  return (
    <Section aria-labelledby="os-hero-title" className="pt-6!">
      <Container>
        <div className="relative border-2 border-fg p-2 @3xl:p-3">
          {/* Zone markers */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 hidden -translate-y-full grid-cols-6 pb-1 font-mono text-[10px] text-fg-muted @3xl:grid">
            {cols.map((n) => (
              <span key={n} className="text-center">
                {n}
              </span>
            ))}
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 start-0 hidden -translate-x-full grid-rows-4 pe-1.5 font-mono text-[10px] text-fg-muted @3xl:grid rtl:translate-x-full">
            {zones.map((z) => (
              <span key={z} className="flex items-center">
                {z}
              </span>
            ))}
          </div>
          <div className="relative border border-fg/60">
            {/* Fine grid, like a drafting sheet */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
            <div className="relative grid gap-8 p-5 @3xl:p-8 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] @5xl:gap-6 @5xl:p-12">
              <div className="flex flex-col gap-6 @5xl:py-6">
                <p className="flex items-center gap-3 font-mono text-eyebrow uppercase tracking-[0.14em] text-fg-muted">
                  <span aria-hidden className="h-2.5 w-6 bg-warning" />
                  {t(c.eyebrow)}
                </p>
                <h1 id="os-hero-title" className="font-display text-display-xl uppercase leading-[0.92] tracking-[var(--display-tracking)] text-balance text-fg [font-weight:var(--display-weight)]">
                  <Emph text={t(c.title)} />
                </h1>
                <p className="max-w-[52ch] text-lead text-fg-muted">{t(c.lead)}</p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="primary" size="lg">
                    <a href={sitePageHref("products")}>
                      {t(c.catalogue)}
                      <ArrowRight aria-hidden className="rtl:rotate-180" />
                    </a>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <a href={sitePageHref("home", "rfq")}>{t(c.rfq)}</a>
                  </Button>
                </div>
              </div>
              <figure className="flex flex-col justify-between gap-4">
                <Drawing kind="flange" label={t(c.figure)} dims={["220", "20", "180"]} className="h-auto w-full" />
                <dl className="ms-auto grid w-full max-w-[26rem] grid-cols-[auto_1fr_auto_auto] border border-fg bg-surface text-xs [&>*]:border-line [&>*]:px-2.5 [&>*]:py-1.5">
                  <dt className="border-e border-b font-mono uppercase text-fg-muted">{t(c.dwg)}</dt>
                  <dd className="col-span-3 border-b font-mono font-semibold text-fg">OC-WN16-100 · DN100 PN16</dd>
                  <dt className="border-e border-b font-mono uppercase text-fg-muted">{t(c.material)}</dt>
                  <dd className="col-span-3 border-b text-fg">P250GH · EN 10222-2</dd>
                  <dt className="border-e font-mono uppercase text-fg-muted">{t(c.scale)}</dt>
                  <dd className="border-e font-mono text-fg">1:2</dd>
                  <dt className="border-e font-mono uppercase text-fg-muted">{t(c.rev)}</dt>
                  <dd className="font-mono text-fg">C</dd>
                </dl>
                <figcaption className="sr-only">{t(c.figure)}</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** Four family cells, each a small drawing over a hairline grid. */
export function FamilyGrid({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const drawingOf = { flanges: "flange", housings: "housing", fittings: "fitting", shafts: "shaft" } as const;
  return (
    <Section aria-labelledby="os-fam-title" anchor="families">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-eyebrow uppercase tracking-[0.14em] text-fg-muted">{t(c.famEyebrow)}</p>
            <h2 id="os-fam-title" className="font-display text-display-m uppercase text-balance text-fg [font-weight:var(--display-weight)]">
              <Emph text={t(c.famTitle)} />
            </h2>
          </div>
        </div>
        <ul className="grid border-s border-t border-line @2xl:grid-cols-2 @5xl:grid-cols-4">
          {families.map((f, i) => (
            <li key={f.id} className="group relative flex flex-col gap-3 border-e border-b border-line p-5 transition-colors hover:bg-hover">
              <span className="font-mono text-xs text-fg-muted">0{i + 1}</span>
              <Drawing kind={drawingOf[f.id]} className="h-auto w-full opacity-90" />
              <h3 className="font-display text-h3 uppercase text-fg">
                <a href={sitePageHref("products", f.id)} className="after:absolute after:inset-0 focus-ring rounded-[2px]">
                  {t(f.name)}
                </a>
              </h3>
              <p className="text-small text-fg-muted">{t(f.blurb)}</p>
              <p className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 font-mono text-xs text-fg-muted">
                <span className="whitespace-nowrap">{(() => { const n = products.filter((p) => p.family === f.id).length; return n === 1 ? t(c.part1) : t(c.parts).replace("{n}", String(n)); })()}</span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap text-accent-ink">
                  {t(c.see)}
                  <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                </span>
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

"use client";

import * as React from "react";
import { Badge, Button, RadioGroup, Table, TableBody, TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { Download, FileText, Check } from "lucide-react";
import { Drawing, plotMotion } from "./drawing";
import { copyFor, datasheetCsv, families, fill, products, specValue, unitLabel, type FamilyId, type Product, type SiteLocale } from "./content";

const c = {
  list: { en: "Products", tr: "Ürünler" },
  units: { en: "Units", tr: "Birimler" },
  metric: { en: "Metric", tr: "Metrik" },
  imperial: { en: "Imperial", tr: "İnç / lb" },
  table: { en: "Dimensions of {name}", tr: "{name} ölçüleri" },
  pick: { en: "Select {size}", tr: "{size} seç" },
  selected: { en: "Selected: {code} · {size}", tr: "Seçili: {code} · {size}" },
  download: { en: "Download datasheet", tr: "Teknik föyü indir" },
  downloaded: { en: "Datasheet saved: {file}", tr: "Teknik föy kaydedildi: {file}" },
  csv: { en: "CSV · opens in Excel · {kb} KB", tr: "CSV · Excel’de açılır · {kb} KB" },
  quote: { en: "Request a quote for {size}", tr: "{size} için teklif iste" },
  figure: { en: "Drawing of {name}, size {size}", tr: "{name} çizimi, ölçü {size}" },
  note: { en: "Representative values. The drawing on your order confirmation governs.", tr: "Temsili değerlerdir. Sipariş onayınızdaki resim esastır." },
  parts: { en: "{n} sizes", tr: "{n} ölçü" },
};

type System = "metric" | "imperial";

/** Products page body: product index on the start side, spec table + datasheet download on the end side. */
export function Catalogue({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const [productId, setProductId] = React.useState(products[0]!.id);
  const [rowIndex, setRowIndex] = React.useState(2);
  const [system, setSystem] = React.useState<System>("metric");
  const [saved, setSaved] = React.useState<string | null>(null);
  const detailRef = React.useRef<HTMLDivElement>(null);
  const product = products.find((p) => p.id === productId)!;
  const row = product.rows[Math.min(rowIndex, product.rows.length - 1)]!;

  // `?page=products#fittings` (from the home page) opens that family's first product.
  React.useEffect(() => {
    const fam = window.location.hash.slice(1) as FamilyId;
    const first = products.find((p) => p.family === fam);
    if (first) {
      setProductId(first.id);
      setRowIndex(Math.min(1, first.rows.length - 1));
    }
  }, []);

  const choose = (p: Product) => {
    setProductId(p.id);
    setRowIndex(Math.min(1, p.rows.length - 1));
    setSaved(null);
    if (window.matchMedia("(max-width: 64rem)").matches) requestAnimationFrame(() => detailRef.current?.scrollIntoView({ block: "start" }));
  };

  const csv = datasheetCsv(product, system, locale, t);
  const kb = Math.max(1, Math.round(new Blob([csv]).size / 1024));
  const file = `${product.code}-${system === "metric" ? "metric" : "imperial"}-datasheet-${locale}.csv`;
  const download = () => {
    // BOM so Excel reads the file as UTF-8 (Ø, ş, µ).
    const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaved(file);
  };

  const dims = (): string[] => {
    const v = (k: string) => (row[k] !== undefined ? specValue(row[k]!, product.columns.find((col) => col.key === k)?.unit ?? "text", system, locale) : "");
    if (product.drawing === "flange") return [v("D"), v("b"), v("K")];
    if (product.drawing === "housing") return [v("J") || v("A"), v("H") || v("d")];
    if (product.drawing === "fitting") return [v("L"), v("S")];
    return [String(row.size), `max. ${v("max")}`];
  };

  return (
    <Section aria-label={t(c.list)} theme={{ rhythm: "tight" }} anchor="catalogue" className="pt-2!">
      <Container>
        <div className="grid items-start gap-8 @5xl:grid-cols-[16rem_minmax(0,1fr)] @5xl:gap-12">
          <nav aria-label={t(c.list)} className="flex flex-col gap-6 @5xl:sticky @5xl:top-24">
            {families.map((f) => (
              <div key={f.id} className="flex flex-col gap-1">
                <h2 className="border-b border-fg pb-1.5 font-display text-[1.05rem] font-semibold uppercase tracking-[0.04em] text-fg">{t(f.name)}</h2>
                <ul className="flex flex-col">
                  {products
                    .filter((p) => p.family === f.id)
                    .map((p) => {
                      const on = p.id === productId;
                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            aria-pressed={on}
                            onClick={() => choose(p)}
                            className={`flex w-full flex-col items-start gap-0.5 border-s-2 py-2 ps-3 pe-2 text-start transition-colors focus-ring ${on ? "border-accent bg-accent-soft" : "border-transparent hover:bg-hover"}`}
                          >
                            <span className={`font-mono text-xs ${on ? "text-accent-ink" : "text-fg-muted"}`}>{p.code}</span>
                            <span className="text-small font-medium text-fg">{t(p.name)}</span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </nav>

          <div ref={detailRef} className="flex min-w-0 scroll-mt-24 flex-col gap-8" data-testid="os-detail">
            <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] @4xl:items-center">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-small font-semibold text-accent-ink">{product.code}</span>
                  <Badge tone="outline">{t(families.find((f) => f.id === product.family)!.name)}</Badge>
                  <Badge tone="outline">{fill(t(c.parts), { n: product.rows.length })}</Badge>
                </div>
                <h2 className="font-display text-display-m uppercase text-balance text-fg [font-weight:var(--display-weight)]">{t(product.name)}</h2>
                <p className="max-w-[56ch] text-body text-fg-muted">{t(product.summary)}</p>
              </div>
              <div className="relative rounded-ui border border-line bg-surface p-3">
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-ui bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
                <style>{plotMotion}</style>
                <Drawing key={`${product.id}-${row.size}`} kind={product.drawing} label={fill(t(c.figure), { name: t(product.name), size: String(row.size) })} dims={dims()} className="os-plot relative h-auto w-full [--os-k:0.4]" />
              </div>
            </div>

            <dl className="grid border-t border-line @2xl:grid-cols-2">
              {product.facts.map((f) => (
                <div key={f.label.en} className="flex flex-col gap-0.5 border-b border-line py-2.5 @2xl:odd:pe-6">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-fg-muted">{t(f.label)}</dt>
                  <dd className="text-small text-fg">{t(f.value)}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <RadioGroup variant="segmented" size="sm" aria-label={t(c.units)} value={system} onValueChange={(v) => setSystem(v as System)} items={[{ value: "metric", label: t(c.metric) }, { value: "imperial", label: t(c.imperial) }]} />
              <p className="font-mono text-xs text-fg-muted" aria-live="polite">
                {fill(t(c.selected), { code: product.code, size: String(row.size) })}
              </p>
            </div>

            <div className="overflow-hidden rounded-ui border border-line bg-surface">
              <TableContainer aria-label={fill(t(c.table), { name: t(product.name) })}>
                <Table density="compact" stickyFirstColumn>
                  <TableCaption visuallyHidden>{fill(t(c.table), { name: t(product.name) })}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      {product.columns.map((col) => (
                        <TableHead key={col.key} numeric={col.unit !== "text"} className="whitespace-nowrap">
                          {t(col.label)}
                          {unitLabel(col.unit, system) ? <span className="ms-1 font-normal text-fg-muted">({unitLabel(col.unit, system)})</span> : null}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.rows.map((r, i) => {
                      const on = r === row;
                      return (
                        <TableRow key={String(r.size)} selected={on} data-testid={`os-row-${i}`}>
                          {product.columns.map((col, ci) => (
                            <TableCell key={col.key} numeric={col.unit !== "text"} rowHeader={ci === 0} className="whitespace-nowrap font-mono">
                              {ci === 0 ? (
                                <button type="button" aria-pressed={on} aria-label={fill(t(c.pick), { size: String(r.size) })} onClick={() => setRowIndex(i)} className="inline-flex items-center gap-2 rounded-[2px] font-mono font-semibold text-fg focus-ring">
                                  <span aria-hidden className={`grid size-3.5 place-items-center rounded-full border ${on ? "border-accent bg-accent text-accent-fg" : "border-field-border"}`}>
                                    {on ? <span className="size-1.5 rounded-full bg-accent-fg" /> : null}
                                  </span>
                                  {String(r.size)}
                                </button>
                              ) : (
                                specValue(r[col.key] ?? "", col.unit, system, locale)
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            <div className="flex flex-col gap-4 border-t-2 border-fg pt-5 @3xl:flex-row @3xl:items-center @3xl:justify-between">
              <div className="flex items-center gap-3">
                <FileText aria-hidden className="size-8 shrink-0 text-fg-muted" strokeWidth={1.25} />
                <div className="flex flex-col">
                  <span className="font-mono text-small text-fg">{file}</span>
                  <span className="text-xs text-fg-muted">{fill(t(c.csv), { kb })}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={download} data-testid="os-download">
                  <Download aria-hidden />
                  {t(c.download)}
                </Button>
                <Button asChild variant="secondary">
                  <a href={sitePageHref("home", "rfq")}>{fill(t(c.quote), { size: String(row.size) })}</a>
                </Button>
              </div>
            </div>
            <p role="status" className="min-h-5 text-small text-fg-muted">
              {saved ? (
                <span className="inline-flex items-center gap-1.5">
                  <Check aria-hidden className="size-4 text-accent-ink" />
                  {fill(t(c.downloaded), { file: saved })}
                </span>
              ) : (
                t(c.note)
              )}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

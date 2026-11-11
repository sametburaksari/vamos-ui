"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Breadcrumb, Button, Image, RadioGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { categories, currencyOf, productById, products, sizeChart, sizesOf, totalStock, type Size } from "./content";
import { ProductTile } from "./drop-card";
import { useDrop } from "./drop-provider";

/** Product detail: photos, code and run, a size picker that shows what’s left, size chart, details. */
export function ProductPage() {
  const { t, s, fmt, add, selected, locale } = useDrop();
  const p = productById(selected);
  const sizes = sizesOf(p);
  const firstInStock = sizes.find((x) => (p.stock[x] ?? 0) > 0) ?? null;
  const [size, setSize] = React.useState<Size | null>(firstInStock);
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    setSize(firstInStock);
    setTried(false);
  }, [p.id, firstInStock]);

  const left = totalStock(p);
  const category = categories.find((c) => c.id === p.category)!;
  const related = products.filter((x) => x.id !== p.id && x.drop === p.drop).slice(0, 4);
  const more = related.length >= 2 ? related : products.filter((x) => x.id !== p.id).slice(0, 4);
  const oneSize = sizes.length === 1 && sizes[0] === "OS";

  return (
    <>
      <Section aria-labelledby="nb-product" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <Breadcrumb
            className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em]"
            items={[
              { label: "Nöbet", href: sitePageHref("home") },
              { label: t({ en: "Archive", tr: "Arşiv" }), href: sitePageHref("archive") },
              { label: t(category.label) },
            ]}
          />
          <div className="grid border border-line @4xl:grid-cols-12">
            <div className="vm-enter vm-enter-media grid gap-px bg-line @4xl:col-span-7 @4xl:border-e @4xl:border-line">
              {p.photos.map((ph, i) => (
                <Image
                  key={ph.src}
                  src={ph.src}
                  width={ph.width}
                  height={ph.height}
                  focal={ph.focal}
                  alt={t(ph.alt)}
                  aspect="4/5"
                  priority={i === 0}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="bg-scene"
                />
              ))}
            </div>

            <div className="@4xl:col-span-5">
              <div className="flex flex-col gap-5 p-4 @3xl:p-6 @4xl:sticky @4xl:top-16">
                <p className="flex flex-wrap gap-x-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
                  <span className="text-accent-ink">{p.code}</span>
                  <span>{s("drop", { no: String(p.drop).padStart(2, "0") })}</span>
                  <span>{s("run", { n: p.run })}</span>
                </p>
                <h1 id="nb-product" tabIndex={-1} className="vm-enter vm-enter-title [--vm-i:1] font-display text-[clamp(2.4rem,1rem+4cqi,4.25rem)] font-[800] uppercase leading-[0.86] tracking-[-0.04em] outline-none">
                  {t(p.name)}
                </h1>
                <div className="flex items-baseline justify-between gap-4 border-y border-line py-3">
                  <p className="tabular font-mono text-h3 text-fg">{fmt(p.price[currencyOf(locale)])}</p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg-muted">{left === 0 ? s("soldOut") : s("ofRun", { left, run: p.run })}</p>
                </div>
                <p className="text-small text-fg-muted">
                  {t(p.colour)} — {t(p.fit)}
                </p>

                {oneSize ? null : (
                  <div className="flex flex-col gap-2">
                    <p id="nb-size-label" className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg">
                      {s("pickSize")}
                    </p>
                    <RadioGroup<Size>
                      aria-labelledby="nb-size-label"
                      variant="segmented"
                      orientation="horizontal"
                      value={size}
                      onValueChange={(v) => {
                        setSize(v);
                        setTried(false);
                      }}
                      invalid={tried && !size}
                      items={sizes.map((x) => ({ value: x, label: <span className="font-mono">{x}</span>, disabled: (p.stock[x] ?? 0) === 0 }))}
                    />
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg-muted" aria-live="polite">
                      {size ? `${size} — ${s("left", { n: p.stock[size] ?? 0 })}` : tried ? s("pickSize") : " "}
                    </p>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  block
                  disabled={left === 0}
                  onClick={() => {
                    const chosen = oneSize ? "OS" : size;
                    if (!chosen) return setTried(true);
                    add(p.id, chosen);
                  }}
                  className="uppercase tracking-[0.1em]"
                >
                  {left === 0 ? s("soldOut") : s("addToBag")}
                </Button>
                <p className="text-small text-fg-muted">{s("limit")}</p>

                <Accordion type="multiple" defaultValue={["fabric"]} size="sm">
                  <AccordionItem value="fabric">
                    <AccordionTrigger>{t({ en: "Fabric & make", tr: "Kumaş ve üretim" })}</AccordionTrigger>
                    <AccordionContent>
                      <p>{t(p.fabric)}</p>
                      <ul className="mt-2 list-disc ps-5">
                        {p.details.map((d) => (
                          <li key={d.en}>{t(d)}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  {oneSize ? null : (
                    <AccordionItem value="chart">
                      <AccordionTrigger>{t({ en: "Size chart (cm, laid flat)", tr: "Beden tablosu (cm, düz serili)" })}</AccordionTrigger>
                      <AccordionContent>
                        <TableContainer>
                          <Table density="compact">
                            <TableHeader>
                              <TableRow>
                                <TableHead>{t({ en: "Size", tr: "Beden" })}</TableHead>
                                <TableHead align="end">{t({ en: "Chest", tr: "Göğüs" })}</TableHead>
                                <TableHead align="end">{t({ en: "Length", tr: "Boy" })}</TableHead>
                                <TableHead align="end">{t({ en: "Sleeve", tr: "Kol" })}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sizeChart.map((r) => (
                                <TableRow key={r.size} selected={r.size === size}>
                                  <TableCell className="font-mono">{r.size}</TableCell>
                                  <TableCell align="end" className="tabular">{r.chest}</TableCell>
                                  <TableCell align="end" className="tabular">{r.length}</TableCell>
                                  <TableCell align="end" className="tabular">{r.sleeve}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  <AccordionItem value="ship">
                    <AccordionTrigger>{t({ en: "Shipping & returns", tr: "Kargo ve iade" })}</AccordionTrigger>
                    <AccordionContent>
                      {t({
                        en: "Ships Monday from Kadıköy. Türkiye 1–2 working days, Europe 4–6, worldwide 6–10. Returns within 14 days with the numbered tag on.",
                        tr: "Pazartesi Kadıköy’den çıkar. Türkiye 1–2 iş günü, Avrupa 4–6, dünya geneli 6–10. Numaralı etiketiyle 14 gün içinde iade.",
                      })}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="nb-more" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <h2 id="nb-more" className="mb-px border-b border-fg pb-3 font-display text-display-m uppercase leading-[0.9]">
            {t({ en: "Same drop", tr: "Aynı drop" })}
          </h2>
          <div className="grid grid-cols-2 gap-px border border-line bg-line @4xl:grid-cols-4">
            {more.map((x) => (
              <ProductTile key={x.id} product={x} idPrefix="nb-more" />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

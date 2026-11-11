"use client";

import * as React from "react";
import { Badge, Breadcrumb, Button, DescriptionList, RadioGroup, toast } from "@vamos-ui/react";
import { Container, Section, sitePageHref, useSiteShell } from "@vamos-ui/react/blocks";
import { Check, ShoppingBag } from "lucide-react";
import { changelog, fill, licenceById, licences, templateById, templates, type Licence } from "./content";
import { initialPreview, LivePreview, type PreviewState } from "./live-preview";
import { useShop } from "./shop-provider";

const copy = {
  home: { en: "Gridwork", tr: "Gridwork" },
  templates: { en: "Templates", tr: "Şablonlar" },
  by: { en: "by {author} · {n} sold", tr: "{author} · {n} satış" },
  licence: { en: "Licence", tr: "Lisans" },
  buy: { en: "Buy {name} — {price}", tr: "{name} satın al — {price}" },
  added: { en: "{name} ({licence}) is in your cart", tr: "{name} ({licence}) sepetinizde" },
  vat: { en: "Prices exclude VAT. One-time payment, 12 months of updates included.", tr: "Fiyatlara KDV dahil değildir. Tek seferlik ödeme, 12 ay güncelleme dahil." },
  included: { en: "In the download", tr: "İndirilen dosyada" },
  inc: [
    { en: "React source, Next.js App Router, TypeScript", tr: "React kaynak kodu, Next.js App Router, TypeScript" },
    { en: "Every page in the set, with sample data", tr: "Setteki tüm sayfalar, örnek veriyle" },
    { en: "Works with all five theme axes: mode, material, accent, density, fonts", tr: "Beş tema ekseniyle çalışır: mod, malzeme, vurgu, yoğunluk, yazı tipi" },
    { en: "English and Turkish strings, ready for more", tr: "İngilizce ve Türkçe metinler, fazlasına hazır" },
  ],
  specs: { en: "Details", tr: "Ayrıntılar" },
  version: { en: "Version", tr: "Sürüm" },
  updated: { en: "Updated", tr: "Güncellendi" },
  pages: { en: "Pages", tr: "Sayfalar" },
  size: { en: "Download", tr: "İndirme" },
  requires: { en: "Requires", tr: "Gereksinim" },
  changes: { en: "Recent changes", tr: "Son değişiklikler" },
  more: { en: "More templates", tr: "Diğer şablonlar" },
  try: { en: "Try {name}", tr: "{name} dene" },
};

/** Product: the live preview with every control, the licence picker and what is in the file. */
export function ProductPage() {
  const { c, selected, select, buy } = useShop();
  const { navigate } = useSiteShell();
  const { t, f, usd } = c;
  const tpl = templateById(selected);
  const [preview, setPreview] = React.useState<PreviewState>(() => initialPreview(tpl));
  const [licence, setLicence] = React.useState<Licence>("team");
  // A different template opens with its own look.
  const [shownId, setShownId] = React.useState(tpl.id);
  if (shownId !== tpl.id) {
    setShownId(tpl.id);
    setPreview(initialPreview(tpl));
  }
  const price = licenceById(licence).price;

  return (
    <Section theme={{ rhythm: "tight" }} headingId="gw-product-title" className="!pt-8">
      <Container size="wide">
        <Breadcrumb
          items={[
            { label: t(copy.home), href: sitePageHref("home") },
            { label: t(copy.templates), href: sitePageHref("home", "templates") },
            { label: tpl.name },
          ]}
        />
        <div className="mt-6 flex flex-col gap-2 border-b border-line pb-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <h1 id="gw-product-title" className="font-display text-[clamp(2.4rem,6vw,4.25rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-fg">
              {tpl.name}
              <span className="text-fg-subtle">.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-lead text-fg-muted">{t(tpl.description)}</p>
          </div>
          <p className="tabular shrink-0 font-mono text-small text-fg-muted">{fill(t(copy.by), { author: tpl.author, n: f.number(tpl.sales) })}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <LivePreview template={tpl} state={preview} onStateChange={setPreview} maxHeight={720} />

          <aside className="flex flex-col gap-8 xl:sticky xl:top-24 xl:self-start" aria-label={t(copy.licence)}>
            <div className="flex flex-col gap-4">
              <h2 id="gw-licence" className="text-small font-medium text-fg">
                {t(copy.licence)}
              </h2>
              <RadioGroup<Licence>
                variant="card"
                value={licence}
                onValueChange={setLicence}
                aria-labelledby="gw-licence"
                items={licences.map((l) => ({
                  value: l.id,
                  label: (
                    <span className="flex w-full items-baseline justify-between gap-3">
                      {t(l.name)} <span className="tabular font-display text-[1.1rem] font-semibold">{usd(l.price)}</span>
                    </span>
                  ),
                  description: t(l.who),
                }))}
              />
              <Button
                variant="primary"
                size="lg"
                block
                onClick={() => {
                  buy(tpl.id, licence);
                  toast.success(fill(t(copy.added), { name: tpl.name, licence: t(licenceById(licence).name) }));
                  navigate({ page: "checkout" });
                }}
              >
                <ShoppingBag aria-hidden />
                {fill(t(copy.buy), { name: tpl.name, price: usd(price) })}
              </Button>
              <p className="text-[12.5px] leading-relaxed text-fg-muted">{t(copy.vat)}</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-small font-medium text-fg">{t(copy.included)}</h2>
              <ul className="flex flex-col gap-2 text-small text-fg-muted">
                {copy.inc.map((i) => (
                  <li key={i.en} className="flex gap-2">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
                    {t(i)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-small font-medium text-fg">{t(copy.specs)}</h2>
              <DescriptionList
                columns={1}
                items={[
                  { key: "v", label: t(copy.version), value: <span className="tabular font-mono">{tpl.version}</span> },
                  { key: "u", label: t(copy.updated), value: f.date(tpl.updated, "medium") },
                  { key: "p", label: t(copy.pages), value: f.number(tpl.pageCount) },
                  { key: "s", label: t(copy.size), value: `${f.bytes(4.2 * 1024 * 1024)} · zip` },
                  { key: "r", label: t(copy.requires), value: "React 19 · Next.js 15 · @vamos-ui/react" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-small font-medium text-fg">{t(copy.changes)}</h2>
              <ol className="flex flex-col gap-3 border-s border-line ps-4">
                {changelog.map((e) => (
                  <li key={e.version} className="text-small">
                    <p className="tabular flex items-center gap-2">
                      <Badge tone="neutral" size="sm" className="font-mono">
                        {e.version}
                      </Badge>
                      <span className="text-fg-subtle">{f.date(e.date, "medium")}</span>
                    </p>
                    <p className="mt-1 text-fg-muted">{t(e.text)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        <nav aria-label={t(copy.more)} className="mt-16 border-t border-line pt-6">
          <h2 className="font-mono text-[11.5px] tracking-[0.1em] text-fg-muted uppercase">{t(copy.more)}</h2>
          <ul role="list" className="mt-4 flex flex-wrap gap-2">
            {templates
              .filter((x) => x.id !== tpl.id)
              .map((x) => (
                <li key={x.id}>
                  <Button variant="secondary" size="sm" onClick={() => select(x.id)}>
                    {fill(t(copy.try), { name: x.name })}
                  </Button>
                </li>
              ))}
          </ul>
        </nav>
      </Container>
    </Section>
  );
}

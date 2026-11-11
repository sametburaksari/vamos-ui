"use client";

import * as React from "react";
import { PackagePlus, Wand2 } from "lucide-react";
import {
  Badge, Button, Card, CardBody, CardHeader, CurrencyInput, Field, Input, Progress, SlugInput, Switch, Textarea, toast,
} from "@vamos-ui/react";
import { Gallery, LengthMeter, SearchPreview, type MediaSource } from "@vamos-ui/react/media";
import { useBlockFormat } from "../../_shared/format";
import { channelLabels, type Channel } from "../../_shared/products";
import { addDecimal } from "../../_shared/money";
import { daysBetween, TODAY } from "../../_shared/time";
import { channelFees, extraMedia, incoming, product, stockByWarehouse, type ContentLang, type VariantRow } from "./data";

/** A canvas section: anchor target, heading, optional actions. */
export function PimSection({ id, title, description, action, children }: { id: string; title: string; description?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card id={id} className="min-w-0 scroll-mt-24">
      <CardHeader title={title} titleAs="h2" description={description} action={action} />
      <CardBody>{children}</CardBody>
    </Card>
  );
}

/* General ----------------------------------------------------------- */

export function GeneralSection({
  lang,
  copy,
  onChange,
}: {
  lang: ContentLang;
  copy: { name: string; description: string };
  onChange: (patch: Partial<{ name: string; description: string }>) => void;
}) {
  const { c } = useBlockFormat();
  const suffix = lang === "tr" ? " · Türkçe" : " · English";
  return (
    <div className="grid gap-4">
      <Field label={c("Product name", "Ürün adı") + suffix} required>
        <Input value={copy.name} onChange={(e) => onChange({ name: e.target.value })} />
      </Field>
      <Field label={c("Description", "Açıklama") + suffix} hint={c(`${copy.description.length} characters · shown on the product page and marketplaces`, `${copy.description.length} karakter · ürün sayfasında ve pazaryerlerinde görünür`)}>
        <Textarea rows={5} value={copy.description} onChange={(e) => onChange({ description: e.target.value })} />
      </Field>
    </div>
  );
}

/* Media ------------------------------------------------------------- */

export function MediaSection({ media, setMedia, touch }: { media: MediaSource[]; setMedia: React.Dispatch<React.SetStateAction<MediaSource[]>>; touch: () => void }) {
  const { c } = useBlockFormat();
  // 1-based positions, so the warning can say which tile needs a caption.
  const missingAlt = media.flatMap((m, i) => (m.alt ? [] : [i + 1]));
  return (
    <div className="grid gap-3">
      {missingAlt.length ? (
        <p className="text-small text-warning">{c(`${missingAlt.length === 1 ? "Image" : "Images"} ${missingAlt.join(", ")} ${missingAlt.length === 1 ? "has" : "have"} no alt text — add a caption to describe ${missingAlt.length === 1 ? "it" : "them"}.`, `${missingAlt.join(", ")}. görselin alternatif metni yok; açıklamak için başlık ekleyin.`)}</p>
      ) : null}
      <Gallery
        label={c("Product images, first one is the cover", "Ürün görselleri, ilki kapak")}
        items={media}
        editable
        aspect="1/1"
        columns={{ base: 2, sm: 4 }}
        onReorder={(ids) => {
          setMedia((prev) => ids.map((id) => prev.find((p) => p.id === id)!));
          touch();
        }}
        onRemove={(id) => {
          setMedia((prev) => prev.filter((p) => p.id !== id));
          touch();
        }}
        onCaptionChange={(id, caption) => {
          setMedia((prev) => prev.map((p) => (p.id === id ? { ...p, caption, alt: p.alt || caption } : p)));
          touch();
        }}
        onAdd={
          media.some((m) => m.id === extraMedia.id)
            ? undefined
            : () => {
                setMedia((prev) => [...prev, extraMedia]);
                touch();
              }
        }
      />
    </div>
  );
}

/* Variants ---------------------------------------------------------- */

export function VariantsSection({ variants, setVariants, touch }: { variants: VariantRow[]; setVariants: React.Dispatch<React.SetStateAction<VariantRow[]>>; touch: () => void }) {
  const { c, t, money } = useBlockFormat();
  const set = (sku: string, patch: Partial<VariantRow>) => {
    setVariants((all) => all.map((v) => (v.sku === sku ? { ...v, ...patch } : v)));
    touch();
  };
  return (
    <div className="relative -mx-(--card-p) overflow-x-auto">
      <table className="w-full text-small sm:min-w-[560px]">
        <caption className="sr-only">{c("Variants", "Varyantlar")}</caption>
        <thead className="text-fg-subtle">
          <tr className="border-b border-line [&>th]:px-(--card-p) [&>th]:py-2 [&>th]:text-start [&>th]:font-normal max-sm:[&>th]:px-1 max-sm:[&>th:first-child]:ps-(--card-p) max-sm:[&>th:last-child]:pe-(--card-p)">
            <th scope="col">{c("Size", "Ölçü")}</th>
            <th scope="col" className="max-sm:hidden">SKU · {c("barcode", "barkod")}</th>
            <th scope="col">{c("Price", "Fiyat")}</th>
            <th scope="col">
              <span className="max-sm:hidden">{c("On hand", "Stok")}</span>
              <span className="sm:hidden">{c("Qty", "Stok")}</span>
            </th>
            <th scope="col">{c("Sell", "Satışta")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {variants.map((v) => {
            const price = addDecimal([product.price.amount, v.priceDelta]);
            return (
              <tr key={v.sku} className={`[&>td]:px-(--card-p) [&>td]:py-2.5 max-sm:[&>td]:px-1 max-sm:[&>td:first-child]:ps-(--card-p) max-sm:[&>td:last-child]:pe-(--card-p) ${v.active ? "" : "text-fg-subtle"}`}>
                <td className="font-medium text-fg">
                  {t(v.option)}
                  {/* Phones drop the SKU column (the product SKU is in General) to keep price, stock and Sell in view. */}
                </td>
                <td className="max-sm:hidden">
                  <span className="block font-mono text-fg">{v.sku}</span>
                  <span className="font-mono text-fg-subtle">{v.barcode}</span>
                </td>
                <td>
                  {/* Fixed-width wrappers: a bare <input> brings its intrinsic width into the table and pushed Sell out of the card. */}
                  <div className="w-[6.5rem] sm:w-32">
                    <CurrencyInput size="sm" currency="TRY" aria-label={c(`Price, ${t(v.option)}`, `Fiyat, ${t(v.option)}`)} value={price} onValueChange={(val: string | null) => set(v.sku, { priceDelta: String(Number(val ?? 0) - Number(product.price.amount)) })} />
                  </div>
                </td>
                <td>
                  <div className="w-14 sm:w-20">
                  <Input
                    size="sm"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    aria-label={c(`Units on hand, ${t(v.option)}`, `Stok adedi, ${t(v.option)}`)}
                    value={String(v.stock)}
                    onChange={(e) => set(v.sku, { stock: Math.max(0, Number(e.target.value) || 0) })}
                    className="tabular"
                  />
                  </div>
                </td>
                <td>
                  <Switch size="sm" checked={v.active} onCheckedChange={(on) => set(v.sku, { active: on })} aria-label={c(`Sell ${t(v.option)}`, `${t(v.option)} satışta`)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="px-(--card-p) pt-3 text-small text-fg-muted">
        {c(`Base price ${money(product.price)}; each size adds or takes off from it.`, `Taban fiyat ${money(product.price)}; her ölçü bunun üzerine eklenir ya da düşülür.`)}
      </p>
    </div>
  );
}

/* Pricing per channel ----------------------------------------------- */

export function PricingSection({
  channels,
  setChannels,
  touch,
}: {
  channels: Array<{ channel: Channel; price: string; published: boolean }>;
  setChannels: React.Dispatch<React.SetStateAction<Array<{ channel: Channel; price: string; published: boolean }>>>;
  touch: () => void;
}) {
  const { c, t, f, money } = useBlockFormat();
  const cost = Number(product.cost.amount);
  const marginOf = (gross: number, ch: Channel) => {
    const net = gross / 1.2; // VAT 20% included
    const fee = gross * channelFees[ch];
    return net > 0 ? (net - fee - cost) / net : 0;
  };
  const web = channels.find((x) => x.channel === "web")!;

  return (
    <div className="grid gap-3">
      <ul className="grid gap-0 divide-y divide-line rounded-ui border border-line">
        {channels.map((ch) => {
          const margin = marginOf(Number(ch.price), ch.channel);
          const tone = margin < 0.25 ? "danger" : margin < 0.4 ? "warning" : "success";
          return (
            <li key={ch.channel} className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_160px_120px] sm:items-center sm:gap-4">
              <div className="grid min-w-0 gap-0.5">
                <span className="font-medium text-fg">{t(channelLabels[ch.channel])}</span>
                <span className="text-small text-fg-muted">
                  {channelFees[ch.channel] ? c(`${f.percent(channelFees[ch.channel])} fees`, `${f.percent(channelFees[ch.channel])} kesinti`) : c("No fees", "Kesinti yok")}
                  {ch.channel === "wholesale" ? c(" · ex-VAT trade price", " · KDV hariç toptan fiyat") : ""}
                </span>
              </div>
              <CurrencyInput
                size="sm"
                currency="TRY"
                aria-label={c(`Price on ${t(channelLabels[ch.channel])}`, `${t(channelLabels[ch.channel])} fiyatı`)}
                value={ch.price}
                onValueChange={(val: string | null) => {
                  setChannels((all) => all.map((x) => (x.channel === ch.channel ? { ...x, price: val ?? "0" } : x)));
                  touch();
                }}
              />
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <span className="text-small text-fg-subtle sm:hidden">{c("Margin", "Marj")}</span>
                <Badge tone={tone} className="tabular" title={c("Margin after VAT, fees and cost", "KDV, kesinti ve maliyet sonrası marj")}>
                  {f.percent(margin, { maximumFractionDigits: 0 })}
                </Badge>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-small text-fg-muted">{c(`Unit cost ${money(product.cost)} · margin after VAT and channel fees.`, `Birim maliyet ${money(product.cost)} · KDV ve kanal kesintisi sonrası marj.`)}</p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setChannels((all) => all.map((x) => (x.channel === "retail" ? { ...x, price: web.price } : x)));
            touch();
            toast(c("Retail price matched to the online store", "Mağaza fiyatı online fiyatla eşitlendi"));
          }}
        >
          <Wand2 /> {c("Match retail to online", "Mağazayı online ile eşitle")}
        </Button>
      </div>
    </div>
  );
}

/* SEO --------------------------------------------------------------- */

export function SeoSection({
  lang,
  copy,
  slug,
  onChange,
  onSlug,
}: {
  lang: ContentLang;
  copy: { seoTitle: string; seoDescription: string; description: string };
  slug: string;
  onChange: (patch: Partial<{ seoTitle: string; seoDescription: string }>) => void;
  onSlug: (s: string) => void;
}) {
  const { c } = useBlockFormat();
  const base = lang === "tr" ? "https://kilnlinen.example.com/tr/urun/" : "https://kilnlinen.example.com/products/";
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 2xl:grid-cols-2">
      <div className="grid min-w-0 content-start gap-4">
        <Field label={c("Page title", "Sayfa başlığı")}>
          <Input value={copy.seoTitle} onChange={(e) => onChange({ seoTitle: e.target.value })} />
        </Field>
        <LengthMeter value={copy.seoTitle} field="title" label={c("Page title length", "Sayfa başlığı uzunluğu")} className="-mt-2" />
        <Field label={c("Meta description", "Meta açıklama")} hint={!copy.seoDescription ? c("Empty: search engines will quote the product description.", "Boş: arama motorları ürün açıklamasından alıntı yapar.") : undefined}>
          <Textarea rows={3} value={copy.seoDescription} onChange={(e) => onChange({ seoDescription: e.target.value })} />
        </Field>
        <LengthMeter value={copy.seoDescription} field="description" label={c("Meta description length", "Meta açıklama uzunluğu")} className="-mt-2" />
        <Field label={c("URL", "Adres")}>
          <SlugInput value={slug} onValueChange={onSlug} prefix={base.replace("https://", "")} />
        </Field>
      </div>
      <div className="grid min-w-0 content-start gap-2">
        <span className="text-small text-fg-muted">{c("Search result preview", "Arama sonucu önizlemesi")}</span>
        <div className="relative max-w-full overflow-x-auto">
          <SearchPreview data={{ url: base + slug, title: copy.seoTitle, description: copy.seoDescription || copy.description, siteName: "Kiln & Linen" }} highlight={lang === "tr" ? "keten nevresim" : "linen duvet cover"} size="sm" />
        </div>
      </div>
    </div>
  );
}

/* Stock --------------------------------------------------------------- */

export function StockSection({ total }: { total: number }) {
  const { c, f } = useBlockFormat();
  const max = Math.max(...stockByWarehouse.map((s) => s.onHand));
  const cover = Math.round((total / product.sold30d) * 30);
  const below = total <= product.reorderPoint;
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-3 gap-3">
        <Figure label={c("On hand", "Eldeki")} value={f.number(total)} />
        <Figure label={c("Sold, 30 days", "30 günde satılan")} value={f.number(product.sold30d)} />
        <Figure label={c("Days of cover", "Yeterlilik (gün)")} value={f.number(cover)} tone={cover < 30 ? "warning" : undefined} />
      </div>
      <ul className="grid gap-3">
        {stockByWarehouse.map((s) => (
          <li key={s.warehouse.id}>
            <Progress
              label={
                <span>
                  {s.warehouse.name} <span className="font-mono text-fg-subtle">{s.warehouse.code}</span>
                </span>
              }
              value={s.onHand}
              max={max}
              size="sm"
              valueText={c(`${s.onHand} on hand, ${s.reserved} reserved`, `${s.onHand} stokta, ${s.reserved} rezerve`)}
              showValue={() => (
                <span className="tabular">
                  <span className="text-fg">{s.onHand}</span> <span className="text-fg-subtle">· {c(`${s.reserved} reserved`, `${s.reserved} rezerve`)}</span>
                </span>
              )}
            />
          </li>
        ))}
      </ul>
      <div className="surface-2 flex flex-wrap items-center justify-between gap-3 rounded-ui p-3">
        <div className="grid gap-0.5 text-small">
          <span className="font-medium text-fg">
            <PackagePlus className="me-1.5 inline size-4 align-[-3px]" aria-hidden />
            {c(`${incoming.units} units arriving ${f.date(incoming.eta, "medium")}`, `${incoming.units} adet ${f.date(incoming.eta, "medium")} geliyor`)}
          </span>
          <span className="text-fg-muted">
            {incoming.po} · {incoming.supplier} · {c(`in ${daysBetween(TODAY, incoming.eta)} days`, `${daysBetween(TODAY, incoming.eta)} gün sonra`)}
          </span>
        </div>
        <Badge tone={below ? "warning" : "neutral"}>{c(`Reorder at ${product.reorderPoint}`, `${product.reorderPoint} adette sipariş`)}</Badge>
      </div>
    </div>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: "warning" }) {
  return (
    <div className="grid gap-0.5 rounded-ui border border-line p-3">
      <span className="text-small text-fg-muted">{label}</span>
      <span className={`font-heading text-[22px] leading-tight tabular ${tone === "warning" ? "text-warning" : "text-fg"}`}>{value}</span>
    </div>
  );
}

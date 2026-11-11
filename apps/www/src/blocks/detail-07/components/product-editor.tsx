"use client";

import * as React from "react";
import { Check, Circle, Eye } from "lucide-react";
import {
  Badge, Button, EditorBar, EditorCanvas, EditorLayout, EditorPanel, EditorPanelSection, SaveStatus, Select, Switch, TagInput, ToggleGroup, ToggleGroupItem, toast, type SaveState,
} from "@vamos-ui/react";
import { ProgressRing } from "@vamos-ui/react/charts";
import type { MediaSource } from "@vamos-ui/react/media";
import { useBlockFormat } from "../../_shared/format";
import { categoryLabels, channelLabels, productStatusLabels, type ProductStatus } from "../../_shared/products";
import { NOW_MS } from "../../_shared/time";
import { collections as initialCollections, initialChannels, initialCopy, initialMedia, initialVariants, product, slug as initialSlug, type ContentLang } from "./data";
import { GeneralSection, MediaSection, PimSection, PricingSection, SeoSection, StockSection, VariantsSection } from "./pim-sections";

/** Product information editor: copy in two languages, media, variants, channel prices, SEO, stock. */
export function ProductEditor() {
  const { c, t } = useBlockFormat();
  const [lang, setLang] = React.useState<ContentLang>("en");
  const [copy, setCopy] = React.useState(initialCopy);
  const [media, setMedia] = React.useState<MediaSource[]>(initialMedia);
  const [variants, setVariants] = React.useState(initialVariants);
  const [channels, setChannels] = React.useState(initialChannels);
  const [slug, setSlug] = React.useState(initialSlug);
  const [status, setStatus] = React.useState<ProductStatus>(product.status);
  const [tags, setTags] = React.useState(initialCollections);
  const [save, setSave] = React.useState<{ state: SaveState; at?: number }>({ state: "saved", at: NOW_MS - 26 * 60_000 });
  const timer = React.useRef<number | undefined>(undefined);

  const touch = React.useCallback(() => setSave({ state: "dirty" }), []);
  const patchCopy = (patch: Partial<(typeof initialCopy)["en"]>) => {
    setCopy((all) => ({ ...all, [lang]: { ...all[lang], ...patch } }));
    touch();
  };

  const doSave = () => {
    if (save.state !== "dirty") return;
    setSave({ state: "saving" });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setSave({ state: "saved", at: NOW_MS });
      toast.success(c("Product saved", "Ürün kaydedildi"), { description: c("Published channels update within a minute.", "Yayındaki kanallar bir dakika içinde güncellenir.") });
    }, 800);
  };
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const total = variants.reduce((s, v) => s + v.stock, 0);

  const checks: Array<{ id: string; label: string; done: boolean; href: string }> = [
    { id: "tr-name", label: c("Turkish name", "Türkçe ad"), done: !!copy.tr.name.trim(), href: "#pim-general" },
    { id: "tr-desc", label: c("Turkish description", "Türkçe açıklama"), done: copy.tr.description.trim().length >= 80, href: "#pim-general" },
    { id: "images", label: c("At least 4 images", "En az 4 görsel"), done: media.length >= 4, href: "#pim-media" },
    { id: "alt", label: c("Alt text on every image", "Tüm görsellerde alternatif metin"), done: media.every((m) => !!m.alt), href: "#pim-media" },
    { id: "seo-en", label: c("Meta description (English)", "Meta açıklama (İngilizce)"), done: !!copy.en.seoDescription.trim(), href: "#pim-seo" },
    { id: "seo-tr", label: c("Meta description (Turkish)", "Meta açıklama (Türkçe)"), done: !!copy.tr.seoDescription.trim(), href: "#pim-seo" },
    { id: "stock", label: c("Every size in stock", "Her ölçü stokta"), done: variants.every((v) => !v.active || v.stock > 0), href: "#pim-variants" },
  ];
  const done = checks.filter((x) => x.done).length;

  const jump = [
    ["pim-general", c("General", "Genel")],
    ["pim-media", c("Media", "Medya")],
    ["pim-variants", c("Variants", "Varyantlar")],
    ["pim-pricing", c("Pricing", "Fiyat")],
    ["pim-seo", "SEO"],
    ["pim-stock", c("Stock", "Stok")],
  ] as const;

  return (
    <div
      className="min-w-0"
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          doSave();
        }
      }}
    >
      <EditorLayout scroll="page" shortcuts={false}>
        <EditorBar
          back={{ href: "#products", label: c("Products", "Ürünler") }}
          title={
            <span className="inline-flex min-w-0 items-center gap-2">
              <span className="truncate">{copy[lang].name || c("Untitled product", "Adsız ürün")}</span>
              <Badge tone={status === "active" ? "success" : status === "draft" ? "neutral" : "warning"} dot className="max-sm:hidden">
                {t(productStatusLabels[status])}
              </Badge>
            </span>
          }
          status={<SaveStatus state={save.state} at={save.at} now={NOW_MS} guard={false} />}
          secondaryActions={
            <Button size="sm" variant="ghost" asChild>
              <a href={`https://kilnlinen.example.com/products/${slug}`} target="_blank" rel="noreferrer">
                <Eye /> {c("View in store", "Mağazada gör")}
              </a>
            </Button>
          }
          actions={
            <Button size="sm" variant="primary" onClick={doSave} disabled={save.state !== "dirty"} loading={save.state === "saving"}>
              {c("Save", "Kaydet")}
            </Button>
          }
          menu={[
            { id: "dup", label: c("Duplicate", "Kopyala"), onSelect: () => toast(c("Copy created as a draft", "Kopya taslak olarak oluşturuldu")) },
            { id: "history", label: c("Change history", "Değişiklik geçmişi") },
            { type: "separator", id: "sep" },
            { id: "archive", label: c("Archive product", "Ürünü arşivle"), tone: "danger", onSelect: () => { setStatus("archived"); touch(); } },
          ]}
        />

        <EditorCanvas width="wide" tone="scene">
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-(--gap) pb-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav aria-label={c("Sections", "Bölümler")} className="scrollbar-none -mx-1 flex min-w-0 max-w-full gap-1 overflow-x-auto px-1">
                {jump.map(([id, label]) => (
                  <a key={id} href={`#${id}`} className="focus-ring shrink-0 rounded-full px-3 py-1 text-small text-fg-muted hover:bg-hover hover:text-fg">
                    {label}
                  </a>
                ))}
              </nav>
              <ToggleGroup type="single" size="sm" variant="segmented" value={lang} onValueChange={(v) => v && setLang(v as ContentLang)} aria-label={c("Content language", "İçerik dili")}>
                <ToggleGroupItem value="en">English</ToggleGroupItem>
                <ToggleGroupItem value="tr">Türkçe</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <PimSection id="pim-general" title={c("General", "Genel")} description={c(`SKU ${product.sku} · ${t(categoryLabels[product.category])}`, `SKU ${product.sku} · ${t(categoryLabels[product.category])}`)}>
              <GeneralSection lang={lang} copy={copy[lang]} onChange={patchCopy} />
            </PimSection>

            <PimSection id="pim-media" title={c("Media", "Medya")} description={c("Drag to reorder. The first image is the cover on every channel.", "Sıralamak için sürükleyin. İlk görsel her kanalda kapak olur.")}>
              <MediaSection media={media} setMedia={setMedia} touch={touch} />
            </PimSection>

            <PimSection id="pim-variants" title={c("Variants", "Varyantlar")} description={c(`${variants.length} sizes · ${total} units`, `${variants.length} ölçü · ${total} adet`)}>
              <VariantsSection variants={variants} setVariants={setVariants} touch={touch} />
            </PimSection>

            <PimSection id="pim-pricing" title={c("Pricing by channel", "Kanala göre fiyat")} description={c("Gross prices, VAT 20% included.", "Brüt fiyatlar, %20 KDV dahil.")}>
              <PricingSection channels={channels} setChannels={setChannels} touch={touch} />
            </PimSection>

            <PimSection id="pim-seo" title={c("Search engine listing", "Arama motoru görünümü")} description={lang === "tr" ? "Türkçe sayfa" : c("English page", "İngilizce sayfa")}>
              <SeoSection
                lang={lang}
                copy={copy[lang]}
                slug={slug}
                onChange={patchCopy}
                onSlug={(s) => {
                  setSlug(s);
                  touch();
                }}
              />
            </PimSection>

            <PimSection id="pim-stock" title={c("Stock", "Stok")} description={c("Across three warehouses.", "Üç depoda toplam.")}>
              <StockSection total={total} />
            </PimSection>
          </div>
        </EditorCanvas>

        <EditorPanel>
          <EditorPanelSection id="pim-completeness" title={c("Completeness", "Tamamlanma")} summary={`${done}/${checks.length}`} defaultOpen>
            <div className="flex items-center gap-4">
              <ProgressRing value={done} max={checks.length} size="sm" color={done === checks.length ? "success" : "accent-ink"} aria-label={c(`${done} of ${checks.length} checks complete`, `${checks.length} kontrolün ${done} tanesi tamam`)} />
              <p className="text-small text-fg-muted">
                {done === checks.length ? c("Ready for every channel.", "Tüm kanallara hazır.") : c(`${checks.length - done} things left before the marketplace accepts it.`, `Pazaryerinin kabul etmesi için ${checks.length - done} eksik var.`)}
              </p>
            </div>
            <ul className="grid gap-1">
              {checks.map((x) => (
                <li key={x.id}>
                  <a href={x.href} className={`focus-ring flex items-center gap-2 rounded-ui px-1.5 py-1 text-small hover:bg-hover ${x.done ? "text-fg-muted" : "text-fg"}`}>
                    {x.done ? <Check className="size-3.5 text-success" aria-hidden /> : <Circle className="size-3.5 text-fg-subtle" aria-hidden />}
                    <span className={x.done ? "line-through decoration-fg-subtle" : ""}>{x.label}</span>
                    <span className="sr-only">{x.done ? c("done", "tamam") : c("to do", "yapılacak")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </EditorPanelSection>

          <EditorPanelSection id="pim-status" title={c("Status & channels", "Durum ve kanallar")} summary={t(productStatusLabels[status])} defaultOpen>
            <Select
              aria-label={c("Product status", "Ürün durumu")}
              value={status}
              onValueChange={(v) => {
                if (!v) return;
                setStatus(v as ProductStatus);
                touch();
              }}
              items={(["active", "draft", "archived"] as const).map((s) => ({ value: s, label: t(productStatusLabels[s]) }))}
            />
            <ul className="grid gap-3 pt-1">
              {channels.map((ch) => (
                <li key={ch.channel}>
                  <Switch
                    size="sm"
                    checked={ch.published && status === "active"}
                    disabled={status !== "active"}
                    onCheckedChange={(on) => {
                      setChannels((all) => all.map((x) => (x.channel === ch.channel ? { ...x, published: on } : x)));
                      touch();
                    }}
                    label={t(channelLabels[ch.channel])}
                    labelPosition="start"
                    className="w-full justify-between"
                  />
                </li>
              ))}
            </ul>
          </EditorPanelSection>

          <EditorPanelSection id="pim-organise" title={c("Organisation", "Düzen")} summary={t(categoryLabels[product.category])}>
            <Select aria-label={c("Category", "Kategori")} defaultValue={product.category} onValueChange={touch} items={Object.entries(categoryLabels).map(([k, v]) => ({ value: k, label: t(v) }))} />
            <TagInput
              aria-label={c("Collections", "Koleksiyonlar")}
              value={tags}
              onValueChange={(v) => {
                setTags(v);
                touch();
              }}
              suggestions={["Bedroom", "Linen edit", "Autumn 2026", "Gifts under ₺3,000", "Bathroom", "New in"]}
            />
          </EditorPanelSection>
        </EditorPanel>
      </EditorLayout>
    </div>
  );
}

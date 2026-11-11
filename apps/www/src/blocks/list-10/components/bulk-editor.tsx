"use client";

import * as React from "react";
import { ArrowRight, Redo2, Search, TriangleAlert, Undo2, UploadCloud } from "lucide-react";
import { Badge, Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Input, Kbd, PageHeader, Select, Switch, Tooltip, cn, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { AdjustPopover, type Adjustment } from "./adjust-popover";
import { categoryLabels, columnLabels, gridProducts, priceKeys, productStatusLabels, type EditKey, type ProductCategory, type ProductStatus } from "./grid-data";
import { PriceGrid } from "./price-grid";
import { roundTo90, toMoney, useGridEdits, type CellValue } from "./use-grid-edits";

const byId = Object.fromEntries(gridProducts.map((p) => [p.id, p]));

/** Bulk price & stock editor: a keyboard-first grid with undo, bulk adjustments and a review step before publishing. */
export function BulkEditor() {
  const { c, t, f } = useBlockFormat();
  const edits = useGridEdits();
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<ProductCategory | null>(null);
  const [changedOnly, setChangedOnly] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [reviewing, setReviewing] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [lastPublished, setLastPublished] = React.useState({
    at: "09:12",
    by: "p-ruth",
  });

  const changedIds = new Set(edits.changes.map((ch) => ch.id));
  const q = query.trim().toLocaleLowerCase();
  const rows = gridProducts.filter(
    (p) => (!category || p.category === category) && (!changedOnly || changedIds.has(p.id)) && (!q || `${t(p.name)} ${p.sku}`.toLocaleLowerCase().includes(q)),
  );
  const targets = selected.size ? rows.filter((p) => selected.has(p.id)) : rows;

  const fmt = (key: EditKey, v: CellValue) =>
    key === "status" ? t(productStatusLabels[v as ProductStatus]) : key === "stock" || key === "reorder" ? f.number(v as number) : f.currency(v as string, { currency: "TRY", currencyDisplay: "narrowSymbol" });

  const applyAdjustment = (a: Adjustment) => {
    const patches: Array<{ id: string; key: EditKey; to: CellValue }> = [];
    for (const p of targets) {
      const v = edits.values[p.id]!;
      if (a.target === "stock") {
        const to = a.mode === "set" ? a.amount : a.mode === "up" ? v.stock + a.amount : Math.max(0, v.stock - a.amount);
        patches.push({ id: p.id, key: "stock", to: Math.round(to) });
        continue;
      }
      const keys = a.target === "all-prices" ? priceKeys : [a.target];
      for (const key of keys) {
        const now = Number(v[key]);
        let next = a.mode === "set" ? a.amount : now * (1 + ((a.mode === "up" ? 1 : -1) * a.amount) / 100);
        if (a.round90) next = roundTo90(next);
        patches.push({ id: p.id, key, to: toMoney(next) });
      }
    }
    edits.apply(patches);
    toast.success(c(`Adjusted ${targets.length} ${targets.length === 1 ? "product" : "products"}`, `${targets.length} ürün düzenlendi`), {
      description: c("Nothing is live yet. Review and publish when you're ready.", "Henüz hiçbir şey yayında değil. Hazır olduğunuzda gözden geçirip yayınlayın."),
      action: { label: c("Undo", "Geri al"), onClick: edits.undo },
    });
  };

  // Summary for the review bar.
  const avgMargin = (vals: typeof edits.values) =>
    gridProducts.reduce((s, p) => s + (Number(vals[p.id]!.price) - Number(p.cost)) / Number(vals[p.id]!.price), 0) / gridProducts.length;
  const marginBefore = avgMargin(edits.base);
  const marginAfter = avgMargin(edits.values);
  const belowCost = edits.changes.filter((ch) => priceKeys.includes(ch.key as never) && Number(ch.to) < Number(byId[ch.id]!.cost)).length;
  const n = edits.changes.length;

  const grouped = Array.from(changedIds).map((id) => ({
    product: byId[id]!,
    items: edits.changes.filter((ch) => ch.id === id),
  }));

  const publish = () => {
    setPublishing(true);
    window.setTimeout(() => {
      edits.publish();
      setPublishing(false);
      setReviewing(false);
      setChangedOnly(false);
      setLastPublished({ at: "10:24", by: "p-defne" });
      toast.success(c(`${n} ${n === 1 ? "change" : "changes"} published`, `${n} değişiklik yayınlandı`), {
        description: c(
          "Online store, marketplace, retail tills and the wholesale price list are updated.",
          "Online mağaza, pazaryeri, mağaza kasaları ve toptan fiyat listesi güncellendi.",
        ),
      });
    }, 900);
  };

  return (
    <div className="mx-auto flex max-w-[1480px] flex-col gap-4">
      <PageHeader
        eyebrow={c("Kiln & Linen · Catalogue", "Kiln & Linen · Katalog")}
        title={c("Prices & stock", "Fiyat ve stok")}
        description={c(
          "Edit like a spreadsheet. Nothing goes live until you publish, then every channel updates at once.",
          "Tablo gibi düzenleyin. Yayınlayana kadar hiçbir şey canlıya çıkmaz, sonra tüm kanallar aynı anda güncellenir.",
        )}
        meta={
          <Badge tone="outline" className="tabular">
            {c(`Published ${lastPublished.at} · ${person(lastPublished.by).name}`, `Son yayın ${lastPublished.at} · ${person(lastPublished.by).name}`)}
          </Badge>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          aria-label={c("Search products", "Ürün ara")}
          placeholder={c("Name or SKU…", "Ad veya SKU…")}
          leading={<Search />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-60"
        />
        <div className="w-[calc(50%-0.25rem)] sm:w-44">
          <Select
            aria-label={c("Category", "Kategori")}
            value={category}
            onValueChange={(v) => setCategory(v as ProductCategory | null)}
            clearable
            placeholder={c("All categories", "Tüm kategoriler")}
            items={(Object.keys(categoryLabels) as ProductCategory[]).map((k) => ({ value: k, label: t(categoryLabels[k]) }))}
          />
        </div>
        <Switch checked={changedOnly} onCheckedChange={setChangedOnly} label={c("Changed only", "Yalnız değişenler")} className="ms-1" />
        <div className="ms-auto flex items-center gap-1.5">
          <Tooltip
            content={
              <span className="flex items-center gap-2">
                {c("Undo", "Geri al")} <Kbd keyName="mod" />
                <Kbd>Z</Kbd>
              </span>
            }
          >
            <Button size="icon" variant="ghost" aria-label={c("Undo", "Geri al")} disabled={!edits.canUndo} onClick={edits.undo}>
              <Undo2 />
            </Button>
          </Tooltip>
          <Tooltip
            content={
              <span className="flex items-center gap-2">
                {c("Redo", "Yinele")} <Kbd keyName="shift" />
                <Kbd keyName="mod" />
                <Kbd>Z</Kbd>
              </span>
            }
          >
            <Button size="icon" variant="ghost" aria-label={c("Redo", "Yinele")} disabled={!edits.canRedo} onClick={edits.redo}>
              <Redo2 />
            </Button>
          </Tooltip>
          <AdjustPopover
            count={targets.length}
            scopeLabel={
              selected.size
                ? c(`${targets.length} selected products`, `${targets.length} seçili ürün`)
                : c(`All ${rows.length} products in this view`, `Bu görünümdeki ${rows.length} ürünün hepsi`)
            }
            onApply={applyAdjustment}
          />
        </div>
      </div>

      <PriceGrid
        rows={rows}
        values={edits.values}
        base={edits.base}
        selected={selected}
        onToggle={(id) =>
          setSelected((s) => {
            const next = new Set(s);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
        onToggleAll={(on) => setSelected(on ? new Set(rows.map((p) => p.id)) : new Set())}
        onCommit={(id, key, to) => edits.apply([{ id, key, to }])}
        onUndo={edits.undo}
        onRedo={edits.redo}
      />

      <div
        role="region"
        aria-label={c("Pending changes", "Bekleyen değişiklikler")}
        className={cn(
          "flex flex-wrap items-center gap-x-5 gap-y-3 rounded-ui-lg px-4 py-3",
          n ? "surface-popover ui-rise sticky bottom-3 z-30" : "border border-dashed border-line",
        )}
      >
        {n ? (
          <>
            <p className="text-[13px] text-fg">
              <strong className="font-mono font-medium tabular">{n}</strong> {n === 1 ? c("change", "değişiklik") : c("changes", "değişiklik")}{" "}
              <span className="text-fg-muted">{c(`in ${changedIds.size} ${changedIds.size === 1 ? "product" : "products"}`, `${changedIds.size} üründe`)}</span>
            </p>
            <p className="flex items-center gap-1.5 font-mono text-[12.5px] text-fg-muted tabular">
              <span className="font-sans text-fg-subtle">{c("Avg. online margin", "Ort. online marj")}</span>
              {f.percent(marginBefore, {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1,
              })}
              <ArrowRight className="size-3.5" aria-label={c("to", "→")} />
              <span className="font-medium text-fg">
                {f.percent(marginAfter, {
                  maximumFractionDigits: 1,
                  minimumFractionDigits: 1,
                })}
              </span>
            </p>
            {belowCost ? (
              <Badge tone="danger" className="gap-1 [&_svg]:size-3">
                <TriangleAlert aria-hidden /> {c(`${belowCost} below cost`, `${belowCost} maliyet altında`)}
              </Badge>
            ) : null}
            <div className="ms-auto flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  edits.discard();
                  toast(c("Changes discarded", "Değişiklikler bırakıldı"), {
                    action: {
                      label: c("Undo", "Geri al"),
                      onClick: edits.undo,
                    },
                  });
                }}
              >
                {c("Discard", "Bırak")}
              </Button>
              <Button variant="primary" onClick={() => setReviewing(true)}>
                <UploadCloud /> {c("Review & publish", "Gözden geçir ve yayınla")}
              </Button>
            </div>
          </>
        ) : (
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-fg-subtle">
            <span className="flex items-center gap-1.5">
              <Kbd keyName="enter" /> {c("edit", "düzenle")}
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>+10%</Kbd> {c("raise a price", "fiyatı artır")}
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd keyName="tab" /> {c("next column", "sonraki sütun")}
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd keyName="mod" />
              <Kbd>Z</Kbd> {c("undo", "geri al")}
            </span>
            <span className="max-sm:hidden">{c("All changes stay drafts until you publish.", "Yayınlayana kadar tüm değişiklikler taslaktır.")}</span>
          </p>
        )}
      </div>

      <Dialog open={reviewing} onOpenChange={(o) => !publishing && setReviewing(o)}>
        <DialogContent size="lg">
          <DialogHeader
            title={c(`Publish ${n} ${n === 1 ? "change" : "changes"}?`, `${n} değişiklik yayınlansın mı?`)}
            description={c(
              "These go to the online store, the marketplace feed, retail tills and the wholesale price list.",
              "Online mağaza, pazaryeri akışı, mağaza kasaları ve toptan fiyat listesine gider.",
            )}
          />
          <DialogBody className="grid gap-4">
            {grouped.map(({ product, items }) => (
              <section key={product.id} aria-label={t(product.name)} className="rounded-ui border border-line">
                <header className="flex items-baseline justify-between gap-3 border-b border-line px-3.5 py-2">
                  <span className="truncate text-[13px] font-medium text-fg">{t(product.name)}</span>
                  <span className="font-mono text-[11px] text-fg-subtle">{product.sku}</span>
                </header>
                <dl className="grid grid-cols-[minmax(7rem,auto)_minmax(0,1fr)] gap-x-4 gap-y-1.5 px-3.5 py-2.5 text-[13px]">
                  {items.map((ch) => {
                    const low = priceKeys.includes(ch.key as never) && Number(ch.to) < Number(product.cost);
                    return (
                      <React.Fragment key={ch.key}>
                        <dt className="text-fg-subtle">{t(columnLabels[ch.key])}</dt>
                        <dd className="flex flex-wrap items-center gap-x-2 font-mono text-[12.5px] tabular">
                          <del className="text-fg-subtle">{fmt(ch.key, ch.from)}</del>
                          <ArrowRight className="size-3 text-fg-subtle" aria-label={c("to", "→")} />
                          <ins className={cn("no-underline", low ? "text-danger" : "text-fg")}>{fmt(ch.key, ch.to)}</ins>
                          {low ? <span className="font-sans text-xs text-danger">{c("below cost", "maliyet altında")}</span> : null}
                        </dd>
                      </React.Fragment>
                    );
                  })}
                </dl>
              </section>
            ))}
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => setReviewing(false)} disabled={publishing}>
              {c("Keep editing", "Düzenlemeye devam")}
            </Button>
            <Button variant="primary" loading={publishing} loadingText={c("Publishing…", "Yayınlanıyor…")} onClick={publish}>
              {c("Publish now", "Şimdi yayınla")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

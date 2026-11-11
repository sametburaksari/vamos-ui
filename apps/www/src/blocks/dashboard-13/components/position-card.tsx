"use client";

import { Card, cn } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { daysOfCover, stockState, unitCost, type Product } from "./data";

// Dividers for a 2 → 4 → 2 → 4 column KPI grid (phone, tablet, laptop beside the chart, wide).
const kpiBorders = ["", "border-s", "max-sm:border-t sm:border-s lg:max-xl:border-s-0 lg:max-xl:border-t", "border-s max-sm:border-t lg:max-xl:border-t"];

const buckets = [
  { key: "out", min: -1, max: 0, cls: "bg-danger" },
  { key: "d14", min: 0, max: 14, cls: "bg-warning" },
  { key: "d30", min: 14, max: 30, cls: "bg-chart-3" },
  { key: "d60", min: 30, max: 60, cls: "bg-chart-2" },
  { key: "d60p", min: 60, max: Infinity, cls: "bg-chart-1" },
] as const;

/** Inventory value and health in numbers, plus how many SKUs fall into each days-of-cover band. */
export function PositionCard({ products }: { products: Product[] }) {
  const { f, c } = useBlockFormat();
  const value = products.reduce((s, p) => s + p.stock * unitCost(p), 0);
  const units = products.reduce((s, p) => s + p.stock, 0);
  const low = products.filter((p) => p.status === "active" && stockState(p) === "low").length;
  const out = products.filter((p) => p.status === "active" && stockState(p) === "out").length;
  const covers = products.filter((p) => p.status === "active").map((p) => (p.stock <= 0 ? 0 : daysOfCover(p))).filter((v): v is number => v !== null);
  const sorted = [...covers].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)]! : 0;

  const bandOf = (p: Product) => {
    if (p.stock <= 0) return "out";
    const d = daysOfCover(p) ?? Infinity;
    return buckets.find((b) => b.key !== "out" && d > b.min && d <= b.max)?.key ?? "d60p";
  };
  const counts = buckets.map((b) => ({ ...b, list: products.filter((p) => p.status === "active" && bandOf(p) === b.key) }));
  const maxCount = Math.max(1, ...counts.map((b) => b.list.length));
  const label = {
    out: c("Out", "Yok"),
    d14: c("≤ 14 d", "≤ 14 g"),
    d30: c("15–30 d", "15–30 g"),
    d60: c("31–60 d", "31–60 g"),
    d60p: c("60+ d", "60+ g"),
  };

  const kpis = [
    { key: "value", label: c("Stock at cost", "Maliyetle stok"), node: <CountUp value={Math.round(value)} format={{ style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", notation: "compact", maximumFractionDigits: 1 }} />, hint: c(`${f.number(units)} units on hand`, `Elde ${f.number(units)} adet`) },
    { key: "low", label: c("At or below reorder point", "Sipariş noktasında"), node: <CountUp value={low} />, hint: c("active SKUs", "aktif ürün"), cls: low ? "text-warning" : "" },
    { key: "out", label: c("Out of stock", "Stokta yok"), node: <CountUp value={out} />, hint: c("losing sales today", "bugün satış kaybettiriyor"), cls: out ? "text-danger" : "" },
    { key: "cover", label: c("Median cover", "Ortanca stok süresi"), node: <><CountUp value={Math.round(median)} /><span className="ms-1 font-sans text-sm text-fg-subtle">{c("days", "gün")}</span></>, hint: c("at the 30-day sales rate", "30 günlük satış hızıyla") },
  ];

  return (
    <Card className="ui-rise min-w-0 overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <dl className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k, i) => (
            <div key={k.key} className={cn("min-w-0 border-line p-(--card-p)", kpiBorders[i])}>
              <dt className="text-[13px] text-fg-muted">{k.label}</dt>
              <dd className={cn("mt-1.5 font-display text-[clamp(1.6rem,2.6vw,2.3rem)] leading-none text-fg", k.cls)}>{k.node}</dd>
              <dd className="mt-1.5 text-xs text-fg-subtle">{k.hint}</dd>
            </div>
          ))}
        </dl>
        <section aria-labelledby="cover-title" className="border-line p-(--card-p) max-lg:border-t lg:border-s">
          <h2 id="cover-title" className="text-[13px] font-medium text-fg">{c("Days of cover", "Kaç gün yeter")}</h2>
          <p className="text-xs text-fg-subtle">{c("Active SKUs by how long stock lasts", "Aktif ürünler, stokun yetme süresine göre")}</p>
          <ol className="mt-3 grid h-28 grid-cols-5 items-end gap-2">
            {counts.map((b) => (
              <li key={b.key} className="flex h-full flex-col items-center justify-end gap-1">
                <span className="font-mono text-xs text-fg tabular">{b.list.length}</span>
                <span
                  className={cn("w-full rounded-t-ui-sm transition-[height] duration-500", b.list.length ? b.cls : "bg-track")}
                  style={{ height: `${Math.max(4, (b.list.length / maxCount) * 72)}px` }}
                  title={b.list.map((p) => p.sku).join(", ")}
                  aria-hidden
                />
                <span className="text-[11px] whitespace-nowrap text-fg-subtle">
                  {label[b.key]}
                  <span className="sr-only">: {b.list.length}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Card>
  );
}

"use client";

import * as React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge, Card, CardHeader, Select, Table, TableBody, TableCell, TableContainer, TableEmpty, TableHead, TableHeader, TableRow, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { categoryLabels, daysOfCover, productPhoto, stockState, warehouses, type Product, type ProductCategory } from "./data";
import type { OnOrder } from "./reorder-queue";

type SortKey = "cover" | "stock" | "sold";

/** Stock per SKU against its reorder point, days of cover and 30-day sales; sortable and filterable by category. */
export function StockTable({ products, onOrder }: { products: Product[]; onOrder: Record<string, OnOrder> }) {
  const { f, t, c } = useBlockFormat();
  const [cat, setCat] = React.useState<ProductCategory | "all">("all");
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 1 | -1 }>({ key: "cover", dir: 1 });

  const val = (p: Product, k: SortKey) => (k === "cover" ? (p.stock <= 0 ? -1 : daysOfCover(p) ?? 9999) : k === "stock" ? p.stock : p.sold30d);
  const rows = products.filter((p) => cat === "all" || p.category === cat).sort((a, b) => (val(a, sort.key) - val(b, sort.key)) * sort.dir);
  const scaleMax = Math.max(1, ...rows.map((p) => Math.max(p.stock, p.reorderPoint * 2)));

  const head = (key: SortKey, label: string) => {
    const on = sort.key === key;
    return (
      <TableHead align="end" aria-sort={on ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
        <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((s.dir * -1) as 1 | -1) : 1 }))} className="focus-ring inline-flex items-center gap-1 rounded-ui-sm hover:text-fg">
          {label}
          {on ? sort.dir === 1 ? <ArrowUp aria-hidden className="size-3" /> : <ArrowDown aria-hidden className="size-3" /> : null}
        </button>
      </TableHead>
    );
  };

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "220ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Stock levels", "Stok seviyeleri")}
        description={c("Bar: units on hand. Tick: reorder point.", "Çubuk: eldeki adet. Çentik: sipariş noktası.")}
        action={
          <Select
            size="sm"
            aria-label={c("Category", "Kategori")}
            value={cat}
            onValueChange={(v) => setCat((v ?? "all") as ProductCategory | "all")}
            items={[{ value: "all", label: c("All categories", "Tüm kategoriler") }, ...(Object.keys(categoryLabels) as ProductCategory[]).map((k) => ({ value: k, label: t(categoryLabels[k]) }))]}
            className="w-44"
          />
        }
      />
      <TableContainer className="border-t border-line">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead>{c("Product", "Ürün")}</TableHead>
              <TableHead>{c("Site", "Depo")}</TableHead>
              <TableHead className="w-[28%]">{c("On hand", "Eldeki")}</TableHead>
              {head("stock", c("Units", "Adet"))}
              {head("cover", c("Cover", "Yeter"))}
              {head("sold", c("Sold 30 d", "30 g satış"))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? <TableEmpty colSpan={6} title={c("No products in this category here", "Bu depoda bu kategoride ürün yok")} /> : null}
            {rows.map((p) => {
              const st = stockState(p);
              const cover = daysOfCover(p);
              const o = onOrder[p.id];
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productPhoto(p, 80)} alt="" className="size-9 shrink-0 rounded-ui-sm bg-surface-2 object-cover" loading="lazy" />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-fg">{t(p.name)}</span>
                        <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
                          <span className="font-mono">{p.sku}</span>
                          {p.status === "draft" ? <Badge size="sm">{c("Draft", "Taslak")}</Badge> : null}
                          {o ? <Badge size="sm" tone="success" className="font-mono">{o.po}</Badge> : null}
                        </span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-fg-muted">{warehouses.find((w) => w.id === p.warehouseId)?.code}</TableCell>
                  <TableCell>
                    <span className="relative block h-2 rounded-full bg-track" role="img" aria-label={c(`${p.stock} on hand, reorder at ${p.reorderPoint}`, `Elde ${p.stock}, sipariş noktası ${p.reorderPoint}`)}>
                      <span className={cn("absolute inset-y-0 start-0 rounded-full transition-[width] duration-500", st === "out" ? "bg-danger" : st === "low" ? "bg-warning" : "bg-accent")} style={{ width: `${Math.max(st === "out" ? 0 : 2, (p.stock / scaleMax) * 100)}%` }} />
                      {p.reorderPoint > 0 ? <span aria-hidden className="absolute -inset-y-1 w-0.5 rounded-full bg-fg" style={{ insetInlineStart: `calc(${(p.reorderPoint / scaleMax) * 100}% - 1px)` }} /> : null}
                    </span>
                  </TableCell>
                  <TableCell align="end" className={cn("font-mono tabular", st === "out" ? "text-danger" : st === "low" ? "text-warning" : "text-fg")}>{f.number(p.stock)}</TableCell>
                  <TableCell align="end" className="font-mono text-fg-muted tabular">
                    {p.stock <= 0 ? "—" : cover === null ? "∞" : c(`${f.number(cover, { maximumFractionDigits: 0 })} d`, `${f.number(cover, { maximumFractionDigits: 0 })} g`)}
                  </TableCell>
                  <TableCell align="end" className="font-mono text-fg-muted tabular">{f.number(p.sold30d)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

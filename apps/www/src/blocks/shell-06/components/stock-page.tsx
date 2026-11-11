"use client";

import * as React from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ClipboardList, MoreHorizontal, PackagePlus, Search, SlidersHorizontal } from "lucide-react";
import {
  Badge, Breadcrumb, Button, Checkbox, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, EmptyState, IconButton, Input,
  Select, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, Tabs, TabsList, TabsTrigger, cn,
} from "@vamos-ui/react";
import { CountUp, Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { stockMovements } from "../../_shared/metrics";
import { categoryLabels, productsById, stockState, warehouses, type Product } from "../../_shared/products";
import { addDecimal, multiplyDecimal } from "../../_shared/money";

export type StockFilter = "all" | "low" | "out" | "on-order";

export interface StockPageProps {
  rows: Product[];
  onOrder: Record<string, number>;
  warehouse: string;
  onWarehouseChange: (id: string) => void;
  selected: Set<string>;
  onSelectedChange: (s: Set<string>) => void;
  onAdjust: (p: Product) => void;
  onReorder: (items: Product[]) => void;
  /** Recently changed rows flash once. */
  flash: string | null;
}

const daysOfCover = (p: Product) => (p.sold30d > 0 ? p.stock / (p.sold30d / 30) : Infinity);

export function StockPage({ rows, onOrder, warehouse, onWarehouseChange, selected, onSelectedChange, onAdjust, onReorder, flash }: StockPageProps) {
  const { c, t, f, money, ago } = useBlockFormat();
  const [filter, setFilter] = React.useState<StockFilter>("all");
  const [query, setQuery] = React.useState("");

  const inWarehouse = rows.filter((p) => p.status !== "archived" && (warehouse === "all" || p.warehouseId === warehouse));
  const count = (k: StockFilter) =>
    inWarehouse.filter((p) => (k === "all" ? true : k === "on-order" ? !!onOrder[p.id] : k === "out" ? stockState(p) === "out" : stockState(p) === "low")).length;
  const q = query.trim().toLocaleLowerCase();
  const shown = inWarehouse
    .filter((p) => (filter === "all" ? true : filter === "on-order" ? !!onOrder[p.id] : filter === "out" ? stockState(p) === "out" : stockState(p) === "low"))
    .filter((p) => !q || p.sku.toLocaleLowerCase().includes(q) || t(p.name).toLocaleLowerCase().includes(q))
    .sort((a, b) => daysOfCover(a) - daysOfCover(b));

  const value = addDecimal(inWarehouse.map((p) => multiplyDecimal(p.cost.amount, String(p.stock))));
  const units = inWarehouse.reduce((n, p) => n + p.stock, 0);
  const below = inWarehouse.filter((p) => stockState(p) !== "ok");
  const allChecked = shown.length > 0 && shown.every((p) => selected.has(p.id));
  const someChecked = shown.some((p) => selected.has(p.id));
  const picked = rows.filter((p) => selected.has(p.id));

  const toggle = (id: string, on: boolean) => {
    const next = new Set(selected);
    if (on) next.add(id);
    else next.delete(id);
    onSelectedChange(next);
  };

  const kpis: Array<{ label: string; node: React.ReactNode; note: string; tone?: "warning" | "danger" }> = [
    { label: c("Stock value at cost", "Maliyetle stok değeri"), node: <span>{money({ amount: value, currency: "TRY" }, { whole: true })}</span>, note: c("Moving average cost", "Hareketli ortalama maliyet") },
    { label: c("Units on hand", "Eldeki adet"), node: <CountUp value={units} />, note: c(`${inWarehouse.length} active SKUs`, `${inWarehouse.length} aktif stok kodu`) },
    { label: c("At or below reorder point", "Yeniden sipariş noktasında"), node: <CountUp value={count("low")} />, note: c("Cover under two weeks", "İki haftadan kısa stok"), tone: "warning" },
    { label: c("Out of stock", "Stokta yok"), node: <CountUp value={count("out")} />, note: c("Lost sales risk", "Kayıp satış riski"), tone: "danger" },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <Breadcrumb
          items={[{ label: c("Inventory", "Stok"), href: "#inventory" }, { label: c("Stock levels", "Stok seviyeleri") }]}
          size="sm"
        />
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <h1 className="min-w-0 flex-1 font-display text-[length:calc(28px*var(--display-scale,1))] leading-tight text-fg">{c("Stock levels", "Stok seviyeleri")}</h1>
          <div className="w-48 max-sm:w-full">
            <Select
              size="sm"
              aria-label={c("Warehouse", "Depo")}
              value={warehouse}
              onValueChange={(v) => v && onWarehouseChange(v)}
              items={[{ value: "all", label: c("All warehouses", "Tüm depolar") }, ...warehouses.map((w) => ({ value: w.id, label: `${w.code} · ${w.name}` }))]}
            />
          </div>
          <Button size="sm" className="max-sm:flex-1">
            <ClipboardList aria-hidden /> {c("Start count", "Sayım başlat")}
          </Button>
          <Button size="sm" variant="primary" className="max-sm:flex-1" onClick={() => onReorder(picked.length ? picked : below)}>
            <PackagePlus aria-hidden /> {picked.length ? c(`Reorder ${picked.length}`, `${picked.length} ürünü sipariş et`) : c("Reorder low stock", "Azalanları sipariş et")}
          </Button>
        </div>

        {/* KPI ledger: one strip with hairline dividers instead of four cards. */}
        <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-ui border border-line bg-surface lg:grid-cols-4">
          {kpis.map((k, i) => (
            <div key={k.label} className={cn("min-w-0 p-4", i % 2 === 1 && "border-s border-line", i >= 2 && "max-lg:border-t lg:border-s border-line")}>
              <dt className="truncate text-[11.5px] text-fg-subtle">{k.label}</dt>
              <dd className={cn("tabular mt-1.5 font-display text-[length:calc(24px*var(--display-scale,1))] leading-none", k.tone === "warning" ? "text-warning" : k.tone === "danger" ? "text-danger" : "text-fg")}>{k.node}</dd>
              <dd className="mt-1.5 truncate text-[11.5px] text-fg-muted">{k.note}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as StockFilter)} className="min-w-0 max-sm:w-full">
            <TabsList variant="pill" aria-label={c("Stock filter", "Stok filtresi")}>
              <TabsTrigger value="all" count={count("all")}>{c("All", "Tümü")}</TabsTrigger>
              <TabsTrigger value="low" count={count("low")}>{c("Low", "Azalan")}</TabsTrigger>
              <TabsTrigger value="out" count={count("out")}>{c("Out", "Tükenen")}</TabsTrigger>
              <TabsTrigger value="on-order" count={count("on-order")}>{c("On order", "Siparişte")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex-1 max-sm:hidden" />
          <Input
            size="sm"
            className="min-w-0 flex-1 sm:max-w-64"
            leading={<Search aria-hidden />}
            placeholder={c("SKU or product", "Stok kodu veya ürün")}
            aria-label={c("Search stock", "Stokta ara")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            clearable
            onClear={() => setQuery("")}
          />
          <IconButton size="sm" variant="secondary" label={c("Columns", "Sütunlar")}>
            <SlidersHorizontal />
          </IconButton>
        </div>

        <div className="mt-3 overflow-hidden rounded-ui border border-line bg-surface">
          {shown.length === 0 ? (
            <EmptyState size="sm" kind="no-results" title={c("No items match", "Eşleşen ürün yok")} description={c("Change the filter or the warehouse.", "Filtreyi veya depoyu değiştirin.")} />
          ) : (
            <TableContainer>
              <Table aria-label={c("Stock levels", "Stok seviyeleri")} className="text-[12.5px]">
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: 40 }}>
                      <Checkbox
                        aria-label={c("Select all rows", "Tüm satırları seç")}
                        checked={allChecked ? true : someChecked ? "indeterminate" : false}
                        onCheckedChange={(v) => onSelectedChange(v === true ? new Set(shown.map((p) => p.id)) : new Set())}
                      />
                    </TableHead>
                    <TableHead>{c("Item", "Ürün")}</TableHead>
                    <TableHead className="max-md:hidden">{c("Whse", "Depo")}</TableHead>
                    <TableHead style={{ minWidth: 150 }} className="max-sm:hidden">{c("On hand vs reorder point", "Eldeki / sipariş noktası")}</TableHead>
                    <TableHead align="end">{c("On hand", "Eldeki")}</TableHead>
                    <TableHead align="end" className="max-lg:hidden">{c("Sold 30d", "30g satış")}</TableHead>
                    <TableHead align="end" className="max-md:hidden">{c("Cover", "Yeterlilik")}</TableHead>
                    <TableHead style={{ width: 44 }}>
                      <span className="sr-only">{c("Actions", "İşlemler")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shown.map((p) => {
                    const state = stockState(p);
                    const scale = Math.max(p.stock, p.reorderPoint * 3, 1);
                    const cover = daysOfCover(p);
                    const wh = warehouses.find((w) => w.id === p.warehouseId);
                    return (
                      <TableRow key={p.id} data-state={selected.has(p.id) ? "selected" : undefined} className={cn(flash === p.id && "bg-accent-soft transition-colors duration-700")}>
                        <TableCell>
                          <Checkbox aria-label={c(`Select ${p.sku}`, `${p.sku} seç`)} checked={selected.has(p.id)} onCheckedChange={(v) => toggle(p.id, v === true)} />
                        </TableCell>
                        <TableCell>
                          <span className="block font-mono text-[11.5px] text-fg-subtle">{p.sku}</span>
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-fg">{t(p.name)}</span>
                            {onOrder[p.id] ? <Badge tone="info">{c(`+${onOrder[p.id]} on order`, `+${onOrder[p.id]} siparişte`)}</Badge> : null}
                          </span>
                          <span className="block text-[11.5px] text-fg-subtle sm:hidden">{t(categoryLabels[p.category])}</span>
                        </TableCell>
                        <TableCell className="font-mono text-[11.5px] text-fg-muted max-md:hidden">{wh?.code}</TableCell>
                        <TableCell className="max-sm:hidden">
                          <span className="relative block h-2 rounded-full bg-track" aria-hidden>
                            <span
                              className={cn("absolute inset-y-0 start-0 rounded-full", state === "out" ? "bg-danger" : state === "low" ? "bg-warning" : "bg-fg-muted")}
                              style={{ width: `${Math.min(100, (p.stock / scale) * 100)}%` }}
                            />
                            <span className="absolute -top-1 -bottom-1 w-px bg-fg" style={{ insetInlineStart: `${(p.reorderPoint / scale) * 100}%` }} />
                          </span>
                          <span className="mt-1 block font-mono text-[10.5px] text-fg-subtle">ROP {f.number(p.reorderPoint)}</span>
                        </TableCell>
                        <TableCell align="end">
                          <span className={cn("tabular font-mono text-[13px]", state === "out" ? "text-danger" : state === "low" ? "text-warning" : "text-fg")}>{f.number(p.stock)}</span>
                        </TableCell>
                        <TableCell align="end" className="tabular font-mono text-fg-muted max-lg:hidden">{f.number(p.sold30d)}</TableCell>
                        <TableCell align="end" className="tabular font-mono max-md:hidden">
                          {cover === Infinity ? <span className="text-fg-subtle">—</span> : <span className={cover < 14 ? "text-warning" : "text-fg-muted"}>{c(`${Math.floor(cover)} d`, `${Math.floor(cover)} g`)}</span>}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <IconButton size="xs" label={c(`Actions for ${p.sku}`, `${p.sku} işlemleri`)} tooltip={false}>
                                <MoreHorizontal />
                              </IconButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => onAdjust(p)}>{c("Adjust stock…", "Stoğu düzelt…")}</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => onReorder([p])}>{c("Reorder…", "Sipariş et…")}</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>{c("Transfer to another warehouse", "Başka depoya transfer")}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
        <p className="mt-2 text-[11.5px] text-fg-subtle">{c("Sorted by days of cover, shortest first. Cover = on hand ÷ average daily sales (30 days).", "Stok yeterlilik gününe göre, en kısadan sıralı. Yeterlilik = eldeki ÷ günlük ortalama satış (30 gün).")}</p>
      </div>

      <aside aria-labelledby="erp-moves" className="min-w-0 xl:pt-[54px]">
        <h2 id="erp-moves" className="text-[11.5px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">{c("Latest movements", "Son hareketler")}</h2>
        <Stagger asChild effect="fade">
          <ol className="mt-3 grid gap-px overflow-hidden rounded-ui border border-line bg-line">
            {stockMovements.map((m) => {
              const p = productsById[m.productId]!;
              const Icon = m.type === "in" ? ArrowDownLeft : m.type === "out" ? ArrowUpRight : ArrowLeftRight;
              return (
                <li key={m.id} className="flex gap-3 bg-surface p-3">
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-md", m.qty > 0 ? "tone-success tone-soft" : m.type === "adjustment" ? "tone-warning tone-soft" : "bg-surface-2 text-fg-muted")}>
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="min-w-0 flex-1 truncate text-[12.5px] text-fg">{t(p.name)}</span>
                      <span className={cn("tabular font-mono text-[12px]", m.qty > 0 ? "text-success" : "text-fg")}>{m.qty > 0 ? "+" : "−"}{f.number(Math.abs(m.qty))}</span>
                    </span>
                    <span className="block truncate font-mono text-[11px] text-fg-subtle">
                      {m.reference} · {warehouses.find((w) => w.id === m.warehouseId)?.code} · {ago(m.at)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </Stagger>
      </aside>
    </div>
  );
}

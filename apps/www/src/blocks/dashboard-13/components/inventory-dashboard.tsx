"use client";

import * as React from "react";
import { ScanBarcode } from "lucide-react";
import { Button, PageHeader, ToggleGroup, ToggleGroupItem, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { MovementsCard } from "./movements-card";
import { PositionCard } from "./position-card";
import { ReorderQueue, type OnOrder } from "./reorder-queue";
import { StockTable } from "./stock-table";
import { NOW, day, initialMovements, products, suppliers, warehouses, type Movement, type Product } from "./data";

/** Warehouse inventory: stock position and cover, reorder queue with purchase orders, today's movements and stock levels. */
export function InventoryDashboard() {
  const { f, t, c } = useBlockFormat();
  const [wh, setWh] = React.useState<string>("all");
  const [stock, setStock] = React.useState<Record<string, number>>(() => Object.fromEntries(products.map((p) => [p.id, p.stock])));
  const [moves, setMoves] = React.useState<Movement[]>(initialMovements);
  const [onOrder, setOnOrder] = React.useState<Record<string, OnOrder>>({});
  const poSeq = React.useRef(8814);

  // Products with live stock; archived items stay out of the operational view.
  const live: Product[] = products.filter((p) => p.status !== "archived").map((p) => ({ ...p, stock: stock[p.id] ?? p.stock }));
  const scoped = wh === "all" ? live : live.filter((p) => p.warehouseId === wh);
  const scopedMoves = wh === "all" ? moves : moves.filter((m) => m.warehouseId === wh);

  const record = (m: Omit<Movement, "id" | "at">) => {
    const mv: Movement = { ...m, id: `mv-new-${moves.length + 1}`, at: NOW };
    const p = products.find((x) => x.id === m.productId)!;
    setMoves((l) => [mv, ...l]);
    setStock((s) => ({ ...s, [m.productId]: Math.max(0, (s[m.productId] ?? 0) + m.qty) }));
    toast.success(c(`${m.qty > 0 ? "+" : "−"}${Math.abs(m.qty)} × ${t(p.name)}`, `${m.qty > 0 ? "+" : "−"}${Math.abs(m.qty)} × ${t(p.name)}`), {
      description: m.reference,
      action: {
        label: c("Undo", "Geri al"),
        onClick: () => {
          setMoves((l) => l.filter((x) => x.id !== mv.id));
          setStock((s) => ({ ...s, [m.productId]: Math.max(0, (s[m.productId] ?? 0) - m.qty) }));
        },
      },
    });
  };

  const order = (lines: Array<{ p: Product; qty: number }>) => {
    const bySupplier = new Map<string, Array<{ p: Product; qty: number }>>();
    for (const l of lines) {
      const s = suppliers[l.p.category];
      bySupplier.set(s.id, [...(bySupplier.get(s.id) ?? []), l]);
    }
    const added: Record<string, OnOrder> = {};
    const numbers: string[] = [];
    for (const group of bySupplier.values()) {
      const po = `PO-${poSeq.current++}`;
      numbers.push(po);
      const s = suppliers[group[0]!.p.category];
      for (const l of group) added[l.p.id] = { po, qty: l.qty, eta: day(s.leadDays) };
    }
    setOnOrder((o) => ({ ...o, ...added }));
    toast.success(numbers.length === 1 ? c(`${numbers[0]} sent`, `${numbers[0]} gönderildi`) : c(`${numbers.length} purchase orders sent`, `${numbers.length} satın alma siparişi gönderildi`), {
      description: numbers.join(" · "),
      action: {
        label: c("Undo", "Geri al"),
        onClick: () =>
          setOnOrder((o) => {
            const n = { ...o };
            for (const id of Object.keys(added)) delete n[id];
            return n;
          }),
      },
    });
  };

  return (
    <div className="mx-auto max-w-[1360px]">
      <PageHeader
        size="lg"
        eyebrow={c(`Inventory · ${f.date(NOW, { weekday: "long", month: "long", day: "numeric" })}`, `Envanter · ${f.date(NOW, { weekday: "long", month: "long", day: "numeric" })}`)}
        title={c("Warehouse stock", "Depo stoku")}
        description={c("What is on the shelves, what runs out before the next delivery, and what moved today.", "Rafta ne var, bir sonraki teslimattan önce ne bitecek ve bugün ne hareket etti.")}
        actions={
          <Button variant="secondary" onClick={() => toast(c("Cycle count started", "Sayım başlatıldı"), { description: c("Aisle C · 46 bins assigned to Ruth Adeyemi", "C koridoru · 46 göz Ruth Adeyemi'ye atandı") })}>
            <ScanBarcode aria-hidden />
            {c("Start cycle count", "Sayım başlat")}
          </Button>
        }
      />

      <div className="-mx-1 mb-(--gap) overflow-x-auto px-1 pb-1">
        <ToggleGroup aria-label={c("Warehouse", "Depo")} size="sm" value={wh} onValueChange={(v) => v && setWh(v)}>
          <ToggleGroupItem value="all">{c("All warehouses", "Tüm depolar")}</ToggleGroupItem>
          {warehouses.map((w) => (
            <ToggleGroupItem key={w.id} value={w.id}>
              <span className="font-mono text-fg-subtle">{w.code}</span> {w.name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <PositionCard products={scoped} />

      <div className="mt-(--gap) grid gap-(--gap) xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <ReorderQueue products={scoped} onOrder={onOrder} onCreate={order} />
        <MovementsCard moves={scopedMoves} products={live} warehouse={wh} onRecord={record} />
      </div>

      <div className="mt-(--gap)">
        <StockTable products={scoped} onOrder={onOrder} />
      </div>
    </div>
  );
}

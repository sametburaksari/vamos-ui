"use client";

import * as React from "react";
import { Bell, CalendarRange, Menu, Search } from "lucide-react";
import { Badge, Button, DialogTitle, EmptyState, IconButton, KbdGroup, Sheet, SheetContent, Toaster, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../_shared/format";
import { products as initialProducts, type Product } from "../_shared/products";
import { erpNav, onOrder as initialOnOrder, pinnedItems, suppliers } from "./data";
import { ErpSidebar } from "./components/erp-sidebar";
import { StockPage } from "./components/stock-page";
import { AdjustStockDialog, PurchaseOrderDialog } from "./components/dialogs";

const NO_ITEMS: Product[] = [];

/**
 * ERP shell with a two-level sidebar: collapsible module sections (Inventory, Purchasing,
 * Sales…) with their screens underneath, a "/" filter that jumps to any screen, and expand /
 * collapse all. Shown with the stock levels screen: warehouse switch, reorder suggestions,
 * stock adjustments and purchase orders, all updated in place.
 */
export default function Shell06() {
  const { c, t } = useBlockFormat();
  const [active, setActive] = React.useState("stock");
  const [mobileNav, setMobileNav] = React.useState(false);
  const [rows, setRows] = React.useState<Product[]>(initialProducts);
  const [onOrder, setOnOrder] = React.useState(initialOnOrder);
  const [warehouse, setWarehouse] = React.useState("all");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [adjusting, setAdjusting] = React.useState<Product | null>(null);
  const [poItems, setPoItems] = React.useState<Product[] | null>(null);
  const [flash, setFlash] = React.useState<string | null>(null);
  const poSeq = React.useRef(8813);

  const navigate = (id: string) => {
    setActive(id);
    setMobileNav(false);
  };

  const pulse = (id: string) => {
    setFlash(id);
    setTimeout(() => setFlash((f) => (f === id ? null : f)), 900);
  };

  const adjust = (id: string, delta: number) => {
    const prev = rows.find((p) => p.id === id)!;
    setRows((r) => r.map((p) => (p.id === id ? { ...p, stock: p.stock + delta } : p)));
    setAdjusting(null);
    pulse(id);
    toast.success(c(`Stock adjusted ${delta > 0 ? "+" : "−"}${Math.abs(delta)}`, `Stok düzeltildi ${delta > 0 ? "+" : "−"}${Math.abs(delta)}`), {
      description: `${prev.sku} · ${c("posted to the stock ledger", "stok defterine işlendi")}`,
      action: { label: c("Undo", "Geri al"), onClick: () => setRows((r) => r.map((p) => (p.id === id ? { ...p, stock: prev.stock } : p))) },
    });
  };

  const createPo = async (lines: Array<{ id: string; qty: number }>, supplierId: string) => {
    await new Promise((r) => setTimeout(r, 700));
    const no = `PO-${poSeq.current++}`;
    setOnOrder((o) => {
      const next = { ...o };
      for (const l of lines) next[l.id] = (next[l.id] ?? 0) + l.qty;
      return next;
    });
    setSelected(new Set());
    setPoItems(null);
    toast.success(c(`${no} sent to ${suppliers.find((s) => s.id === supplierId)?.name}`, `${no}, ${suppliers.find((s) => s.id === supplierId)?.name} firmasına gönderildi`), {
      description: c(`${lines.length} lines · awaiting confirmation`, `${lines.length} satır · onay bekleniyor`),
    });
  };

  const screen = [...erpNav.flatMap((s) => s.items), ...pinnedItems].find((i) => i.id === active);

  return (
    <div className="relative z-10 flex h-dvh overflow-hidden">
      <ErpSidebar className="max-lg:hidden" active={active} onNavigate={navigate} shortcut />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-[color-mix(in_srgb,var(--scene)_72%,transparent)] px-4 backdrop-blur-xl md:px-6">
          <IconButton size="sm" label={c("Open menu", "Menüyü aç")} className="lg:hidden" onClick={() => setMobileNav(true)}>
            <Menu />
          </IconButton>
          <button
            type="button"
            className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-ui-sm border border-field-border bg-field px-3 text-[13px] text-fg-subtle hover:border-field-border-hover focus-ring sm:max-w-80"
          >
            <Search className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{c("Search items, orders, suppliers", "Ürün, sipariş, tedarikçi ara")}</span>
            <KbdGroup keys="mod+k" size="sm" className="ms-auto max-sm:hidden" />
          </button>
          <div className="flex-1 max-sm:hidden" />
          <Badge tone="outline" size="md" className="max-sm:hidden">
            <CalendarRange aria-hidden /> {c("Period: Nov 2026 · open", "Dönem: Kasım 2026 · açık")}
          </Badge>
          <IconButton size="sm" label={c("Notifications", "Bildirimler")}>
            <Bell />
          </IconButton>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          {active === "stock" ? (
            <StockPage
              rows={rows}
              onOrder={onOrder}
              warehouse={warehouse}
              onWarehouseChange={(w) => {
                setWarehouse(w);
                setSelected(new Set());
              }}
              selected={selected}
              onSelectedChange={setSelected}
              onAdjust={setAdjusting}
              onReorder={(items) => setPoItems(items)}
              flash={flash}
            />
          ) : (
            <EmptyState
              size="lg"
              title={screen ? t(screen.label) : ""}
              description={c("This screen isn't part of the preview. The sidebar works the same everywhere.", "Bu ekran önizlemeye dahil değil. Kenar menüsü her yerde aynı çalışır.")}
              actions={<Button onClick={() => setActive("stock")}>{c("Back to stock levels", "Stok seviyelerine dön")}</Button>}
            />
          )}
        </main>
      </div>

      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="start" size="sm" hideClose className="max-w-[86vw] border-0 p-0">
          <DialogTitle className="sr-only">{c("Navigation", "Gezinme")}</DialogTitle>
          <ErpSidebar className="w-full border-e-0" active={active} onNavigate={navigate} />
        </SheetContent>
      </Sheet>

      <AdjustStockDialog product={adjusting} onOpenChange={(o) => !o && setAdjusting(null)} onConfirm={adjust} />
      <PurchaseOrderDialog open={!!poItems} onOpenChange={(o) => !o && setPoItems(null)} items={poItems ?? NO_ITEMS} onCreate={createPo} />
      <Toaster />
    </div>
  );
}

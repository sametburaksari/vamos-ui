"use client";

import * as React from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Plus, SlidersHorizontal } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  EmptyState,
  Field,
  Input,
  Select,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { NOW_MS, moveLabels, warehouses, type Movement, type MoveType, type Product } from "./data";

const icon: Record<MoveType, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  in: ArrowDownLeft,
  out: ArrowUpRight,
  transfer: ArrowLeftRight,
  adjustment: SlidersHorizontal,
};
const tone: Record<MoveType, string> = { in: "bg-success/12 text-success", out: "bg-info/12 text-info", transfer: "bg-selected text-fg-muted", adjustment: "bg-warning/12 text-warning" };

export interface MovementsCardProps {
  moves: Movement[];
  products: Product[];
  warehouse: string;
  onRecord: (m: Omit<Movement, "id" | "at">) => void;
}

/** Today's stock movements with net in/out, and a dialog to record a receipt, shipment or count correction. */
export function MovementsCard({ moves, products, warehouse, onRecord }: MovementsCardProps) {
  const { f, t, c } = useBlockFormat();
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<"in" | "out" | "adjustment">("in");
  const [productId, setProductId] = React.useState<string | null>(null);
  const [qty, setQty] = React.useState("");
  const [ref, setRef] = React.useState("");
  const [tried, setTried] = React.useState(false);

  const inUnits = moves.filter((m) => m.qty > 0).reduce((s, m) => s + m.qty, 0);
  const outUnits = moves.filter((m) => m.qty < 0).reduce((s, m) => s - m.qty, 0);
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const chosen = productId ? byId[productId] : undefined;
  const n = Math.round(Number(qty));
  const qtyError = !qty || !Number.isFinite(n) || n === 0 ? c("Enter a quantity.", "Miktar girin.") : type !== "in" && n < 0 ? c("Use a positive number; the type sets the direction.", "Pozitif sayı girin; yönü tür belirler.") : type === "out" && chosen && n > chosen.stock ? c(`Only ${chosen.stock} on hand.`, `Elde yalnızca ${chosen.stock} adet var.`) : undefined;
  const productError = !productId ? c("Choose a product.", "Ürün seçin.") : undefined;

  const reset = () => {
    setType("in");
    setProductId(null);
    setQty("");
    setRef("");
    setTried(false);
  };
  const submit = () => {
    setTried(true);
    if (qtyError || productError || !chosen) return;
    const signed = type === "in" ? Math.abs(n) : type === "out" ? -Math.abs(n) : n;
    onRecord({ productId: chosen.id, type, qty: signed, warehouseId: chosen.warehouseId, reference: ref.trim() || (type === "adjustment" ? c("Count correction", "Sayım düzeltmesi") : type === "in" ? c("Manual receipt", "Elle giriş") : c("Manual shipment", "Elle çıkış")) });
    setOpen(false);
    reset();
  };

  return (
    <Card className="ui-rise flex min-w-0 flex-col" style={{ animationDelay: "160ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Today's movements", "Bugünkü hareketler")}
        description={c(`${f.number(inUnits)} in · ${f.number(outUnits)} out`, `${f.number(inUnits)} giriş · ${f.number(outUnits)} çıkış`)}
        action={
          <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
            <Plus aria-hidden />
            {c("Record", "Kaydet")}
          </Button>
        }
      />
      {moves.length === 0 ? (
        <EmptyState size="sm" title={c("No movements yet", "Henüz hareket yok")} description={c("Receipts, picks and counts appear here as they happen.", "Girişler, toplamalar ve sayımlar oldukça burada görünür.")} />
      ) : (
        <Stagger asChild step={35}>
          <ol tabIndex={0} aria-label={c("Today's movements", "Bugünkü hareketler")} className="focus-ring max-h-[480px] overflow-y-auto border-t border-line">
            {moves.map((m) => {
              const p = byId[m.productId];
              const Icon = icon[m.type];
              return (
                <li key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-line px-(--card-p) py-2.5 last:border-b-0">
                  <span className={cn("grid size-8 place-items-center rounded-ui-sm", tone[m.type])}>
                    <Icon aria-hidden className="size-4" />
                    <span className="sr-only">{t(moveLabels[m.type])}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] text-fg">{p ? t(p.name) : m.productId}</span>
                    <span className="block truncate text-xs text-fg-subtle">
                      <span className="font-mono">{m.reference}</span> · {warehouses.find((w) => w.id === m.warehouseId)?.code} · {f.relative(m.at, { now: NOW_MS })}
                    </span>
                  </span>
                  <span className={cn("font-mono text-[13px] font-medium tabular", m.qty > 0 ? "text-success" : "text-fg")}>
                    {m.qty > 0 ? "+" : "−"}
                    {Math.abs(m.qty)}
                  </span>
                </li>
              );
            })}
          </ol>
        </Stagger>
      )}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent size="sm">
          <DialogHeader title={c("Record a movement", "Hareket kaydet")} description={c("Stock updates at once and the line lands in today's log.", "Stok hemen güncellenir ve satır bugünkü kayda eklenir.")} />
          <DialogBody className="space-y-4">
            <ToggleGroup aria-label={c("Movement type", "Hareket türü")} size="sm" value={type} onValueChange={(v) => v && setType(v as typeof type)} className="w-full">
              {(["in", "out", "adjustment"] as const).map((k) => (
                <ToggleGroupItem key={k} value={k} className="flex-1">
                  {t(moveLabels[k])}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Field label={c("Product", "Ürün")} error={tried ? productError : undefined}>
              <Select
                value={productId}
                onValueChange={setProductId}
                placeholder={c("Choose a product…", "Ürün seçin…")}
                items={products
                  .filter((p) => warehouse === "all" || p.warehouseId === warehouse)
                  .map((p) => ({ value: p.id, label: `${t(p.name)} · ${p.stock}` }))}
              />
            </Field>
            <Field
              label={type === "adjustment" ? c("Change (use − to remove)", "Değişim (çıkarmak için −)") : c("Quantity", "Miktar")}
              hint={chosen ? c(`${chosen.stock} on hand at ${warehouses.find((w) => w.id === chosen.warehouseId)?.name}`, `${warehouses.find((w) => w.id === chosen.warehouseId)?.name} deposunda ${chosen.stock} adet`) : undefined}
              error={tried ? qtyError : undefined}
            >
              <Input type="number" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} className="font-mono tabular" />
            </Field>
            <Field label={c("Reference", "Referans")} optional>
              <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder={type === "in" ? "PO-8815" : type === "out" ? "#KL-24231" : c("Cycle count, aisle C", "Sayım, C koridoru")} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>{c("Cancel", "Vazgeç")}</Button>
            <Button variant="primary" onClick={submit}>{c("Record movement", "Hareketi kaydet")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

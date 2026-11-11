"use client";

import * as React from "react";
import { Download, PackageCheck, Printer, Search, X } from "lucide-react";
import {
  Avatar, Badge, Breadcrumb, Button, Checkbox, EmptyState, Input, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, cn,
} from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { channelLabels } from "../../_shared/products";
import { customersById, orderStatusLabels, orderStatusTone, type Order } from "../../_shared/orders";
import { addDecimal } from "../../_shared/money";
import { TODAY } from "../../_shared/time";
import type { SubTab } from "../data";

export const tabFilter: Record<string, (o: Order) => boolean> = {
  all: () => true,
  unfulfilled: (o) => o.status === "paid" || o.status === "fulfilling",
  unpaid: (o) => o.status === "pending",
  returns: (o) => o.status === "refunded" || o.status === "cancelled",
  abandoned: () => false,
};

export interface OrdersPageProps {
  tab: SubTab;
  sectionLabel: string;
  orders: Order[];
  selected: Set<string>;
  onSelectedChange: (s: Set<string>) => void;
  onOpen: (o: Order) => void;
  onFulfil: (ids: string[]) => void;
  onBack: () => void;
}

export function OrdersPage({ tab, sectionLabel, orders, selected, onSelectedChange, onOpen, onFulfil, onBack }: OrdersPageProps) {
  const { c, t, f, money } = useBlockFormat();
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLocaleLowerCase();
  const rows = orders
    .filter(tabFilter[tab.id] ?? (() => true))
    .filter((o) => !q || o.number.toLocaleLowerCase().includes(q) || customersById[o.customerId]!.name.toLocaleLowerCase().includes(q));
  const allChecked = rows.length > 0 && rows.every((o) => selected.has(o.id));
  const someChecked = rows.some((o) => selected.has(o.id));
  const canFulfil = tab.id === "unfulfilled" || tab.id === "all";
  const ids = rows.filter((o) => selected.has(o.id)).map((o) => o.id);

  const today = orders.filter((o) => o.placedAt.startsWith(TODAY) && o.status !== "cancelled");
  const gross = addDecimal(today.map((o) => o.total.amount));
  const toShip = orders.filter(tabFilter.unfulfilled!);
  const units = toShip.reduce((n, o) => n + o.lines.reduce((m, l) => m + l.qty, 0), 0);

  const toggle = (id: string, on: boolean) => {
    const next = new Set(selected);
    if (on) next.add(id);
    else next.delete(id);
    onSelectedChange(next);
  };

  return (
    <div className="mx-auto w-full max-w-[1320px]">
      <Breadcrumb
        size="sm"
        items={[{ label: "Kiln & Linen", href: "#home" }, { label: sectionLabel, href: "#orders" }, { label: t(tab.label) }]}
      />
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <h1 className="min-w-0 flex-1 font-display text-[length:calc(30px*var(--display-scale,1))] leading-tight text-fg">{t(tab.label)}</h1>
        <Button size="sm">
          <Download aria-hidden /> {c("Export", "Dışa aktar")}
        </Button>
        <Button size="sm" variant="solid">{c("Create order", "Sipariş oluştur")}</Button>
      </div>

      {/* Today ribbon: a sentence-like strip, not a card wall. */}
      <p className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y border-line py-3 text-[13px] text-fg-muted">
        <span>
          {c("Today", "Bugün")} <strong className="tabular font-display text-[20px] font-normal text-fg"><CountUp value={today.length} /></strong> {c("orders", "sipariş")}
        </span>
        <span>
          <strong className="tabular font-display text-[20px] font-normal text-fg">{money({ amount: gross, currency: "TRY" }, { whole: true })}</strong> {c("gross sales", "brüt satış")}
        </span>
        <span>
          <strong className="tabular font-display text-[20px] font-normal text-fg"><CountUp value={units} /></strong> {c(`units in ${toShip.length} orders to ship`, `adet, ${toShip.length} siparişte gönderilecek`)}
        </span>
        <span className="text-fg-subtle">{c("Cut-off for same-day dispatch 16:00", "Aynı gün kargo için son saat 16:00")}</span>
      </p>

      {tab.id === "abandoned" ? (
        <EmptyState
          className="mt-8"
          title={c("No abandoned checkouts this week", "Bu hafta terk edilen ödeme yok")}
          description={c("Recovery emails go out one hour after a shopper leaves the checkout.", "Kurtarma e-postaları alışveriş yapan kişi ödemeden ayrıldıktan bir saat sonra gider.")}
          actions={<Button size="sm" onClick={onBack}>{c("See unfulfilled orders", "Gönderilmeyenlere bak")}</Button>}
        />
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Input
              size="sm"
              className="min-w-0 flex-1 sm:max-w-72"
              leading={<Search aria-hidden />}
              placeholder={c("Order number or customer", "Sipariş no veya müşteri")}
              aria-label={c("Search orders", "Siparişlerde ara")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              clearable
              onClear={() => setQuery("")}
            />
            <span className="tabular text-[12.5px] text-fg-subtle">{c(`${f.number(rows.length)} orders`, `${f.number(rows.length)} sipariş`)}</span>
          </div>

          {ids.length > 0 ? (
            <div role="region" aria-label={c("Bulk actions", "Toplu işlemler")} data-state="open" className="ui-fade mt-3 flex flex-wrap items-center gap-2 rounded-ui border border-line bg-surface-2 px-3 py-2">
              <span className="tabular me-auto text-[13px] font-medium text-fg" aria-live="polite">{c(`${ids.length} selected`, `${ids.length} seçili`)}</span>
              <Button size="sm" variant="ghost">
                <Printer aria-hidden /> {c("Packing slips", "İrsaliyeler")}
              </Button>
              {canFulfil ? (
                <Button size="sm" variant="primary" onClick={() => onFulfil(ids)}>
                  <PackageCheck aria-hidden /> {c("Mark as fulfilled", "Gönderildi olarak işaretle")}
                </Button>
              ) : null}
              <Button size="icon-sm" variant="ghost" aria-label={c("Clear selection", "Seçimi temizle")} onClick={() => onSelectedChange(new Set())}>
                <X aria-hidden />
              </Button>
            </div>
          ) : null}

          <div className="mt-3 overflow-hidden rounded-ui border border-line bg-surface">
            {rows.length === 0 ? (
              <EmptyState size="sm" kind={q ? "no-results" : "done"} title={q ? c("No orders match", "Eşleşen sipariş yok") : c("All caught up", "Hepsi tamam")} description={q ? undefined : c("Every paid order has left the warehouse.", "Ödenen tüm siparişler depodan çıktı.")} />
            ) : (
              <TableContainer>
                <Table aria-label={t(tab.label)} className="text-[13px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: 40 }}>
                        <Checkbox
                          aria-label={c("Select all orders", "Tüm siparişleri seç")}
                          checked={allChecked ? true : someChecked ? "indeterminate" : false}
                          onCheckedChange={(v) => onSelectedChange(v === true ? new Set(rows.map((o) => o.id)) : new Set())}
                        />
                      </TableHead>
                      <TableHead>{c("Order", "Sipariş")}</TableHead>
                      <TableHead className="max-md:hidden">{c("Customer", "Müşteri")}</TableHead>
                      <TableHead className="max-lg:hidden">{c("Channel", "Kanal")}</TableHead>
                      <TableHead className="max-sm:hidden">{c("Status", "Durum")}</TableHead>
                      <TableHead align="end" className="max-lg:hidden">{c("Items", "Ürün")}</TableHead>
                      <TableHead align="end">{c("Total", "Tutar")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((o) => {
                      const cu = customersById[o.customerId]!;
                      return (
                        <TableRow key={o.id} data-state={selected.has(o.id) ? "selected" : undefined}>
                          <TableCell>
                            <Checkbox aria-label={c(`Select order ${o.number}`, `${o.number} siparişini seç`)} checked={selected.has(o.id)} onCheckedChange={(v) => toggle(o.id, v === true)} />
                          </TableCell>
                          <TableCell>
                            <button type="button" onClick={() => onOpen(o)} className="rounded-sm text-start font-mono text-[12.5px] font-medium text-fg underline-offset-4 hover:underline focus-ring">
                              {o.number}
                            </button>
                            <span className="block text-[11.5px] text-fg-subtle">{f.dateTime(o.placedAt, { dateStyle: "medium", timeStyle: "short" })}</span>
                            <span className="mt-1 block md:hidden">
                              <span className="block truncate text-[12px] text-fg-muted">{cu.name}</span>
                              <Badge tone={orderStatusTone[o.status]} className="mt-1 sm:hidden">{t(orderStatusLabels[o.status])}</Badge>
                            </span>
                          </TableCell>
                          <TableCell className="max-md:hidden">
                            <span className="flex items-center gap-2">
                              <Avatar name={cu.name} size="xs" />
                              <span className="min-w-0 leading-tight">
                                <span className="block truncate text-fg">{cu.name}</span>
                                <span className="block truncate text-[11.5px] text-fg-subtle">{cu.city}</span>
                              </span>
                            </span>
                          </TableCell>
                          <TableCell className="text-fg-muted max-lg:hidden">{t(channelLabels[o.channel])}</TableCell>
                          <TableCell className="max-sm:hidden">
                            <Badge tone={orderStatusTone[o.status]} dot>{t(orderStatusLabels[o.status])}</Badge>
                          </TableCell>
                          <TableCell align="end" className="tabular text-fg-muted max-lg:hidden">{f.number(o.lines.reduce((n, l) => n + l.qty, 0))}</TableCell>
                          <TableCell align="end" className={cn("tabular font-medium text-fg", o.status === "refunded" && "text-fg-subtle line-through")}>{money(o.total)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}

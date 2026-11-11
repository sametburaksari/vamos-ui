"use client";

import * as React from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Avatar, Badge, Button, Image, TableBody, TableCell, TableRow, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { customersById, orderStatusLabels, orderStatusTone, paymentLabels, type Order } from "../../_shared/orders";
import { channelLabels, productPhoto, productsById } from "../../_shared/products";
import { netOf, unitsOf, type GroupBy, type OrderGroup } from "./grouped-orders-data";

const COLS = 8;

function Chevron({ open }: { open: boolean }) {
  return <ChevronRight aria-hidden className={cn("size-4 transition-transform duration-200 motion-reduce:transition-none rtl:-scale-x-100", open && "rotate-90 rtl:rotate-90")} />;
}

interface GroupRowsProps {
  group: OrderGroup;
  by: GroupBy;
  name: string;
  /** 0..1 of the biggest group's revenue (the subtotal bar). */
  share: number;
  open: boolean;
  onToggle: () => void;
  openOrders: Set<string>;
  onToggleOrder: (id: string) => void;
}

/** One group: a header row with subtotals, then (when open) its orders, each expandable to its lines. */
export function GroupRows({ group: g, by, name, share, open, onToggle, openOrders, onToggleOrder }: GroupRowsProps) {
  const { c, t, f, money } = useBlockFormat();
  const bodyId = React.useId();
  const channels = new Set(g.orders.map((o) => o.channel));
  const count = c(`${g.orders.length} ${g.orders.length === 1 ? "order" : "orders"}`, `${g.orders.length} sipariş`);

  const toggle = (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={open ? bodyId : undefined}
      className="focus-ring -my-1 flex w-full min-w-0 items-center gap-2.5 rounded-ui-sm py-1 text-start"
    >
      <span className="grid size-6 shrink-0 place-items-center text-fg-muted">
        <Chevron open={open} />
      </span>
      {by === "customer" ? <Avatar name={name} size="sm" /> : null}
      <span className="grid min-w-0 leading-tight">
        <span className="truncate font-medium text-fg">{name}</span>
        <span className="truncate text-[12px] text-fg-subtle">
          {by === "customer" ? `${g.city} · ${count}` : count}
          {g.open ? <span className="sm:hidden"> · {c(`${g.open} open`, `${g.open} açık`)}</span> : null}
        </span>
      </span>
    </button>
  );

  return (
    <TableBody data-group={g.key} className="border-t border-line first-of-type:border-t-0">
      <TableRow className="bg-surface-2 hover:bg-hover">
        <TableCell colSpan={2} rowHeader scope="rowgroup" className="ps-3 font-normal">
          {toggle}
        </TableCell>
        <TableCell className="text-[12.5px] text-fg-muted max-lg:hidden">
          <span className="grid leading-tight">
            <span className="text-[11px] text-fg-subtle">{c("Latest", "Son")}</span>
            <time dateTime={g.latest} className="tabular">
              {f.date(g.latest, { day: "numeric", month: "short" })}
            </time>
          </span>
        </TableCell>
        <TableCell className="max-sm:hidden">
          {g.open ? (
            <Badge tone="info" size="sm" className="tabular whitespace-nowrap">
              {c(`${g.open} open`, `${g.open} açık`)}
            </Badge>
          ) : (
            <span className="text-[12.5px] text-fg-subtle">{c("All closed", "Hepsi kapandı")}</span>
          )}
        </TableCell>
        <TableCell className="text-[12.5px] text-fg-muted max-xl:hidden">
          {by === "channel" ? c(`${new Set(g.orders.map((o) => o.customerId)).size} customers`, `${new Set(g.orders.map((o) => o.customerId)).size} müşteri`) : [...channels].map((ch) => t(channelLabels[ch])).join(", ")}
        </TableCell>
        <TableCell className="max-xl:hidden" />
        <TableCell numeric className="text-fg-muted max-lg:hidden">
          {f.number(g.units)}
        </TableCell>
        <TableCell numeric className="pe-5">
          <span className="grid justify-items-end gap-1">
            <span className="font-semibold text-fg">{money({ amount: g.net, currency: "TRY" })}</span>
            <span aria-hidden className="block h-0.5 w-16 overflow-hidden rounded-full bg-track">
              <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(4, share * 100)}%` }} />
            </span>
          </span>
        </TableCell>
      </TableRow>

      {open
        ? g.orders.map((o, i) => (
            <OrderRows key={o.id} order={o} by={by} first={i === 0} id={i === 0 ? bodyId : undefined} open={openOrders.has(o.id)} onToggle={() => onToggleOrder(o.id)} />
          ))
        : null}
    </TableBody>
  );
}

function OrderRows({ order: o, by, id, open, onToggle }: { order: Order; by: GroupBy; first: boolean; id?: string; open: boolean; onToggle: () => void }) {
  const { c, t, f, money } = useBlockFormat();
  const linesId = React.useId();
  const cu = customersById[o.customerId]!;
  const cancelled = o.status === "cancelled" || o.status === "refunded";
  const date = f.date(o.placedAt, { day: "numeric", month: "short" });
  const time = f.date(o.placedAt, { hour: "2-digit", minute: "2-digit" });
  return (
    <>
      <TableRow id={id} data-state={open ? "open" : undefined}>
        <TableCell className="ps-3">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={open ? linesId : undefined}
            aria-label={c(`Items in order ${o.number}`, `${o.number} siparişindeki ürünler`)}
            className="ms-6"
          >
            <Chevron open={open} />
          </Button>
        </TableCell>
        <TableCell rowHeader className="ps-1 font-normal">
          <span className="grid leading-tight">
            <span className="font-mono text-[13px] font-medium whitespace-nowrap text-fg">{o.number}</span>
            <span className="text-[11.5px] text-fg-subtle lg:hidden">
              {date} · {time}
            </span>
            <span className="mt-0.5 sm:hidden">
              <Badge size="sm" tone={orderStatusTone[o.status]} dot className="whitespace-nowrap">
                {t(orderStatusLabels[o.status])}
              </Badge>
            </span>
            {by !== "customer" ? <span className="truncate text-[12px] text-fg-muted">{cu.name}</span> : null}
          </span>
        </TableCell>
        <TableCell className="text-fg-muted max-lg:hidden">
          <time dateTime={o.placedAt} className="tabular whitespace-nowrap">
            {date} <span className="text-fg-subtle">{time}</span>
          </time>
        </TableCell>
        <TableCell className="max-sm:hidden">
          <Badge size="sm" tone={orderStatusTone[o.status]} dot className="whitespace-nowrap">
            {t(orderStatusLabels[o.status])}
          </Badge>
        </TableCell>
        <TableCell className="text-fg-muted max-xl:hidden">{by === "channel" ? cu.name : t(channelLabels[o.channel])}</TableCell>
        <TableCell className="text-fg-muted max-xl:hidden">{t(paymentLabels[o.payment])}</TableCell>
        <TableCell numeric className="text-fg-muted max-lg:hidden">
          {unitsOf(o)}
        </TableCell>
        <TableCell numeric className={cn("pe-5", cancelled ? "text-fg-subtle line-through decoration-fg-subtle/60" : "text-fg")}>
          {money(o.total)}
        </TableCell>
      </TableRow>
      {open ? (
        <TableRow id={linesId} className="hover:bg-transparent">
          <TableCell colSpan={COLS} className="p-0">
            <div className="ui-fade grid gap-4 border-s-2 border-accent bg-surface-2/60 py-3 ps-6 pe-5 sm:ms-[52px] xl:grid-cols-[minmax(0,1fr)_240px]">
              <ul className="grid gap-2" aria-label={c(`Lines of ${o.number}`, `${o.number} kalemleri`)}>
                {o.lines.map((l) => {
                  const p = productsById[l.productId];
                  return (
                    <li key={l.sku} className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3">
                      <span className="size-9 overflow-hidden rounded-ui-sm bg-surface">
                        {p ? <Image src={productPhoto(p, 96)} alt="" width={36} height={36} aspect={1} className="size-full [&_img]:size-full [&_img]:object-cover" /> : null}
                      </span>
                      <span className="grid min-w-0 leading-tight">
                        <span className="truncate text-fg">{t(l.name)}</span>
                        <span className="truncate font-mono text-[11.5px] text-fg-subtle">
                          {l.sku} · {l.qty} × {money(l.unitPrice)}
                        </span>
                      </span>
                      <span className="tabular text-fg">{money(l.total)}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="grid content-start gap-1 border-line text-[12.5px] max-xl:border-t max-xl:pt-3 xl:border-s xl:ps-4">
                <dl className="grid gap-1">
                {[
                  [c("Subtotal", "Ara toplam"), money(o.subtotal)],
                  [c("Shipping", "Kargo"), Number(o.shipping.amount) ? money(o.shipping) : c("Free", "Ücretsiz")],
                  [c("of which VAT", "içindeki KDV"), money(o.tax)],
                  ...(o.refunded ? [[c("Refunded", "İade edilen"), `−${money(o.refunded)}`]] : []),
                  [c("Counts toward revenue", "Ciroya yansıyan"), money({ amount: netOf(o), currency: "TRY" })],
                ].map(([k, v], i, arr) => (
                  <div key={k} className={cn("flex justify-between gap-3", i === arr.length - 1 && "mt-1 border-t border-line pt-1.5 font-medium text-fg")}>
                    <dt className={i === arr.length - 1 ? "text-fg" : "text-fg-muted"}>{k}</dt>
                    <dd className="tabular">{v}</dd>
                  </div>
                ))}
                </dl>
                {o.carrier ? (
                  <p className="mt-1 truncate text-[11.5px] text-fg-subtle">
                    {o.carrier} · <span className="font-mono">{o.tracking}</span>
                  </p>
                ) : null}
                <Button asChild size="xs" variant="link" className="mt-1 justify-self-start">
                  <a href={`#/site/orders/${o.id}`}>
                    {c("Open order", "Siparişi aç")} <ExternalLink />
                  </a>
                </Button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}

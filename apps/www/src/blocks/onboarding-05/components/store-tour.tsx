"use client";

import * as React from "react";
import { Compass, PackageCheck, Plus, Printer } from "lucide-react";
import {
  Badge, Button, Card, CardHeader, PageHeader, Stat, StatGroup, Table, TableBody, TableCaption, TableCell, TableContainer, TableHead,
  TableHeader, TableRow, TableEmpty, Tabs, TabsList, TabsTrigger, Tour, toast, type TourStep,
} from "@vamos-ui/react";
import { AdminShell } from "../../detail-04/components/admin-shell";
import { useBlockFormat } from "../../_shared/format";
import { orderStatusLabels } from "../../_shared/orders";
import { TODAY } from "../../_shared/time";
import { customerName, kpis, lowStock, queue as initialQueue, tours, type QueueTab, type TourId } from "./data";
import { TourPanel, type TourProgress } from "./tour-panel";

/**
 * Resolves a tour target. On a short screen a target taller than half the viewport (the stacked
 * stats, the order queue) would push the step card off-screen, so the spotlight moves to the part
 * marked `data-tour-compact` inside it.
 */
function fitTarget(selector: string): Element | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  if (el.getBoundingClientRect().height <= window.innerHeight * 0.5) return el;
  return el.querySelector("[data-tour-compact]") ?? el;
}

/**
 * Commerce overview with guided tours. The tours spotlight real parts of the page (`data-tour`
 * targets, plus the shell's search) and remember how far you got, so a tour can be resumed or
 * replayed from the Tours card.
 */
export function StoreTour() {
  const { c, t, f, money, ago } = useBlockFormat();
  const [active, setActive] = React.useState<TourId>("basics");
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [progress, setProgress] = React.useState<Record<TourId, TourProgress>>({ basics: { seen: -1, done: false }, orders: { seen: -1, done: false } });
  const [tab, setTab] = React.useState<QueueTab>("pack");
  const [queue, setQueue] = React.useState(initialQueue);

  const tour = tours.find((x) => x.id === active)!;
  // Below xl the side column stacks under the main one: side cards go above their target instead.
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 1279px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const steps = React.useMemo<TourStep[]>(
    () =>
      tour.steps.map((s) => ({
        id: s.id,
        target: s.target ? () => fitTarget(s.target!) : undefined,
        side: narrow && (s.side === "left" || s.side === "right") ? "top" : s.side,
        align: narrow && (s.side === "left" || s.side === "right") ? "center" : s.align,
        title: t(s.title),
        description: t(s.description),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tour, c, narrow],
  );

  const start = (id: TourId, from = 0) => {
    if (id === "orders") setTab("pack");
    setActive(id);
    setStep(from);
    setProgress((p) => ({ ...p, [id]: { ...p[id], seen: Math.max(p[id].seen, from) } }));
    setOpen(true);
  };

  const onStep = (i: number) => {
    setStep(i);
    setProgress((p) => ({ ...p, [active]: { ...p[active], seen: Math.max(p[active].seen, i) } }));
  };

  const pack = (id: string) => {
    const o = queue.pack.find((x) => x.id === id);
    if (!o) return;
    setQueue((q) => ({ ...q, pack: q.pack.filter((x) => x.id !== id), packed: [o, ...q.packed] }));
    toast.success(c(`${o.number} packed — ready for pickup`, `${o.number} paketlendi — alıma hazır`));
  };

  const rows = queue[tab];
  const tabs: { id: QueueTab; label: string }[] = [
    { id: "pack", label: c("To pack", "Paketlenecek") },
    { id: "packed", label: c("Packed", "Paketlenen") },
    { id: "returns", label: c("Returns", "İadeler") },
  ];
  const vs = c("vs last Wednesday", "geçen çarşambaya göre");

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1320px]">
      <PageHeader
        size="lg"
        eyebrow={f.date(TODAY, { weekday: "long", day: "numeric", month: "long" })}
        title={
          <>
            {c("Good morning,", "Günaydın,")} <em>Defne</em>
          </>
        }
        description={c("Kiln & Linen · 3 people are working orders right now.", "Kiln & Linen · şu an 3 kişi sipariş hazırlıyor.")}
        actions={
          <>
            <Button variant="ghost" onClick={() => start("basics", 0)}>
              <Compass /> {c("Take the tour", "Turu başlat")}
            </Button>
            <Button variant="primary" data-tour="create">
              <Plus /> {c("New order", "Yeni sipariş")}
            </Button>
          </>
        }
      />

      <StatGroup data-tour="kpis" className="mt-6" aria-label={c("Today so far", "Bugüne kadar")}>
        <Stat size="sm" data-tour-compact label={c("Revenue today", "Bugünkü ciro")} value={money({ amount: kpis.revenue.value.toFixed(2), currency: "TRY" }, { compact: true })} delta={kpis.revenue.value / kpis.revenue.prev - 1} deltaKind="percent" trend={kpis.revenue.trend} comparison={vs} />
        <Stat size="sm" label={c("Orders", "Siparişler")} value={kpis.orders.value} delta={kpis.orders.value / kpis.orders.prev - 1} deltaKind="percent" trend={kpis.orders.trend} comparison={vs} />
        <Stat size="sm" label={c("Conversion", "Dönüşüm")} value={kpis.conversion.value} format="percent" delta={kpis.conversion.value / kpis.conversion.prev - 1} deltaKind="percent" trend={kpis.conversion.trend} comparison={vs} />
        <Stat size="sm" label={c("Visitors", "Ziyaretçi")} value={kpis.visitors.value} delta={kpis.visitors.value / kpis.visitors.prev - 1} deltaKind="percent" trend={kpis.visitors.trend} comparison={vs} />
      </StatGroup>

      <div className="mt-(--gap) grid items-start gap-(--gap) xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 gap-(--gap)">
          <Card data-tour="queue" className="min-w-0">
            <CardHeader
              data-tour-compact
              titleAs="h2"
              title={c("Orders to handle", "İşlenecek siparişler")}
              description={c("Oldest first. Packed orders leave for the courier at 16:00.", "En eskiden yeniye. Paketlenenler 16:00'da kargoya çıkar.")}
              action={
                <Button size="sm" variant="secondary" data-tour="labels" onClick={() => toast(c(`Labels for ${rows.length} orders are ready`, `${rows.length} siparişin etiketi hazır`))}>
                  <Printer /> {c("Print labels", "Etiket bas")}
                </Button>
              }
            />
            <Tabs value={tab} onValueChange={(v) => setTab(v as QueueTab)}>
              <div className="overflow-x-auto px-(--card-p)">
                <TabsList data-tour="queue-tabs" aria-label={c("Order queue", "Sipariş kuyruğu")}>
                  {tabs.map((x) => (
                    <TabsTrigger key={x.id} value={x.id} count={queue[x.id].length}>
                      {x.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
            <TableContainer className="pb-2">
              <Table>
                <TableCaption visuallyHidden>{tabs.find((x) => x.id === tab)!.label}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>{c("Order", "Sipariş")}</TableHead>
                    <TableHead className="hidden md:table-cell">{c("Placed", "Tarih")}</TableHead>
                    <TableHead className="hidden sm:table-cell">{c("Status", "Durum")}</TableHead>
                    <TableHead numeric>{c("Total", "Tutar")}</TableHead>
                    <TableHead align="end">
                      <span className="sr-only">{c("Actions", "İşlemler")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableEmpty colSpan={5} title={c("All caught up", "Hepsi tamam")} description={c("Nothing waits in this tab.", "Bu sekmede bekleyen yok.")} />
                  ) : (
                    rows.map((o, i) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <span className="block font-mono text-[12.5px] text-fg">{o.number}</span>
                          <span className="block max-w-[11rem] truncate text-[12px] text-fg-muted">{customerName(o)}</span>
                        </TableCell>
                        <TableCell className="hidden text-fg-muted md:table-cell">{ago(o.placedAt)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {tab === "packed" ? <Badge tone="success">{c("Packed", "Paketlendi")}</Badge> : <Badge tone={o.status === "paid" ? "info" : "warning"}>{t(orderStatusLabels[o.status])}</Badge>}
                        </TableCell>
                        <TableCell numeric>{money(o.total)}</TableCell>
                        <TableCell align="end">
                          {tab === "pack" ? (
                            <Button size="sm" variant="ghost" data-tour={i === 0 ? "queue-action" : undefined} onClick={() => pack(o.id)} aria-label={c(`Mark ${o.number} packed`, `${o.number} paketlendi olarak işaretle`)}>
                              <PackageCheck /> <span className="hidden sm:inline">{c("Packed", "Paketlendi")}</span>
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost">{c("Open", "Aç")}</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
          <Card data-tour="stock">
            <CardHeader titleAs="h2" title={c("Low stock", "Azalan stok")} description={c("At or under the reorder point", "Yeniden sipariş seviyesinde veya altında")} />
            <ul className="m-0 grid list-none divide-y divide-line p-0 pb-1">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-(--card-p) py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-fg">{t(p.name)}</span>
                    <span className="block font-mono text-[11px] text-fg-subtle">{p.sku}</span>
                  </span>
                  <Badge tone={p.stock === 0 ? "danger" : "warning"} className="font-mono tabular">
                    {f.number(p.stock)}
                    <span aria-hidden> / </span>
                    <span className="sr-only"> {c("in stock, reorder point", "stokta, sipariş eşiği")} </span>
                    {f.number(p.reorderPoint)}
                  </Badge>
                  <Button size="sm" variant="ghost" aria-label={c(`Reorder ${t(p.name)}`, `${t(p.name)} için sipariş ver`)}>
                    {c("Reorder", "Sipariş")}
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <TourPanel tours={tours} progress={progress} onStart={start} />
      </div>

      <Tour
        steps={steps}
        open={open}
        onOpenChange={setOpen}
        step={step}
        onStepChange={onStep}
        onComplete={() => {
          setProgress((p) => ({ ...p, [active]: { seen: tour.steps.length - 1, done: true } }));
          toast.success(c(`“${tour.title.en}” finished`, `“${tour.title.tr}” tamamlandı`));
        }}
        onSkip={(i) => toast(c(`Tour paused at step ${i + 1}. Resume it from Tours.`, `Tur ${i + 1}. adımda durdu. Turlar'dan devam edin.`))}
        labels={{
          next: c("Next", "İleri"),
          back: c("Back", "Geri"),
          done: c("Finish", "Bitir"),
          skip: c("Leave tour", "Turdan çık"),
          progress: c("Step {current} of {total}", "Adım {current} / {total}"),
        }}
      />
    </div>
  );
}

export function StoreTourScreen() {
  return (
    <AdminShell path="/commerce">
      <StoreTour />
    </AdminShell>
  );
}

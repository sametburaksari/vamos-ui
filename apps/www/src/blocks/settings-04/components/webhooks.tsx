"use client";

import * as React from "react";
import { Plus, RotateCw, Webhook } from "lucide-react";
import {
  Badge, Button, Card, CardHeader, Checkbox, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, Input, Select, Sheet, SheetBody,
  SheetContent, SheetFooter, SheetHeader, Spinner, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, Tabs, TabsList,
  TabsTrigger, cn, toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { NOW } from "../../_shared/time";
import { deliveries as initialDeliveries, endpointHealth, responseFor, webhookEndpoints, webhookEvents, type Delivery } from "./developer-data";
import { CopyButton } from "./api-keys";

type Endpoint = (typeof webhookEndpoints)[number];
const host = (url: string) => url.replace(/^https?:\/\//, "").split("/")[0]!;
const tone = (status: number) => (status >= 200 && status < 300 ? "success" : status >= 500 ? "danger" : "warning");

/** Endpoints with a 24-hour health strip, and the delivery log with payload inspection and redelivery. */
export function Webhooks() {
  const { c, f, t, ago } = useBlockFormat();
  const [endpoints, setEndpoints] = React.useState<Endpoint[]>(webhookEndpoints);
  const [log, setLog] = React.useState<Delivery[]>(initialDeliveries);
  const [filter, setFilter] = React.useState<"all" | "failed">("all");
  const [endpointFilter, setEndpointFilter] = React.useState("any");
  const [inspect, setInspect] = React.useState<Delivery | null>(null);
  const [sheet, setSheet] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const seq = React.useRef(100);

  const rows = log.filter((d) => (filter === "all" || d.pending || d.status >= 300) && (endpointFilter === "any" || d.endpoint === endpointFilter));
  const failed = log.filter((d) => !d.pending && d.status >= 300).length;
  const epName = (id: string) => host(endpoints.find((e) => e.id === id)?.url ?? id);

  const redeliver = (d: Delivery) => {
    const id = `dl-${seq.current++}`;
    const next: Delivery = { ...d, id, at: NOW, attempt: d.attempt + 1, pending: true, status: 0, duration: 0 };
    setLog((all) => [next, ...all]);
    setSheet(false);
    window.setTimeout(() => {
      // The stock endpoint still rejects the signature; the ERP one recovers.
      const status = d.endpoint === "wh-2" ? 401 : 200;
      setLog((all) => all.map((x) => (x.id === id ? { ...x, pending: false, status, duration: status === 200 ? 214 : 92, response: responseFor(status) } : x)));
      if (status === 200) toast.success(c(`${d.event} delivered`, `${d.event} iletildi`), { description: c(`${epName(d.endpoint)} answered 200 in 214 ms.`, `${epName(d.endpoint)} 214 ms'de 200 döndü.`) });
      else
        toast.danger(c(`${epName(d.endpoint)} answered 401`, `${epName(d.endpoint)} 401 döndü`), {
          description: c("The receiver rejects the signature. Check it uses the current signing secret.", "Alıcı imzayı reddediyor. Güncel imzalama anahtarını kullandığını kontrol edin."),
        });
    }, 1300);
  };

  return (
    <Card className="min-w-0">
      <CardHeader
        titleAs="h2"
        title={c("Webhooks", "Webhook'lar")}
        description={c("We POST a signed JSON event to each endpoint and retry failures 5 times over 6 hours.", "Her uç noktaya imzalı bir JSON olayı POST ederiz; başarısızları 6 saat içinde 5 kez yeniden deneriz.")}
        action={
          <Button onClick={() => setAdding(true)}>
            <Plus /> {c("Add endpoint", "Uç nokta ekle")}
          </Button>
        }
      />

      <ul className="grid border-t border-line" aria-label={c("Endpoints", "Uç noktalar")}>
        {endpoints.map((e) => {
          const health = endpointHealth[e.id] ?? Array<number | null>(24).fill(null);
          const switchId = `ep-${e.id}`;
          return (
            <li key={e.id} className="grid gap-3 border-b border-line px-(--card-p) py-3.5 md:grid-cols-[minmax(0,1fr)_minmax(10rem,14rem)_auto] md:items-center">
              <div className="min-w-0">
                <p id={`${switchId}-label`} className="truncate font-mono text-[12.5px] text-fg" title={e.url}>
                  {e.url}
                </p>
                <p className="mt-1.5 flex flex-wrap gap-1">
                  {e.events.map((ev) => (
                    <Badge key={ev} shape="square" className="font-mono">
                      {ev}
                    </Badge>
                  ))}
                </p>
              </div>
              {/* One cell per hour, oldest first: green full success, amber partial, red nothing got through. */}
              <div className="min-w-0">
                <div aria-hidden className="flex h-5 gap-[2px]">
                  {health.map((h, i) => (
                    <span
                      key={i}
                      className={cn(
                        "min-w-0 flex-1 rounded-[1px]",
                        !e.active || h === null ? "bg-track" : h >= 0.97 ? "bg-success" : h >= 0.5 ? "bg-warning" : "bg-danger",
                      )}
                    />
                  ))}
                </div>
                <p className="mt-1 flex justify-between text-[11px] text-fg-subtle">
                  <span>{c("24 h", "24 sa")}</span>
                  <span className={cn("font-mono tabular", e.active && e.successRate < 0.9 && "text-danger")}>
                    {e.active ? c(`${f.percent(e.successRate, { maximumFractionDigits: 1 })} delivered`, `%${f.number(e.successRate * 100, { maximumFractionDigits: 1 })} iletildi`) : c("Paused", "Duraklatıldı")}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 md:justify-end">
                <span className="text-xs text-fg-muted md:hidden">{e.active ? c("Sending", "Gönderiliyor") : c("Paused", "Duraklatıldı")}</span>
                <Switch
                  aria-label={c(`Send events to ${host(e.url)}`, `${host(e.url)} adresine olay gönder`)}
                  checked={e.active}
                  onCheckedChange={(on) => {
                    setEndpoints((all) => all.map((x) => (x.id === e.id ? { ...x, active: on, successRate: on && x.successRate === 0 ? 1 : x.successRate } : x)));
                    toast(on ? c(`Sending to ${host(e.url)} again`, `${host(e.url)} adresine yeniden gönderiliyor`) : c(`${host(e.url)} paused`, `${host(e.url)} duraklatıldı`), {
                      description: on ? undefined : c("Events are kept for 72 hours and sent when you resume.", "Olaylar 72 saat saklanır ve devam ettiğinizde gönderilir."),
                    });
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 px-(--card-p) pt-5 pb-3">
        <h3 className="text-[15px] font-medium text-fg">{c("Delivery log", "Gönderim kaydı")}</h3>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <Select
            size="sm"
            className="w-48"
            aria-label={c("Endpoint", "Uç nokta")}
            value={endpointFilter}
            onValueChange={(v) => v && setEndpointFilter(v)}
            items={[{ value: "any", label: c("All endpoints", "Tüm uç noktalar") }, ...endpoints.map((e) => ({ value: e.id, label: host(e.url) }))]}
          />
          <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "failed")}>
            <TabsList variant="pill" size="sm" aria-label={c("Result", "Sonuç")}>
              <TabsTrigger value="all">{c("All", "Tümü")}</TabsTrigger>
              <TabsTrigger value="failed" count={failed}>
                {c("Failed", "Başarısız")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <TableContainer className="border-t border-line">
        <Table aria-label={c("Delivery log", "Gönderim kaydı")}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{c("Status", "Durum")}</TableHead>
              <TableHead>{c("Event", "Olay")}</TableHead>
              <TableHead className="max-md:hidden">{c("Endpoint", "Uç nokta")}</TableHead>
              <TableHead align="end" className="max-sm:hidden">
                {c("Time", "Süre")}
              </TableHead>
              <TableHead align="end" className="max-sm:hidden">
                {c("When", "Zaman")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d.id} className={cn(d.pending && "ui-fade")}>
                <TableCell>
                  {d.pending ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
                      <Spinner size="xs" /> {c("Sending", "Gönderiliyor")}
                    </span>
                  ) : (
                    <Badge tone={tone(d.status)} shape="square" className="font-mono">
                      {d.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    disabled={d.pending}
                    onClick={() => {
                      setInspect(d);
                      setSheet(true);
                    }}
                    className="block max-w-full rounded-ui-sm text-start focus-ring disabled:cursor-default"
                  >
                    <span className="block truncate font-mono text-[12.5px] text-fg hover:underline">{d.event}</span>
                    <span className="block truncate text-[11.5px] text-fg-subtle">
                      <span className="sm:hidden">{d.at === NOW ? c("just now", "az önce") : ago(d.at)} · </span>
                      {c(`attempt ${d.attempt}`, `${d.attempt}. deneme`)}
                    </span>
                    <span className="block truncate font-mono text-[11.5px] text-fg-subtle md:hidden">{epName(d.endpoint)}</span>
                  </button>
                </TableCell>
                <TableCell className="font-mono text-[12px] text-fg-muted max-md:hidden">{epName(d.endpoint)}</TableCell>
                <TableCell align="end" className={cn("font-mono text-[12px] tabular max-sm:hidden", d.duration > 2000 ? "text-danger" : "text-fg-muted")}>
                  {d.pending ? "—" : `${f.number(d.duration)} ms`}
                </TableCell>
                <TableCell align="end" className="text-[12px] whitespace-nowrap text-fg-muted max-sm:hidden">
                  {d.at === NOW ? c("just now", "az önce") : ago(d.at)}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-[13px] text-fg-muted">
                  {c("No failed deliveries. Everything got through.", "Başarısız gönderim yok. Hepsi iletildi.")}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="end" className="sm:max-w-[560px]">
          {inspect ? (
            <>
              <SheetHeader
                icon={<Webhook />}
                title={inspect.event}
                description={`${epName(inspect.endpoint)} · ${f.dateTime(inspect.at)}`}
                action={
                  <Badge tone={tone(inspect.status)} shape="square" className="font-mono">
                    {inspect.status}
                  </Badge>
                }
              />
              <SheetBody className="grid gap-5">
                <dl className="grid grid-cols-3 gap-3 text-[13px]">
                  <div>
                    <dt className="text-xs text-fg-subtle">{c("Attempt", "Deneme")}</dt>
                    <dd className="font-mono text-fg tabular">{inspect.attempt} / 5</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-fg-subtle">{c("Response time", "Yanıt süresi")}</dt>
                    <dd className="font-mono text-fg tabular">{f.number(inspect.duration)} ms</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-fg-subtle">{c("Delivery", "Gönderim")}</dt>
                    <dd className="truncate font-mono text-fg">{inspect.id}</dd>
                  </div>
                </dl>
                <CodeBlock title={c("Request body", "İstek gövdesi")} code={inspect.request} />
                <CodeBlock title={c("Request headers", "İstek başlıkları")} code={`content-type: application/json\nvamos-event: ${inspect.event}\nvamos-signature: t=1763450640,v1=5f1c…e9a0`} />
                <CodeBlock title={c("Response", "Yanıt")} code={inspect.response} tone={inspect.status >= 300 ? "danger" : undefined} />
              </SheetBody>
              <SheetFooter>
                <Button onClick={() => redeliver(inspect)}>
                  <RotateCw /> {c("Resend", "Yeniden gönder")}
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <AddEndpoint
        open={adding}
        onOpenChange={setAdding}
        onAdd={(url, events) => {
          const ep: Endpoint = { id: `wh-${endpoints.length + 10}`, url, events, active: true, successRate: 1 };
          setEndpoints((all) => [...all, ep]);
          setAdding(false);
          toast.success(c(`${host(url)} added`, `${host(url)} eklendi`), { description: c("We sent a ping event to check it answers.", "Yanıt verdiğini kontrol etmek için bir ping olayı gönderdik.") });
        }}
      />
    </Card>
  );
}

function CodeBlock({ title, code, tone }: { title: string; code: string; tone?: "danger" }) {
  const { c } = useBlockFormat();
  return (
    <section className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-medium text-fg-muted">{title}</h4>
        <CopyButton text={code} label={c("Copy", "Kopyala")} done={c("Copied", "Kopyalandı")} />
      </div>
      <pre className={cn("mt-1.5 max-h-72 overflow-auto rounded-ui border border-line surface-2 p-3 font-mono text-[12px] leading-relaxed text-fg", tone === "danger" && "border-danger/40")} tabIndex={0}>
        {code}
      </pre>
    </section>
  );
}

function AddEndpoint({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (v: boolean) => void; onAdd: (url: string, events: string[]) => void }) {
  const { c, t } = useBlockFormat();
  const [url, setUrl] = React.useState("");
  const [events, setEvents] = React.useState<string[]>(["order.created"]);
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setUrl("");
      setEvents(["order.created"]);
      setTried(false);
    }
  }, [open]);
  const urlError = !/^https:\/\/[^\s/]+\.[^\s/]+/.test(url) ? c("Use a public https:// address.", "Herkese açık bir https:// adresi girin.") : undefined;
  const eventsError = events.length === 0 ? c("Pick at least one event.", "En az bir olay seçin.") : undefined;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader title={c("Add endpoint", "Uç nokta ekle")} description={c("We send a test ping as soon as you save.", "Kaydettiğiniz anda bir test ping'i göndeririz.")} />
        <form
          id="endpoint-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (!urlError && !eventsError) onAdd(url.trim(), events);
          }}
        >
          <DialogBody className="grid gap-5">
            <Field label={c("Endpoint URL", "Uç nokta adresi")} error={tried ? urlError : undefined} required>
              <Input type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://erp.example.com/hooks" className="font-mono" data-autofocus />
            </Field>
            <fieldset>
              <legend className="text-[13px] font-medium text-fg">{c("Events", "Olaylar")}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {webhookEvents.map((ev) => (
                  <Checkbox
                    key={ev.key}
                    label={t(ev.label)}
                    description={<span className="font-mono">{ev.key}</span>}
                    checked={events.includes(ev.key)}
                    onCheckedChange={(v) => setEvents((all) => (v === true ? [...all, ev.key] : all.filter((x) => x !== ev.key)))}
                  />
                ))}
              </div>
              {tried && eventsError ? <p className="mt-2 text-xs text-danger">{eventsError}</p> : null}
            </fieldset>
          </DialogBody>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c("Cancel", "Vazgeç")}
          </Button>
          <Button variant="primary" type="submit" form="endpoint-form">
            {c("Add endpoint", "Uç nokta ekle")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

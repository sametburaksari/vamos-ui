"use client";

import { Eye, Mail, ShoppingBag, ShoppingCart, CreditCard, Smartphone, Monitor, Tablet, type LucideIcon } from "lucide-react";
import { Button, Card, CardHeader, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { eventLabels, type EventKind, type LiveEvent } from "./live-data";

const kindIcon: Record<EventKind, LucideIcon> = { view: Eye, cart: ShoppingCart, checkout: CreditCard, order: ShoppingBag, signup: Mail };
const deviceIcon = { mobile: Smartphone, desktop: Monitor, tablet: Tablet } as const;

/** Newest first. Rows that arrive after the first render rise in once; nothing else moves. */
export function LiveFeed({ events, city, onClearCity }: { events: LiveEvent[]; city: string | null; onClearCity: () => void }) {
  const { f, t, c } = useBlockFormat();
  const rows = city ? events.filter((e) => e.city === city) : events;
  return (
    <Card className="ui-rise flex min-w-0 flex-col overflow-hidden" style={{ animationDelay: "120ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Activity", "Etkinlik")}
        description={city ? c(`Only visitors from ${city}`, `Yalnızca ${city} ziyaretçileri`) : c("Every visitor, as it happens", "Tüm ziyaretçiler, anında")}
      />
      {/* role=log, but not announced: a screen reader would otherwise speak every page view. */}
      <div role="log" aria-live="off" aria-label={c("Live activity", "Canlı etkinlik")} tabIndex={0} className="min-h-0 flex-1 border-t border-line focus-ring focus-visible:-outline-offset-2 lg:max-h-[30rem] lg:overflow-y-auto">
      <ol className="divide-y divide-line">
        {rows.map((e) => {
          const Icon = kindIcon[e.kind];
          const Device = deviceIcon[e.device];
          const strong = e.kind === "order" || e.kind === "checkout";
          return (
            <li key={e.id} className="ui-rise grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-5 py-2.5">
              <span className={cn("mt-0.5 grid size-7 place-items-center rounded-ui-sm", strong ? "bg-accent-soft text-accent-ink" : "bg-surface-2 text-fg-muted")} aria-hidden>
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] text-fg">
                  <span className="font-medium">{t(eventLabels[e.kind])}</span>
                  {e.kind === "order" && e.value ? <span className="ms-1.5 font-mono tabular">{f.currency(e.value, "TRY", { maximumFractionDigits: 0, currencyDisplay: "narrowSymbol" })}</span> : null}
                </p>
                <p className="flex min-w-0 items-center gap-1.5 text-xs text-fg-subtle">
                  <Device className="size-3 shrink-0" aria-label={e.device} />
                  <span className="shrink-0">{e.city}</span>
                  <span aria-hidden>·</span>
                  <span className="truncate font-mono">{e.path}</span>
                </p>
              </div>
              <div className="text-end">
                <time className="block font-mono text-[11.5px] text-fg-muted tabular" dateTime={new Date(e.at).toISOString()}>
                  {f.time(new Date(e.at), { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Istanbul" })}
                </time>
                <span className="block text-[11px] text-fg-subtle">{e.source === "direct" ? c("direct", "doğrudan") : e.source}</span>
              </div>
            </li>
          );
        })}
        {rows.length === 0 ? (
          <li className="grid justify-items-center gap-2 px-5 py-10 text-center text-sm text-fg-muted">
            {c(`Nobody from ${city} did anything in the last few minutes.`, `Son birkaç dakikada ${city} ziyaretçilerinden hareket yok.`)}
            <Button size="sm" variant="secondary" onClick={onClearCity}>{c("Show everyone", "Herkesi göster")}</Button>
          </li>
        ) : null}
      </ol>
      </div>
    </Card>
  );
}

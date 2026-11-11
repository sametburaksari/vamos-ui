"use client";

import * as React from "react";
import { Clock3, DoorClosed, DoorOpen, MousePointerClick, Navigation, Phone, UsersRound } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  PinMap,
  RadioGroup,
  Sparkline,
  cn,
  useMediaQuery,
  type MapPin,
  type MapPinTone,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { closeReasons, kindLabels, metricLabels, networkBounds, type Location, type LocationKind } from "./locations-data";
import { closedMarker, kindMarker } from "./location-list";

const pinTone: Record<LocationKind, MapPinTone> = {
  store: "accent",
  pickup: "info",
  warehouse: "neutral",
};

interface LocationPanelProps {
  items: Location[];
  selected: Location | null;
  onSelect: (id: string | null) => void;
  onSetOpen: (id: string, open: boolean, reason?: { en: string; tr: string }) => void;
}

/** The map (same filter and selection as the list) with the selected location's details under it. */
export function LocationPanel({ items, selected, onSelect, onSetOpen }: LocationPanelProps) {
  const { c, t, f } = useBlockFormat();
  const [closing, setClosing] = React.useState(false);
  // Very wide screens get a flatter map so the details stay in view.
  const xxl = useMediaQuery("(min-width: 1536px)");
  const [reason, setReason] = React.useState(closeReasons[0]!.value);

  const pins: MapPin[] = items.map((l) => ({
    id: l.id,
    lat: l.lat,
    lng: l.lng,
    label: `${Number(l.no)} · ${l.name}`,
    tone: l.open ? pinTone[l.kind] : "danger",
    icon: <span className="font-mono text-[8.5px] leading-none font-semibold">{Number(l.no)}</span>,
    description: l.open ? `${f.number(l.metric)} · ${t(metricLabels[l.kind]).toLocaleLowerCase()}` : c("Closed", "Kapalı"),
  }));

  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="p-2 pb-0">
        <PinMap
          aria-label={c("Locations in Istanbul", "İstanbul'daki lokasyonlar")}
          pins={pins}
          bounds={networkBounds}
          aspectRatio={xxl ? 2 : 16 / 10}
          selectedId={selected?.id ?? null}
          onSelectedIdChange={onSelect}
          className="rounded-[calc(var(--radius)*0.9)]"
        />
      </div>
      <ul aria-label={c("Map legend", "Harita açıklaması")} className="flex flex-wrap gap-x-4 gap-y-1 px-4 pt-2.5 text-[11.5px] text-fg-subtle">
        {(["store", "pickup", "warehouse"] as const).map((k) => (
          <li key={k} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("size-2.5 rounded-full", k === "store" ? "bg-accent" : k === "pickup" ? "bg-info" : "bg-fg-muted")} />
            {t(kindLabels[k])}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-danger" />
          {c("Closed", "Kapalı")}
        </li>
        <li className="ms-auto max-sm:hidden">{c("Arrow keys move between pins", "Ok tuşları iğneler arasında gezer")}</li>
      </ul>

      {selected ? (
        <section key={selected.id} aria-label={selected.name} className="ui-fade grid gap-4 p-4 pt-3 sm:p-5 sm:pt-4">
          <header className="flex flex-wrap items-start gap-3">
            <span
              aria-hidden="true"
              className={cn("grid size-10 shrink-0 place-items-center rounded-ui font-mono text-sm font-medium tabular", selected.open ? kindMarker[selected.kind] : closedMarker)}
            >
              {selected.no}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-[1.375rem] leading-tight text-fg">{selected.name}</h2>
              <p className="mt-0.5 text-[13px] text-fg-muted">
                {selected.street}, {selected.district} · {t(kindLabels[selected.kind])}
              </p>
            </div>
            {selected.open ? (
              <Badge tone="success" dot>
                {c("Open", "Açık")} · {selected.hours.open}–{selected.hours.close}
              </Badge>
            ) : (
              <Badge tone="danger" dot>
                {selected.closedReason ? t(selected.closedReason) : c("Closed", "Kapalı")}
              </Badge>
            )}
          </header>

          <div className="grid gap-px overflow-hidden rounded-ui border border-line bg-line sm:grid-cols-3">
            <div className="flex items-end justify-between gap-3 bg-surface-2 px-3.5 py-3">
              <div className="grid gap-1">
                <span className="text-xs text-fg-muted">{t(metricLabels[selected.kind])}</span>
                <span className="font-mono text-xl leading-none text-fg tabular">{f.number(selected.metric)}</span>
              </div>
              <Sparkline
                values={selected.trend}
                size="xs"
                color={selected.open ? "accent-ink" : "fg-subtle"}
                showLast
                label={c(`${t(metricLabels[selected.kind])}, last 14 days`, `${t(metricLabels[selected.kind])}, son 14 gün`)}
              />
            </div>
            <div className="grid gap-1 bg-surface-2 px-3.5 py-3">
              <span className="flex items-center gap-1.5 text-xs text-fg-muted">
                <UsersRound className="size-3.5" aria-hidden /> {c("On shift", "Vardiyada")}
              </span>
              <span className="font-mono text-xl leading-none text-fg tabular">
                {selected.staff.on}
                <span className="text-sm text-fg-subtle"> / {selected.staff.planned}</span>
              </span>
            </div>
            <div className="grid gap-1 bg-surface-2 px-3.5 py-3">
              <span className="flex items-center gap-1.5 text-xs text-fg-muted">
                <Clock3 className="size-3.5" aria-hidden /> {c("14-day average", "14 günlük ortalama")}
              </span>
              <span className="font-mono text-xl leading-none text-fg tabular">{f.number(Math.round(selected.trend.reduce((a, b) => a + b, 0) / selected.trend.length))}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Avatar name={person(selected.managerId).name} size="sm" status={person(selected.managerId).status} />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[13px] font-medium text-fg">{person(selected.managerId).name}</p>
                <p className="truncate text-xs text-fg-subtle">{c("Location manager", "Lokasyon sorumlusu")}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" asChild>
                <a href={`tel:${selected.phone.replace(/\s/g, "")}`}>
                  <Phone /> <span className="tabular">{selected.phone}</span>
                </a>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href={`#directions/${selected.id}`}>
                  <Navigation /> {c("Directions", "Yol tarifi")}
                </a>
              </Button>
              {selected.open ? (
                <Button size="sm" onClick={() => setClosing(true)}>
                  <DoorClosed /> {c("Close for today", "Bugün kapat")}
                </Button>
              ) : (
                <Button size="sm" variant="solid" onClick={() => onSetOpen(selected.id, true)}>
                  <DoorOpen /> {c("Reopen", "Yeniden aç")}
                </Button>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="flex items-center gap-3 p-5 text-[13px] text-fg-muted">
          <MousePointerClick className="size-4 shrink-0 text-fg-subtle" aria-hidden />
          {c("Select a pin or a row to see opening hours, staff and today's numbers.", "Çalışma saatleri, personel ve bugünün rakamları için bir iğne ya da satır seçin.")}
        </div>
      )}

      <Dialog open={closing} onOpenChange={setClosing}>
        <DialogContent size="sm">
          <DialogHeader
            title={c(`Close ${selected?.name ?? ""} for today?`, `${selected?.name ?? ""} bugün kapatılsın mı?`)}
            description={c(
              "Online orders and pickups move to the nearest open location. Staff on shift get a notification.",
              "Online sipariş ve teslimler en yakın açık lokasyona geçer. Vardiyadaki personele bildirim gider.",
            )}
          />
          <DialogBody>
            <Field label={c("Reason", "Neden")}>
              <RadioGroup
                value={reason}
                onValueChange={setReason}
                items={closeReasons.map((r) => ({
                  value: r.value,
                  label: t(r.label),
                }))}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => setClosing(false)}>{c("Keep open", "Açık kalsın")}</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (selected) onSetOpen(selected.id, false, closeReasons.find((r) => r.value === reason)!.label);
                setClosing(false);
              }}
            >
              {c("Close location", "Lokasyonu kapat")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

"use client";

import * as React from "react";
import { MapPinOff } from "lucide-react";
import { Badge, Button, EmptyState, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { kindLabels, metricLabels, type Location, type LocationKind } from "./locations-data";

/** Marker colours, shared with the map pins. */
export const kindMarker: Record<LocationKind, string> = {
  store: "bg-accent-soft text-accent-ink",
  pickup: "tone-info tone-soft",
  warehouse: "bg-selected text-fg-muted",
};
export const closedMarker = "tone-danger tone-soft";

interface LocationListProps {
  items: Location[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
}

/** The ledger: one numbered row per location. Up/Down move between rows, Enter or Space selects. */
export function LocationList({ items, selectedId, onSelect, onClear }: LocationListProps) {
  const { c, t, f } = useBlockFormat();
  const rowRefs = React.useRef(new Map<string, HTMLButtonElement>());

  // Keep the selected row in view when it was picked on the map.
  React.useEffect(() => {
    if (!selectedId) return;
    const el = rowRefs.current.get(selectedId);
    if (el && document.activeElement !== el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const next = e.key === "ArrowDown" ? index + 1 : e.key === "ArrowUp" ? index - 1 : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const target = items[Math.max(0, Math.min(items.length - 1, next))];
    if (target) rowRefs.current.get(target.id)?.focus();
  };

  if (!items.length) {
    return (
      <EmptyState
        kind="no-results"
        size="sm"
        icon={<MapPinOff />}
        title={c("No locations match", "Eşleşen lokasyon yok")}
        description={c("Try another name or district, or show closed locations too.", "Başka bir ad ya da ilçe deneyin veya kapalı lokasyonları da gösterin.")}
        actions={
          <Button size="sm" onClick={onClear}>
            {c("Clear filters", "Filtreleri temizle")}
          </Button>
        }
        className="py-14"
      />
    );
  }

  return (
    <div className="lg:max-h-[calc(100dvh-17rem)] lg:min-h-[420px] lg:overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-[color-mix(in_oklch,var(--surface-2)_92%,transparent)] px-4 py-2 text-[11.5px] text-fg-subtle backdrop-blur-sm">
        <span>{items.length === 1 ? c("1 location", "1 lokasyon") : c(`${items.length} locations`, `${items.length} lokasyon`)}</span>
        <span>{c("Today", "Bugün")}</span>
      </div>
      <Stagger asChild step={35}>
        <ul aria-label={c("Locations", "Lokasyonlar")} className="divide-y divide-line">
          {items.map((l, i) => {
            const active = l.id === selectedId;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  ref={(el) => {
                    if (el) rowRefs.current.set(l.id, el);
                    else rowRefs.current.delete(l.id);
                  }}
                  aria-pressed={active}
                  onClick={() => onSelect(l.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    "group relative grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-3 px-4 py-3 text-start transition-colors focus-ring focus-visible:-outline-offset-2",
                    active ? "bg-selected" : "hover:bg-hover",
                  )}
                >
                  <span aria-hidden="true" className={cn("absolute inset-y-2 start-0 w-0.5 rounded-full bg-accent transition-opacity", active ? "opacity-100" : "opacity-0")} />
                  <span
                    aria-hidden="true"
                    className={cn("grid size-8 place-items-center rounded-ui-sm font-mono text-[12px] font-medium tabular", l.open ? kindMarker[l.kind] : closedMarker)}
                  >
                    {l.no}
                  </span>
                  <span className="grid min-w-0 gap-0.5">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={cn("truncate text-[13.5px] font-medium", l.open ? "text-fg" : "text-fg-muted")}>{l.name}</span>
                      {!l.open ? (
                        <Badge tone="danger" size="sm" className="shrink-0">
                          {c("Closed", "Kapalı")}
                        </Badge>
                      ) : null}
                    </span>
                    <span className="truncate text-xs text-fg-subtle">
                      {t(kindLabels[l.kind])} · {l.district}
                      {!l.open && l.closedReason ? ` · ${t(l.closedReason)}` : ` · ${l.hours.open}–${l.hours.close}`}
                    </span>
                  </span>
                  <span className="grid justify-items-end gap-0.5">
                    <span className="font-mono text-[15px] leading-none text-fg tabular">{f.number(l.metric)}</span>
                    <span className="text-[11px] whitespace-nowrap text-fg-subtle max-sm:sr-only">{t(metricLabels[l.kind])}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Stagger>
    </div>
  );
}

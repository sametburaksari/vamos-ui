"use client";

import * as React from "react";
import { Download, List, Map as MapIcon, Plus, Search } from "lucide-react";
import { Badge, Button, Card, Input, PageHeader, Switch, ToggleGroup, ToggleGroupItem, cn, toast } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { AddLocationDialog } from "./add-location-dialog";
import { LocationList } from "./location-list";
import { LocationPanel } from "./location-panel";
import { kindPlural, locations as seed, type Location, type LocationKind } from "./locations-data";

type KindFilter = "all" | LocationKind;

/** Stores, pickup points and warehouses: a numbered ledger and a map that share one selection. */
export function LocationsView() {
  const { c, t } = useBlockFormat();
  const [items, setItems] = React.useState<Location[]>(seed);
  const [kind, setKind] = React.useState<KindFilter>("all");
  const [query, setQuery] = React.useState("");
  const [openOnly, setOpenOnly] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>("st-2");
  const [pane, setPane] = React.useState<"list" | "map">("list");
  const [adding, setAdding] = React.useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);

  const q = query.trim().toLocaleLowerCase();
  const visible = items.filter(
    (l) => (kind === "all" || l.kind === kind) && (!openOnly || l.open) && (!q || `${l.name} ${l.district} ${l.street}`.toLocaleLowerCase().includes(q)),
  );
  const selected = visible.find((l) => l.id === selectedId) ?? null;

  const select = (id: string | null, from: "list" | "map") => {
    setSelectedId(id);
    // Small screens show one pane at a time: picking a row jumps to the map.
    if (from === "list" && id && window.matchMedia("(max-width: 1023px)").matches) {
      setPane("map");
      requestAnimationFrame(() => mapRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }));
    }
  };

  const setOpen = (id: string, open: boolean, reason?: { en: string; tr: string }) => {
    const before = items.find((l) => l.id === id);
    if (!before) return;
    setItems((all) =>
      all.map((l) =>
        l.id === id
          ? {
              ...l,
              open,
              closedReason: open ? undefined : reason,
              staff: { ...l.staff, on: open ? l.staff.planned : 0 },
            }
          : l,
      ),
    );
    toast.success(open ? c(`${before.name} is open again`, `${before.name} yeniden açık`) : c(`${before.name} closed for today`, `${before.name} bugün kapalı`), {
      description: open
        ? c("Online orders route to this location again.", "Online siparişler yeniden buraya yönleniyor.")
        : c("Pickup orders are routed to the nearest open location.", "Teslim siparişleri en yakın açık noktaya yönlendirildi."),
      action: {
        label: c("Undo", "Geri al"),
        onClick: () => setItems((all) => all.map((l) => (l.id === id ? before : l))),
      },
    });
  };

  const counts = {
    all: items.length,
    store: 0,
    pickup: 0,
    warehouse: 0,
  } as Record<KindFilter, number>;
  for (const l of items) counts[l.kind]++;
  const openNow = items.filter((l) => l.open).length;
  const retail = items.filter((l) => l.kind !== "warehouse").reduce((n, l) => n + l.metric, 0);
  const dispatched = items.filter((l) => l.kind === "warehouse").reduce((n, l) => n + l.metric, 0);
  const staffOn = items.reduce((n, l) => n + l.staff.on, 0);
  const staffPlanned = items.reduce((n, l) => n + l.staff.planned, 0);

  const kpis = [
    {
      label: c("Open now", "Şu an açık"),
      value: openNow,
      suffix: `/ ${items.length}`,
    },
    {
      label: c("Orders & pickups today", "Bugünkü sipariş ve teslim"),
      value: retail,
    },
    { label: c("Parcels dispatched", "Çıkan koli"), value: dispatched },
    {
      label: c("On shift", "Vardiyada"),
      value: staffOn,
      suffix: `/ ${staffPlanned}`,
    },
  ];

  return (
    <div className="mx-auto flex max-w-[1480px] flex-col gap-5">
      <PageHeader
        eyebrow={c("Kiln & Linen · Operations", "Kiln & Linen · Operasyon")}
        title={c("Locations", "Lokasyonlar")}
        meta={
          <Badge tone="outline" className="tabular">
            {items.length}
          </Badge>
        }
        description={c(
          "Every store, pickup point and warehouse in Istanbul. Pick a row or a pin — both stay in step.",
          "İstanbul'daki tüm mağaza, teslim noktası ve depolar. Bir satır ya da iğne seçin; ikisi birlikte hareket eder.",
        )}
        actions={
          <>
            <Button onClick={() => toast.success(c("locations-2026-11-18.csv is ready", "locations-2026-11-18.csv hazır"))}>
              <Download /> {c("Export", "Dışa aktar")}
            </Button>
            <Button variant="primary" onClick={() => setAdding(true)}>
              <Plus /> {c("Add location", "Lokasyon ekle")}
            </Button>
          </>
        }
      />

      <dl className="ui-rise surface grid grid-cols-2 overflow-hidden rounded-ui-lg lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className={cn("flex min-w-0 flex-col gap-1.5 border-line px-4 py-3.5", i % 2 === 1 && "border-s", i >= 2 && "max-lg:border-t lg:border-s")}>
            <dt className="truncate text-[12.5px] text-fg-muted">{k.label}</dt>
            <dd className="flex items-baseline gap-1.5">
              <span className="font-display text-[1.75rem] leading-none text-fg">
                <CountUp value={k.value} />
              </span>
              {k.suffix ? <span className="font-mono text-xs text-fg-subtle tabular">{k.suffix}</span> : null}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          aria-label={c("Search locations", "Lokasyon ara")}
          placeholder={c("Name, district or street…", "Ad, ilçe veya cadde…")}
          leading={<Search />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-64"
        />
        <ToggleGroup
          aria-label={c("Kind of location", "Lokasyon türü")}
          value={kind}
          onValueChange={(v) => v && setKind(v as KindFilter)}
          className="max-sm:w-full max-sm:overflow-x-auto"
        >
          <ToggleGroupItem value="all">
            {c("All", "Tümü")} <span className="font-mono text-[11px] text-fg-subtle tabular">{counts.all}</span>
          </ToggleGroupItem>
          {(["store", "pickup", "warehouse"] as const).map((k) => (
            <ToggleGroupItem key={k} value={k}>
              {t(kindPlural[k])} <span className="font-mono text-[11px] text-fg-subtle tabular">{counts[k]}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Switch checked={openOnly} onCheckedChange={setOpenOnly} label={c("Open now", "Şu an açık")} className="ms-1" />
        <ToggleGroup aria-label={c("Show", "Göster")} value={pane} onValueChange={(v) => v && setPane(v as "list" | "map")} className="ms-auto lg:hidden">
          <ToggleGroupItem value="list" label={c("List", "Liste")}>
            <List /> <span className="max-sm:sr-only">{c("List", "Liste")}</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="map" label={c("Map", "Harita")}>
            <MapIcon /> <span className="max-sm:sr-only">{c("Map", "Harita")}</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)] 2xl:grid-cols-[440px_minmax(0,1fr)]">
        <Card className={cn("min-w-0 overflow-hidden", pane === "map" && "max-lg:hidden")}>
          <LocationList
            items={visible}
            selectedId={selected?.id ?? null}
            onSelect={(id) => select(id, "list")}
            onClear={() => {
              setQuery("");
              setKind("all");
              setOpenOnly(false);
            }}
          />
        </Card>
        <div ref={mapRef} className={cn("min-w-0 scroll-mt-20 lg:sticky lg:top-20", pane === "list" && "max-lg:hidden")}>
          <LocationPanel items={visible} selected={selected} onSelect={(id) => select(id, "map")} onSetOpen={setOpen} />
        </div>
      </div>

      <AddLocationDialog
        open={adding}
        onOpenChange={setAdding}
        nextNo={String(items.length + 1).padStart(2, "0")}
        onAdd={(loc) => {
          setItems((all) => [...all, loc]);
          setKind("all");
          setQuery("");
          setSelectedId(loc.id);
          toast.success(c(`${loc.name} added`, `${loc.name} eklendi`), {
            description: c("It shows on the map as a draft until the first shift is planned.", "İlk vardiya planlanana kadar haritada taslak olarak görünür."),
            action: {
              label: c("Undo", "Geri al"),
              onClick: () => setItems((all) => all.filter((l) => l.id !== loc.id)),
            },
          });
        }}
      />
    </div>
  );
}

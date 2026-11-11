"use client";

import * as React from "react";
import { Download, FilterX, ScrollText, Search, ShieldCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  cn,
  toast,
  useMediaQuery,
} from "@vamos-ui/react";
import { ExportDialog, exportToBlob, type ExportColumn } from "@vamos-ui/react/business";
import { useBlockFormat } from "../../_shared/format";
import { me, person } from "../../_shared/people";
import { day, minutesFromNow } from "../../_shared/time";
import { auditEntries, entityLabels, sourceLabels, type AuditEntry, type EntityType, type Severity, type Source } from "./audit-data";
import { AuditInspector } from "./audit-inspector";
import { AuditTimeline, actorName } from "./audit-timeline";

const DAYS = [-6, -5, -4, -3, -2, -1, 0].map(day);

const exportColumns: ExportColumn[] = [
  { id: "at", label: "Time", type: "date" },
  { id: "actor", label: "Actor" },
  { id: "action", label: "Action" },
  { id: "summary", label: "Description" },
  { id: "target", label: "Target" },
  { id: "source", label: "Source" },
  { id: "ip", label: "IP address", personalData: true },
  { id: "changes", label: "Changes" },
  { id: "request", label: "Request ID", defaultSelected: false },
];

/** Workspace audit log: filters, a 7-day density strip, a day-grouped timeline and an event inspector. */
export function AuditView() {
  const { c, t, f } = useBlockFormat();
  const wide = useMediaQuery("(min-width: 1280px)");
  const [entries, setEntries] = React.useState<AuditEntry[]>(auditEntries);
  const [query, setQuery] = React.useState("");
  const [actor, setActor] = React.useState<string | null>(null);
  const [entity, setEntity] = React.useState<EntityType | null>(null);
  const [source, setSource] = React.useState<Source | null>(null);
  const [severity, setSeverity] = React.useState<"all" | Severity>("all");
  const [onlyChanges, setOnlyChanges] = React.useState(false);
  const [dayFilter, setDayFilter] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [reverting, setReverting] = React.useState<AuditEntry | null>(null);

  const system = c("System", "Sistem");
  const q = query.trim().toLocaleLowerCase();
  const matchesBase = (e: AuditEntry) =>
    (!actor || (actor === "keys" ? e.actorId.startsWith("key:") : e.actorId === actor)) &&
    (!entity || e.entity.type === entity) &&
    (!source || e.source === source) &&
    (severity === "all" || (severity === "notice" ? e.severity !== "info" : e.severity === "critical")) &&
    (!onlyChanges || !!e.changes?.length) &&
    (!q || `${actorName(e.actorId, system)} ${t(e.summary)} ${e.action} ${e.entity.label} ${e.ip ?? ""}`.toLocaleLowerCase().includes(q));
  const base = entries.filter(matchesBase);
  const visible = dayFilter ? base.filter((e) => e.at.startsWith(dayFilter)) : base;
  const selected = entries.find((e) => e.id === selectedId) ?? null;

  const activeFilters = [actor, entity, source, q || null, severity !== "all" ? severity : null, onlyChanges || null, dayFilter].filter(Boolean).length;
  const clear = () => {
    setQuery("");
    setActor(null);
    setEntity(null);
    setSource(null);
    setSeverity("all");
    setOnlyChanges(false);
    setDayFilter(null);
  };

  const select = (id: string) => {
    setSelectedId(id);
    if (!wide) setSheetOpen(true);
  };

  // Reverting writes a new event; the original stays and is marked.
  const revert = (e: AuditEntry) => {
    const id = `ev-r${Date.now().toString(36)}`;
    const undo: AuditEntry = {
      id,
      at: minutesFromNow(0),
      actorId: me.id,
      action: `${e.action}.reverted`,
      summary: {
        en: `reverted “${t(e.summary)}” by ${actorName(e.actorId, "System")}`,
        tr: `${actorName(e.actorId, "Sistem")} tarafından yapılan “${t(e.summary)}” değişikliğini geri aldı`,
      },
      entity: e.entity,
      changes: e.changes?.map((ch) => ({
        field: ch.field,
        from: ch.to,
        to: ch.from,
      })),
      ip: "203.0.113.24",
      source: "web",
      severity: "notice",
      requestId: `req_${Date.now().toString(36)}`,
    };
    setEntries((all) => [undo, ...all.map((x) => (x.id === e.id ? { ...x, revertedBy: id } : x))]);
    setSelectedId(id);
    setDayFilter(null);
    toast.success(c("Change reverted", "Değişiklik geri alındı"), {
      description: c(
        `${e.entity.label} is back to its earlier values. A new event was added to the log.`,
        `${e.entity.label} önceki değerlerine döndü. Kayda yeni bir olay eklendi.`,
      ),
      action: {
        label: c("Undo", "Geri al"),
        onClick: () => {
          setEntries((all) => all.filter((x) => x.id !== id).map((x) => (x.id === e.id ? { ...x, revertedBy: undefined } : x)));
          setSelectedId(e.id);
        },
      },
    });
  };

  // Density strip: events per day for the current filters (without the day filter itself).
  const perDay = DAYS.map((d) => {
    const items = base.filter((e) => e.at.startsWith(d));
    return {
      d,
      total: items.length,
      critical: items.filter((e) => e.severity === "critical").length,
    };
  });
  const peak = Math.max(1, ...perDay.map((p) => p.total));

  const actorIds = Array.from(new Set(entries.map((e) => e.actorId).filter((id) => id !== "system" && !id.startsWith("key:"))));
  const actorItems = [
    ...actorIds.map((id) => ({ value: id, label: person(id).name })).sort((a, b) => a.label.localeCompare(b.label)),
    { value: "system", label: system },
    { value: "keys", label: c("API keys", "API anahtarları") },
  ];

  const exportRows = (scope: "selected" | "filtered" | "all") =>
    (scope === "all" ? entries : visible).map((e) => ({
      at: e.at,
      actor: actorName(e.actorId, "System"),
      action: e.action,
      summary: e.summary.en,
      target: `${e.entity.type}:${e.entity.label}`,
      source: e.source,
      ip: e.ip ?? "",
      changes: (e.changes ?? []).map((ch) => `${ch.field}: ${ch.from ?? "∅"} → ${ch.to ?? "∅"}`).join("; "),
      request: e.requestId,
    }));

  const criticalToday = entries.filter((e) => e.at.startsWith(DAYS[6]!) && e.severity === "critical").length;

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        eyebrow={c("Workspace · Security", "Çalışma alanı · Güvenlik")}
        title={c("Audit log", "Denetim kaydı")}
        meta={
          <Badge tone="outline" className="gap-1 [&_svg]:size-3">
            <ShieldCheck aria-hidden /> {c("Kept for 400 days", "400 gün saklanır")}
          </Badge>
        }
        description={c(
          `Every change made in Kiln & Linen, by people, API keys and the system. ${criticalToday} critical events today. Times are Istanbul time.`,
          `Kiln & Linen'de kişilerin, API anahtarlarının ve sistemin yaptığı her değişiklik. Bugün ${criticalToday} kritik olay. Saatler İstanbul saatidir.`,
        )}
        actions={
          <ExportDialog
            resource={c("events", "olay")}
            columns={exportColumns}
            filteredCount={visible.length}
            totalCount={entries.length}
            requireReason="personal-data"
            trigger={
              <Button>
                <Download /> {c("Export", "Dışa aktar")}
              </Button>
            }
            onExport={async (r) => {
              const cols = r.columns.map((id) => exportColumns.find((x) => x.id === id)!).filter(Boolean);
              const blob = await exportToBlob({
                rows: exportRows(r.scope),
                columns: cols,
                format: r.format,
                masked: r.masked,
                csv: r.csv,
                sheetName: "Audit log",
              });
              toast.success(c(`${r.filename} downloaded`, `${r.filename} indirildi`), {
                description: c("The export itself was written to the audit log.", "Dışa aktarma işlemi de denetim kaydına yazıldı."),
              });
              return { blob, filename: r.filename };
            }}
          />
        }
      />

      <div className="mt-5 grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="search"
            aria-label={c("Search the log", "Kayıtta ara")}
            placeholder={c("Actor, action, target or IP…", "Kişi, işlem, hedef veya IP…")}
            leading={<Search />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-72"
          />
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:[&>[data-slot=select]]:w-40">
            <Select aria-label={c("Actor", "Kişi")} value={actor} onValueChange={setActor} clearable placeholder={c("Anyone", "Herkes")} items={actorItems} />
            <Select
              aria-label={c("Target type", "Hedef türü")}
              value={entity}
              onValueChange={(v) => setEntity(v as EntityType | null)}
              clearable
              placeholder={c("All targets", "Tüm hedefler")}
              items={(Object.keys(entityLabels) as EntityType[]).map((k) => ({
                value: k,
                label: t(entityLabels[k]),
              }))}
            />
            <Select
              aria-label={c("Source", "Kaynak")}
              value={source}
              onValueChange={(v) => setSource(v as Source | null)}
              clearable
              placeholder={c("Any source", "Her kaynak")}
              items={(Object.keys(sourceLabels) as Source[]).map((k) => ({
                value: k,
                label: t(sourceLabels[k]),
              }))}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ToggleGroup aria-label={c("Severity", "Önem")} size="sm" value={severity} onValueChange={(v) => v && setSeverity(v as typeof severity)}>
            <ToggleGroupItem value="all">{c("All", "Tümü")}</ToggleGroupItem>
            <ToggleGroupItem value="notice">{c("Notice and up", "Dikkat ve üstü")}</ToggleGroupItem>
            <ToggleGroupItem value="critical">{c("Critical", "Kritik")}</ToggleGroupItem>
          </ToggleGroup>
          <Switch checked={onlyChanges} onCheckedChange={setOnlyChanges} label={c("With field changes", "Alan değişikliği olanlar")} />
          {activeFilters ? (
            <Button size="sm" variant="ghost" onClick={clear} className="ms-auto">
              <FilterX /> {c(`Clear ${activeFilters} ${activeFilters === 1 ? "filter" : "filters"}`, `${activeFilters} filtreyi temizle`)}
            </Button>
          ) : null}
        </div>

        <div className="surface rounded-ui-lg px-3 pt-2.5 pb-2 sm:px-4">
          <div className="mb-1 flex items-center gap-3 text-[11.5px] text-fg-subtle">
            <span className="font-medium text-fg-muted">{c("Last 7 days", "Son 7 gün")}</span>
            <span className="max-sm:hidden">{c("Pick a day to filter", "Filtrelemek için bir gün seçin")}</span>
            <span className="ms-auto flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2 rounded-[2px] bg-danger" /> {c("Critical", "Kritik")}
            </span>
          </div>
          <div role="group" aria-label={c("Events per day, last 7 days", "Günlük olay sayısı, son 7 gün")} className="grid grid-cols-7 items-end gap-1.5 sm:gap-3">
            {perDay.map((p) => {
              const on = dayFilter === p.d;
              return (
                <button
                  key={p.d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setDayFilter(on ? null : p.d)}
                  className={cn("group grid justify-items-center gap-1.5 rounded-ui-sm px-0.5 pt-1 pb-1 transition-colors focus-ring", on ? "bg-selected" : "hover:bg-hover")}
                >
                  <span className="font-mono text-[11px] text-fg-muted tabular">{p.total}</span>
                  <span className="flex h-10 w-full max-w-9 flex-col justify-end overflow-hidden rounded-[3px]">
                    <span
                      className={cn(
                        "flex w-full flex-col justify-end rounded-[3px] transition-[height] duration-300",
                        on ? "bg-accent" : "bg-fg-subtle/35 group-hover:bg-fg-subtle/55",
                      )}
                      style={{
                        height: `${p.total ? Math.max(14, Math.sqrt(p.total / peak) * 100) : 3}%`,
                      }}
                    >
                      {p.critical ? (
                        <span
                          className="w-full bg-danger"
                          style={{
                            height: `${(p.critical / Math.max(1, p.total)) * 100}%`,
                          }}
                        />
                      ) : null}
                    </span>
                  </span>
                  <span className={cn("text-[11px]", on ? "font-medium text-fg" : "text-fg-subtle")}>{f.date(p.d, { weekday: "short" })}</span>
                  <span className="sr-only">
                    {c(`, ${f.date(p.d, { day: "numeric", month: "long" })}, ${p.critical} critical`, `, ${f.date(p.d, { day: "numeric", month: "long" })}, ${p.critical} kritik`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          <p className="mb-3 flex items-center gap-2 text-[12.5px] text-fg-subtle" role="status">
            <ScrollText className="size-3.5" aria-hidden />
            {c(`${visible.length} of ${entries.length} events`, `${entries.length} olaydan ${visible.length} tanesi`)}
            {dayFilter ? ` · ${f.date(dayFilter, { day: "numeric", month: "long" })}` : ""}
            <span className="ms-auto max-sm:hidden">{c("↑ ↓ or j / k to move", "↑ ↓ veya j / k ile gezin")}</span>
          </p>
          {visible.length ? (
            <AuditTimeline entries={visible} selectedId={selectedId} onSelect={select} />
          ) : (
            <Card>
              <EmptyState
                kind="no-results"
                size="sm"
                title={c("No events match", "Eşleşen olay yok")}
                description={c(
                  "Nothing was recorded for these filters. Widen the search or clear the filters.",
                  "Bu filtrelerle kayıt yok. Aramayı genişletin veya filtreleri temizleyin.",
                )}
                actions={
                  <Button size="sm" onClick={clear}>
                    {c("Clear filters", "Filtreleri temizle")}
                  </Button>
                }
                className="py-14"
              />
            </Card>
          )}
        </div>

        <aside aria-label={c("Event details", "Olay ayrıntıları")} className="sticky top-20 max-xl:hidden">
          <Card className="max-h-[calc(100dvh-6.5rem)] overflow-y-auto p-5">
            {selected ? (
              <div key={selected.id} className="ui-fade">
                <AuditInspector entry={selected} onRevert={setReverting} />
              </div>
            ) : (
              <EmptyState
                size="sm"
                icon={<ScrollText />}
                title={c("Pick an event", "Bir olay seçin")}
                description={c("See who did it, from where, the full before and after, and the raw record.", "Kimin, nereden yaptığını, önce ve sonrasını ve ham kaydı görün.")}
                className="py-10"
              />
            )}
          </Card>
        </aside>
      </div>

      <Sheet open={sheetOpen && !wide && !!selected} onOpenChange={setSheetOpen}>
        <SheetContent side="end" size="md">
          <SheetHeader title={c("Event details", "Olay ayrıntıları")} />
          <SheetBody>{selected ? <AuditInspector entry={selected} onRevert={setReverting} /> : null}</SheetBody>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!reverting} onOpenChange={(o) => !o && setReverting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader
            title={c("Revert this change?", "Bu değişiklik geri alınsın mı?")}
            description={
              reverting
                ? c(
                    `${reverting.entity.label} goes back to its earlier values (${(reverting.changes ?? []).map((ch) => `${ch.field}: ${ch.from ?? "empty"}`).join(", ")}). The original event stays in the log.`,
                    `${reverting.entity.label} önceki değerlerine döner (${(reverting.changes ?? []).map((ch) => `${ch.field}: ${ch.from ?? "boş"}`).join(", ")}). Asıl olay kayıtta kalır.`,
                  )
                : undefined
            }
          />
          <AlertDialogFooter>
            <AlertDialogCancel>{c("Cancel", "Vazgeç")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => reverting && revert(reverting)}>{c("Revert", "Geri al")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

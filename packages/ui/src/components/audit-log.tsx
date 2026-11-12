"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRight, Cpu, Download, KeyRound, Search, ShieldAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useFormat, useLocale } from "../lib/locale";
import { matchText } from "../lib/text";
import { CopyValueButton } from "../lib/data-islands";
import { ActivityTimeline, type TimelineEntry } from "./activity-timeline";
import { Avatar } from "./avatar";
import { Badge } from "./badge";
import { Button } from "./button";
import { NativeSelect } from "./native-select";
import { Spinner } from "./spinner";
import { ToggleGroup, ToggleGroupItem } from "./toggle";
import { DiffView, FieldDiff, type FieldDiffField } from "./version-history";

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditEvent {
  id: string;
  /** ISO instant. */
  at: string;
  actor: { id: string; name: string; type: "user" | "api-key" | "system"; avatar?: string };
  /** Dotted action code: `"user.role.updated"`. Label it with `actionLabels`. */
  action: string;
  target?: { type: string; id: string; label?: string };
  ip?: string;
  /** "Istanbul, TR". */
  location?: string;
  userAgent?: string;
  changes?: { before: Record<string, unknown>; after: Record<string, unknown> };
  /** Request id, reason, export size… `requestId` gets its own copy row. */
  metadata?: Record<string, unknown>;
  /** Default `"info"`. */
  severity?: AuditSeverity;
}

export interface AuditFilters {
  /** Free text over actor, action, target, IP. */
  q?: string;
  actorId?: string;
  /** Action prefix (`"user"`, `"user.role"`) or full code. */
  action?: string;
  severity?: AuditSeverity;
}

export const auditLogLabels = {
  log: "Audit log",
  search: "Search events",
  searchPlaceholder: "Search actor, action, target or IP…",
  allActors: "All actors",
  allActions: "All actions",
  allSeverities: "Any severity",
  actor: "Actor",
  action: "Action",
  severity: "Severity",
  time: "Time",
  target: "Target",
  source: "Source",
  info: "Info",
  warning: "Warning",
  critical: "Critical",
  user: "User",
  apiKey: "API key",
  system: "System",
  expand: "Show details for {action} by {actor}",
  changes: "Changes",
  fields: "Fields",
  json: "JSON",
  changesView: "Changes view",
  noChanges: "No field changes recorded.",
  details: "Details",
  eventId: "Event ID",
  requestId: "Request ID",
  ip: "IP address",
  userAgent: "Client",
  metadata: "Metadata",
  raw: "Raw event",
  showRaw: "View raw JSON",
  hideRaw: "Hide raw JSON",
  copyJson: "event JSON",
  results: "{count, plural, one {# event} other {# events}}",
  resultsOf: "{shown} of {total} events",
  empty: "No events match these filters",
  clear: "Clear filters",
  loadMore: "Load older events",
  loading: "Loading…",
  export: "Export",
};
export type AuditLogLabels = Partial<typeof auditLogLabels>;
type T = LabelFn<typeof auditLogLabels>;

function humanizeAction(code: string) {
  const s = code.replace(/[._-]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Local filtering (used unless `manualFiltering`). Locale-aware text match. */
export function filterAuditEvents(events: AuditEvent[], filters: AuditFilters, locale?: string, actionLabels?: Record<string, string>): AuditEvent[] {
  return events.filter((e) => {
    if (filters.actorId && e.actor.id !== filters.actorId) return false;
    if (filters.severity && (e.severity ?? "info") !== filters.severity) return false;
    if (filters.action && !(e.action === filters.action || e.action.startsWith(`${filters.action}.`))) return false;
    if (filters.q) {
      const hay = [e.actor.name, e.action, actionLabels?.[e.action], e.target?.label, e.target?.id, e.target?.type, e.ip, e.location].filter(Boolean).join(" ");
      if (!matchText(hay, filters.q, locale)) return false;
    }
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* AuditLog                                                             */
/* ------------------------------------------------------------------ */

export interface AuditLogProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  events: AuditEvent[];
  /** Total on the server (server mode) — "50 of 12,408 events". */
  rowCount?: number;
  /** `"user.role.updated"` → "Changed role". Missing codes are humanized. */
  actionLabels?: Record<string, string>;
  /** Labels / formats for the change diff ("price" → currency). */
  changeFields?: FieldDiffField[];
  filters?: AuditFilters;
  defaultFilters?: AuditFilters;
  onFiltersChange?: (filters: AuditFilters) => void;
  /** Server mode: `events` are already filtered; the component only reports filter changes. */
  manualFiltering?: boolean;
  /** Show the built-in filter row. Default `true`. */
  showFilters?: boolean;
  /** Extra filter controls (a Date range picker) at the end of the filter row. */
  toolbar?: React.ReactNode;
  /** Retention / scope notice ("Showing the last 90 days"). */
  notice?: React.ReactNode;
  onExport?: (events: AuditEvent[]) => void;
  hasMore?: boolean;
  /** Called near the end of the scroll and by the "Load older events" button. */
  onLoadMore?: () => void | Promise<void>;
  loading?: boolean;
  /** Scroll viewport height. Default `"32rem"`. */
  height?: string;
  /** Virtualize above this many events. Default 80. */
  virtualizeAfter?: number;
  /** `table` (default) or `timeline` — a compact feed for one record's history. */
  variant?: "table" | "timeline";
  /** Pin the clock for relative times (timeline variant; docs, tests). */
  now?: Date | string | number;
  labels?: AuditLogLabels;
}

/**
 * The full ledger of who did what, when and from where: logins, permission changes, exports,
 * deletes. Filter by actor, action and severity, expand an event to see its field diff and raw
 * JSON, and scroll thousands of rows (virtualized, native table semantics kept).
 * Timestamps show seconds and the time zone; IPs and ids are mono and left-to-right.
 *
 * ```tsx
 * <AuditLog
 *   events={events}
 *   actionLabels={{ "user.role.updated": "Changed role", "export.created": "Exported data" }}
 *   hasMore={hasMore}
 *   onLoadMore={fetchOlder}
 *   notice="Showing the last 90 days"
 * />
 * ```
 */
export const AuditLog = /*#__PURE__*/ React.forwardRef<HTMLDivElement, AuditLogProps>(function AuditLog(
  {
    events,
    rowCount,
    actionLabels,
    changeFields,
    filters: filtersProp,
    defaultFilters,
    onFiltersChange,
    manualFiltering,
    showFilters = true,
    toolbar,
    notice,
    onExport,
    hasMore,
    onLoadMore,
    loading,
    height = "32rem",
    virtualizeAfter = 80,
    variant = "table",
    now,
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("auditLog", auditLogLabels, labels);
  const f = useFormat();
  const { locale } = useLocale();
  const [filterState, setFilterState] = React.useState<AuditFilters>(defaultFilters ?? {});
  const filters = filtersProp ?? filterState;
  const setFilters = (next: AuditFilters) => {
    setFilterState(next);
    onFiltersChange?.(next);
  };
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());
  const [loadingMore, setLoadingMore] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const baseId = React.useId();

  const actionLabel = (code: string) => actionLabels?.[code] ?? humanizeAction(code);
  const shown = React.useMemo(() => (manualFiltering ? events : filterAuditEvents(events, filters, locale, actionLabels)), [events, filters, manualFiltering, locale, actionLabels]);

  const actors = React.useMemo(() => {
    const m = new Map<string, string>();
    events.forEach((e) => m.set(e.actor.id, e.actor.name));
    return Array.from(m, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, locale));
  }, [events, locale]);
  const actionGroups = React.useMemo(() => {
    const m = new Set<string>();
    events.forEach((e) => m.add(e.action.split(".")[0]!));
    return Array.from(m).sort();
  }, [events]);

  const more = async () => {
    if (!onLoadMore || loadingMore) return;
    setLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  };

  const virtual = variant === "table" && shown.length > virtualizeAfter;
  const virtualizer = useVirtualizer({
    count: virtual ? shown.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 52,
    overscan: 8,
    getItemKey: (i) => shown[i]?.id ?? i,
  });

  const toggle = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const filterRow = showFilters ? (
    <div data-slot="audit-filters" className="flex flex-wrap items-center gap-2">
      <label className="relative min-w-48 flex-1">
        <span className="sr-only">{t("search")}</span>
        <Search aria-hidden className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
        <input
          type="search"
          value={filters.q ?? ""}
          placeholder={t("searchPlaceholder")}
          onChange={(e) => setFilters({ ...filters, q: e.target.value || undefined })}
          className="h-8 w-full rounded-ui-sm border border-field-border bg-field ps-8 pe-2.5 text-[13px] text-fg outline-none placeholder:text-fg-subtle hover:border-field-border-hover focus-visible:border-field-border-hover focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_18%,transparent)]"
        />
      </label>
      <NativeSelect
        size="sm"
        aria-label={t("actor")}
        value={filters.actorId ?? ""}
        onChange={(e) => setFilters({ ...filters, actorId: e.target.value || undefined })}
        items={[{ value: "", label: t("allActors") }, ...actors]}
        className="w-auto"
      />
      <NativeSelect
        size="sm"
        aria-label={t("action")}
        value={filters.action ?? ""}
        onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}
        items={[{ value: "", label: t("allActions") }, ...actionGroups.map((g) => ({ value: g, label: humanizeAction(g) }))]}
        className="w-auto"
      />
      <NativeSelect
        size="sm"
        aria-label={t("severity")}
        value={filters.severity ?? ""}
        onChange={(e) => setFilters({ ...filters, severity: (e.target.value || undefined) as AuditSeverity | undefined })}
        items={[
          { value: "", label: t("allSeverities") },
          { value: "info", label: t("info") },
          { value: "warning", label: t("warning") },
          { value: "critical", label: t("critical") },
        ]}
        className="w-auto"
      />
      {toolbar}
      {onExport ? (
        <Button size="sm" variant="ghost" onClick={() => onExport(shown)} className="ms-auto">
          <Download aria-hidden />
          {t("export")}
        </Button>
      ) : null}
    </div>
  ) : null;

  const summary = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
      <span className="tabular" aria-live="polite">
        {rowCount !== undefined && rowCount > shown.length ? t("resultsOf", { shown: f.number(shown.length), total: f.number(rowCount) }) : t("results", { count: shown.length })}
      </span>
      {notice ? <span className="text-fg-subtle">{notice}</span> : null}
      {loading ? (
        <span className="inline-flex items-center gap-1.5">
          <Spinner size="xs" />
          {t("loading")}
        </span>
      ) : null}
    </div>
  );

  const empty = (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <p className="text-sm text-fg-muted">{t("empty")}</p>
      {Object.values(filters).some(Boolean) && !filtersProp ? (
        <Button size="xs" variant="secondary" onClick={() => setFilters({})}>
          {t("clear")}
        </Button>
      ) : null}
    </div>
  );

  if (variant === "timeline") {
    const items: TimelineEntry[] = shown.map((e) => ({
      id: e.id,
      at: e.at,
      avatar: e.actor.type === "user" ? { name: e.actor.name, src: e.actor.avatar } : undefined,
      icon: e.actor.type === "api-key" ? KeyRound : e.actor.type === "system" ? Cpu : undefined,
      tone: e.severity === "critical" ? "danger" : e.severity === "warning" ? "warning" : "neutral",
      actor: e.actor.name,
      title: (
        <>
          {actionLabel(e.action).toLocaleLowerCase(locale)}
          {e.target?.label ? <> · {e.target.label}</> : null}
        </>
      ),
      body: e.changes ? <FieldDiff before={e.changes.before} after={e.changes.after} fields={changeFields} className="mt-1.5 max-w-xl" /> : undefined,
    }));
    return (
      <div ref={ref} data-slot="audit-log" data-variant="timeline" className={cn("ui-audit grid gap-3", className)} {...props}>
        {filterRow}
        <ActivityTimeline items={items} now={now} hasMore={hasMore} onLoadMore={onLoadMore} empty={t("empty")} />
      </div>
    );
  }

  const renderEvent = (e: AuditEvent, index: number, measure?: (el: HTMLTableSectionElement | null) => void) => {
    const open = expanded.has(e.id);
    const detailId = `${baseId}-${e.id}`;
    const sev = e.severity ?? "info";
    return (
      <tbody key={e.id} ref={measure} data-index={index} data-expanded={open ? "" : undefined} data-severity={sev}>
        <tr data-slot="audit-row" className="cursor-pointer" onClick={(ev) => !(ev.target as HTMLElement).closest("button,a,input") && toggle(e.id)}>
          <td className="w-9 py-2 ps-2 align-top">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={open ? detailId : undefined}
              aria-label={t("expand", { action: actionLabel(e.action), actor: e.actor.name })}
              onClick={() => toggle(e.id)}
              className="inline-flex size-6 cursor-pointer items-center justify-center rounded-ui-sm text-fg-subtle hover:bg-hover hover:text-fg focus-ring"
            >
              <ChevronRight aria-hidden className={cn("size-4 transition-transform motion-reduce:transition-none rtl:rotate-180", open && "rotate-90 rtl:rotate-90")} />
            </button>
          </td>
          <td className="py-2 pe-3 align-top whitespace-nowrap">
            <time dateTime={e.at} className="grid text-[13px] leading-tight tabular" title={f.date(e.at, "full")}>
              <span className="text-fg">{f.date(e.at, { month: "short", day: "numeric", year: "numeric" })}</span>
              <span className="font-mono text-[11.5px] text-fg-muted">{f.time(e.at, { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" })}</span>
            </time>
          </td>
          <td className="py-2 pe-3 align-top">
            <span className="flex min-w-0 items-center gap-2">
              {e.actor.type === "user" ? (
                <Avatar name={e.actor.name} src={e.actor.avatar} size="sm" aria-hidden />
              ) : (
                <span aria-hidden className="inline-flex size-6 shrink-0 items-center justify-center rounded-ui-sm bg-selected text-fg-muted [&_svg]:size-3.5">
                  {e.actor.type === "api-key" ? <KeyRound /> : <Cpu />}
                </span>
              )}
              <span className="grid min-w-0 leading-tight">
                <span className="truncate text-[13px] font-medium text-fg">{e.actor.name}</span>
                <span className="text-[11.5px] text-fg-subtle">{e.actor.type === "api-key" ? t("apiKey") : e.actor.type === "system" ? t("system") : t("user")}</span>
              </span>
            </span>
          </td>
          <td className="py-2 pe-3 align-top">
            <span className="grid leading-tight">
              <span className="flex items-center gap-1.5 text-[13px] text-fg">
                {sev === "critical" ? <ShieldAlert aria-hidden className="size-3.5 shrink-0 text-danger" /> : null}
                {actionLabel(e.action)}
                {sev !== "info" ? (
                  <Badge size="sm" tone={sev === "critical" ? "danger" : "warning"}>
                    {t(sev)}
                  </Badge>
                ) : null}
              </span>
              <code dir="ltr" className="font-mono text-[11px] text-fg-subtle">
                {e.action}
              </code>
            </span>
          </td>
          <td className="py-2 pe-3 align-top">
            {e.target ? (
              <span className="grid min-w-0 leading-tight">
                <span className="truncate text-[13px] text-fg">{e.target.label ?? e.target.id}</span>
                <span className="truncate text-[11.5px] text-fg-subtle">
                  {humanizeAction(e.target.type)} · <span dir="ltr" className="font-mono">{e.target.id}</span>
                </span>
              </span>
            ) : (
              <span className="text-fg-subtle">—</span>
            )}
          </td>
          <td className="py-2 pe-3 align-top">
            <span className="grid leading-tight">
              <span dir="ltr" className="text-start font-mono text-[12px] text-fg-muted">
                {e.ip ?? "—"}
              </span>
              {e.location ? <span className="text-[11.5px] text-fg-subtle">{e.location}</span> : null}
            </span>
          </td>
        </tr>
        {open ? (
          <tr data-slot="audit-detail">
            <td colSpan={6} id={detailId} className="px-3 pt-1 pb-4 ps-11">
              <AuditEventDetail event={e} changeFields={changeFields} t={t} />
            </td>
          </tr>
        ) : null}
      </tbody>
    );
  };

  const items = virtual ? virtualizer.getVirtualItems() : [];
  const padTop = virtual && items.length ? items[0]!.start : 0;
  const padBottom = virtual && items.length ? virtualizer.getTotalSize() - items[items.length - 1]!.end : 0;

  return (
    <div ref={ref} data-slot="audit-log" data-variant="table" className={cn("ui-audit grid gap-3", className)} {...props}>
      {filterRow}
      {summary}
      <div
        ref={scrollRef}
        data-slot="audit-scroll"
        className="overflow-auto rounded-ui border border-line"
        style={{ maxHeight: height }}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (hasMore && !loadingMore && el.scrollTop + el.clientHeight > el.scrollHeight - 240) void more();
        }}
      >
        <table className="ui-audit-table w-full min-w-[46rem] text-start" aria-label={t("log")} aria-rowcount={rowCount}>
          <thead>
            <tr className="text-[11.5px] font-medium text-fg-muted">
              <th scope="col" className="w-9 py-2 ps-2">
                <span className="sr-only">{t("details")}</span>
              </th>
              <th scope="col" className="py-2 pe-3 text-start font-medium">{t("time")}</th>
              <th scope="col" className="py-2 pe-3 text-start font-medium">{t("actor")}</th>
              <th scope="col" className="py-2 pe-3 text-start font-medium">{t("action")}</th>
              <th scope="col" className="py-2 pe-3 text-start font-medium">{t("target")}</th>
              <th scope="col" className="py-2 pe-3 text-start font-medium">{t("source")}</th>
            </tr>
          </thead>
          {shown.length === 0 && !loading ? (
            <tbody>
              <tr>
                <td colSpan={6}>{empty}</td>
              </tr>
            </tbody>
          ) : virtual ? (
            <>
              {padTop > 0 ? (
                <tbody aria-hidden>
                  <tr style={{ height: padTop }} />
                </tbody>
              ) : null}
              {items.map((vi) => renderEvent(shown[vi.index]!, vi.index, virtualizer.measureElement))}
              {padBottom > 0 ? (
                <tbody aria-hidden>
                  <tr style={{ height: padBottom }} />
                </tbody>
              ) : null}
            </>
          ) : (
            shown.map((e, i) => renderEvent(e, i))
          )}
        </table>
        {hasMore && onLoadMore ? (
          <div className="flex justify-center border-t border-line p-2">
            <Button size="xs" variant="ghost" loading={loadingMore} onClick={() => void more()}>
              {t("loadMore")}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Event detail                                                         */
/* ------------------------------------------------------------------ */

export interface AuditEventDetailProps {
  event: AuditEvent;
  changeFields?: FieldDiffField[];
  labels?: AuditLogLabels;
  /** @internal */
  t?: T;
}

/** Expanded row content: field diff (or JSON diff) of the change, ids with copy, client and raw JSON. */
export function AuditEventDetail({ event: e, changeFields, labels, t: tProp }: AuditEventDetailProps) {
  const tOwn = useLabels("auditLog", auditLogLabels, labels);
  const t = tProp ?? tOwn;
  const [view, setView] = React.useState<"fields" | "json">("fields");
  const [raw, setRaw] = React.useState(false);
  const requestId = typeof e.metadata?.requestId === "string" ? (e.metadata.requestId as string) : undefined;
  const meta = Object.entries(e.metadata ?? {}).filter(([k]) => k !== "requestId");
  const json = JSON.stringify(e, null, 2);

  const rows: Array<[string, React.ReactNode, string?]> = [
    [t("eventId"), e.id, e.id],
    ...(requestId ? ([[t("requestId"), requestId, requestId]] as Array<[string, React.ReactNode, string]>) : []),
    ...(e.ip ? ([[t("ip"), e.ip, e.ip]] as Array<[string, React.ReactNode, string]>) : []),
    ...(e.userAgent ? ([[t("userAgent"), e.userAgent]] as Array<[string, React.ReactNode]>) : []),
    ...meta.map(([k, v]) => [humanizeAction(k), typeof v === "object" ? JSON.stringify(v) : String(v)] as [string, React.ReactNode]),
  ];

  return (
    <div data-slot="audit-event-detail" className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <section className="grid min-w-0 content-start gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold text-fg">{t("changes")}</h4>
          {e.changes ? (
            <ToggleGroup aria-label={t("changesView")} size="xs" value={view} onValueChange={(v) => v && setView(v as "fields" | "json")} className="ms-auto">
              <ToggleGroupItem value="fields">{t("fields")}</ToggleGroupItem>
              <ToggleGroupItem value="json">{t("json")}</ToggleGroupItem>
            </ToggleGroup>
          ) : null}
        </div>
        {!e.changes ? (
          <p className="text-[13px] text-fg-subtle">{t("noChanges")}</p>
        ) : view === "fields" ? (
          <FieldDiff before={e.changes.before} after={e.changes.after} fields={changeFields} />
        ) : (
          <DiffView before={JSON.stringify(e.changes.before, null, 2)} after={JSON.stringify(e.changes.after, null, 2)} granularity="word" context={Infinity} wrap={false} toolbar={false} />
        )}
      </section>
      <section className="grid min-w-0 content-start gap-2">
        <h4 className="text-xs font-semibold text-fg">{t("details")}</h4>
        <dl className="grid gap-1.5 text-[13px]">
          {rows.map(([label, value, copy]) => (
            <div key={label} className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-2">
              <dt className="text-fg-muted">{label}</dt>
              <dd className="flex min-w-0 items-start gap-1">
                <span dir="ltr" className={cn("min-w-0 text-start", copy ? "break-all font-mono text-[12px] text-fg" : "text-fg [overflow-wrap:anywhere]")}>
                  {value}
                </span>
                {copy ? <CopyValueButton text={copy} label={label} className="-my-1" /> : null}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-1 grid gap-2">
          <button type="button" aria-expanded={raw} onClick={() => setRaw((r) => !r)} className="w-fit cursor-pointer text-xs font-medium text-fg-muted underline-offset-2 hover:text-fg hover:underline focus-ring">
            {raw ? t("hideRaw") : t("showRaw")}
          </button>
          {raw ? (
            <div className="relative">
              <pre aria-label={t("raw")} tabIndex={0} dir="ltr" className="max-h-64 overflow-auto rounded-ui-sm border border-line bg-surface-2 p-3 pe-10 font-mono text-[11.5px] leading-relaxed text-fg-muted focus-ring">
                {json}
              </pre>
              <CopyValueButton text={json} label={t("copyJson")} className="absolute end-1.5 top-1.5" />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

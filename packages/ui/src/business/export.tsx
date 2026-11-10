"use client";

import * as React from "react";
import { Download, FileSpreadsheet, FileText, Braces, Search, ShieldAlert, RotateCw } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { foldText } from "../lib/text";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { Alert } from "../components/alert";
import { Checkbox } from "../components/checkbox";
import { Input, Field, Textarea } from "../components/input";
import { RadioGroup } from "../components/radio-group";
import { Progress } from "../components/progress";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "../components/dialog";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from "../components/sheet";
import { Sortable, SortableHandle, SortableItem } from "../sortable/sortable";
import { csvDelimiter } from "../data-table/csv";
import type { FilterGroup, ListState } from "../data-table/types";
import { downloadBlob, exportFilename, type CsvExportOptions, type ExportColumn, type ExportFormat } from "./export-core";

export const exportLabels = {
  title: "Export {resource}",
  description: "Choose rows, columns and a file format.",
  scope: "Rows",
  scopeSelected: "Selected rows",
  scopeFiltered: "Current view",
  scopeAll: "All {resource}",
  scopeFilteredHint: "{count} filters · search “{q}”",
  scopeFilteredHintNoQ: "{count, plural, =0 {No filters} one {# filter} other {# filters}}",
  rows: "{count, plural, one {# row} other {# rows}}",
  noneSelected: "Select rows in the list first",
  columns: "Columns",
  columnsCount: "{selected} of {total}",
  selectAll: "All columns",
  searchColumns: "Find a column",
  noColumns: "No column matches “{q}”",
  personal: "Personal data",
  mask: "Mask",
  maskHint: "Masked: {label}",
  format: "Format",
  csv: "CSV",
  csvHint: "{delimiter}-separated · {decimal} decimals · UTF-8",
  comma: "Comma",
  semicolon: "Semicolon",
  tab: "Tab",
  pointDecimal: "point",
  commaDecimal: "comma",
  xlsx: "Excel (XLSX)",
  xlsxHint: "One sheet, typed number and date cells",
  json: "JSON",
  jsonHint: "Array of objects, for developers and APIs",
  privacyTitle: "This export contains personal data",
  privacyBody: "{columns} will leave the system unmasked. Exports are logged with your name and reason.",
  reason: "Reason for export",
  reasonHint: "Kept in the audit log (KVKK / GDPR).",
  reasonMissing: "Add a reason to export personal data.",
  reasonPlaceholder: "What is this file for?",
  background: "Large export: it runs in the background and you get a link when it's ready.",
  export: "Export",
  exporting: "Exporting…",
  cancel: "Cancel",
  close: "Close",
  nothing: "Nothing to export",
  noColumnsSelected: "Pick at least one column",
  queued: "Queued",
  running: "Preparing file…",
  done: "Your file is ready",
  failed: "Export failed",
  download: "Download {filename}",
  retry: "Try again",
  saved: "Saved {filename}",
  quick: "Export",
};
export type ExportLabels = typeof exportLabels;

export type ExportScope = "selected" | "filtered" | "all";

export interface ExportRequest {
  scope: ExportScope;
  /** Column ids in the chosen order. */
  columns: string[];
  /** Column ids to write masked. */
  masked: string[];
  format: ExportFormat;
  reason?: string;
  csv: Required<CsvExportOptions>;
  /** Suggested file name ("contacts-2026-11-10.csv"). */
  filename: string;
}

export type ExportResult = { blob: Blob; filename?: string } | { jobId: string };

export interface ExportJobState {
  status: "queued" | "running" | "done" | "failed";
  /** 0–100. */
  progress?: number;
  url?: string;
  error?: string;
}

export interface ExportDialogProps {
  columns: ExportColumn[];
  /** What "Current view" means: filters and search of the list. */
  listState?: ListState;
  selectedCount?: number;
  /** Rows matching the current view. */
  filteredCount?: number;
  totalCount?: number;
  /** Plural noun for titles ("contacts"). Default "records". */
  resource?: string;
  formats?: ExportFormat[];
  csv?: CsvExportOptions;
  /** `true` always asks for a reason; `"personal-data"` only when unmasked personal columns are included. */
  requireReason?: boolean | "personal-data";
  /** Rows above this are announced as a background job. Default 10,000. */
  syncLimit?: number;
  onExport: (request: ExportRequest) => Promise<ExportResult>;
  /** Polled every 1.5 s for background jobs. */
  pollJob?: (jobId: string) => Promise<ExportJobState>;
  presentation?: "dialog" | "sheet";
  /** The element that opens the dialog (rendered with `asChild`). */
  trigger?: React.ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultScope?: ExportScope;
  defaultFormat?: ExportFormat;
  labels?: Partial<ExportLabels>;
}

function activeFilterCount(ls?: ListState): number {
  if (!ls?.filters) return 0;
  const walk = (g: FilterGroup): number => g.clauses.reduce<number>((n, c) => n + ("clauses" in c ? walk(c) : 1), 0);
  return walk(ls.filters);
}

/**
 * Export a collection: scope (selected / current view / all), columns (searchable, reorderable,
 * personal data maskable), format (CSV / XLSX / JSON with locale CSV conventions), a reason for
 * personal-data exports and background jobs with a download link.
 *
 * ```tsx
 * <ExportDialog resource="contacts" columns={columns} listState={state} selectedCount={3} filteredCount={248} totalCount={1240}
 *   trigger={<Button><Download /> Export</Button>}
 *   onExport={async (r) => ({ blob: await exportToBlob({ rows, columns: pick(r.columns), format: r.format, masked: r.masked }) })} />
 * ```
 */
export function ExportDialog(props: ExportDialogProps) {
  const { presentation = "dialog", trigger, open: openProp, defaultOpen = false, onOpenChange, labels, resource = "records" } = props;
  const t = useLabels("export", exportLabels, labels);
  const [inner, setInner] = React.useState(defaultOpen);
  const open = openProp ?? inner;
  const setOpen = (o: boolean) => {
    if (openProp === undefined) setInner(o);
    onOpenChange?.(o);
  };
  const title = t("title", { resource });
  if (presentation === "sheet") {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
        <SheetContent size="md">
          <SheetHeader title={title} description={t("description")} />
          {open ? <ExportForm {...props} t={t} onClose={() => setOpen(false)} Body={SheetBody} Footer={SheetFooter} /> : null}
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent size="lg" mobile="fullscreen">
        <DialogHeader title={title} description={t("description")} />
        {open ? <ExportForm {...props} t={t} onClose={() => setOpen(false)} Body={DialogBody} Footer={DialogFooter} /> : null}
      </DialogContent>
    </Dialog>
  );
}

type Shell = React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;

function ExportForm({
  columns,
  listState,
  selectedCount = 0,
  filteredCount,
  totalCount,
  resource = "records",
  formats = ["csv", "xlsx"],
  csv,
  requireReason = "personal-data",
  syncLimit = 10_000,
  onExport,
  pollJob,
  defaultScope,
  defaultFormat,
  t,
  onClose,
  Body,
  Footer,
}: ExportDialogProps & { t: LabelFn<ExportLabels>; onClose: () => void; Body: Shell; Footer: Shell }) {
  const { locale, format: f } = useLocale();
  const [scope, setScope] = React.useState<ExportScope>(defaultScope ?? (selectedCount > 0 ? "selected" : "filtered"));
  const [order, setOrder] = React.useState<ExportColumn[]>(columns);
  const [picked, setPicked] = React.useState<Set<string>>(() => new Set(columns.filter((c) => c.defaultSelected !== false).map((c) => c.id)));
  const [masked, setMasked] = React.useState<Set<string>>(() => new Set(columns.filter((c) => c.personalData && c.maskByDefault).map((c) => c.id)));
  const [q, setQ] = React.useState("");
  const [fmt, setFmt] = React.useState<ExportFormat>(defaultFormat ?? formats[0] ?? "csv");
  const [reason, setReason] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [job, setJob] = React.useState<(ExportJobState & { id: string; filename: string }) | null>(null);
  const [announce, setAnnounce] = React.useState("");
  const downloadRef = React.useRef<HTMLAnchorElement>(null);

  const csvResolved: Required<CsvExportOptions> = {
    delimiter: csv?.delimiter ?? (csvDelimiter(locale) as "," | ";"),
    bom: csv?.bom ?? true,
    decimal: csv?.decimal ?? "locale",
  };
  const counts: Record<ExportScope, number | undefined> = { selected: selectedCount, filtered: filteredCount, all: totalCount };
  const rowCount = counts[scope];
  const filters = activeFilterCount(listState);
  const chosen = order.filter((c) => picked.has(c.id));
  const exposed = chosen.filter((c) => c.personalData && !masked.has(c.id));
  const needsReason = requireReason === true || (requireReason === "personal-data" && exposed.length > 0);
  const filename = exportFilename(resource, fmt);
  const nothing = rowCount === 0;
  const visibleCols = q ? order.filter((c) => foldText(c.label, locale).includes(foldText(q, locale))) : order;
  const allState = picked.size === 0 ? false : picked.size === columns.length ? true : "indeterminate";

  // Poll background jobs.
  React.useEffect(() => {
    if (!job || !pollJob || job.status === "done" || job.status === "failed") return;
    let alive = true;
    const id = setTimeout(async () => {
      try {
        const s = await pollJob(job.id);
        if (!alive) return;
        setJob((j) => (j ? { ...j, ...s } : j));
        if (s.status === "done") setAnnounce(t("done"));
        if (s.status === "failed") setAnnounce(t("failed"));
      } catch (e) {
        if (alive) setJob((j) => (j ? { ...j, status: "failed", error: e instanceof Error ? e.message : String(e) } : j));
      }
    }, 1500);
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [job, pollJob, t]);

  React.useEffect(() => {
    if (job?.status === "done") requestAnimationFrame(() => downloadRef.current?.focus());
  }, [job?.status]);

  const run = async () => {
    setTouched(true);
    if (nothing || chosen.length === 0) return;
    if (needsReason && !reason.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await onExport({
        scope,
        columns: chosen.map((c) => c.id),
        masked: chosen.filter((c) => masked.has(c.id)).map((c) => c.id),
        format: fmt,
        reason: reason.trim() || undefined,
        csv: csvResolved,
        filename,
      });
      if ("jobId" in res) {
        setJob({ id: res.jobId, status: "queued", filename });
        setAnnounce(t("queued"));
      } else {
        const name = res.filename ?? filename;
        downloadBlob(res.blob, name);
        setAnnounce(t("saved", { filename: name }));
        onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const delimiterName = csvResolved.delimiter === ";" ? t("semicolon") : csvResolved.delimiter === "\t" ? t("tab") : t("comma");
  const decimalName = csvResolved.decimal === "." ? t("pointDecimal") : f.number(1.5).includes(",") ? t("commaDecimal") : t("pointDecimal");
  const formatItems = formats.map((x) => ({
    value: x,
    label: t(x),
    icon: x === "csv" ? <FileText /> : x === "xlsx" ? <FileSpreadsheet /> : <Braces />,
    description: x === "csv" ? t("csvHint", { delimiter: delimiterName, decimal: decimalName }) : x === "xlsx" ? t("xlsxHint") : t("jsonHint"),
  }));

  if (job) {
    return (
      <>
        <Body>
          <ExportJobStatus job={job} filename={job.filename} labels={{}} t={t} downloadRef={downloadRef} onRetry={() => { setJob(null); void run(); }} />
          <span className="sr-only" aria-live="polite">{announce}</span>
        </Body>
        <Footer>
          <Button variant="secondary" onClick={onClose}>
            {t("close")}
          </Button>
        </Footer>
      </>
    );
  }

  return (
    <>
      <Body className="flex flex-col gap-6">
        {error ? (
          <Alert tone="danger" title={t("failed")} live="assertive">
            {error}
          </Alert>
        ) : null}

        <fieldset className="m-0 min-w-0 border-0 p-0" data-slot="export-scope">
          <legend className="mb-2 text-[13px] font-medium text-fg">{t("scope")}</legend>
          <RadioGroup<ExportScope>
            value={scope}
            onValueChange={setScope}
            variant="card"
            orientation="horizontal"
            size="sm"
            aria-label={t("scope")}
            className="grid gap-2 sm:grid-cols-3"
            items={[
              {
                value: "selected",
                label: t("scopeSelected"),
                description: selectedCount ? t("rows", { count: selectedCount }) : t("noneSelected"),
                disabled: !selectedCount,
              },
              {
                value: "filtered",
                label: t("scopeFiltered"),
                description: (
                  <>
                    {filteredCount != null ? t("rows", { count: filteredCount }) : null}
                    {listState ? <span className="block text-fg-subtle">{listState.q ? t("scopeFilteredHint", { count: filters, q: listState.q }) : t("scopeFilteredHintNoQ", { count: filters })}</span> : null}
                  </>
                ),
              },
              { value: "all", label: t("scopeAll", { resource }), description: totalCount != null ? t("rows", { count: totalCount }) : undefined },
            ]}
          />
          {rowCount != null && rowCount > syncLimit ? <p className="mt-2 text-xs text-fg-muted">{t("background")}</p> : null}
        </fieldset>

        <fieldset className="m-0 min-w-0 border-0 p-0" data-slot="export-columns">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <legend className="float-start text-[13px] font-medium text-fg">
              {t("columns")} <span className="ms-1 font-normal text-fg-subtle tabular">{t("columnsCount", { selected: picked.size, total: columns.length })}</span>
            </legend>
            <Input size="sm" leading={<Search />} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchColumns")} aria-label={t("searchColumns")} className="w-full sm:w-52" clearable />
          </div>
          <div className="rounded-ui-lg border border-line">
            <div className="flex items-center gap-2 border-b border-line px-3 py-2">
              <Checkbox
                size="sm"
                checked={allState}
                onCheckedChange={(c) => setPicked(c === true ? new Set(columns.map((x) => x.id)) : new Set())}
                label={<span className="text-[13px] font-medium">{t("selectAll")}</span>}
              />
            </div>
            <Sortable items={order} getLabel={(c) => c.label} onReorder={setOrder} disabled={!!q}>
              <ul className="m-0 max-h-64 list-none overflow-y-auto p-1" aria-label={t("columns")}>
                {visibleCols.map((c) => (
                  <SortableItem key={c.id} id={c.id} as="li" className="flex min-h-9 items-center gap-1.5 rounded-ui-sm pe-2 hover:bg-hover">
                    {q ? <span className="w-6" aria-hidden /> : <SortableHandle size="sm" />}
                    <Checkbox
                      size="sm"
                      className="min-w-0 flex-1"
                      checked={picked.has(c.id)}
                      onCheckedChange={(v) =>
                        setPicked((s) => {
                          const n = new Set(s);
                          if (v === true) n.add(c.id);
                          else n.delete(c.id);
                          return n;
                        })
                      }
                      label={<span className="truncate text-[13px]">{c.label}</span>}
                    />
                    {c.personalData ? (
                      <>
                        <Badge tone="warning" size="sm" className="shrink-0">
                          <ShieldAlert /> {t("personal")}
                        </Badge>
                        <Checkbox
                          size="sm"
                          disabled={!picked.has(c.id)}
                          checked={masked.has(c.id)}
                          aria-label={t("maskHint", { label: c.label })}
                          onCheckedChange={(v) =>
                            setMasked((s) => {
                              const n = new Set(s);
                              if (v === true) n.add(c.id);
                              else n.delete(c.id);
                              return n;
                            })
                          }
                          label={<span className="text-xs text-fg-muted">{t("mask")}</span>}
                        />
                      </>
                    ) : null}
                  </SortableItem>
                ))}
                {visibleCols.length === 0 ? <li className="px-3 py-4 text-center text-sm text-fg-subtle">{t("noColumns", { q })}</li> : null}
              </ul>
            </Sortable>
          </div>
          {touched && chosen.length === 0 ? <p className="mt-1.5 text-xs text-danger">{t("noColumnsSelected")}</p> : null}
        </fieldset>

        {formats.length > 1 ? (
          <fieldset className="m-0 min-w-0 border-0 p-0" data-slot="export-format">
            <legend className="mb-2 text-[13px] font-medium text-fg">{t("format")}</legend>
            <RadioGroup<ExportFormat> value={fmt} onValueChange={setFmt} variant="card" size="sm" aria-label={t("format")} className={cn("grid gap-2", formats.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")} items={formatItems} />
          </fieldset>
        ) : null}

        {exposed.length ? (
          <div className="flex flex-col gap-3" data-slot="export-privacy">
            <Alert tone="warning" title={t("privacyTitle")}>
              {t("privacyBody", { columns: f.list(exposed.map((c) => c.label)) })}
            </Alert>
          </div>
        ) : null}
        {needsReason ? (
          <Field label={t("reason")} hint={t("reasonHint")} required error={touched && !reason.trim() ? t("reasonMissing") : undefined}>
            <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("reasonPlaceholder")} />
          </Field>
        ) : null}
        <span className="sr-only" aria-live="polite">
          {announce}
        </span>
      </Body>
      <Footer>
        <span className="me-auto hidden min-w-0 truncate font-mono text-xs text-fg-subtle sm:block">{filename}</span>
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={() => void run()} loading={busy} loadingText={t("exporting")} disabled={nothing} title={nothing ? t("nothing") : undefined}>
          <Download /> {t("export")}
          {rowCount != null ? <span className="font-normal opacity-75 tabular">· {f.number(rowCount)}</span> : null}
        </Button>
      </Footer>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Job status                                                          */
/* ------------------------------------------------------------------ */

export interface ExportJobStatusProps {
  job: ExportJobState;
  filename: string;
  onRetry?: () => void;
  labels?: Partial<ExportLabels>;
  className?: string;
}

/** Background export progress: queued → running (progress bar) → done (focusable download link) / failed (retry). */
export function ExportJobStatus({
  job,
  filename,
  onRetry,
  labels,
  className,
  t: tProp,
  downloadRef,
}: ExportJobStatusProps & { t?: LabelFn<ExportLabels>; downloadRef?: React.Ref<HTMLAnchorElement> }) {
  const own = useLabels("export", exportLabels, labels);
  const t = tProp ?? own;
  const title = job.status === "queued" ? t("queued") : job.status === "running" ? t("running") : job.status === "done" ? t("done") : t("failed");
  return (
    <div data-slot="export-job-status" data-status={job.status} className={cn("flex flex-col gap-3 rounded-ui-lg surface-2 p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-fg">{title}</p>
        <span className="font-mono text-xs text-fg-subtle">{filename}</span>
      </div>
      {job.status === "queued" || job.status === "running" ? (
        <Progress value={job.status === "queued" ? null : (job.progress ?? null)} aria-label={title} />
      ) : null}
      {job.status === "done" && job.url ? (
        <Button asChild variant="primary" className="self-start">
          <a ref={downloadRef} href={job.url} download={filename}>
            <Download /> {t("download", { filename })}
          </a>
        </Button>
      ) : null}
      {job.status === "failed" ? (
        <div className="flex flex-wrap items-center gap-3">
          {job.error ? <p className="text-sm text-danger">{job.error}</p> : null}
          {onRetry ? (
            <Button size="sm" variant="secondary" onClick={onRetry}>
              <RotateCw /> {t("retry")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quick export                                                        */
/* ------------------------------------------------------------------ */

export interface QuickExportButtonProps extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  /** Exports the current view with default columns. Return a Blob to download it. */
  onExport: () => Promise<{ blob: Blob; filename: string }>;
  labels?: Partial<ExportLabels>;
}

/** One click: current view, default columns, default format. */
export function QuickExportButton({ onExport, labels, children, ...props }: QuickExportButtonProps) {
  const t = useLabels("export", exportLabels, labels);
  const [busy, setBusy] = React.useState(false);
  return (
    <Button
      {...props}
      loading={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const r = await onExport();
          downloadBlob(r.blob, r.filename);
        } finally {
          setBusy(false);
        }
      }}
    >
      <Download /> {children ?? t("quick")}
    </Button>
  );
}

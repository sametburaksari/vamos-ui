"use client";

import * as React from "react";
import { ArrowRight, Download, FileSpreadsheet, RotateCcw, Save, X, CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { Badge } from "../components/badge";
import { Checkbox } from "../components/checkbox";
import { Input, Field } from "../components/input";
import { Select } from "../components/select";
import { RadioGroup } from "../components/radio-group";
import { Progress } from "../components/progress";
import { FileUpload, type UploadFile } from "../components/file-upload";
import { toCsv } from "../data-table/csv";
import { downloadBlob } from "./export-core";
import { MultiStepForm, MultiStepFormFooter, MultiStepFormStep, MultiStepFormStepper, type StepDef } from "./multi-step-form";
import {
  applyTemplate,
  autoMap,
  decodeText,
  importCellMessages,
  looksGarbled,
  mappingToTemplate,
  parseCsv,
  readXlsx,
  sniffCsv,
  validateImport,
  validateImportRow,
  type CsvEncoding,
  type ImportField,
  type ImportRowResult,
  type ImportSheet,
  type MappingTemplate,
} from "./import-core";

export const importWizardLabels = {
  stepUpload: "Upload",
  stepUploadHint: "CSV or Excel. The first row should hold column names.",
  stepMap: "Map columns",
  stepMapHint: "Match each column in your file to a field. Unmapped columns are ignored.",
  stepReview: "Review",
  stepReviewHint: "Fix problems inline or leave them out — rows with errors are skipped.",
  stepImport: "Import",
  stepImportHint: "Choose how duplicates are handled, then start.",
  sample: "Download a sample file",
  parsing: "Reading file…",
  parseFailed: "Couldn't read this file",
  noFile: "Choose a file to continue",
  noRows: "The file has no data rows",
  tooMany: "This file has {count} rows; the limit is {max}.",
  fileSummary: "{rows} rows · {columns} columns",
  encoding: "Encoding",
  delimiter: "Delimiter",
  sheet: "Sheet",
  header: "First row is a header",
  fileLocale: "Number and date format",
  fileLocaleHint: "How the file writes 1,234.50 and dates.",
  garbled: "Characters look wrong?",
  garbledBody: "This file may use a Turkish Windows encoding.",
  tryEncoding: "Try Turkish (Windows-1254)",
  column: "Column",
  sampleValue: "Sample",
  field: "Field",
  mapsTo: "Column “{column}” maps to",
  ignore: "Don't import",
  required: "Required",
  unmapped: "Map the required fields: {fields}",
  mappedCount: "{mapped} of {total} columns mapped",
  template: "Mapping template",
  applyTemplate: "Apply a template",
  saveTemplate: "Save mapping",
  templateName: "Template name",
  templateSaved: "Template saved",
  templatePlaceholder: "e.g. Legacy CRM export",
  encUtf8: "UTF-8",
  enc1254: "Turkish (Windows-1254)",
  enc1252: "Western (Windows-1252)",
  delimComma: "Comma ( , )",
  delimSemicolon: "Semicolon ( ; )",
  delimTab: "Tab",
  counts: "{rows} rows · {errors} errors · {warnings} warnings",
  onlyErrors: "Only rows with problems",
  nextError: "Next error",
  showing: "Showing {shown} of {total}",
  row: "Row",
  fix: "{field}, row {row}",
  allInvalid: "Every row has errors. Fix them or go back to the mapping.",
  strategy: "When a record already exists",
  skip: "Skip it",
  skipHint: "Keep what's there; import only new records.",
  update: "Update it",
  updateHint: "Overwrite matching records with the file's values.",
  create: "Create a copy",
  createHint: "Import every row as a new record.",
  dryRun: "Dry run",
  dryRunHint: "Validate against the server without writing anything.",
  willImport: "{valid} rows will be imported · {skipped} skipped for errors",
  start: "Import {count} rows",
  startDry: "Run a dry run",
  importing: "Importing {done} of {total}…",
  cancel: "Cancel import",
  cancelled: "Import cancelled after {done} rows",
  leave: "An import is running. Leave anyway?",
  reportTitle: "Import finished",
  reportDry: "Dry run finished — nothing was written",
  reportPartial: "Import finished with problems",
  reportSummary: "{ok} imported · {failed} failed · {skipped} skipped",
  failedRows: "Failed rows",
  error: "Error",
  downloadFailed: "Download failed rows",
  again: "Import another file",
  done: "Done",
};
export type ImportWizardLabels = typeof importWizardLabels;

export type ImportStrategy = "skip" | "update" | "create";

export interface ImportContext {
  signal: AbortSignal;
  /** Report rows written so far within this chunk. */
  onProgress: (done: number) => void;
  strategy: ImportStrategy;
  dryRun: boolean;
  /** Index of the chunk's first row among all valid rows. */
  offset: number;
}

export interface ImportResult {
  ok: number;
  /** `row` = 0-based index within the rows passed in. */
  failed: { row: number; error: string }[];
}

export interface ImportWizardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  fields: ImportField[];
  /** Fields that identify an existing record (enables the duplicate strategy). */
  dedupeKeys?: string[];
  /** Default 50,000. */
  maxRows?: number;
  /** Bytes. Default 20 MB. */
  maxSize?: number;
  /** Rows per `onImport` call. Default 200. */
  chunkSize?: number;
  /** Called per chunk with typed values. */
  onImport: (rows: Record<string, unknown>[], ctx: ImportContext) => Promise<ImportResult>;
  templates?: { list: () => Promise<MappingTemplate[]>; save: (t: MappingTemplate) => Promise<void> };
  sampleFile?: { name: string; href: string };
  /** Locales offered for number / date parsing. Default: UI locale, en-US, en-GB, tr-TR, de-DE. */
  fileLocales?: { value: string; label: string }[];
  /** After the report: "Done". */
  onDone?: (report: ImportReport) => void;
  /** Rows shown in the review table. Default 200. */
  previewLimit?: number;
  labels?: Partial<ImportWizardLabels>;
}

export interface ImportReport {
  ok: number;
  failed: { row: number; error: string; raw: Record<string, string> }[];
  skipped: number;
  dryRun: boolean;
  cancelled: boolean;
}

interface LoadedFile {
  name: string;
  kind: "csv" | "xlsx";
  bytes?: Uint8Array;
  sheets?: ImportSheet[];
}

const DEFAULT_LOCALES = [
  { value: "en-US", label: "English (US) · 1,234.50 · 11/10/2026" },
  { value: "en-GB", label: "English (UK) · 1,234.50 · 10/11/2026" },
  { value: "tr-TR", label: "Türkçe · 1.234,50 · 10.11.2026" },
  { value: "de-DE", label: "Deutsch · 1.234,50 · 10.11.2026" },
];

/**
 * Imports CSV / XLSX into any collection: upload (encoding, delimiter, sheet, header) → column
 * mapping (auto + templates) → review with inline fixes → duplicate strategy, dry run and a
 * chunked, cancellable import → report with a failed-rows download. Built on Multi-step form.
 *
 * ```tsx
 * <ImportWizard fields={contactFields} dedupeKeys={["email"]} onImport={(rows, { signal }) => api.contacts.bulk(rows, { signal })} />
 * ```
 */
export const ImportWizard = React.forwardRef<HTMLDivElement, ImportWizardProps>(function ImportWizard(
  {
    fields,
    dedupeKeys,
    maxRows = 50_000,
    maxSize = 20 * 1024 * 1024,
    chunkSize = 200,
    onImport,
    templates,
    sampleFile,
    fileLocales,
    onDone,
    previewLimit = 200,
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("importWizard", importWizardLabels, labels);
  const { locale, format } = useLocale();
  const [step, setStep] = React.useState("upload");
  const [uploads, setUploads] = React.useState<UploadFile[]>([]);
  const [file, setFile] = React.useState<LoadedFile | null>(null);
  const [parsing, setParsing] = React.useState(false);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [encoding, setEncoding] = React.useState<CsvEncoding>("utf-8");
  const [delimiter, setDelimiter] = React.useState<"," | ";" | "\t">(",");
  const [sheet, setSheet] = React.useState(0);
  const [hasHeader, setHasHeader] = React.useState(true);
  const [fileLocale, setFileLocale] = React.useState(locale);
  const [table, setTable] = React.useState<string[][]>([]);
  const [garbled, setGarbled] = React.useState(false);
  const [mapping, setMapping] = React.useState<Record<number, string | null>>({});
  const [edits, setEdits] = React.useState<Record<number, Record<string, string>>>({});
  const [onlyErrors, setOnlyErrors] = React.useState(false);
  const [strategy, setStrategy] = React.useState<ImportStrategy>("skip");
  const [dryRun, setDryRun] = React.useState(false);
  const [progress, setProgress] = React.useState<{ done: number; total: number } | null>(null);
  const [report, setReport] = React.useState<ImportReport | null>(null);
  const [tplList, setTplList] = React.useState<MappingTemplate[]>([]);
  const [tplName, setTplName] = React.useState("");
  const [tplNote, setTplNote] = React.useState("");
  const abortRef = React.useRef<AbortController | null>(null);
  const reviewRef = React.useRef<HTMLDivElement>(null);

  const localeItems = React.useMemo(() => {
    const list = fileLocales ?? DEFAULT_LOCALES;
    return list.some((l) => l.value === locale) ? list : [{ value: locale, label: locale }, ...list];
  }, [fileLocales, locale]);

  React.useEffect(() => {
    if (templates) void templates.list().then(setTplList).catch(() => setTplList([]));
  }, [templates]);

  const headers = React.useMemo(() => (hasHeader ? (table[0] ?? []) : (table[0] ?? []).map((_, i) => `${t("column")} ${i + 1}`)), [table, hasHeader, t]);
  const body = React.useMemo(() => (hasHeader ? table.slice(1) : table), [table, hasHeader]);

  // Re-parse when the CSV options or sheet change.
  const load = React.useCallback(
    async (f: LoadedFile, enc: CsvEncoding, delim: string, sheetIndex: number) => {
      setParsing(true);
      setParseError(null);
      try {
        let rows: string[][];
        if (f.kind === "csv") {
          const text = decodeText(f.bytes!, enc);
          setGarbled(enc === "utf-8" ? looksGarbled(text) : false);
          rows = await parseCsv(text, delim);
        } else {
          rows = f.sheets?.[sheetIndex]?.rows ?? [];
          setGarbled(false);
        }
        setTable(rows);
        setEdits({});
        const hdr = rows[0] ?? [];
        setMapping(autoMap(hdr, fields, locale));
      } catch (e) {
        setParseError(e instanceof Error ? e.message : String(e));
        setTable([]);
      } finally {
        setParsing(false);
      }
    },
    [fields, locale],
  );

  const onFiles = async (files: UploadFile[]) => {
    setUploads(files);
    const raw = files[0]?.file;
    if (!raw) {
      setFile(null);
      setTable([]);
      return;
    }
    setParsing(true);
    setParseError(null);
    try {
      const isXlsx = /\.xlsx$/i.test(raw.name) || raw.type.includes("spreadsheetml");
      if (isXlsx) {
        const sheets = await readXlsx(raw);
        const f: LoadedFile = { name: raw.name, kind: "xlsx", sheets };
        setFile(f);
        setSheet(0);
        await load(f, encoding, delimiter, 0);
      } else {
        const bytes = new Uint8Array(await raw.arrayBuffer());
        const sniff = sniffCsv(bytes);
        const f: LoadedFile = { name: raw.name, kind: "csv", bytes };
        setFile(f);
        setEncoding(sniff.encoding);
        setDelimiter(sniff.delimiter);
        if (sniff.encoding === "windows-1254" || sniff.delimiter === ";") setFileLocale(localeItems.find((l) => l.value.startsWith("tr"))?.value ?? fileLocale);
        await load(f, sniff.encoding, sniff.delimiter, 0);
      }
    } catch (e) {
      setParseError(e instanceof Error ? e.message : String(e));
      setParsing(false);
    }
  };

  const results = React.useMemo<ImportRowResult[]>(() => {
    const base = validateImport(body, mapping, fields, { locale: fileLocale, dedupeKeys });
    if (!Object.keys(edits).length) return base;
    const byId = new Map(fields.map((f) => [f.id, f]));
    return base.map((r, i) => (edits[i] ? validateImportRow({ ...r.raw, ...edits[i] }, r.row, byId, { locale: fileLocale }) : r));
  }, [body, mapping, fields, fileLocale, dedupeKeys, edits]);
  const errorRows = results.filter((r) => Object.keys(r.errors).length);
  const errorCount = results.reduce((n, r) => n + Object.keys(r.errors).length, 0);
  const warningCount = results.reduce((n, r) => n + Object.keys(r.warnings).length, 0);
  const validRows = results.filter((r) => !Object.keys(r.errors).length);
  const mappedFields = fields.filter((f) => Object.values(mapping).includes(f.id));
  const missingRequired = fields.filter((f) => f.required && !Object.values(mapping).includes(f.id));

  const steps: StepDef[] = [
    {
      id: "upload",
      title: t("stepUpload"),
      description: t("stepUploadHint"),
      validate: () => {
        if (parseError) return parseError;
        if (!file) return t("noFile");
        if (!body.length) return t("noRows");
        if (body.length > maxRows) return t("tooMany", { count: format.number(body.length), max: format.number(maxRows) });
        return true;
      },
    },
    {
      id: "map",
      title: t("stepMap"),
      description: t("stepMapHint"),
      validate: () => (missingRequired.length ? t("unmapped", { fields: format.list(missingRequired.map((f) => f.label)) }) : true),
    },
    { id: "review", title: t("stepReview"), description: t("stepReviewHint"), validate: () => (validRows.length ? true : t("allInvalid")) },
    { id: "import", title: t("stepImport"), description: t("stepImportHint") },
  ];

  const runImport = async () => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const total = validRows.length;
    let ok = 0;
    const failed: ImportReport["failed"] = [];
    setProgress({ done: 0, total });
    let cancelled = false;
    try {
      for (let offset = 0; offset < total; offset += chunkSize) {
        if (ctrl.signal.aborted) {
          cancelled = true;
          break;
        }
        const chunk = validRows.slice(offset, offset + chunkSize);
        const res = await onImport(
          chunk.map((r) => r.values),
          { signal: ctrl.signal, strategy, dryRun, offset, onProgress: (d) => setProgress({ done: offset + d, total }) },
        );
        ok += res.ok;
        for (const f of res.failed) {
          const src = chunk[f.row];
          if (src) failed.push({ row: src.row, error: f.error, raw: src.raw });
        }
        setProgress({ done: Math.min(total, offset + chunk.length), total });
      }
    } catch (e) {
      if (ctrl.signal.aborted) cancelled = true;
      else throw e;
    } finally {
      abortRef.current = null;
    }
    setReport({ ok, failed, skipped: results.length - validRows.length, dryRun, cancelled });
    setProgress(null);
  };

  const reset = () => {
    setUploads([]);
    setFile(null);
    setTable([]);
    setMapping({});
    setEdits({});
    setReport(null);
    setStep("upload");
  };

  const downloadFailed = () => {
    if (!report) return;
    const cols = fields.filter((f) => mappedFields.includes(f));
    const csv = toCsv([[t("row"), ...cols.map((c) => c.label), t("error")], ...report.failed.map((f) => [f.row, ...cols.map((c) => f.raw[c.id] ?? ""), f.error])], { locale: fileLocale });
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${(file?.name ?? "import").replace(/\.[^.]+$/, "")}-failed.csv`);
  };

  // F8 → next error cell in the review table.
  const nextError = () => {
    const cells = Array.from(reviewRef.current?.querySelectorAll<HTMLElement>('input[aria-invalid="true"]') ?? []);
    if (!cells.length) return;
    const i = cells.indexOf(document.activeElement as HTMLElement);
    cells[(i + 1) % cells.length]!.focus();
  };

  const importing = progress !== null;

  return (
    <div ref={ref} data-slot="import-wizard" className={cn("vui-import min-w-0", className)} {...props}>
      <MultiStepForm steps={steps} value={step} onValueChange={setStep} onComplete={runImport} confirmLeave={importing} labels={{ leave: t("leave") }}>
        <MultiStepFormStepper />

        <MultiStepFormStep id="upload">
          <div className="flex flex-col gap-5">
            <FileUpload
              accept={[".csv", ".tsv", ".txt", ".xlsx", "text/csv"]}
              maxFiles={1}
              maxSize={maxSize}
              value={uploads}
              onValueChange={(f) => void onFiles(f)}
              invalid={!!parseError}
            />
            {sampleFile ? (
              <a href={sampleFile.href} download={sampleFile.name} className="focus-ring inline-flex w-fit items-center gap-1.5 rounded-ui-sm text-[13px] text-accent-ink underline-offset-4 hover:underline">
                <Download aria-hidden className="size-3.5" /> {t("sample")}
              </a>
            ) : null}
            {parsing ? (
              <p className="text-sm text-fg-muted" role="status">
                {t("parsing")}
              </p>
            ) : null}
            {parseError ? (
              <Alert tone="danger" title={t("parseFailed")} live="assertive">
                {parseError}
              </Alert>
            ) : null}
            {garbled && file?.kind === "csv" ? (
              <Alert
                tone="warning"
                title={t("garbled")}
                live="polite"
                actions={
                  <Button size="sm" variant="secondary" onClick={() => { setEncoding("windows-1254"); void load(file, "windows-1254", delimiter, sheet); }}>
                    {t("tryEncoding")}
                  </Button>
                }
              >
                {t("garbledBody")}
              </Alert>
            ) : null}
            {file && table.length ? (
              <div className="rounded-ui-lg surface-2 p-4">
                <p className="mb-4 flex items-center gap-2 text-sm text-fg">
                  <FileSpreadsheet aria-hidden className="size-4 text-fg-muted" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-fg-muted tabular">· {t("fileSummary", { rows: format.number(body.length), columns: headers.length })}</span>
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {file.kind === "csv" ? (
                    <>
                      <Field label={t("encoding")}>
                        <Select
                          value={encoding}
                          onValueChange={(v) => {
                            if (!v) return;
                            setEncoding(v);
                            void load(file, v, delimiter, sheet);
                          }}
                          items={[
                            { value: "utf-8", label: t("encUtf8") },
                            { value: "windows-1254", label: t("enc1254") },
                            { value: "windows-1252", label: t("enc1252") },
                          ]}
                        />
                      </Field>
                      <Field label={t("delimiter")}>
                        <Select
                          value={delimiter}
                          onValueChange={(v) => {
                            if (!v) return;
                            const d = v as "," | ";" | "\t";
                            setDelimiter(d);
                            void load(file, encoding, d, sheet);
                          }}
                          items={[
                            { value: ",", label: t("delimComma") },
                            { value: ";", label: t("delimSemicolon") },
                            { value: "\t", label: t("delimTab") },
                          ]}
                        />
                      </Field>
                    </>
                  ) : (file.sheets?.length ?? 0) > 1 ? (
                    <Field label={t("sheet")}>
                      <Select
                        value={String(sheet)}
                        onValueChange={(v) => {
                          const i = Number(v ?? 0);
                          setSheet(i);
                          void load(file, encoding, delimiter, i);
                        }}
                        items={(file.sheets ?? []).map((s, i) => ({ value: String(i), label: `${s.name} · ${format.number(Math.max(0, s.rows.length - 1))}` }))}
                      />
                    </Field>
                  ) : null}
                  <Field label={t("fileLocale")} hint={t("fileLocaleHint")}>
                    <Select value={fileLocale} onValueChange={(v) => v && setFileLocale(v)} items={localeItems} />
                  </Field>
                  <div className="flex items-end pb-2">
                    <Checkbox checked={hasHeader} onCheckedChange={(c) => { setHasHeader(c === true); setMapping(autoMap(c === true ? (table[0] ?? []) : [], fields, locale)); }} label={t("header")} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </MultiStepFormStep>

        <MultiStepFormStep id="map">
          <ImportMapping
            headers={headers}
            sample={body[0] ?? []}
            fields={fields}
            mapping={mapping}
            onMappingChange={setMapping}
            t={t}
            toolbar={
              templates ? (
                <div className="flex flex-wrap items-end gap-2">
                  {tplList.length ? (
                    <Field label={t("template")} className="min-w-48">
                      <Select
                        placeholder={t("applyTemplate")}
                        value={null}
                        onValueChange={(id) => {
                          const tpl = tplList.find((x) => x.id === id);
                          if (tpl) setMapping(applyTemplate(headers, tpl, locale));
                        }}
                        items={tplList.map((x) => ({ value: x.id, label: x.name }))}
                      />
                    </Field>
                  ) : null}
                  <Field label={t("templateName")} className="min-w-40">
                    <Input value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder={t("templatePlaceholder")} />
                  </Field>
                  <Button
                    variant="secondary"
                    disabled={!tplName.trim()}
                    onClick={async () => {
                      const tpl: MappingTemplate = { id: `tpl-${Date.now().toString(36)}`, name: tplName.trim(), mapping: mappingToTemplate(headers, mapping, locale) };
                      await templates.save(tpl);
                      setTplList((l) => [...l, tpl]);
                      setTplName("");
                      setTplNote(t("templateSaved"));
                    }}
                  >
                    <Save /> {t("saveTemplate")}
                  </Button>
                  <span className="text-xs text-fg-muted" aria-live="polite">
                    {tplNote}
                  </span>
                </div>
              ) : null
            }
          />
        </MultiStepFormStep>

        <MultiStepFormStep id="review">
          <div
            ref={reviewRef}
            onKeyDown={(e) => {
              if (e.key === "F8") {
                e.preventDefault();
                nextError();
              }
            }}
          >
            <ImportReview
              results={results}
              fields={mappedFields}
              onlyErrors={onlyErrors}
              onOnlyErrorsChange={setOnlyErrors}
              errorCount={errorCount}
              warningCount={warningCount}
              errorRowCount={errorRows.length}
              onFix={(index, field, v) => setEdits((e) => ({ ...e, [index]: { ...e[index], [field]: v } }))}
              onNextError={nextError}
              limit={previewLimit}
              t={t}
            />
          </div>
        </MultiStepFormStep>

        <MultiStepFormStep id="import">
          {report ? (
            <ImportReportView report={report} fields={mappedFields} t={t} onDownload={downloadFailed} onAgain={reset} onDone={onDone ? () => onDone(report) : undefined} />
          ) : (
            <div className="flex flex-col gap-5">
              <p className="text-sm text-fg tabular" aria-live="polite">
                {t("willImport", { valid: format.number(validRows.length), skipped: format.number(results.length - validRows.length) })}
              </p>
              {dedupeKeys?.length ? (
                <fieldset className="m-0 border-0 p-0">
                  <legend className="mb-2 text-[13px] font-medium text-fg">{t("strategy")}</legend>
                  <RadioGroup<ImportStrategy>
                    value={strategy}
                    onValueChange={setStrategy}
                    variant="card"
                    size="sm"
                    aria-label={t("strategy")}
                    className="grid gap-2 sm:grid-cols-3"
                    disabled={importing}
                    items={[
                      { value: "skip", label: t("skip"), description: t("skipHint") },
                      { value: "update", label: t("update"), description: t("updateHint") },
                      { value: "create", label: t("create"), description: t("createHint") },
                    ]}
                  />
                </fieldset>
              ) : null}
              <Checkbox checked={dryRun} onCheckedChange={(c) => setDryRun(c === true)} label={t("dryRun")} description={t("dryRunHint")} disabled={importing} />
              {progress ? (
                <div className="flex flex-col gap-2 rounded-ui-lg surface-2 p-4">
                  <Progress value={progress.total ? (progress.done / progress.total) * 100 : null} aria-label={t("importing", { done: progress.done, total: progress.total })} />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] text-fg-muted tabular" aria-live="polite">
                      {t("importing", { done: format.number(progress.done), total: format.number(progress.total) })}
                    </p>
                    <Button size="sm" variant="ghost" onClick={() => abortRef.current?.abort()}>
                      <X /> {t("cancel")}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </MultiStepFormStep>

        {report ? null : <MultiStepFormFooter submitLabel={dryRun ? t("startDry") : t("start", { count: format.number(validRows.length) })} />}
      </MultiStepForm>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Mapping                                                             */
/* ------------------------------------------------------------------ */

export interface ImportMappingProps {
  headers: string[];
  /** First data row, shown as a sample. */
  sample?: string[];
  fields: ImportField[];
  mapping: Record<number, string | null>;
  onMappingChange: (m: Record<number, string | null>) => void;
  toolbar?: React.ReactNode;
  labels?: Partial<ImportWizardLabels>;
}

/** Column → field mapping: one labelled Select per file column. Usable alone. */
export function ImportMapping({ headers, sample = [], fields, mapping, onMappingChange, toolbar, labels, t: tProp }: ImportMappingProps & { t?: LabelFn<ImportWizardLabels> }) {
  const own = useLabels("importWizard", importWizardLabels, labels);
  const t = tProp ?? own;
  const used = new Set(Object.values(mapping).filter(Boolean) as string[]);
  const mapped = Object.values(mapping).filter(Boolean).length;
  const missing = fields.filter((f) => f.required && !used.has(f.id));
  return (
    <div data-slot="import-mapping" className="flex flex-col gap-4">
      {toolbar}
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-fg-muted tabular">
        {t("mappedCount", { mapped, total: headers.length })}
        {missing.map((f) => (
          <Badge key={f.id} tone="danger" size="sm">
            {f.label} · {t("required")}
          </Badge>
        ))}
      </div>
      <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-ui-lg border border-line p-0">
        {headers.map((h, i) => {
          const id = `import-map-${i}`;
          const value = mapping[i] ?? "__ignore";
          return (
            <li key={i} className="grid grid-cols-1 items-center gap-x-4 gap-y-1.5 px-3.5 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,15rem)]">
              <div className="min-w-0">
                <label htmlFor={id} className="block truncate text-[13px] font-medium text-fg">
                  {h || `${t("column")} ${i + 1}`}
                  <span className="sr-only"> → {t("field")}</span>
                </label>
                <p className="truncate font-mono text-[11px] text-fg-subtle">{sample[i] || "—"}</p>
              </div>
              <ArrowRight aria-hidden className="hidden size-4 text-fg-subtle sm:block rtl:rotate-180" />
              <Select
                id={id}
                size="sm"
                value={value}
                aria-label={t("mapsTo", { column: h })}
                onValueChange={(v) => onMappingChange({ ...mapping, [i]: !v || v === "__ignore" ? null : v })}
                items={[
                  { value: "__ignore", label: t("ignore") },
                  ...fields.map((f) => ({ value: f.id, label: f.required ? `${f.label} *` : f.label, disabled: used.has(f.id) && mapping[i] !== f.id })),
                ]}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Review                                                              */
/* ------------------------------------------------------------------ */

export interface ImportReviewProps {
  results: ImportRowResult[];
  /** Mapped fields, as table columns. */
  fields: ImportField[];
  onlyErrors: boolean;
  onOnlyErrorsChange: (v: boolean) => void;
  errorCount: number;
  warningCount: number;
  errorRowCount: number;
  /** Inline fix: index into `results`. */
  onFix?: (index: number, field: string, value: string) => void;
  onNextError?: () => void;
  limit?: number;
  labels?: Partial<ImportWizardLabels>;
}

/** Validation preview: counts, an "only problems" filter and editable error cells (F8 = next error). */
export function ImportReview({ results, fields, onlyErrors, onOnlyErrorsChange, errorCount, warningCount, errorRowCount, onFix, onNextError, limit = 200, labels, t: tProp }: ImportReviewProps & { t?: LabelFn<ImportWizardLabels> }) {
  const own = useLabels("importWizard", importWizardLabels, labels);
  const t = tProp ?? own;
  const { format } = useLocale();
  const indexed = results.map((r, i) => ({ r, i }));
  const filtered = onlyErrors ? indexed.filter(({ r }) => Object.keys(r.errors).length || Object.keys(r.warnings).length) : indexed;
  const shown = filtered.slice(0, limit);
  return (
    <div data-slot="import-review" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="me-auto flex items-center gap-2 text-sm text-fg tabular" aria-live="polite">
          {errorCount ? <CircleAlert aria-hidden className="size-4 text-danger" /> : <CircleCheck aria-hidden className="size-4 text-success" />}
          {t("counts", { rows: format.number(results.length), errors: format.number(errorCount), warnings: format.number(warningCount) })}
        </p>
        <Checkbox size="sm" checked={onlyErrors} onCheckedChange={(c) => onOnlyErrorsChange(c === true)} label={<span className="text-[13px]">{t("onlyErrors")}</span>} disabled={!errorRowCount && !warningCount} />
        {onNextError ? (
          <Button size="sm" variant="secondary" onClick={onNextError} disabled={!errorCount}>
            {t("nextError")} <kbd className="ms-1 font-mono text-[10px] text-fg-subtle">F8</kbd>
          </Button>
        ) : null}
      </div>
      <div className="max-h-[26rem] overflow-auto rounded-ui-lg border border-line bg-surface">
        <table className="w-full border-separate border-spacing-0 text-[13px]">
          <caption className="sr-only">{t("stepReview")}</caption>
          <thead>
            <tr>
              <th scope="col" className="vui-pm-sticky sticky top-0 z-10 w-14 border-b border-line px-3 py-2 text-start text-[11px] font-medium text-fg-subtle">
                {t("row")}
              </th>
              {fields.map((f) => (
                <th key={f.id} scope="col" className="vui-pm-sticky sticky top-0 z-10 min-w-36 border-b border-line px-3 py-2 text-start text-[11px] font-medium tracking-[0.04em] text-fg-subtle uppercase">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map(({ r, i }) => (
              <tr key={r.row}>
                <th scope="row" className="border-b border-line px-3 py-1.5 text-start font-mono text-[11px] font-normal text-fg-subtle tabular">
                  {r.row}
                </th>
                {fields.map((f) => {
                  const err = r.errors[f.id];
                  const warn = r.warnings[f.id];
                  const v = r.raw[f.id] ?? "";
                  return (
                    <td key={f.id} data-error={err ? "" : undefined} data-warning={warn && !err ? "" : undefined} className="vui-import-cell border-b border-line px-1.5 py-1 align-top">
                      {err && onFix ? (
                        <>
                          <Input size="sm" variant="ghost" defaultValue={v} invalid aria-label={t("fix", { field: f.label, row: r.row })} aria-describedby={`ie-${r.row}-${f.id}`} onBlur={(e) => e.target.value !== v && onFix(i, f.id, e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
                          <p id={`ie-${r.row}-${f.id}`} className="px-1.5 pt-0.5 text-[11px] text-danger">
                            {err}
                          </p>
                        </>
                      ) : (
                        <span className="block px-1.5 py-1 text-fg [overflow-wrap:anywhere]">
                          {v || <span className="text-fg-subtle">—</span>}
                          {err ? <span className="block text-[11px] text-danger">{err}</span> : null}
                          {warn ? <span className="block text-[11px] text-warning">{warn}</span> : null}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > shown.length ? <p className="text-xs text-fg-subtle tabular">{t("showing", { shown: format.number(shown.length), total: format.number(filtered.length) })}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Report                                                              */
/* ------------------------------------------------------------------ */

function ImportReportView({ report, fields, t, onDownload, onAgain, onDone }: { report: ImportReport; fields: ImportField[]; t: LabelFn<ImportWizardLabels>; onDownload: () => void; onAgain: () => void; onDone?: () => void }) {
  const { format } = useLocale();
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => headingRef.current?.focus(), []);
  const title = report.cancelled ? t("cancelled", { done: format.number(report.ok + report.failed.length) }) : report.dryRun ? t("reportDry") : report.failed.length ? t("reportPartial") : t("reportTitle");
  return (
    <div data-slot="import-report" className="flex flex-col gap-4">
      <div className={cn("flex items-start gap-3 rounded-ui-lg p-4", report.failed.length ? "tone-warning tone-soft" : "tone-success tone-soft")}>
        {report.failed.length ? <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" /> : <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" />}
        <div>
          <h3 ref={headingRef} tabIndex={-1} className="text-[15px] font-semibold text-fg outline-none">
            {title}
          </h3>
          <p className="mt-0.5 text-sm text-fg tabular">{t("reportSummary", { ok: format.number(report.ok), failed: format.number(report.failed.length), skipped: format.number(report.skipped) })}</p>
        </div>
      </div>
      {report.failed.length ? (
        <div className="overflow-auto rounded-ui-lg border border-line">
          <table className="w-full text-[13px]">
            <caption className="px-3 py-2 text-start text-[13px] font-medium text-fg">{t("failedRows")}</caption>
            <thead>
              <tr className="border-y border-line text-[11px] text-fg-subtle">
                <th scope="col" className="px-3 py-1.5 text-start font-medium">{t("row")}</th>
                {fields.slice(0, 3).map((f) => (
                  <th key={f.id} scope="col" className="px-3 py-1.5 text-start font-medium">{f.label}</th>
                ))}
                <th scope="col" className="px-3 py-1.5 text-start font-medium">{t("error")}</th>
              </tr>
            </thead>
            <tbody>
              {report.failed.slice(0, 50).map((f) => (
                <tr key={f.row} className="border-b border-line last:border-0">
                  <td className="px-3 py-1.5 font-mono text-[11px] text-fg-subtle tabular">{f.row}</td>
                  {fields.slice(0, 3).map((c) => (
                    <td key={c.id} className="px-3 py-1.5 text-fg">{f.raw[c.id]}</td>
                  ))}
                  <td className="px-3 py-1.5 text-danger">{f.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {report.failed.length ? (
          <Button variant="secondary" onClick={onDownload}>
            <Download /> {t("downloadFailed")}
          </Button>
        ) : null}
        <Button variant="ghost" onClick={onAgain}>
          <RotateCcw /> {t("again")}
        </Button>
        {onDone ? (
          <Button variant="primary" className="ms-auto" onClick={onDone}>
            {t("done")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export { importCellMessages };

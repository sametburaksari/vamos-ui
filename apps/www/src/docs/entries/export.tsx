import { ex, type DocEntry } from "../types";
import ExportDemo from "../examples/export/demo";
import ExportXlsx from "../examples/export/xlsx";
import ExportBackgroundJob from "../examples/export/background-job";
import ExportPersonalData from "../examples/export/personal-data";
import ExportLocaleCsv from "../examples/export/locale-csv";

const entry: DocEntry = {
  slug: "export",
  title: "Export",
  group: "Flows & wizards",
  description:
    "Export a collection: scope (selected / current view / all), columns (searchable, reorderable, personal data maskable), format (CSV, XLSX, JSON) with locale CSV conventions, a reason for personal-data exports, and background jobs with a focusable download link. exportToBlob writes the file; XLSX loads write-excel-file only when chosen.",
  source: ["business/export.tsx", "business/export-core.ts", "data-table/csv.ts"],
  basedOn: "Dialog / Sheet · Radio Group · Checkbox · Sortable",
  usage: `import { ExportDialog, exportToBlob } from "@vamos-ui/react/business";

<ExportDialog
  resource="contacts"
  columns={columns}
  listState={listState}
  selectedCount={selection.length}
  filteredCount={total}
  totalCount={allContacts}
  trigger={<Button><Download /> Export</Button>}
  onExport={async (r) => r.scope === "all" ? api.exports.start(r) /* → { jobId } */ : { blob: await exportToBlob({ rows, columns: pick(r.columns), format: r.format, masked: r.masked }) }}
  pollJob={api.exports.status}
/>`,
  demo: ex("demo", "Demo", "export/demo.tsx", ExportDemo),
  examples: [
    ex("xlsx", "Excel with typed cells", "export/xlsx.tsx", ExportXlsx, "XLSX first: numbers and dates stay typed, the header row is bold. JSON for developers."),
    ex("background-job", "Large export as a job", "export/background-job.tsx", ExportBackgroundJob, "Above syncLimit the dialog says it runs in the background; onExport returns { jobId } and pollJob drives the progress bar until a download link appears (and takes focus)."),
    ex("personal-data", "Personal data (KVKK / GDPR)", "export/personal-data.tsx", ExportPersonalData, "Sensitive columns are flagged and masked by default. Unmasking shows a notice and requires a reason, passed to onExport for your audit log. Shown as a Sheet."),
    ex("locale-csv", "Locale CSV conventions", "export/locale-csv.tsx", ExportLocaleCsv, "tr-TR writes ; with decimal commas and a BOM so Turkish Excel splits columns; en-US writes , and points. QuickExportButton exports the current view in one click."),
  ],
  api: [
    { name: "ExportDialog", props: [
      { name: "columns", type: "ExportColumn[]", description: "{ id, label, personalData?, maskByDefault?, defaultSelected?, accessor?, type? }." },
      { name: "onExport", type: "(r: ExportRequest) => Promise<{ blob; filename? } | { jobId }>", description: "r = { scope, columns (ordered), masked, format, reason?, csv, filename }. A blob downloads at once; a jobId starts polling." },
      { name: "pollJob", type: "(jobId) => Promise<{ status; progress?; url?; error? }>", description: "Polled every 1.5 s until done or failed (retry)." },
      { name: "listState", type: "ListState", description: "Describes the current view (\"2 filters · search “acme”\")." },
      { name: "selectedCount / filteredCount / totalCount", type: "number", description: "Row counts per scope; selected is disabled at 0." },
      { name: "resource", type: "string", default: '"records"', description: "Plural noun for the title and file name." },
      { name: "formats", type: '("csv" | "xlsx" | "json")[]', default: '["csv", "xlsx"]', description: "Offered formats, first is the default." },
      { name: "csv", type: '{ delimiter?: "," | ";" | "\\t"; bom?: boolean; decimal?: "locale" | "." }', default: "from the locale", description: "CSV conventions." },
      { name: "requireReason", type: 'boolean | "personal-data"', default: '"personal-data"', description: "Ask for a reason always, or only when unmasked personal columns are included." },
      { name: "syncLimit", type: "number", default: "10000", description: "Rows above this are announced as a background export." },
      { name: "presentation", type: '"dialog" | "sheet"', default: '"dialog"', description: "Container." },
      { name: "trigger / open / defaultOpen / onOpenChange", type: "ReactElement / boolean / fn", description: "Opening, controlled or not." },
      { name: "defaultScope / defaultFormat", type: "ExportScope / ExportFormat", description: "Initial choices." },
      { name: "labels", type: "Partial<ExportLabels>", description: "Built-in strings (export namespace)." },
    ] },
    { name: "exportToBlob(options)", props: [
      { name: "rows / columns / format", type: "object[] / ExportColumn[] / ExportFormat", description: "Data in, a file Blob out." },
      { name: "masked", type: "string[]", description: "Column ids written masked (a••••@domain.com)." },
      { name: "locale / csv / sheetName", type: "string / CsvExportOptions / string", description: "CSV conventions and the XLSX sheet name." },
    ] },
    { name: "QuickExportButton", props: [{ name: "onExport", type: "() => Promise<{ blob; filename }>", description: "One click: current view, default columns." }] },
    { name: "ExportJobStatus", props: [{ name: "job / filename / onRetry", type: "ExportJobState / string / fn", description: "The job panel on its own (an exports page)." }] },
  ],
  notes: ["Scope and format are radio groups, columns a checkbox list with select-all and drag or keyboard reordering. File names carry the local date: contacts-2026-11-10.csv. Writing the audit entry is the app's job — onExport receives the reason."],
  covers: ["Export"],
};

export default entry;

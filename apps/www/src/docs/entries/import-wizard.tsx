import { ex, type DocEntry } from "../types";
import ImportWizardDemo from "../examples/import-wizard/demo";
import ImportWizardValidation from "../examples/import-wizard/validation";
import ImportWizardTemplates from "../examples/import-wizard/templates";
import ImportWizardEncoding from "../examples/import-wizard/encoding";

const entry: DocEntry = {
  slug: "import-wizard",
  title: "Import wizard",
  group: "Flows & wizards",
  description:
    "Import CSV or XLSX into any collection: upload (encoding and delimiter sniffing, sheet, header row, the file's number/date format) → column mapping (locale-folded auto-mapping and saved templates) → review with inline fixes → duplicate strategy, dry run and a chunked, cancellable import → report with a failed-rows download. papaparse and read-excel-file load only when a file is read.",
  source: ["business/import-wizard.tsx", "business/import-core.ts"],
  basedOn: "Multi-step form · File upload · papaparse · read-excel-file",
  usage: `import { ImportWizard, type ImportField } from "@vamos-cms/ui/business";

const fields: ImportField[] = [
  { id: "name", label: "Full name", aliases: ["Ad Soyad"], required: true, type: "text" },
  { id: "email", label: "Email", aliases: ["E-posta", "Mail"], required: true, type: "email" },
  { id: "value", label: "Deal value", type: "money" },
];

<ImportWizard
  fields={fields}
  dedupeKeys={["email"]}
  onImport={(rows, { signal, strategy, dryRun, onProgress }) => api.contacts.bulk(rows, { signal, strategy, dryRun })}
/>`,
  demo: ex("demo", "Demo", "import-wizard/demo.tsx", ImportWizardDemo),
  examples: [
    ex("validation", "Locale-pack validators", "import-wizard/validation.tsx", ImportWizardValidation, "HR bulk import: TCKN and IBAN checked with the tr pack, \"01.12.2026\" and \"96.000,00\" parsed in the file's Turkish format. Fix bad cells inline; F8 jumps to the next error."),
    ex("templates", "Saved mapping templates", "import-wizard/templates.tsx", ImportWizardTemplates, "Headers that don't auto-map are mapped once and saved; templates.list() offers them next time."),
    ex("encoding", "Windows-1254 semicolon CSV", "import-wizard/encoding.tsx", ImportWizardEncoding, "Download the file and drop it in: the encoding and ; delimiter are sniffed, so Turkish letters come out right. If a file still looks garbled, a banner offers Windows-1254."),
  ],
  api: [
    { name: "ImportWizard", props: [
      { name: "fields", type: "ImportField[]", description: "{ id, label, aliases?, required?, type, options?, validate?(v, row), normalize?(v) }. type: text · number · money · date · boolean · enum · email · phone · id · iban." },
      { name: "onImport", type: "(rows, ctx) => Promise<{ ok; failed: { row; error }[] }>", description: "Called per chunk with typed values. ctx = { signal, onProgress, strategy, dryRun, offset }; failed rows index into the chunk." },
      { name: "dedupeKeys", type: "string[]", description: "Fields that identify a record: duplicates in the file become warnings and the duplicate strategy (skip / update / create) is offered." },
      { name: "chunkSize", type: "number", default: "200", description: "Rows per onImport call; cancel stops between chunks." },
      { name: "maxRows / maxSize", type: "number", default: "50,000 / 20 MB", description: "Limits checked on upload." },
      { name: "templates", type: "{ list(): Promise<MappingTemplate[]>; save(t): Promise<void> }", description: "Saved column mappings." },
      { name: "sampleFile", type: "{ name; href }", description: "\"Download a sample file\" link." },
      { name: "fileLocales", type: "{ value; label }[]", description: "Choices for the file's number/date format (defaults to the UI locale)." },
      { name: "previewLimit", type: "number", default: "200", description: "Rows rendered in the review table." },
      { name: "onDone", type: "(report: ImportReport) => void", description: "Shows a Done button on the report." },
      { name: "labels", type: "Partial<ImportWizardLabels>", description: "Built-in strings (importWizard namespace)." },
    ] },
    { name: "ImportMapping / ImportReview", props: [
      { name: "ImportMapping", type: "{ headers, sample?, fields, mapping, onMappingChange }", description: "The mapping list on its own: one labelled Select per column." },
      { name: "ImportReview", type: "{ results, fields, onlyErrors, onOnlyErrorsChange, errorCount, warningCount, onFix? }", description: "The validation preview on its own." },
    ] },
    { name: "core (worker-safe)", props: [
      { name: "sniffCsv(bytes)", type: "{ encoding, delimiter, hasBom }", description: "UTF-8 vs Windows-1254 / 1252, and , ; or tab." },
      { name: "autoMap(headers, fields, locale)", type: "Record<column, fieldId | null>", description: "Folded exact, then contains matching (tr \"E-posta\" ≈ \"eposta\")." },
      { name: "parseCell(v, field, locale)", type: "{ value, error? }", description: "\"1.234,50\", \"10.11.2026\", Excel serial dates, yes/no/evet/hayır." },
      { name: "validateImport(rows, mapping, fields, { locale, dedupeKeys })", type: "ImportRowResult[]", description: "Typed values, errors and warnings per field." },
    ] },
  ],
  notes: ["The drop zone is a real file button. Review counts are aria-live, error cells are labelled inputs (\"Email, row 2\") with their message linked, progress is a progressbar and the report has a focused heading, summary text and a table."],
  covers: ["Import wizard"],
};

export default entry;

"use client";

import * as React from "react";
import { CircleCheck, Download, FileSpreadsheet, RotateCcw, Sparkles } from "lucide-react";
import {
  Alert, Badge, Button, Card, CardBody, Field, FileUpload, PageHeader, Progress, RadioGroup, Select, Table, TableBody,
  TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow, type UploadFile,
} from "@vamos-ui/react";
import {
  ImportMapping, ImportReview, MultiStepForm, MultiStepFormFooter, MultiStepFormStep, MultiStepFormStepper,
  autoMap, decodeText, downloadBlob, parseCsv, sniffCsv, validateImport, validateImportRow, type ImportRowResult, type ImportStrategy, type StepDef,
} from "@vamos-ui/react/business";
import { AdminShell } from "../../detail-04/components/admin-shell";
import { useBlockFormat } from "../../_shared/format";
import { cellMessages, contactFields, sampleCsv, sampleFileName, strategyNotes, templateCsv } from "./data";
import { ImportSidebar } from "./import-sidebar";

interface Loaded {
  name: string;
  delimiter: "," | ";" | "\t";
  encoding: string;
  table: string[][];
}

/** Contacts in the sample that the CRM already has. */
const EXISTING = 2;

const delimiterName = (d: Loaded["delimiter"], c: (en: string, tr: string) => string) =>
  d === ";" ? c("semicolon", "noktalı virgül") : d === "\t" ? c("tab", "sekme") : c("comma", "virgül");

/**
 * Contacts → Import. Built from the kit's import parts so each step can carry its own context:
 * upload (or the sample export) with a raw preview, column mapping with suggestions, a validation
 * table with inline fixes, then a duplicate strategy and a chunked import with a report.
 */
export function ContactImport() {
  const { c, t, f } = useBlockFormat();
  const fields = React.useMemo(() => contactFields(c), [c]);
  const messages = React.useMemo(() => cellMessages(c), [c]);
  const [step, setStep] = React.useState("upload");
  const [uploads, setUploads] = React.useState<UploadFile[]>([]);
  const [file, setFile] = React.useState<Loaded | null>(null);
  const [readError, setReadError] = React.useState<string | null>(null);
  const [fileLocale, setFileLocale] = React.useState("tr-TR");
  const [mapping, setMapping] = React.useState<Record<number, string | null>>({});
  const [edits, setEdits] = React.useState<Record<number, Record<string, string>>>({});
  const [onlyErrors, setOnlyErrors] = React.useState(false);
  const [strategy, setStrategy] = React.useState<ImportStrategy>("update");
  const [progress, setProgress] = React.useState<number | null>(null);
  const [report, setReport] = React.useState<{ ok: number; skipped: number; updated: number } | null>(null);
  const reviewRef = React.useRef<HTMLDivElement>(null);

  const headers = file?.table[0] ?? [];
  const body = React.useMemo(() => file?.table.slice(1).filter((r) => r.some((x) => x.trim())) ?? [], [file]);

  const results = React.useMemo<ImportRowResult[]>(() => {
    const base = validateImport(body, mapping, fields, { locale: fileLocale, dedupeKeys: ["email"], messages });
    if (!Object.keys(edits).length) return base;
    const byId = new Map(fields.map((x) => [x.id, x]));
    return base.map((r, i) => (edits[i] ? validateImportRow({ ...r.raw, ...edits[i] }, r.row, byId, { locale: fileLocale, messages }) : r));
  }, [body, mapping, fields, fileLocale, messages, edits]);

  const errorRows = results.filter((r) => Object.keys(r.errors).length);
  const errorCount = results.reduce((n, r) => n + Object.keys(r.errors).length, 0);
  const warningCount = results.reduce((n, r) => n + Object.keys(r.warnings).length, 0);
  const validRows = results.filter((r) => !Object.keys(r.errors).length);
  const duplicates = results.filter((r) => r.warnings.email).length;
  const mappedFields = fields.filter((x) => Object.values(mapping).includes(x.id));
  const missing = fields.filter((x) => x.required && !Object.values(mapping).includes(x.id));

  const read = async (name: string, bytes: Uint8Array) => {
    setReadError(null);
    try {
      const sniff = sniffCsv(bytes);
      const table = await parseCsv(decodeText(bytes, sniff.encoding), sniff.delimiter);
      setFile({ name, delimiter: sniff.delimiter, encoding: sniff.encoding, table });
      // Semicolons usually mean a Turkish Excel export: day-first dates, comma decimals.
      setFileLocale(sniff.delimiter === ";" || sniff.encoding === "windows-1254" ? "tr-TR" : "en-GB");
      setMapping(autoMap(table[0] ?? [], fields, "tr-TR"));
      setEdits({});
      setReport(null);
    } catch (e) {
      setFile(null);
      setReadError(e instanceof Error ? e.message : String(e));
    }
  };

  const onFiles = async (list: UploadFile[]) => {
    setUploads(list);
    const raw = list[0]?.file;
    if (!raw) {
      setFile(null);
      return;
    }
    if (/\.xlsx$/i.test(raw.name)) {
      setReadError(c("This demo reads CSV files. Save the sheet as CSV, or use the sample.", "Bu demo CSV okur. Sayfayı CSV olarak kaydedin ya da örneği kullanın."));
      return;
    }
    await read(raw.name, new Uint8Array(await raw.arrayBuffer()));
  };

  const loadSample = async () => {
    const bytes = new TextEncoder().encode(sampleCsv);
    const sample = new File([bytes], sampleFileName, { type: "text/csv" });
    setUploads([{ key: "sample", file: sample, name: sampleFileName, size: bytes.byteLength, type: "text/csv", status: "done" }]);
    await read(sampleFileName, bytes);
  };

  const nextError = () => {
    const cells = Array.from(reviewRef.current?.querySelectorAll<HTMLElement>('input[aria-invalid="true"]') ?? []);
    if (!cells.length) return;
    const i = cells.indexOf(document.activeElement as HTMLElement);
    cells[(i + 1) % cells.length]!.focus();
  };

  const steps: StepDef[] = [
    {
      id: "upload",
      title: c("Upload", "Yükle"),
      description: c("A CSV from your old CRM or a spreadsheet. The first row holds column names.", "Eski CRM'inizden ya da tablodan bir CSV. İlk satır sütun adlarını içerir."),
      validate: () => (readError ? readError : !file ? c("Choose a file, or use the sample export.", "Bir dosya seçin ya da örnek dosyayı kullanın.") : !body.length ? c("The file has no data rows.", "Dosyada veri satırı yok.") : true),
    },
    {
      id: "map",
      title: c("Map columns", "Sütunları eşle"),
      description: c("We matched what we could. Check the rest — unmapped columns are left out.", "Eşleşebilenleri eşledik. Kalanları kontrol edin — eşlenmeyen sütunlar alınmaz."),
      validate: () => (missing.length ? c(`Map the required fields: ${f.list(missing.map((x) => x.label))}`, `Zorunlu alanları eşleyin: ${f.list(missing.map((x) => x.label))}`) : true),
    },
    {
      id: "review",
      title: c("Review", "Gözden geçir"),
      description: c("Fix a cell in place, or carry on — rows with errors are skipped.", "Hücreyi yerinde düzeltin ya da devam edin — hatalı satırlar atlanır."),
      validate: () => (validRows.length ? true : c("Every row has errors. Fix them or go back to the mapping.", "Tüm satırlarda hata var. Düzeltin ya da eşlemeye dönün.")),
    },
    { id: "import", title: c("Import", "İçe aktar"), description: c("Choose what happens to contacts you already have.", "Zaten kayıtlı kişilere ne olacağını seçin.") },
  ];

  const runImport = async () => {
    const total = validRows.length;
    for (let done = 0; done <= total; done += Math.max(1, Math.ceil(total / 5))) {
      setProgress(done / total);
      await new Promise((r) => setTimeout(r, 160));
    }
    setProgress(null);
    // Two of the file's contacts already exist in the CRM (matched by email).
    const existing = Math.min(EXISTING, total);
    setReport({ ok: strategy === "create" ? total : total - existing, skipped: results.length - total, updated: strategy === "update" ? existing : 0 });
  };

  const reset = () => {
    setUploads([]);
    setFile(null);
    setMapping({});
    setEdits({});
    setReport(null);
    setStep("upload");
  };

  const preview = file ? file.table.slice(0, 5) : [];

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1320px]">
      <PageHeader
        back={{ href: "/crm/contacts", label: c("Contacts", "Kişiler") }}
        title={c("Import contacts", "Kişileri içe aktar")}
        description={c(
          "Bring your list over from another tool. Nothing is written until the last step, and you can undo an import for 7 days.",
          "Listenizi başka bir araçtan taşıyın. Son adıma kadar hiçbir şey yazılmaz; içe aktarmayı 7 gün içinde geri alabilirsiniz.",
        )}
        actions={
          <Button variant="ghost" onClick={() => downloadBlob(new Blob([templateCsv], { type: "text/csv;charset=utf-8" }), "contacts-template.csv")}>
            <Download /> {c("Download template", "Şablonu indir")}
          </Button>
        }
      />

      <div className="mt-6 grid items-start gap-(--gap) xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-w-0">
          <CardBody className="min-w-0 pt-(--card-p,1.25rem)">
            <MultiStepForm steps={steps} value={step} onValueChange={setStep} onComplete={runImport} confirmLeave={progress !== null} aria-label={c("Import contacts", "Kişileri içe aktar")}>
              <MultiStepFormStepper />

              <MultiStepFormStep id="upload">
                <div className="flex flex-col gap-4">
                  <FileUpload accept={[".csv", ".txt", ".xlsx", "text/csv"]} maxFiles={1} maxSize={20 * 1024 * 1024} value={uploads} onValueChange={(l) => void onFiles(l)} invalid={!!readError} />
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <Button variant="secondary" size="sm" onClick={() => void loadSample()}>
                      <Sparkles /> {c("Use the sample export", "Örnek dosyayı kullan")}
                    </Button>
                    <span className="text-[13px] text-fg-muted">{c("14 contacts from a previous CRM, with a few mistakes to fix.", "Önceki bir CRM'den 14 kişi; düzeltilecek birkaç hatayla.")}</span>
                  </div>
                  {readError ? (
                    <Alert tone="danger" title={c("Couldn't read this file", "Bu dosya okunamadı")} live="assertive">{readError}</Alert>
                  ) : null}
                  {file ? (
                    <div className="min-w-0 rounded-ui-lg surface-2 p-3 sm:p-4">
                      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px]">
                        <FileSpreadsheet aria-hidden className="size-4 shrink-0 text-fg-muted" />
                        <span className="min-w-0 font-medium text-fg [overflow-wrap:anywhere]">{file.name}</span>
                        <span className="text-fg-muted tabular">
                          {c(`${body.length} rows · ${headers.length} columns`, `${body.length} satır · ${headers.length} sütun`)}
                        </span>
                        <Badge tone="outline" className="ms-auto">
                          {file.encoding.toUpperCase()} · {delimiterName(file.delimiter, c)}
                        </Badge>
                      </div>
                      <TableContainer className="max-w-full">
                        <Table density="compact" hover={false} className="text-[12px]">
                          <TableCaption visuallyHidden>{c("First rows of the file, as read", "Dosyanın ilk satırları, okunduğu haliyle")}</TableCaption>
                          <TableHeader>
                            <TableRow>
                              {preview[0]?.map((h, i) => (
                                <TableHead key={i} className="whitespace-nowrap font-mono text-[11px]">{h}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {preview.slice(1).map((r, i) => (
                              <TableRow key={i}>
                                {r.map((v, j) => (
                                  <TableCell key={j} className="whitespace-nowrap font-mono text-[11.5px] text-fg-muted">{v || "—"}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Field label={c("Dates and numbers in this file", "Dosyadaki tarih ve sayılar")} hint={c("Detected from the delimiter. Change it if dates look wrong in Review.", "Ayırıcıdan tahmin edildi. İncelemede tarihler yanlışsa değiştirin.")} className="mt-4 max-w-sm">
                        <Select
                          value={fileLocale}
                          onValueChange={(v) => v && setFileLocale(v)}
                          items={[
                            { value: "tr-TR", label: c("Turkish · 14.03.2025 · 1.234,50", "Türkçe · 14.03.2025 · 1.234,50") },
                            { value: "en-GB", label: c("English (UK) · 14/03/2025 · 1,234.50", "İngilizce (UK) · 14/03/2025 · 1,234.50") },
                            { value: "en-US", label: c("English (US) · 03/14/2025 · 1,234.50", "İngilizce (ABD) · 03/14/2025 · 1,234.50") },
                          ]}
                        />
                      </Field>
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
                  toolbar={
                    <Button size="sm" variant="ghost" className="-ms-2.5 self-start" onClick={() => setMapping(autoMap(headers, fields, "tr-TR"))}>
                      <RotateCcw /> {c("Reset to suggestions", "Önerilere dön")}
                    </Button>
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
                  />
                </div>
              </MultiStepFormStep>

              <MultiStepFormStep id="import">
                {report ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3 rounded-ui-lg p-4 tone-success tone-soft" role="status">
                      <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" />
                      <div>
                        <h3 className="text-[15px] font-semibold text-fg">{c("Import finished", "İçe aktarma tamamlandı")}</h3>
                        <p className="mt-0.5 text-sm text-fg tabular">
                          {c(
                            `${report.ok} new contacts · ${report.updated} updated · ${report.skipped} skipped for errors`,
                            `${report.ok} yeni kişi · ${report.updated} güncellendi · ${report.skipped} hatadan dolayı atlandı`,
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="primary">{c("View contacts", "Kişileri gör")}</Button>
                      <Button variant="ghost" onClick={reset}>{c("Import another file", "Başka dosya aktar")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    <dl className="grid grid-cols-3 gap-2 rounded-ui-lg surface-2 p-3 sm:p-4">
                      {[
                        { k: c("Ready", "Hazır"), v: validRows.length },
                        { k: c("Skipped", "Atlanacak"), v: results.length - validRows.length },
                        { k: c("Possible duplicates", "Olası tekrar"), v: duplicates },
                      ].map((x) => (
                        <div key={x.k} className="min-w-0">
                          <dt className="truncate text-[12px] text-fg-muted">{x.k}</dt>
                          <dd className="m-0 font-display text-[28px] leading-tight text-fg tabular">{f.number(x.v)}</dd>
                        </div>
                      ))}
                    </dl>
                    <fieldset className="m-0 min-w-0 border-0 p-0">
                      <legend className="mb-2 text-[13px] font-medium text-fg">{c("When a contact with the same email exists", "Aynı e-postayla bir kişi varsa")}</legend>
                      <RadioGroup<ImportStrategy>
                        value={strategy}
                        onValueChange={setStrategy}
                        variant="card"
                        size="sm"
                        aria-label={c("Duplicate handling", "Tekrar eden kayıtlar")}
                        disabled={progress !== null}
                        className="grid gap-2 sm:grid-cols-3"
                        items={[
                          { value: "update", label: c("Update it", "Güncelle"), description: t(strategyNotes.update) },
                          { value: "skip", label: c("Keep mine", "Benimkini koru"), description: t(strategyNotes.skip) },
                          { value: "create", label: c("Add a copy", "Kopya ekle"), description: t(strategyNotes.create) },
                        ]}
                      />
                    </fieldset>
                    {progress !== null ? (
                      <Progress value={Math.round(progress * 100)} label={c("Importing contacts", "Kişiler aktarılıyor")} showValue />
                    ) : null}
                  </div>
                )}
              </MultiStepFormStep>

              {report ? null : <MultiStepFormFooter submitLabel={c(`Import ${validRows.length} contacts`, `${validRows.length} kişiyi aktar`)} />}
            </MultiStepForm>
          </CardBody>
        </Card>

        <ImportSidebar fields={fields} />
      </div>
    </div>
  );
}

export function ContactImportScreen() {
  return (
    <AdminShell path="/crm/contacts">
      <ContactImport />
    </AdminShell>
  );
}

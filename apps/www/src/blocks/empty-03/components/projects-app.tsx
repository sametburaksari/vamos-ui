"use client";

import * as React from "react";
import { Plus, RotateCcw } from "lucide-react";
import {
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Badge,
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  PageHeader,
  Progress,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from "@vamos-ui/react";
import { ImportWizard } from "@vamos-ui/react/business";
import { companiesById } from "../../_shared/companies";
import { useBlockFormat } from "../../_shared/format";
import { projectStatusLabels, type ProjectStatus } from "../../_shared/projects";
import { day } from "../../_shared/time";
import { FirstRun } from "./first-run";
import { importFields, projectFromTemplate, sampleCsv, sampleProjects, type Template } from "./data";

interface Row {
  id: string;
  code: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  due: string;
  sample?: boolean;
  fresh?: boolean;
}

const statusTone: Record<ProjectStatus, "neutral" | "info" | "success" | "warning"> = { planning: "neutral", active: "info", "on-hold": "warning", completed: "success" };

/** Projects app on its first day: the first-run screen until something exists, then the list. */
export function ProjectsApp() {
  const { f, t, c } = useBlockFormat();
  const [rows, setRows] = React.useState<Row[]>([]);
  const [importing, setImporting] = React.useState(false);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const seq = React.useRef(0);
  const hasSample = rows.some((r) => r.sample);

  const fromTemplate = (tp: Template, name: string, clientId: string) => {
    const p = projectFromTemplate(tp, name, clientId, ++seq.current);
    setRows((r) => [{ id: p.id, code: p.code, name, client: companiesById[clientId]!.name, status: p.status, progress: 0, due: p.due, fresh: true }, ...r]);
    toast.success(c(`${name} created`, `${name} oluşturuldu`), { description: c(`${tp.phases.length} phases and ${tp.tasks} tasks from “${t(tp.name)}”`, `“${t(tp.name)}” şablonundan ${tp.phases.length} aşama ve ${tp.tasks} görev`) });
  };

  const loadSample = () => {
    setRows((r) => [
      ...r,
      ...sampleProjects.map((p) => ({ id: p.id, code: p.code, name: t(p.name), client: companiesById[p.clientId]!.name, status: p.status, progress: p.progress, due: p.due, sample: true })),
    ]);
    toast.success(c("Sample data loaded", "Örnek veriler yüklendi"), { description: c(`${sampleProjects.length} projects, marked “Sample”`, `${sampleProjects.length} proje, “Örnek” olarak işaretli`) });
  };

  const clearSample = () => {
    const removed = rows.filter((r) => r.sample);
    setRows((r) => r.filter((x) => !x.sample));
    toast(c(`${removed.length} sample projects removed`, `${removed.length} örnek proje silindi`), {
      action: { label: c("Undo", "Geri al"), onClick: () => setRows((r) => [...r, ...removed]) },
    });
  };

  const imported = (list: Record<string, unknown>[]) => {
    const now = list.map<Row>((r, i) => ({
      id: `pj-imp-${++seq.current}`,
      code: `IMP-${String(seq.current).padStart(2, "0")}`,
      name: String(r.name ?? ""),
      client: String(r.client ?? ""),
      status: "planning",
      progress: 0,
      due: typeof r.due === "string" && r.due ? r.due.slice(0, 10) : day(30 + i * 7),
      fresh: true,
    }));
    setRows((r) => [...now, ...r]);
  };

  const header = (
    <PageHeader
      eyebrow="Work"
      title={c("Projects", "Projeler")}
      description={rows.length ? undefined : c("Nothing here yet. Choose how you want to begin.", "Burada henüz bir şey yok. Nasıl başlamak istediğinizi seçin.")}
      meta={rows.length ? <Badge>{f.number(rows.length)}</Badge> : null}
      actions={
        rows.length ? (
          <>
            <Button variant="secondary" onClick={() => setImporting(true)}>{c("Import", "İçe aktar")}</Button>
            <Button variant="primary" onClick={() => setRows([])}>
              <Plus aria-hidden />
              {c("New project", "Yeni proje")}
            </Button>
          </>
        ) : null
      }
    />
  );

  return (
    <div className="mx-auto max-w-[1180px]">
      {header}
      {rows.length === 0 ? (
        <FirstRun onTemplate={fromTemplate} onImport={() => setImporting(true)} onSample={loadSample} />
      ) : (
        <div className="grid gap-(--gap)">
          {hasSample ? (
            <Alert
              tone="info"
              title={c("You are looking at sample data", "Örnek verilere bakıyorsunuz")}
              actions={<Button size="sm" variant="secondary" onClick={() => setConfirmClear(true)}>{c("Remove sample data", "Örnek verileri sil")}</Button>}
            >
              {c("Edit anything you like. Your own projects stay when the samples go.", "İstediğinizi düzenleyin. Örnekler silinince kendi projeleriniz kalır.")}
            </Alert>
          ) : null}
          <Card className="ui-rise min-w-0 overflow-hidden">
            <TableContainer>
              <Table>
                <TableCaption visuallyHidden>{c("Projects", "Projeler")}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>{c("Project", "Proje")}</TableHead>
                    <TableHead className="max-md:hidden">{c("Client", "Müşteri")}</TableHead>
                    <TableHead>{c("Status", "Durum")}</TableHead>
                    <TableHead className="w-40 max-sm:hidden">{c("Progress", "İlerleme")}</TableHead>
                    <TableHead className="max-sm:hidden">{c("Due", "Bitiş")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} className={r.fresh ? "ui-rise" : undefined}>
                      <TableCell rowHeader>
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-fg">{r.name}</span>
                          {r.sample ? <Badge size="sm" shape="square">{c("Sample", "Örnek")}</Badge> : null}
                          {r.fresh ? <Badge size="sm" tone="accent">{c("New", "Yeni")}</Badge> : null}
                        </span>
                        <span className="block font-mono text-xs text-fg-subtle">
                          {r.code}
                          <span className="md:hidden"> · {r.client}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-fg-muted max-md:hidden">{r.client}</TableCell>
                      <TableCell><Badge tone={statusTone[r.status]} dot>{t(projectStatusLabels[r.status])}</Badge></TableCell>
                      <TableCell className="max-sm:hidden"><Progress size="xs" value={r.progress} aria-label={c(`${r.name} progress`, `${r.name} ilerleme`)} showValue /></TableCell>
                      <TableCell className="whitespace-nowrap text-fg-muted tabular max-sm:hidden">{f.date(r.due, { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
          <p className="text-center">
            <Button variant="ghost" size="sm" onClick={() => setRows([])}>
              <RotateCcw aria-hidden />
              {c("Back to the first-run screen", "İlk açılış ekranına dön")}
            </Button>
          </p>
        </div>
      )}

      <Dialog open={importing} onOpenChange={setImporting}>
        <DialogContent size="xl" mobile="fullscreen">
          <DialogHeader title={c("Import projects", "Projeleri içe aktar")} description={c("CSV or Excel. One row per project.", "CSV veya Excel. Her satır bir proje.")} />
          <DialogBody>
            <ImportWizard
              fields={importFields}
              dedupeKeys={["name"]}
              sampleFile={{ name: "projects-sample.csv", href: `data:text/csv;charset=utf-8,${encodeURIComponent(sampleCsv)}` }}
              onImport={async (list, ctx) => {
                if (!ctx.dryRun) imported(list);
                return { ok: list.length, failed: [] };
              }}
              onDone={(report) => {
                setImporting(false);
                if (report.ok && !report.dryRun) toast.success(c(`${report.ok} projects imported`, `${report.ok} proje içe aktarıldı`));
              }}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent tone="danger">
          <AlertDialogHeader
            title={c("Remove sample data?", "Örnek veriler silinsin mi?")}
            description={c(`${rows.filter((r) => r.sample).length} sample projects and their tasks go. Projects you made stay.`, `${rows.filter((r) => r.sample).length} örnek proje ve görevleri silinir. Sizin oluşturduğunuz projeler kalır.`)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>{c("Keep", "Kalsın")}</AlertDialogCancel>
            <AlertDialogAction onClick={clearSample}>{c("Remove", "Sil")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

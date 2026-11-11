"use client";

import * as React from "react";
import { ArrowRight, Database, FileSpreadsheet, LayoutTemplate } from "lucide-react";
import { Badge, Button, Card, Field, Input, Progress, Select, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { companies, sampleProjects, sampleTasks, templates, weeksOf, type Template } from "./data";

interface FirstRunProps {
  onTemplate: (tp: Template, name: string, clientId: string) => void;
  onImport: () => void;
  onSample: () => void;
}

/**
 * Empty Projects app. Three ways in, ranked by how much they give you: a template (structure),
 * an import (your data), or sample data (a feel for the app). No dead "No projects" box.
 */
export function FirstRun({ onTemplate, onImport, onSample }: FirstRunProps) {
  const { t, c } = useBlockFormat();
  const [picked, setPicked] = React.useState<string>(templates[0]!.id);
  const tp = templates.find((x) => x.id === picked)!;
  const [name, setName] = React.useState("");
  const [client, setClient] = React.useState<string | null>(null);
  const [error, setError] = React.useState<{ name?: string; client?: string }>({});
  const [loading, setLoading] = React.useState<number | null>(null);

  // Simulated sample import in three visible steps, then hand over.
  const loadSample = () => {
    setLoading(0);
    const steps = [34, 72, 100];
    steps.forEach((v, i) => window.setTimeout(() => setLoading(v), 320 * (i + 1)));
    window.setTimeout(onSample, 320 * steps.length + 260);
  };

  const radios = React.useRef<Array<HTMLButtonElement | null>>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + templates.length) % templates.length;
    setPicked(templates[next]!.id);
    radios.current[next]?.focus();
  };

  return (
    <div className="mx-auto grid max-w-[1180px] gap-(--gap) xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
      <Card className="ui-rise min-w-0 overflow-hidden">
        <div className="border-b border-line px-5 pt-6 pb-5 md:px-7 md:pt-8">
          <p className="flex items-center gap-2 text-xs text-fg-subtle">
            <LayoutTemplate className="size-3.5" aria-hidden />
            {c("Recommended", "Önerilen")}
          </p>
          <h2 className="mt-2 font-heading text-[26px] leading-tight font-medium tracking-tight text-fg md:text-[30px]">
            {c("Start from a plan that already works", "Hazır bir planla başlayın")}
          </h2>
          <p className="mt-2 max-w-[52ch] text-sm text-fg-muted">
            {c("Pick the kind of work you do. Phases, tasks and dates come filled in; you rename and move what does not fit.", "Yaptığınız işin türünü seçin. Aşamalar, görevler ve tarihler dolu gelir; uymayanı yeniden adlandırır ya da taşırsınız.")}
          </p>
        </div>

        <div role="radiogroup" aria-label={c("Project templates", "Proje şablonları")} className="grid gap-px bg-line sm:grid-cols-2">
          {templates.map((x, i) => {
            const on = x.id === picked;
            const total = weeksOf(x);
            return (
              <button
                key={x.id}
                ref={(el) => {
                  radios.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => setPicked(x.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn("group relative grid content-start gap-3 bg-surface px-5 py-5 text-start transition-colors hover:bg-hover focus-ring focus-visible:-outline-offset-2 md:px-7", on && "bg-surface-2 hover:bg-surface-2")}
              >
                {on ? <span className="absolute inset-y-0 start-0 w-0.5 bg-accent" aria-hidden /> : null}
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-medium text-fg">{t(x.name)}</span>
                  <span className="shrink-0 font-mono text-[11.5px] text-fg-subtle tabular">{c(`${total} wk`, `${total} hf`)}</span>
                </span>
                <span className="text-[13px] leading-snug text-fg-muted">{t(x.blurb)}</span>
                {/* Phase strip: widths follow each phase's weeks. */}
                <span className="flex gap-0.5" aria-hidden>
                  {x.phases.map((p, j) => (
                    <span key={j} className="min-w-0" style={{ flex: p.weeks }}>
                      <span className={cn("block h-1.5 rounded-full", on ? (j === 0 ? "bg-accent" : "bg-accent/45") : "bg-track")} />
                      <span className="mt-1 block truncate text-[10.5px] text-fg-muted">{p.weeks / total >= 0.2 || x.phases.length <= 3 ? t(p.name) : "\u00a0"}</span>
                    </span>
                  ))}
                </span>
                <span className="sr-only">{x.phases.map((p) => t(p.name)).join(", ")}</span>
                <span className="text-xs text-fg-subtle">
                  {c(`${x.tasks} tasks · ${t(x.roles)}`, `${x.tasks} görev · ${t(x.roles)}`)}
                </span>
              </button>
            );
          })}
        </div>

        <form
          className="grid gap-4 border-t border-line px-5 py-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-end lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:px-7"
          onSubmit={(e) => {
            e.preventDefault();
            const err = { name: name.trim() ? undefined : c("Give the project a name.", "Projeye bir ad verin."), client: client ? undefined : c("Choose a client.", "Bir müşteri seçin.") };
            setError(err);
            if (err.name || err.client) return;
            onTemplate(tp, name.trim(), client!);
          }}
          noValidate
        >
          <Field label={c("Project name", "Proje adı")} required error={error.name}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={c(`e.g. Kuzey ${t(tp.name).toLowerCase()}`, `ör. Kuzey ${t(tp.name).toLowerCase()}`)} />
          </Field>
          <Field label={c("Client", "Müşteri")} required error={error.client}>
            <Select
              value={client}
              onValueChange={setClient}
              placeholder={c("Choose…", "Seçin…")}
              items={companies.filter((x) => x.lifecycle !== "churned").map((x) => ({ value: x.id, label: x.name }))}
            />
          </Field>
          <Button type="submit" variant="primary" className="md:col-span-2 md:justify-self-end lg:col-span-1 lg:mb-px">
            {c(`Create from “${t(tp.name)}”`, `“${t(tp.name)}” ile oluştur`)}
            <ArrowRight aria-hidden className="rtl:rotate-180" />
          </Button>
        </form>
      </Card>

      <Stagger className="grid content-start gap-(--gap)" effect="rise">
        <Card className="min-w-0 p-5 md:p-6">
          <span className="grid size-9 place-items-center rounded-ui bg-surface-2 text-fg-muted" aria-hidden>
            <FileSpreadsheet className="size-4" />
          </span>
          <h2 className="mt-4 text-[17px] font-medium text-fg">{c("Bring your projects over", "Projelerinizi taşıyın")}</h2>
          <p className="mt-1.5 text-sm text-fg-muted">
            {c("A CSV or Excel export from your spreadsheet or old tool. Columns are matched for you; nothing is saved until you confirm.", "Tablonuzdan ya da eski aracınızdan bir CSV veya Excel dosyası. Sütunlar otomatik eşlenir; onaylamadan hiçbir şey kaydedilmez.")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={onImport}>{c("Import a file", "Dosya içe aktar")}</Button>
            <span className="text-xs text-fg-subtle">.csv · .xlsx · {c("up to 20 MB", "20 MB'a kadar")}</span>
          </div>
        </Card>

        <Card className="min-w-0 p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-9 place-items-center rounded-ui bg-surface-2 text-fg-muted" aria-hidden>
              <Database className="size-4" />
            </span>
            <Badge shape="square">{c("Removable", "Silinebilir")}</Badge>
          </div>
          <h2 className="mt-4 text-[17px] font-medium text-fg">{c("Look around with sample data", "Örnek verilerle göz atın")}</h2>
          <p className="mt-1.5 text-sm text-fg-muted">
            {c(
              `${sampleProjects.length} projects for fictional clients, ${sampleTasks.length} tasks and their milestones. Marked as sample everywhere and gone in one click.`,
              `Hayali müşteriler için ${sampleProjects.length} proje, ${sampleTasks.length} görev ve kilometre taşları. Her yerde örnek olarak işaretli, tek tıkla silinir.`,
            )}
          </p>
          <div className="mt-4" aria-live="polite">
            {loading === null ? (
              <Button variant="ghost" className="-ms-3" onClick={loadSample}>
                {c("Load sample data", "Örnek verileri yükle")}
              </Button>
            ) : (
              <Progress
                value={loading}
                label={loading < 34 ? c("Adding projects…", "Projeler ekleniyor…") : loading < 72 ? c("Adding tasks and milestones…", "Görevler ve kilometre taşları ekleniyor…") : c("Almost there…", "Neredeyse bitti…")}
                showValue
              />
            )}
          </div>
        </Card>

        <p className="px-1 text-xs leading-relaxed text-fg-subtle">
          {c("Working with a team? Projects you create are visible to everyone in Work. You can change that per project later.", "Ekiple mi çalışıyorsunuz? Oluşturduğunuz projeleri Work'teki herkes görür. Bunu daha sonra proje bazında değiştirebilirsiniz.")}
        </p>
      </Stagger>
    </div>
  );
}

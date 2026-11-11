"use client";

import * as React from "react";
import { ArrowRight, Download, Plus, Star, X } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  PageHeader,
  Select,
  Switch,
  cn,
  toast,
} from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { candidates as seed, hiringManager, role, stageLabels, type Candidate, type Stage } from "./compare-data";
import { buildRows, overall, type CompareRow } from "./compare-rows";

const MAX = 4;
const stageTone: Record<Stage, "neutral" | "info" | "warning" | "success" | "danger"> = { screen: "neutral", onsite: "info", final: "warning", offer: "success", rejected: "danger" };

/** Side-by-side candidate comparison: up to four columns, differences only, best value per row, deltas against a baseline. */
export function CompareView() {
  const fmt = useBlockFormat();
  const { c, t } = fmt;
  const [people, setPeople] = React.useState<Candidate[]>(seed);
  const [ids, setIds] = React.useState<string[]>(["cd-1", "cd-2", "cd-3"]);
  const [baseline, setBaseline] = React.useState<string>("cd-1");
  const [onlyDiff, setOnlyDiff] = React.useState(false);
  const [highlight, setHighlight] = React.useState(true);
  const [shortlist, setShortlist] = React.useState<Set<string>>(new Set(["cd-1"]));
  const [offerFor, setOfferFor] = React.useState<Candidate | null>(null);

  const cols = ids.map((id) => people.find((p) => p.id === id)!);
  const rows = React.useMemo(() => buildRows(fmt), [fmt.lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const differs = (r: CompareRow) => new Set(cols.map(r.key)).size > 1;
  const shown = rows.filter((r) => !onlyDiff || differs(r));
  const hidden = rows.length - shown.length;
  const base = cols.find((x) => x.id === baseline) ?? cols[0]!;
  const others = people.filter((p) => !ids.includes(p.id));

  const best = (r: CompareRow): Set<string> => {
    if (!r.num || !r.better || cols.length < 2) return new Set();
    const vals = cols.map((x) => r.num!(x));
    const target = r.better === "high" ? Math.max(...vals) : Math.min(...vals);
    if (vals.every((v) => v === target)) return new Set();
    return new Set(cols.filter((x) => r.num!(x) === target).map((x) => x.id));
  };

  const remove = (id: string) => {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    if (baseline === id) setBaseline(next[0]!);
  };

  const groups = shown.reduce<Array<{ name: string; rows: CompareRow[] }>>((acc, r) => {
    const g = acc.find((x) => x.name === r.group);
    if (g) g.rows.push(r);
    else acc.push({ name: r.group, rows: [r] });
    return acc;
  }, []);

  const template = { "--cols": String(cols.length) } as React.CSSProperties;
  const gridCols = "grid grid-cols-[repeat(var(--cols),minmax(172px,1fr))] md:grid-cols-[minmax(150px,210px)_repeat(var(--cols),minmax(0,1fr))]";

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-5">
      <PageHeader
        back={{ href: "/people", label: c("Hiring", "İşe alım") }}
        eyebrow={c(`Open role · ${role.applicants} applicants`, `Açık pozisyon · ${role.applicants} başvuru`)}
        title={c("Compare candidates", "Adayları karşılaştır")}
        description={c(
          `${t(role.title)} · ${role.location}. Hiring manager ${hiringManager.name}. Scores are averages across interviewers on a 1–4 scale.`,
          `${t(role.title)} · ${role.location}. İşe alım yöneticisi ${hiringManager.name}. Puanlar, mülakatçıların 1–4 ölçeğindeki ortalamasıdır.`,
        )}
        actions={
          <>
            <Button onClick={() => toast.success(c("scorecards-senior-backend.pdf is ready", "scorecards-senior-backend.pdf hazır"))}>
              <Download /> {c("Export", "Dışa aktar")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="primary" disabled={ids.length >= MAX || others.length === 0}>
                  <Plus /> {c("Add candidate", "Aday ekle")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{c(`Up to ${MAX} side by side`, `Yan yana en fazla ${MAX}`)}</DropdownMenuLabel>
                {others.map((p) => (
                  <DropdownMenuItem key={p.id} onSelect={() => setIds((all) => [...all, p.id])} description={`${t(stageLabels[p.stage])} · ${overall(p).toFixed(2)}`}>
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Switch label={c("Only differences", "Yalnızca farklar")} checked={onlyDiff} onCheckedChange={setOnlyDiff} />
        <Switch label={c("Highlight the best", "En iyisini vurgula")} checked={highlight} onCheckedChange={setHighlight} />
        <div className="flex items-center gap-2">
          <span id="baseline-label" className="whitespace-nowrap text-[13px] text-fg-muted">{c("Compare against", "Şuna göre")}</span>
          <Select
            size="sm"
            aria-labelledby="baseline-label"
            value={base.id}
            onValueChange={(v) => v && setBaseline(v)}
            items={cols.map((x) => ({ value: x.id, label: x.name }))}
            className="w-48"
          />
        </div>
        <p className="text-[12.5px] text-fg-subtle sm:ms-auto" aria-live="polite">
          {onlyDiff && hidden > 0 ? c(`${hidden} identical rows hidden`, `${hidden} aynı satır gizlendi`) : c(`${rows.length} criteria`, `${rows.length} ölçüt`)}
        </p>
      </div>

      <div className="max-md:-mx-4 max-md:overflow-x-auto max-md:px-4 max-md:pb-2">
        <div role="table" aria-label={c("Candidate comparison", "Aday karşılaştırması")} className="surface min-w-fit rounded-ui-lg md:min-w-0" style={template}>
          <div role="rowgroup" className="md:sticky md:top-14 md:z-10">
            <div role="row" className={cn(gridCols, "rounded-t-ui-lg border-b border-line bg-surface")}>
              <div role="columnheader" className="px-4 py-4 max-md:hidden">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-fg-subtle">{c("Candidate", "Aday")}</span>
              </div>
              {cols.map((x) => {
                const isBase = x.id === base.id;
                const starred = shortlist.has(x.id);
                return (
                  <div key={x.id} role="columnheader" aria-label={x.name} className={cn("relative flex min-w-0 flex-col gap-3 border-s border-line px-4 py-4 first:border-s-0 md:first:border-s", isBase && "bg-surface-2")}>
                    <div className="flex items-start gap-2.5">
                      <Avatar name={x.name} size="lg" className="lg:order-first" />
                      <div className="min-w-0 flex-1 max-lg:hidden">
                        <NameBlock x={x} isBase={isBase && cols.length > 1} />
                      </div>
                      <div className="-me-2 -mt-1.5 ms-auto flex shrink-0">
                        <Button size="icon-xs" variant="ghost" aria-pressed={starred} aria-label={c(`Shortlist ${x.name}`, `${x.name} kısa listeye`)} onClick={() => setShortlist((s) => { const n = new Set(s); if (n.has(x.id)) n.delete(x.id); else n.add(x.id); return n; })} className={cn(starred ? "text-accent-ink" : "text-fg-subtle")}>
                          <Star className={cn(starred && "fill-current")} />
                        </Button>
                        <Button size="icon-xs" variant="ghost" aria-label={c(`Remove ${x.name} from comparison`, `${x.name} karşılaştırmadan çıkar`)} disabled={cols.length <= 2} onClick={() => remove(x.id)} className="text-fg-subtle">
                          <X />
                        </Button>
                      </div>
                    </div>
                    <div className="min-w-0 lg:hidden">
                      <NameBlock x={x} isBase={isBase && cols.length > 1} />
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-2">
                      <p className="font-display text-[28px] leading-none text-fg tabular">
                        <CountUp value={Number(overall(x).toFixed(2))} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                        <span className="ms-1 font-sans text-[12px] text-fg-subtle">/ 4</span>
                      </p>
                      {x.stage === "offer" ? (
                        <span className="text-[12px] text-fg-muted">{c("Offer drafted", "Teklif hazırlandı")}</span>
                      ) : (
                        <Button size="xs" variant={x.stage === "final" ? "solid" : "secondary"} onClick={() => setOfferFor(x)} disabled={people.some((p) => p.stage === "offer")}>
                          {c("Make offer", "Teklif ver")} <ArrowRight />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div role="rowgroup">
            {groups.map((grp) => (
              <React.Fragment key={grp.name}>
                <div role="row" className="border-b border-line bg-surface-2/60">
                  <div role="rowheader" className="px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-subtle">{grp.name}</div>
                </div>
                {grp.rows.map((r) => {
                  const top = highlight ? best(r) : new Set<string>();
                  const diff = differs(r);
                  return (
                    <div key={r.id} role="row" className={cn(gridCols, "border-b border-line last:border-b-0 hover:bg-hover/40")}>
                      <div role="rowheader" className="col-span-full flex flex-col justify-center px-4 pb-0 pt-3 md:col-span-1 md:py-3">
                        <span className={cn("text-[13px]", diff ? "text-fg" : "text-fg-muted")}>{r.label}</span>
                        {r.hint ? <span className="text-[11.5px] text-fg-subtle">{r.hint}</span> : null}
                      </div>
                      {cols.map((x) => {
                        const isBest = top.has(x.id);
                        const d = r.num && r.delta && x.id !== base.id ? r.num(x) - r.num(base) : null;
                        const good = d != null && d !== 0 && (r.better === "high" ? d > 0 : d < 0);
                        return (
                          <div
                            key={x.id}
                            role="cell"
                            className={cn(
                              "relative min-w-0 border-s border-line px-4 py-3 first:border-s-0 md:first:border-s",
                              r.prose ? "text-[12.5px] leading-relaxed text-fg-muted" : "text-[13.5px] text-fg",
                              x.id === base.id && "bg-surface-2",
                              isBest && "bg-accent-soft",
                            )}
                          >
                            {isBest ? <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-accent" aria-hidden /> : null}
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                              {r.render(x)}
                              {d != null && d !== 0 ? (
                                <span className={cn("text-[11.5px] tabular", good ? "text-fg" : "text-fg-subtle")}>{r.delta!(d)}</span>
                              ) : null}
                              {isBest ? <span className="sr-only">{c("(best)", "(en iyi)")}</span> : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            {shown.length === 0 ? <p className="px-4 py-10 text-center text-sm text-fg-muted">{c("These candidates match on every criterion.", "Bu adaylar her ölçütte aynı.")}</p> : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!offerFor}
        title={offerFor ? c(`Move ${offerFor.name} to offer?`, `${offerFor.name} teklif aşamasına geçsin mi?`) : ""}
        description={
          offerFor
            ? c(
                `${hiringManager.name} and People get a task to draft the offer. The other finalists stay in the process until the offer is accepted.`,
                `${hiringManager.name} ve İK ekibine teklif hazırlama görevi açılır. Diğer finalistler teklif kabul edilene kadar süreçte kalır.`,
              )
            : undefined
        }
        confirmLabel={c("Move to offer", "Teklife geçir")}
        cancelLabel={c("Cancel", "Vazgeç")}
        onResult={(ok) => {
          const target = offerFor;
          setOfferFor(null);
          if (!ok || !target) return;
          const before = people;
          setPeople((all) => all.map((p) => (p.id === target.id ? { ...p, stage: "offer" } : p)));
          toast.success(c(`${target.name} moved to offer`, `${target.name} teklif aşamasında`), { action: { label: c("Undo", "Geri al"), onClick: () => setPeople(before) } });
        }}
      />
    </div>
  );
}

function NameBlock({ x, isBase }: { x: Candidate; isBase: boolean }) {
  const { c, t } = useBlockFormat();
  return (
    <>
      <p className="truncate text-[14px] font-medium text-fg">{x.name}</p>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <Badge tone={stageTone[x.stage]}>{t(stageLabels[x.stage])}</Badge>
        {isBase ? <Badge tone="outline" shape="square">{c("Baseline", "Referans")}</Badge> : null}
      </div>
    </>
  );
}

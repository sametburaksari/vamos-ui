"use client";

import * as React from "react";
import { CalendarClock, Hourglass, Trophy, X } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  DescriptionList,
  Select,
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  ToggleGroup,
  ToggleGroupItem,
  type BadgeProps,
} from "@vamos-ui/react";
import { dealStageLabels, dealStages } from "../../_shared/deals";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { NOW_MS, daysBetween, TODAY } from "../../_shared/time";
import { QUARTER, amountOf, STALL_DAYS, categoryLabels, categoryOf, companyName, dealProduct, inQuarter, toTry, type Deal, type DealStage, tryCompact, tryWhole } from "./data";

const stageTone: Record<DealStage, BadgeProps["tone"]> = {
  discovery: "neutral",
  qualified: "neutral",
  proposal: "info",
  negotiation: "warning",
  won: "success",
  lost: "danger",
};

export type DealPatch = Partial<Pick<Deal, "stage" | "closeDate" | "stageAge">>;

export interface DealsTableProps {
  deals: Deal[];
  stage: DealStage | null;
  onClearStage: () => void;
  scope: "quarter" | "all";
  onScopeChange: (scope: "quarter" | "all") => void;
  onUpdate: (id: string, patch: DealPatch, message: { en: string; tr: string }) => void;
}

type Sort = "close" | "amount";

/** Open deals with a close date, sortable; a row opens the deal in a side sheet. */
export function DealsTable({ deals, stage, onClearStage, scope, onScopeChange: setScope, onUpdate }: DealsTableProps) {
  const { f, t, c } = useBlockFormat();
  const [sort, setSort] = React.useState<Sort>("close");
  const [openId, setOpenId] = React.useState<string | null>(null);

  const rows = deals
    .filter((d) => d.stage !== "won" && d.stage !== "lost")
    .filter((d) => (stage ? d.stage === stage : true))
    .filter((d) => (scope === "quarter" ? inQuarter(d) : true))
    .sort((a, b) => (sort === "close" ? a.closeDate.localeCompare(b.closeDate) : toTry(b.amount) - toTry(a.amount)));
  const open = deals.find((d) => d.id === openId) ?? null;

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "240ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Deals to close", "Kapanacak fırsatlar")}
        description={
          stage ? (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              {c("Filtered to", "Süzülen aşama:")}
              <Badge onRemove={onClearStage} removeLabel={c("Clear stage filter", "Aşama filtresini kaldır")}>
                {t(dealStageLabels[stage])}
              </Badge>
            </span>
          ) : (
            c(`${rows.length} open deals · sorted by ${sort === "close" ? "close date" : "value"}`, `${rows.length} açık fırsat · ${sort === "close" ? "kapanış tarihine" : "tutara"} göre`)
          )
        }
        action={
          <ToggleGroup aria-label={c("Close date range", "Kapanış aralığı")} size="sm" value={scope} onValueChange={(v) => v && setScope(v as typeof scope)}>
            <ToggleGroupItem value="quarter">{QUARTER.label}</ToggleGroupItem>
            <ToggleGroupItem value="all">{c("All open", "Tüm açıklar")}</ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <TableContainer className="border-t border-line">
        <Table hover>
          <TableCaption visuallyHidden>{c("Open deals and their expected close dates", "Açık fırsatlar ve beklenen kapanış tarihleri")}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>{c("Deal", "Fırsat")}</TableHead>
              <TableHead className="max-lg:hidden">{c("Stage", "Aşama")}</TableHead>
              <TableHead sort={sort === "close" ? "asc" : false} onSort={() => setSort("close")} className="max-sm:hidden">
                {c("Close", "Kapanış")}
              </TableHead>
              <TableHead numeric sort={sort === "amount" ? "desc" : false} onSort={() => setSort("amount")}>
                {c("Value", "Tutar")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty colSpan={4} title={c("Nothing closing here", "Burada kapanacak fırsat yok")} description={c("Try all open deals or another stage.", "Tüm açık fırsatları ya da başka bir aşamayı deneyin.")} />
            ) : (
              rows.map((d) => {
                const days = daysBetween(TODAY, d.closeDate);
                const next = !inQuarter(d);
                return (
                  <TableRow key={d.id} selected={openId === d.id} className="cursor-pointer" onClick={() => setOpenId(d.id)}>
                    <TableCell rowHeader>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar name={person(d.ownerId).name} size="sm" className="max-sm:hidden" aria-hidden />
                        <div className="min-w-0">
                          <button
                            type="button"
                            className="block max-w-full truncate rounded-ui-sm text-start font-medium text-fg focus-ring hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenId(d.id);
                            }}
                          >
                            {companyName(d)}
                          </button>
                          <div className="flex min-w-0 items-center gap-1.5 text-xs text-fg-subtle">
                            <span className="truncate">{dealProduct(d)} · {person(d.ownerId).name.split(" ")[0]}</span>
                            {d.stageAge > STALL_DAYS ? <Hourglass className="size-3 shrink-0 text-warning" aria-label={c("Stalled", "Bekliyor")} /> : null}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-lg:hidden">
                      <Badge tone={stageTone[d.stage]} shape="square">{t(dealStageLabels[d.stage])}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-fg-muted tabular max-sm:hidden">
                      {f.date(d.closeDate, { month: "short", day: "numeric" })}
                      <span className={`block text-xs ${days <= 7 ? "text-warning" : "text-fg-subtle"}`}>
                        {next ? c("Next quarter", "Sonraki çeyrek") : f.relative(`${d.closeDate}T12:00:00+03:00`, { now: NOW_MS })}
                      </span>
                    </TableCell>
                    <TableCell numeric className="font-medium text-fg">
                      {amountOf(f, d.amount)}
                      {d.amount.currency !== "TRY" ? (
                        <span className="block text-xs font-normal text-fg-subtle">≈ {tryCompact(f, toTry(d.amount))}</span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DealSheet deal={open} onClose={() => setOpenId(null)} onUpdate={onUpdate} />
    </Card>
  );
}

function DealSheet({ deal, onClose, onUpdate }: { deal: Deal | null; onClose: () => void; onUpdate: DealsTableProps["onUpdate"] }) {
  const { f, t, c } = useBlockFormat();
  // Keep the last deal while the sheet animates out.
  const [shown, setShown] = React.useState<Deal | null>(deal);
  React.useEffect(() => {
    if (deal) setShown(deal);
  }, [deal]);
  const d = deal ?? shown;
  if (!d) return null;
  const category = categoryOf(d.stage);
  const nextQuarterDate = "2027-01-15";

  return (
    <Sheet open={!!deal} onOpenChange={(o) => !o && onClose()}>
      <SheetContent size="md">
        <SheetHeader title={companyName(d)} description={`${dealProduct(d)} · ${person(d.ownerId).name}`} />
        <SheetBody className="space-y-6">
          <div className="rounded-ui border border-line bg-surface-2 p-4">
            <p className="text-xs text-fg-subtle">{c("Deal value", "Fırsat tutarı")}</p>
            <p className="mt-1 font-display text-display-m leading-none text-fg tabular">{amountOf(f, d.amount)}</p>
            {category ? (
              <p className="mt-2 text-[13px] text-fg-muted">
                {c("Counts toward", "Tahmindeki yeri:")} <span className="font-medium text-fg">{t(categoryLabels[category])}</span>
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="deal-stage" className="mb-1.5 block text-[13px] font-medium text-fg">
              {c("Stage", "Aşama")}
            </label>
            <Select
              id="deal-stage"
              value={d.stage}
              onValueChange={(v) => {
                if (!v || v === d.stage) return;
                const label = dealStageLabels[v as DealStage];
                onUpdate(d.id, { stage: v as DealStage, stageAge: 0 }, { en: `Moved to ${label.en}`, tr: `${label.tr} aşamasına taşındı` });
              }}
              items={dealStages.map((s) => ({ value: s.key, label: `${t(s.label)} · ${s.probability}%` }))}
            />
          </div>

          <DescriptionList
            size="sm"
            items={[
              { key: "close", label: c("Expected close", "Beklenen kapanış"), value: f.date(d.closeDate, "long") },
              { key: "age", label: c("Time in stage", "Aşamada geçen süre"), value: c(`${d.stageAge} days`, `${d.stageAge} gün`), hint: d.stageAge > STALL_DAYS ? c("Longer than usual — book a next step", "Normalden uzun — bir sonraki adımı planlayın") : undefined },
              { key: "created", label: c("Created", "Oluşturuldu"), value: f.date(d.createdDate, "long") },
              { key: "prob", label: c("Probability", "Olasılık"), value: `${d.probability}%` },
              { key: "weighted", label: c("Weighted (TRY)", "Ağırlıklı (TRY)"), value: tryWhole(f, (toTry(d.amount) * d.probability) / 100) },
            ]}
          />
        </SheetBody>
        <SheetFooter align="between" className="flex-wrap">
          <Button
            variant="ghost"
            disabled={d.closeDate > QUARTER.end}
            onClick={() => onUpdate(d.id, { closeDate: nextQuarterDate }, { en: "Pushed to next quarter", tr: "Sonraki çeyreğe ertelendi" })}
          >
            <CalendarClock aria-hidden />
            {c("Push to Q1", "Q1'e ertele")}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onUpdate(d.id, { stage: "lost" }, { en: "Marked as lost", tr: "Kaybedildi olarak işaretlendi" })}>
              <X aria-hidden />
              {c("Lost", "Kaybedildi")}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onUpdate(d.id, { stage: "won", closeDate: TODAY }, { en: `${companyName(d)} won`, tr: `${companyName(d)} kazanıldı` });
                onClose();
              }}
            >
              <Trophy aria-hidden />
              {c("Mark won", "Kazanıldı")}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

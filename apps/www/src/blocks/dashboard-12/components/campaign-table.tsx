"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CurrencyInput,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { campaignChannelLabels, channelColor, elapsed, type Campaign } from "./data";

export interface CampaignTableProps {
  campaigns: Campaign[];
  onToggle: (cp: Campaign, on: boolean) => void;
  onBudget: (cp: Campaign, amount: string) => void;
}

/** Campaigns with budget pacing (spend vs time elapsed), unit economics, pause/resume and budget edits. */
export function CampaignTable({ campaigns, onToggle, onBudget }: CampaignTableProps) {
  const { f, t, c } = useBlockFormat();
  const [editing, setEditing] = React.useState<Campaign | null>(null);
  const [amount, setAmount] = React.useState<string | null>(null);
  const money = (v: string | number) => f.currency(v, { currency: "TRY", currencyDisplay: "narrowSymbol" }, { maximumFractionDigits: 0 });
  const minBudget = editing ? Number(editing.spend.amount) : 0;
  const invalid = amount === null || Number(amount) < minBudget;

  const hot = campaigns.filter((cp) => cp.status === "active" && Number(cp.spend.amount) / Number(cp.budget.amount) > elapsed(cp) + 0.15);

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "220ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Campaigns", "Kampanyalar")}
        description={
          hot.length
            ? c(`${hot.length === 1 ? "1 campaign spends faster than its flight" : `${hot.length} campaigns spend faster than their flights`}: ${hot.map((h) => h.name).join(", ")}`, `${hot.length} kampanya süresinden hızlı harcıyor: ${hot.map((h) => h.name).join(", ")}`)
            : c("Every active campaign is pacing to its budget", "Tüm aktif kampanyalar bütçesine uygun ilerliyor")
        }
      />
      <TableContainer className="border-t border-line">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow>
              <TableHead>{c("Campaign", "Kampanya")}</TableHead>
              <TableHead>{c("Running", "Yayında")}</TableHead>
              <TableHead className="w-[22%]">{c("Budget pacing", "Bütçe temposu")}</TableHead>
              <TableHead align="end">{c("Conv.", "Dön.")}</TableHead>
              <TableHead align="end">CPA</TableHead>
              <TableHead align="end">ROAS</TableHead>
              <TableHead align="end"><span className="sr-only">{c("Actions", "İşlemler")}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((cp) => {
              const spend = Number(cp.spend.amount);
              const budget = Number(cp.budget.amount);
              const used = budget ? spend / budget : 0;
              const time = elapsed(cp);
              const isHot = hot.includes(cp);
              const cpa = cp.conversions ? spend / cp.conversions : null;
              const roas = spend ? Number(cp.revenue.amount) / spend : null;
              return (
                <TableRow key={cp.id} className={cn(cp.status === "paused" && "text-fg-muted")}>
                  <TableCell>
                    <span className="flex items-center gap-2.5">
                      <span aria-hidden className="h-8 w-1 shrink-0 rounded-full" style={{ background: `var(--${channelColor[cp.channel]})` }} />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-fg">{cp.name}</span>
                        <span className="text-xs text-fg-subtle">
                          {t(campaignChannelLabels[cp.channel])} · {f.dateRange(cp.start, cp.end, { month: "short", day: "numeric" })}
                        </span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    {cp.status === "active" || cp.status === "paused" ? (
                      <Switch size="sm" checked={cp.status === "active"} onCheckedChange={(on) => onToggle(cp, on)} aria-label={c(`${cp.name} running`, `${cp.name} yayında`)} />
                    ) : (
                      <Badge size="sm" tone={cp.status === "scheduled" ? "info" : "neutral"}>{cp.status === "scheduled" ? c("Scheduled", "Planlandı") : c("Ended", "Bitti")}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-mono text-fg tabular">
                        {money(spend)} <span className="text-fg-subtle">/ {money(budget)}</span>
                      </span>
                      {isHot ? <span className="text-warning">{c("Hot", "Hızlı")}</span> : null}
                    </span>
                    <span
                      className="relative mt-1.5 block h-1.5 rounded-full bg-track"
                      role="img"
                      aria-label={c(`${f.percent(used, { maximumFractionDigits: 0 })} of budget spent, ${f.percent(time, { maximumFractionDigits: 0 })} of flight elapsed`, `Bütçenin %${Math.round(used * 100)} kadarı harcandı, sürenin %${Math.round(time * 100)} kadarı geçti`)}
                    >
                      <span className={cn("absolute inset-y-0 start-0 rounded-full transition-[width] duration-500", used > 1 ? "bg-danger" : isHot ? "bg-warning" : "bg-accent")} style={{ width: `${Math.min(100, used * 100)}%` }} />
                      {cp.status !== "scheduled" ? <span aria-hidden className="absolute -inset-y-1 w-0.5 rounded-full bg-fg" style={{ insetInlineStart: `calc(${time * 100}% - 1px)` }} /> : null}
                    </span>
                  </TableCell>
                  <TableCell align="end" className="font-mono tabular">{f.number(cp.conversions)}</TableCell>
                  <TableCell align="end" className="font-mono tabular">{cpa === null ? "—" : money(cpa)}</TableCell>
                  <TableCell align="end" className={cn("font-mono tabular", roas !== null && roas < 3 && "text-danger")}>
                    {roas === null ? "—" : `${f.number(roas, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}×`}
                  </TableCell>
                  <TableCell align="end">
                    <Button
                      size="xs"
                      variant="ghost"
                      disabled={cp.status === "ended"}
                      onClick={() => {
                        setEditing(cp);
                        setAmount(cp.budget.amount);
                      }}
                    >
                      <Pencil aria-hidden />
                      {c("Budget", "Bütçe")}
                      <span className="sr-only">: {cp.name}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent size="sm">
          <DialogHeader title={c("Change budget", "Bütçeyi değiştir")} description={editing ? `${editing.name} · ${c("spent so far", "harcanan")} ${money(editing.spend.amount)}` : undefined} />
          <DialogBody>
            <Field
              label={c("Total budget", "Toplam bütçe")}
              hint={c("Applies to the rest of the flight. Daily caps adjust automatically.", "Kalan süreye uygulanır. Günlük limitler otomatik ayarlanır.")}
              error={!invalid ? undefined : c(`At least ${money(minBudget)} — already spent.`, `En az ${money(minBudget)}; bu tutar zaten harcandı.`)}
            >
              <CurrencyInput currency="TRY" value={amount} onValueChange={(v) => setAmount(v)} align="end" mono />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditing(null)}>{c("Cancel", "Vazgeç")}</Button>
            <Button
              variant="primary"
              disabled={invalid}
              onClick={() => {
                if (editing && amount) onBudget(editing, Number(amount).toFixed(2));
                setEditing(null);
              }}
            >
              {c("Save budget", "Bütçeyi kaydet")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

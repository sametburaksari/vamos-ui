"use client";

import * as React from "react";
import { Flag } from "lucide-react";
import { Slider, ToggleGroup, ToggleGroupItem, useFormat } from "@vamos-ui/react";
import { AreaChart, type ChartConfig } from "@vamos-ui/react/charts";

export interface PlannerGoal {
  id: string;
  label: string;
  target: number;
  monthly: number;
  months: number;
}

export interface PlannerLabels {
  goal: string;
  monthly: string;
  months: string;
  /** "{n} months" */
  monthsValue: string;
  /** "{n}y" — slider marks */
  years: string;
  balance: string;
  deposits: string;
  interest: string;
  /** "You reach {target} in {month}" */
  reached: string;
  /** "{short} short of {target}" */
  short: string;
  /** "Raise the monthly amount to {amount} to get there" */
  needed: string;
  chartTitle: string;
  fineprint: string;
  result: string;
}

/**
 * The savings goal planner: pick a goal, set a monthly amount and a horizon, and see the pot
 * grow month by month with interest compounded monthly at the illustrative net rate — plus the
 * month the goal is reached, or how much more a month it would take.
 */
export function GoalPlanner({ goals, netMonthly, start, labels }: { goals: PlannerGoal[]; netMonthly: number; start: string; labels: PlannerLabels }) {
  const f = useFormat();
  const [goalId, setGoalId] = React.useState(goals[1]!.id);
  const goal = goals.find((g) => g.id === goalId) ?? goals[0]!;
  const [monthly, setMonthly] = React.useState(goal.monthly);
  const [months, setMonths] = React.useState(goal.months);
  const ids = React.useId();

  const pickGoal = (id: string) => {
    const g = goals.find((x) => x.id === id);
    if (!g) return;
    setGoalId(id);
    setMonthly(g.monthly);
    setMonths(g.months);
  };

  const [y, m] = start.split("-").map(Number) as [number, number];
  const monthAt = (i: number) => {
    const d = new Date(Date.UTC(y, m - 1 + i, 1));
    return d.toISOString().slice(0, 10);
  };

  const { rows, reachedAt, final, deposited } = React.useMemo(() => {
    const out: { month: string; balance: number; deposits: number }[] = [];
    let bal = 0;
    let reached: number | null = null;
    for (let i = 1; i <= months; i++) {
      bal = bal * (1 + netMonthly) + monthly;
      out.push({ month: monthAt(i - 1), balance: Math.round(bal), deposits: monthly * i });
      if (reached === null && bal >= goal.target) reached = i;
    }
    return { rows: out, reachedAt: reached, final: bal, deposited: monthly * months };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthly, months, netMonthly, goal.target, start]);

  // Monthly amount needed to reach the target in `months` (future value of an annuity).
  const growth = (Math.pow(1 + netMonthly, months) - 1) / netMonthly;
  const needed = Math.ceil(goal.target / growth / 100) * 100;

  const money = (v: number) => f.currency(v, { currency: "TRY", display: "narrowSymbol", maximumFractionDigits: 0 });
  const compactMoney = (v: unknown, locale: string) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(Number(v));
  const config = {
    balance: { label: labels.balance, format: compactMoney },
    deposits: { label: labels.deposits, format: compactMoney, color: "fg-subtle" },
  } satisfies ChartConfig;

  return (
    <div className="grid gap-x-(--gutter) gap-y-8 @5xl:grid-cols-12">
      <div className="flex min-w-0 flex-col gap-7 @5xl:col-span-5">
        <div className="flex flex-col gap-2.5">
          <p id={`${ids}-goal`} className="text-small font-medium">
            {labels.goal}
          </p>
          <ToggleGroup type="single" value={goalId} onValueChange={(v) => v && pickGoal(v)} aria-labelledby={`${ids}-goal`} block className="flex-col @xl:flex-row">
            {goals.map((g) => (
              <ToggleGroupItem key={g.id} value={g.id}>
                {g.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-small text-fg-muted">
            <Flag aria-hidden className="me-1.5 inline size-3.5 align-[-2px] text-accent-ink" />
            {money(goal.target)}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <p id={`${ids}-monthly`} className="text-small font-medium">
              {labels.monthly}
            </p>
            <output htmlFor={`${ids}-m`} className="font-mono text-small tabular">
              {money(monthly)}
            </output>
          </div>
          <Slider
            id={`${ids}-m`}
            value={[monthly]}
            onValueChange={(v) => setMonthly(v[0]!)}
            min={1000}
            max={60000}
            step={500}
            aria-labelledby={`${ids}-monthly`}
            formatValue={(v) => money(v)}
            showValue="never"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <p id={`${ids}-months`} className="text-small font-medium">
              {labels.months}
            </p>
            <output className="font-mono text-small tabular">{labels.monthsValue.replace("{n}", String(months))}</output>
          </div>
          <Slider
            value={[months]}
            onValueChange={(v) => setMonths(v[0]!)}
            min={6}
            max={60}
            step={1}
            aria-labelledby={`${ids}-months`}
            formatValue={(v) => labels.monthsValue.replace("{n}", String(v))}
            showValue="never"
            marks={[1, 2, 3, 4, 5].map((n) => ({ value: n * 12, label: labels.years.replace("{n}", String(n)) }))}
          />
        </div>

        <dl aria-live="polite" aria-label={labels.result} className="grid grid-cols-2 gap-px overflow-hidden rounded-ui border border-line bg-line">
          <div className="col-span-2 flex flex-col gap-1 bg-surface p-4">
            <dt className="text-eyebrow text-fg-muted">{labels.balance}</dt>
            <dd className="font-mono text-[1.75rem] font-medium leading-tight tracking-[-0.03em] tabular">{money(final)}</dd>
          </div>
          <div className="flex flex-col gap-1 bg-surface p-4">
            <dt className="text-eyebrow text-fg-muted">{labels.deposits}</dt>
            <dd className="font-mono text-small tabular">{money(deposited)}</dd>
          </div>
          <div className="flex flex-col gap-1 bg-surface p-4">
            <dt className="text-eyebrow text-fg-muted">{labels.interest}</dt>
            <dd className="font-mono text-small text-success tabular">+{money(final - deposited)}</dd>
          </div>
        </dl>

        <p className="rounded-ui bg-accent-soft px-4 py-3 text-small text-fg text-pretty">
          {reachedAt !== null
            ? labels.reached.replace("{target}", money(goal.target)).replace("{month}", f.date(monthAt(reachedAt - 1), "month-year"))
            : `${labels.short.replace("{short}", money(goal.target - final)).replace("{target}", money(goal.target))} ${labels.needed.replace("{amount}", money(needed))}`}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-3 @5xl:col-span-7">
        <div className="surface rounded-[calc(var(--radius)*1.6)] border border-surface-border p-4 @md:p-6">
          <AreaChart
            title={labels.chartTitle}
            data={rows}
            x="month"
            xFormat={{ date: "month-short-year" }}
            config={config}
            height="lg"
            reference={[{ y: goal.target, label: goal.label }]}
            curve="monotone"
          />
        </div>
        <p className="text-eyebrow text-fg-muted text-pretty">{labels.fineprint}</p>
      </div>
    </div>
  );
}

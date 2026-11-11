// Portfolio data for dashboard-11: the six client projects from the shared fixtures with budget
// burn, a cost forecast at completion and the next milestone. USD budgets are converted to TRY at
// a fixed reporting rate so the portfolio totals add up.
import type { Formatter } from "@vamos-ui/react/format";
import { companiesById } from "../../_shared/companies";
import type { L } from "../../_shared/l10n";
import type { Money } from "../../_shared/money";
import { healthLabels, projectStatusLabels, projects, type Health, type Milestone, type Project } from "../../_shared/projects";
import { TODAY, daysBetween } from "../../_shared/time";

export { healthLabels, projectStatusLabels, projects, TODAY, daysBetween };
export type { Health, Milestone, Project };

export const FX: Record<Money["currency"], number> = { TRY: 1, USD: 41.8, EUR: 48.6 };
export const toTry = (m: Money) => Number(m.amount) * FX[m.currency];

export const clientOf = (p: Project) => companiesById[p.clientId];

export const healthTone: Record<Health, "success" | "warning" | "danger"> = { "on-track": "success", "at-risk": "warning", "off-track": "danger" };
export const healthDot: Record<Health, string> = { "on-track": "bg-success", "at-risk": "bg-warning", "off-track": "bg-danger" };

export type RiskImpact = "low" | "medium" | "high";
export interface Risk {
  id: string;
  projectId: string;
  title: L;
  impact: RiskImpact;
  ownerId: string;
}
export const impactLabels: Record<RiskImpact, L> = {
  high: { en: "High", tr: "Yüksek" },
  medium: { en: "Medium", tr: "Orta" },
  low: { en: "Low", tr: "Düşük" },
};
export const impactRank: Record<RiskImpact, number> = { high: 0, medium: 1, low: 2 };

/** Risks flattened out of the projects, each owned by the project lead. */
export const initialRisks: Risk[] = projects.flatMap((p) => p.risks.map((r) => ({ ...r, id: `${p.id}-${r.id}`, projectId: p.id, ownerId: p.leadId })));

/** Burn and forecast for one project. */
export function burnOf(p: Project) {
  const budget = toTry(p.budget);
  const spent = toTry(p.spent);
  const used = budget ? spent / budget : 0;
  const progress = p.progress / 100;
  // Estimate at completion: spend so far scaled by progress; a project that has barely started
  // is forecast at its budget until there is enough signal.
  const eac = progress >= 0.15 ? spent / progress : Math.max(budget, spent);
  return { budget, spent, used, progress, eac, variance: budget - eac };
}

export const nextMilestone = (p: Project, done: Record<string, boolean>) =>
  p.milestones.filter((m) => !(done[`${p.id}:${m.id}`] ?? m.done)).sort((a, b) => a.due.localeCompare(b.due))[0];

/** Initial "done" map for milestones, keyed `projectId:milestoneId`. */
export const initialDone: Record<string, boolean> = Object.fromEntries(projects.flatMap((p) => p.milestones.map((m) => [`${p.id}:${m.id}`, m.done])));

export const tryCompact = (f: Pick<Formatter, "currency">, v: number) =>
  f.currency(Math.round(v), { currency: "TRY", currencyDisplay: "narrowSymbol", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 });

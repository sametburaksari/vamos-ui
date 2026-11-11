// Forecast data for dashboard-06, derived from the shared CRM fixtures (deals, quotas, people).
// Mixed-currency deals are converted to TRY at fixed month-end rates so every total adds up.
import type { Formatter } from "@vamos-ui/react/format";
import { companiesById } from "../../_shared/companies";
import { dealStages, deals as sharedDeals, repQuota, type Deal, type DealStage } from "../../_shared/deals";
import type { L } from "../../_shared/l10n";
import type { Money } from "../../_shared/money";
import { daysBetween, TODAY } from "../../_shared/time";

/** Fixed conversion rates used for reporting (TRY per unit). */
export const FX: Record<Money["currency"], number> = { TRY: 1, USD: 41.8, EUR: 48.6 };
export const toTry = (m: Money) => Number(m.amount) * FX[m.currency];

export const QUARTER = { label: "Q4 2026", start: "2026-10-01", end: "2026-12-31" };
export const daysLeftInQuarter = daysBetween(TODAY, QUARTER.end);

/** Forecast category: what a manager is willing to call. */
export type ForecastCategory = "won" | "commit" | "best" | "pipeline";
export const categoryOf = (stage: DealStage): ForecastCategory | null =>
  stage === "won" ? "won" : stage === "negotiation" ? "commit" : stage === "proposal" ? "best" : stage === "lost" ? null : "pipeline";

export const categoryLabels: Record<ForecastCategory, L & { hint: L }> = {
  won: { en: "Closed won", tr: "Kazanıldı", hint: { en: "Booked this quarter", tr: "Bu çeyrek kapandı" } },
  commit: { en: "Commit", tr: "Kesin", hint: { en: "In negotiation", tr: "Pazarlıkta" } },
  best: { en: "Best case", tr: "En iyi durum", hint: { en: "Proposal sent", tr: "Teklif gönderildi" } },
  pipeline: { en: "Pipeline", tr: "Fırsat havuzu", hint: { en: "Discovery & qualified", tr: "Keşif ve nitelikli" } },
};

export const openStages = dealStages.filter((s) => s.key !== "won" && s.key !== "lost");

export const reps = ["p-noah", "p-aylin", "p-tomas", "p-ines"] as const;
export const teamQuota = Object.values(repQuota).reduce((s, v) => s + Number(v), 0);

/** A deal "stalls" after this many days without moving stage. */
export const STALL_DAYS = 21;

export const inQuarter = (d: Pick<Deal, "closeDate">) => d.closeDate >= QUARTER.start && d.closeDate <= QUARTER.end;
export const companyName = (d: Deal) => companiesById[d.companyId]?.name ?? "";
/** "Kuzey Outdoor · Seat expansion" → "Seat expansion". */
export const dealProduct = (d: Deal) => d.title.split(" · ")[1] ?? d.title;

/**
 * The shared fixture has every proposal closing in January, which leaves "Best case" empty for the
 * quarter. Two of them are expected before year end in this forecast.
 */
const expectedClose: Record<string, string> = { "d-30": "2026-12-11", "d-14": "2026-12-18" };
export const deals: Deal[] = sharedDeals.map((d) => (expectedClose[d.id] ? { ...d, closeDate: expectedClose[d.id]! } : d));
export type { Deal, DealStage };

type Fmt = Pick<Formatter, "currency">;
/** "₺2.6M" — explicit min digits so server and browser ICU agree. */
export const tryCompact = (f: Fmt, v: number) =>
  f.currency(Math.round(v), { currency: "TRY", currencyDisplay: "narrowSymbol", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 });
/** "₺2,640,000" */
export const tryWhole = (f: Fmt, v: number) =>
  f.currency(Math.round(v), { currency: "TRY", currencyDisplay: "narrowSymbol" }, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
/** A deal amount in its own currency with a narrow symbol, no decimals: "$24,000", "₺440,000". */
export const amountOf = (f: Fmt, m: Money) =>
  f.currency(m.amount, { currency: m.currency, currencyDisplay: "narrowSymbol" }, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

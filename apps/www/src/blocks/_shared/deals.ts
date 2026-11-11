// CRM pipeline: deals on the fictional customer companies, owned by the sales team.
// Used by dashboard-06 (pipeline), detail-04 (customer 360) and detail-08 (quote builder).
import type { L } from "./l10n";
import type { Money } from "./money";
import { companies } from "./companies";
import { int, pick, seeded } from "./random";
import { day } from "./time";

export type DealStage = "discovery" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export interface Deal {
  id: string;
  title: string;
  companyId: string;
  ownerId: string;
  stage: DealStage;
  amount: Money;
  /** 0–100. */
  probability: number;
  createdDate: string;
  /** Expected (open) or actual (won/lost) close date. */
  closeDate: string;
  /** Days in the current stage. */
  stageAge: number;
  lostReason?: L;
}

export const dealStages: Array<{ key: DealStage; label: L; probability: number }> = [
  { key: "discovery", label: { en: "Discovery", tr: "Keşif" }, probability: 10 },
  { key: "qualified", label: { en: "Qualified", tr: "Nitelikli" }, probability: 25 },
  { key: "proposal", label: { en: "Proposal sent", tr: "Teklif gönderildi" }, probability: 50 },
  { key: "negotiation", label: { en: "Negotiation", tr: "Pazarlık" }, probability: 75 },
  { key: "won", label: { en: "Won", tr: "Kazanıldı" }, probability: 100 },
  { key: "lost", label: { en: "Lost", tr: "Kaybedildi" }, probability: 0 },
];
export const dealStageLabels = Object.fromEntries(dealStages.map((s) => [s.key, s.label])) as Record<DealStage, L>;

const salesReps = ["p-tomas", "p-aylin", "p-noah", "p-ines"];
const products = ["Annual licence", "Onboarding package", "Seat expansion", "Multi-site rollout", "Support upgrade", "API add-on", "Renewal", "Pilot"];
const lostReasons: L[] = [
  { en: "Chose a cheaper tool", tr: "Daha ucuz bir araç seçti" },
  { en: "No budget this year", tr: "Bu yıl bütçe yok" },
  { en: "Went quiet after demo", tr: "Demodan sonra dönüş olmadı" },
];

function build(): Deal[] {
  const rand = seeded(4242);
  const out: Deal[] = [];
  for (let i = 0; i < 32; i++) {
    const company = pick(rand, companies);
    const stage = pick(rand, ["discovery", "qualified", "qualified", "proposal", "proposal", "negotiation", "won", "won", "lost"] as const);
    const open = stage !== "won" && stage !== "lost";
    const created = -int(rand, 10, 120);
    const close = open ? int(rand, 3, 75) : Math.min(-1, created + int(rand, 14, 60));
    const usd = company.mrr.currency !== "TRY";
    const amount = usd ? int(rand, 6, 80) * 500 : int(rand, 6, 90) * 5000;
    out.push({
      id: `d-${i + 1}`,
      title: `${company.name} · ${pick(rand, products)}`,
      companyId: company.id,
      ownerId: pick(rand, salesReps),
      stage,
      amount: { amount: amount.toFixed(2), currency: usd ? (company.mrr.currency === "EUR" ? "EUR" : "USD") : "TRY" },
      probability: dealStages.find((s) => s.key === stage)!.probability,
      createdDate: day(created),
      closeDate: day(close),
      stageAge: int(rand, 1, 34),
      lostReason: stage === "lost" ? pick(rand, lostReasons) : undefined,
    });
  }
  return out;
}

/** 32 deals across every stage. */
export const deals: Deal[] = build();
export const dealsOf = (companyId: string) => deals.filter((d) => d.companyId === companyId);

/** Quarterly quota per rep, TRY. */
export const repQuota: Record<string, string> = { "p-tomas": "1200000.00", "p-aylin": "1500000.00", "p-noah": "1800000.00", "p-ines": "900000.00" };

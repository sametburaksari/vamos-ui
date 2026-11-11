// SaaS metrics derived from the shared fixtures: MRR movements per month, retention cohorts
// and the customer accounts worth a call this week.
import type { L } from "../../_shared/l10n";
import { companies, type Company } from "../../_shared/companies";
import { cohorts, saasMonths } from "../../_shared/metrics";

export { cohorts };

export interface SaasMonth {
  month: string;
  /** MRR at the start of the month (USD). */
  start: number;
  mrr: number;
  newMrr: number;
  expansion: number;
  contraction: number;
  churned: number;
  customers: number;
  logoChurnRate: number;
}

export const months: SaasMonth[] = saasMonths.map((m) => {
  const mrr = Number(m.mrr);
  const newMrr = Number(m.newMrr);
  const expansion = Number(m.expansion);
  const contraction = Number(m.contraction);
  const churned = Number(m.churned);
  return { month: m.month, start: mrr - newMrr - expansion + contraction + churned, mrr, newMrr, expansion, contraction, churned, customers: m.customers, logoChurnRate: m.logoChurnRate };
});

export type Movement = "newMrr" | "expansion" | "contraction" | "churned";
export const movementOrder: Movement[] = ["newMrr", "expansion", "contraction", "churned"];
export const movementLabels: Record<Movement, L> = {
  newMrr: { en: "New", tr: "Yeni" },
  expansion: { en: "Expansion", tr: "Genişleme" },
  contraction: { en: "Contraction", tr: "Daralma" },
  churned: { en: "Churn", tr: "Kayıp" },
};
export const movementHints: Record<Movement, L> = {
  newMrr: { en: "First invoices from new customers", tr: "Yeni müşterilerin ilk faturaları" },
  expansion: { en: "Upgrades and added seats", tr: "Paket yükseltme ve ek kullanıcı" },
  contraction: { en: "Downgrades and removed seats", tr: "Paket düşürme ve kullanıcı azaltma" },
  churned: { en: "Cancelled subscriptions", tr: "İptal edilen abonelikler" },
};
export const isLoss = (m: Movement) => m === "contraction" || m === "churned";

/** Metrics for one month. Ratios are 0–1. */
export function kpis(i: number) {
  const m = months[i]!;
  const prev = months[i - 1];
  // Net revenue retention, trailing 12 months on the existing base: (start + exp − contr − churn) / start, compounded monthly.
  const window = months.slice(Math.max(0, i - 11), i + 1);
  const nrr = window.reduce((acc, x) => acc * ((x.start + x.expansion - x.contraction - x.churned) / x.start), 1);
  const grr = window.reduce((acc, x) => acc * ((x.start - x.contraction - x.churned) / x.start), 1);
  return {
    mrr: m.mrr,
    arr: m.mrr * 12,
    growth: prev ? m.mrr / prev.mrr - 1 : m.mrr / m.start - 1,
    nrr,
    grr,
    quickRatio: (m.newMrr + m.expansion) / (m.contraction + m.churned),
    arpa: m.mrr / m.customers,
    logoChurn: m.logoChurnRate,
    customers: m.customers,
  };
}

/** Accounts on the watch list. Seat use and the last login are set here, the rest comes from companies.ts. */
export interface WatchAccount {
  company: Company;
  kind: "expansion" | "risk";
  /** Seats used / seats paid. */
  seatsUsed: number;
  seats: number;
  signal: L;
  /** Days since anyone logged in. */
  idleDays: number;
}

const signals: Record<string, Omit<WatchAccount, "company">> = {
  "c-tessellate": { kind: "expansion", seatsUsed: 24, seats: 25, idleDays: 0, signal: { en: "Seats almost full · 3 invites pending", tr: "Kullanıcı kotası doluyor · 3 davet bekliyor" } },
  "c-larkspur": { kind: "expansion", seatsUsed: 58, seats: 60, idleDays: 0, signal: { en: "API calls up 41% in 30 days", tr: "API çağrıları 30 günde %41 arttı" } },
  "c-halcyon": { kind: "expansion", seatsUsed: 112, seats: 120, idleDays: 0, signal: { en: "Asked about a second site", tr: "İkinci tesis için bilgi istedi" } },
  "c-northpaw": { kind: "expansion", seatsUsed: 19, seats: 20, idleDays: 1, signal: { en: "Hit the Growth automation limit twice", tr: "Büyüme paketinin otomasyon sınırına iki kez ulaştı" } },
  "c-kuzey": { kind: "expansion", seatsUsed: 33, seats: 40, idleDays: 0, signal: { en: "Trialled the Scale reports add-on", tr: "Ölçek rapor eklentisini denedi" } },
  "c-lodestar": { kind: "risk", seatsUsed: 41, seats: 90, idleDays: 9, signal: { en: "Usage down 54% since the new COO", tr: "Yeni COO'dan beri kullanım %54 düştü" } },
  "c-mistral": { kind: "risk", seatsUsed: 2, seats: 6, idleDays: 17, signal: { en: "Card declined twice · renewal Dec 2", tr: "Kart iki kez reddedildi · yenileme 2 Ara" } },
  "c-brightwater": { kind: "risk", seatsUsed: 70, seats: 150, idleDays: 3, signal: { en: "Opened a competitor comparison ticket", tr: "Rakip karşılaştırması için talep açtı" } },
  "c-yelken": { kind: "risk", seatsUsed: 3, seats: 5, idleDays: 12, signal: { en: "Owner has not logged in for 12 days", tr: "İşletme sahibi 12 gündür giriş yapmadı" } },
};

export const watchList: WatchAccount[] = companies.filter((c) => signals[c.id]).map((company) => ({ company, ...signals[company.id]! }));

export const playOptions: Array<{ value: string; label: L }> = [
  { value: "call", label: { en: "Executive call", tr: "Yönetici görüşmesi" } },
  { value: "training", label: { en: "Free training session", tr: "Ücretsiz eğitim oturumu" } },
  { value: "discount", label: { en: "Renewal discount", tr: "Yenileme indirimi" } },
  { value: "upgrade", label: { en: "Upgrade proposal", tr: "Paket yükseltme teklifi" } },
  { value: "seats", label: { en: "Seat top-up offer", tr: "Ek kullanıcı teklifi" } },
];

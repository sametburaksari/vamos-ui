// Project overview data: the six shared projects plus what an overview needs on top — weekly
// spend, this week's hours per person, files and a status-update log. Generated with a fixed
// seed per project, so every render (server, client, screenshot) shows the same numbers.
import { companiesById } from "../../_shared/companies";
import type { L } from "../../_shared/l10n";
import { person } from "../../_shared/people";
import { projects, tasks, type Health, type Project } from "../../_shared/projects";
import { int, seeded } from "../../_shared/random";
import { TODAY, at, daysBetween } from "../../_shared/time";

export { projects };
export const DEFAULT_PROJECT = "pj-2";

export const clientOf = (p: Project) => companiesById[p.clientId]!;
export const tasksOf = (p: Project) => tasks.filter((t) => t.projectId === p.id);

/** Days from start to due, elapsed so far and left (negative = late). */
export function schedule(p: Project) {
  const total = Math.max(1, daysBetween(p.start, p.due));
  const elapsed = Math.min(total, Math.max(0, daysBetween(p.start, TODAY)));
  return { total, elapsed, left: daysBetween(TODAY, p.due), timePct: (elapsed / total) * 100 };
}

const seedOf = (id: string) => [...id].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7);

/** Cumulative spend per week against an even plan. The last point is today's actual. */
export function burn(p: Project) {
  const rand = seeded(seedOf(p.id));
  const { total, elapsed } = schedule(p);
  const weeks = Math.max(1, Math.ceil(total / 7));
  const budget = Number(p.budget.amount);
  const spent = Number(p.spent.amount);
  const doneWeeks = Math.floor(elapsed / 7);
  // Random weekly weights, scaled so the actual line ends exactly on `spent`.
  const weights = Array.from({ length: doneWeeks + 1 }, () => 0.6 + rand() * 0.9);
  const wsum = weights.reduce((a, b) => a + b, 0);
  let run = 0;
  return Array.from({ length: weeks + 1 }, (_, w) => {
    const date = at(-elapsed + w * 7, "12:00").slice(0, 10);
    const planned = Math.round((budget * Math.min(w * 7, total)) / total);
    if (w <= doneWeeks) run += (spent * weights[w]!) / wsum;
    return { week: date, planned, actual: w <= doneWeeks ? Math.round(w === doneWeeks ? spent : run) : null };
  });
}

/** Forecast at completion from the current burn rate per percent done. */
export function forecast(p: Project) {
  const spent = Number(p.spent.amount);
  const budget = Number(p.budget.amount);
  if (p.progress <= 0) return { eac: budget, variance: 0 };
  const eac = p.progress >= 100 ? spent : (spent / p.progress) * 100;
  return { eac, variance: eac / budget - 1 };
}

export interface Member {
  id: string;
  role: L;
  /** Hours booked this week / capacity. */
  booked: number;
  capacity: number;
}

const roleOf: Record<string, L> = {
  "p-viktor": { en: "Tech lead", tr: "Teknik lider" },
  "p-yusuf": { en: "Backend", tr: "Backend" },
  "p-maya": { en: "Frontend", tr: "Frontend" },
  "p-nadia": { en: "Product design", tr: "Ürün tasarımı" },
  "p-jun": { en: "Content", tr: "İçerik" },
  "p-defne": { en: "Delivery lead", tr: "Teslimat lideri" },
  "p-camille": { en: "Campaign lead", tr: "Kampanya lideri" },
  "p-arda": { en: "Paid media", tr: "Ücretli medya" },
};

export function team(p: Project): Member[] {
  const rand = seeded(seedOf(p.id) + 11);
  return p.memberIds.map((id) => {
    const capacity = id === p.leadId ? 24 : 32;
    const booked = p.status === "completed" ? 0 : p.status === "on-hold" ? int(rand, 0, 6) : int(rand, Math.round(capacity * 0.55), Math.round(capacity * 1.2));
    return { id, role: roleOf[id] ?? person(id).title, booked, capacity };
  });
}

export interface ProjectFile {
  id: string;
  name: string;
  size: number;
  mime: string;
  uploadedBy: string;
  uploadedAt: string;
}

export function files(p: Project): ProjectFile[] {
  const rand = seeded(seedOf(p.id) + 23);
  const code = p.code.toLowerCase();
  const rows: Array<[string, string]> = [
    [`${code}-statement-of-work-v3.pdf`, "application/pdf"],
    [`${code}-weekly-report.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    [`${code}-design-review.fig`, "application/octet-stream"],
    [`${code}-kickoff-deck.pptx`, "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  ];
  return rows.map(([name, mime], i) => ({
    id: `${p.id}-f${i}`,
    name,
    mime,
    size: int(rand, 80, 9000) * 1024,
    uploadedBy: person(p.memberIds[i % p.memberIds.length]!).name,
    uploadedAt: at(-int(rand, 1, 40), `${String(int(rand, 9, 17)).padStart(2, "0")}:${String(int(rand, 0, 5) * 10).padStart(2, "0")}`),
  }));
}

export interface StatusUpdate {
  id: string;
  authorId: string;
  at: string;
  health: Health;
  text: L;
}

/** The last status update posted on each project. */
export const lastUpdates: Record<string, StatusUpdate> = {
  "pj-1": { id: "su-1", authorId: "p-viktor", at: at(-2, "17:10"), health: "on-track", text: { en: "Booking flow beta is with 40 test guests. Loyalty API contract is the one open question.", tr: "Rezervasyon akışı beta 40 test misafiriyle. Tek açık konu sadakat API sözleşmesi." } },
  "pj-2": { id: "su-2", authorId: "p-viktor", at: at(-1, "18:30"), health: "at-risk", text: { en: "Live map shipped. Scorecards need two more weeks and we have 9% of budget left — change request drafted for the client.", tr: "Canlı harita yayında. Sürücü karneleri iki hafta daha istiyor ve bütçenin %9'u kaldı; müşteri için değişiklik talebi hazırlandı." } },
  "pj-3": { id: "su-3", authorId: "p-defne", at: at(-3, "11:45"), health: "off-track", text: { en: "Go-live slipped: the ERP export rejects VAT codes. Dealer price lists are ready and tested.", tr: "Canlıya geçiş kaydı: ERP aktarımı KDV kodlarını reddediyor. Bayi fiyat listeleri hazır ve test edildi." } },
  "pj-4": { id: "su-4", authorId: "p-nadia", at: at(-5, "10:00"), health: "on-track", text: { en: "Kick-off booked; interviews with eight parents scheduled for week one.", tr: "Başlangıç toplantısı ayarlandı; ilk hafta sekiz veliyle görüşme planlandı." } },
  "pj-5": { id: "su-5", authorId: "p-camille", at: at(-14, "16:20"), health: "on-track", text: { en: "Campaign closed 7% under budget. Final report shared with the client.", tr: "Kampanya bütçenin %7 altında kapandı. Final raporu müşteriyle paylaşıldı." } },
  "pj-6": { id: "su-6", authorId: "p-yusuf", at: at(-4, "14:05"), health: "at-risk", text: { en: "Paused until the client's security review is done. Questionnaire answers due Friday.", tr: "Müşterinin güvenlik incelemesi bitene kadar durduruldu. Anket yanıtları cuma teslim." } },
};

export const healthTone: Record<Health, "success" | "warning" | "danger"> = { "on-track": "success", "at-risk": "warning", "off-track": "danger" };
export const impactLabels: Record<"low" | "medium" | "high", L> = {
  low: { en: "Low impact", tr: "Düşük etki" },
  medium: { en: "Medium impact", tr: "Orta etki" },
  high: { en: "High impact", tr: "Yüksek etki" },
};

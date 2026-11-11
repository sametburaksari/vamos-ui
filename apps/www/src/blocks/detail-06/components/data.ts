// Employee profile for Kerem Yıldız, the support lead. Person, employment, manager chain,
// reports and documents come from the shared HR fixtures; leave history, the public holiday
// calendar, review cycles and goals are added here.
import type { L } from "../../_shared/l10n";
import { person } from "../../_shared/people";
import { employeesById, employeeDocuments, reportsOf, type LeaveType } from "../../_shared/hr";
import { day } from "../../_shared/time";

export const subject = person("p-kerem");
export const employment = employeesById[subject.id]!;
export const manager = employment.managerId ? person(employment.managerId) : undefined;
export const reports = reportsOf(subject.id).map((e) => person(e.personId));
export const documents = employeeDocuments.filter((d) => d.personId === subject.id);

/** Türkiye public holidays in 2026 (date-only). */
export const holidays: Array<{ date: string; name: L }> = [
  { date: "2026-01-01", name: { en: "New Year's Day", tr: "Yılbaşı" } },
  { date: "2026-03-20", name: { en: "Ramadan Feast", tr: "Ramazan Bayramı" } },
  { date: "2026-03-21", name: { en: "Ramadan Feast", tr: "Ramazan Bayramı" } },
  { date: "2026-04-23", name: { en: "National Sovereignty and Children's Day", tr: "Ulusal Egemenlik ve Çocuk Bayramı" } },
  { date: "2026-05-01", name: { en: "Labour Day", tr: "Emek ve Dayanışma Günü" } },
  { date: "2026-05-19", name: { en: "Youth and Sports Day", tr: "Gençlik ve Spor Bayramı" } },
  { date: "2026-05-27", name: { en: "Feast of Sacrifice", tr: "Kurban Bayramı" } },
  { date: "2026-05-28", name: { en: "Feast of Sacrifice", tr: "Kurban Bayramı" } },
  { date: "2026-05-29", name: { en: "Feast of Sacrifice", tr: "Kurban Bayramı" } },
  { date: "2026-07-15", name: { en: "Democracy and National Unity Day", tr: "Demokrasi ve Millî Birlik Günü" } },
  { date: "2026-10-29", name: { en: "Republic Day", tr: "Cumhuriyet Bayramı" } },
];

export interface LeaveEntry {
  id: string;
  type: LeaveType;
  start: string;
  end: string;
  days: number;
  status: "approved" | "pending" | "declined" | "taken";
  note?: L;
  approverId?: string;
}

/** This year's leave for Kerem (matches the 12 used + 1 planned days in hr.ts). */
export const initialLeave: LeaveEntry[] = [
  { id: "kl-1", type: "annual", start: "2026-03-23", end: "2026-03-27", days: 5, status: "taken", approverId: "p-defne", note: { en: "Bridge after the Ramadan Feast", tr: "Ramazan Bayramı sonrası köprü" } },
  { id: "kl-2", type: "annual", start: "2026-07-20", end: "2026-07-24", days: 5, status: "taken", approverId: "p-defne" },
  { id: "kl-3", type: "sick", start: "2026-10-06", end: "2026-10-06", days: 1, status: "taken" },
  { id: "kl-4", type: "annual", start: "2026-09-14", end: "2026-09-15", days: 2, status: "taken", approverId: "p-defne" },
  { id: "kl-5", type: "annual", start: "2026-12-31", end: "2026-12-31", days: 1, status: "approved", approverId: "p-defne", note: { en: "New Year's Eve", tr: "Yılbaşı arifesi" } },
];

/** Sick days are not capped but tracked against a 10-day reference. */
export const sickReference = 10;

export interface ReviewCycle {
  id: string;
  name: L;
  closed: string;
  rating: number;
  reviewerId: string;
  summary: L;
}

export const reviewCycles: ReviewCycle[] = [
  { id: "rc-1", name: { en: "H2 2025", tr: "2025 2. yarı" }, closed: "2026-01-16", rating: 4, reviewerId: "p-defne", summary: { en: "Took over the Ankara queue mid-cycle and cut first-response time by a third.", tr: "Dönem ortasında Ankara kuyruğunu devraldı, ilk yanıt süresini üçte bir kısalttı." } },
  { id: "rc-2", name: { en: "H1 2026", tr: "2026 1. yarı" }, closed: "2026-07-10", rating: 5, reviewerId: "p-defne", summary: { en: "Built the macro library and the weekend rota. The team's CSAT is the highest in the company.", tr: "Hazır yanıt kütüphanesini ve hafta sonu nöbetini kurdu. Ekibin CSAT puanı şirketteki en yüksek puan." } },
];

/** Competency scores (1–5) for the last two cycles. */
export const competencies: Array<{ key: string; label: L; previous: number; current: number }> = [
  { key: "craft", label: { en: "Craft", tr: "Ustalık" }, previous: 4, current: 5 },
  { key: "ownership", label: { en: "Ownership", tr: "Sahiplenme" }, previous: 4, current: 5 },
  { key: "people", label: { en: "Leading people", tr: "Ekip liderliği" }, previous: 3, current: 4 },
  { key: "comms", label: { en: "Communication", tr: "İletişim" }, previous: 4, current: 4 },
  { key: "planning", label: { en: "Planning", tr: "Planlama" }, previous: 3, current: 3 },
];

export interface Goal {
  id: string;
  title: L;
  progress: number;
  due: string;
}

export const goals: Goal[] = [
  { id: "g-1", title: { en: "Keep first response under 30 min for urgent tickets", tr: "Acil taleplerde ilk yanıtı 30 dakikanın altında tut" }, progress: 82, due: day(43) },
  { id: "g-2", title: { en: "Hire and onboard an Arabic-speaking specialist", tr: "Arapça bilen bir uzman işe al ve uyumunu tamamla" }, progress: 35, due: day(74) },
  { id: "g-3", title: { en: "Publish 20 help-centre articles from top macros", tr: "En çok kullanılan yanıtlardan 20 yardım makalesi yayınla" }, progress: 60, due: day(43) },
];

/** Equipment on loan (shown on the overview). */
export const equipment: Array<{ id: string; name: string; tag: string; since: string }> = [
  { id: "eq-1", name: "Laptop 14″ · 32 GB", tag: "IT-00418", since: "2025-07-21" },
  { id: "eq-2", name: "Headset, wireless", tag: "IT-00733", since: "2025-07-21" },
  { id: "eq-3", name: "Building access card", tag: "AC-2291", since: "2025-07-21" },
];

export const payroll = { gross: "118500.00", band: "L5 · Support", lastChange: "2026-07-15", change: "+14%", iban: "TR00 0000 0000 0000 0000 0000 00" };

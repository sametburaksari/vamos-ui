// Support SLA data for dashboard-10: the open tickets from the shared fixtures with the SLA clock
// that currently applies to each (first response until someone replies, then resolution), plus
// four weeks of arrivals by weekday and hour and recent CSAT comments.
import { slaState } from "@vamos-ui/react";
import { companiesById, contactsById } from "../../_shared/companies";
import type { L } from "../../_shared/l10n";
import { peopleById, type Person } from "../../_shared/people";
import { seeded } from "../../_shared/random";
import { csatTrend, priorityLabels, queues, slaPolicy, tickets, type QueueKey, type Ticket, type TicketPriority } from "../../_shared/tickets";
import { NOW, NOW_MS } from "../../_shared/time";

export { csatTrend, NOW, NOW_MS, priorityLabels, queues, slaPolicy };
export type { QueueKey, Ticket, TicketPriority };

export const agentIds = ["p-kerem", "p-oskar", "p-zeynep", "p-hana"] as const;
export const agents: Person[] = agentIds.map((id) => peopleById[id]!);
/** Hana works from Osaka; her shift ended before Istanbul's morning. */
export const offShift = new Set(["p-hana"]);

export const isActive = (t: Ticket) => t.status === "new" || t.status === "open" || t.status === "pending" || t.status === "on-hold";

export type Clock = "first-response" | "resolution";

/** The SLA clock that applies to a ticket right now. */
export function clockOf(t: Ticket) {
  const kind: Clock = t.firstRespondedAt ? "resolution" : "first-response";
  const due = kind === "first-response" ? t.firstResponseDue : t.resolveDue;
  const paused = t.status === "pending" || t.status === "on-hold";
  const model = slaState({ due, start: t.createdAt, pausedAt: paused ? t.updatedAt : null, now: NOW_MS });
  return { kind, due, paused, pausedAt: paused ? t.updatedAt : null, ...model };
}

export const requesterOf = (t: Ticket) => contactsById[t.requesterId];
export const companyOf = (t: Ticket) => companiesById[t.companyId];

export const priorityRank: Record<TicketPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
export const nextPriority: Record<TicketPriority, TicketPriority> = { low: "normal", normal: "high", high: "urgent", urgent: "urgent" };

/** Minutes from creation to the first reply, for tickets that got one. */
export const firstResponseMinutes = (list: Ticket[]) =>
  list.filter((t) => t.firstRespondedAt).map((t) => Math.max(1, Math.round((Date.parse(t.firstRespondedAt!) - Date.parse(t.createdAt)) / 60_000)));

export function median(values: number[]) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : Math.round((s[mid - 1]! + s[mid]!) / 2);
}

/** Share of replied tickets whose first reply landed inside the policy. */
export const firstResponseHitRate = (list: Ticket[]) => {
  const replied = list.filter((t) => t.firstRespondedAt);
  if (!replied.length) return 1;
  return replied.filter((t) => Date.parse(t.firstRespondedAt!) <= Date.parse(t.firstResponseDue)).length / replied.length;
};

/** Ticket arrivals over the last four weeks, weekday × hour (08–19), seeded. */
export const arrivalHours = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];
export const weekdays: L[] = [
  { en: "Mon", tr: "Pzt" },
  { en: "Tue", tr: "Sal" },
  { en: "Wed", tr: "Çar" },
  { en: "Thu", tr: "Per" },
  { en: "Fri", tr: "Cum" },
  { en: "Sat", tr: "Cmt" },
  { en: "Sun", tr: "Paz" },
];
export const arrivals: Array<{ day: number; hour: string; value: number }> = (() => {
  const rand = seeded(1010);
  const dayShape = [1.25, 1.1, 1, 0.95, 0.9, 0.38, 0.22];
  const hourShape = [0.55, 1.05, 1.35, 1.3, 0.85, 0.95, 1.2, 1.1, 0.95, 0.8, 0.5, 0.35];
  return dayShape.flatMap((d, di) => hourShape.map((h, hi) => ({ day: di, hour: arrivalHours[hi]!, value: Math.round(14 * d * h * (0.8 + rand() * 0.4)) })));
})();

export const csatComments: Array<{ id: string; score: number; who: string; queue: QueueKey; text: L }> = [
  { id: "cs1", score: 5, who: "c-quill", queue: "billing", text: { en: "Refund showed up the same afternoon. Thank you, Kerem.", tr: "İade aynı öğleden sonra hesabımızdaydı. Teşekkürler Kerem." } },
  { id: "cs2", score: 2, who: "c-lodestar", queue: "technical", text: { en: "Took two days and three people to get one straight answer about the scanner.", tr: "Okuyucuyla ilgili net bir yanıt için iki gün ve üç kişi gerekti." } },
  { id: "cs3", score: 4, who: "c-tessellate", queue: "onboarding", text: { en: "Import worked on the second try; the CSV template helped.", tr: "İçe aktarma ikinci denemede oldu; CSV şablonu işe yaradı." } },
];

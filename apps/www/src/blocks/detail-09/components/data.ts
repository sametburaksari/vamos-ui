// Ticket #4814 from the shared support fixtures, with its conversation brought up to NOW:
// the customer answered Oskar's first reply, so the resolution clock is ours again.
import { companiesById, contacts } from "../../_shared/companies";
import type { L } from "../../_shared/l10n";
import { person, teamOf } from "../../_shared/people";
import { macros, queues, sampleThread, slaPolicy, tickets, type Ticket, type TicketMessage, type TicketPriority } from "../../_shared/tickets";
import { minutesFromNow } from "../../_shared/time";

export { macros, queues, slaPolicy };

const base = tickets[4]!;
/** The thread says Oskar picked it up, so he is the assignee here. */
export const ticket: Ticket = {
  ...base,
  assigneeId: "p-oskar",
  createdAt: minutesFromNow(-26),
  firstRespondedAt: minutesFromNow(-17),
  firstResponseDue: minutesFromNow(-26 + slaPolicy[base.priority].firstResponse),
  resolveDue: minutesFromNow(-26 + slaPolicy[base.priority].resolve),
  tags: ["bug", "integration", "vip"],
};

export const requester = contacts.find((x) => x.id === ticket.requesterId)!;
export const company = companiesById[ticket.companyId]!;
export const agents = teamOf("support");
export const me = person("p-oskar");

const body = (id: string) => sampleThread.find((m) => m.id === id)!.body;

export interface ThreadMessage extends Omit<TicketMessage, "ticketId"> {
  /** Delivery for our replies: sending → delivered → opened. */
  delivery?: "sending" | "delivered" | "opened";
  attachments?: Array<{ name: string; size: number }>;
}

export const thread: ThreadMessage[] = [
  { id: "m1", authorId: "customer", kind: "reply", at: minutesFromNow(-26), body: body("m1"), attachments: [{ name: "webhook-failures-1117.csv", size: 18_432 }] },
  { id: "m2", authorId: "p-oskar", kind: "event", at: minutesFromNow(-24), body: body("m2") },
  { id: "m3", authorId: "p-oskar", kind: "internal-note", at: minutesFromNow(-21), body: body("m3") },
  { id: "m3b", authorId: "p-kerem", kind: "internal-note", at: minutesFromNow(-19), body: { en: "Confirmed — rotated Monday 17:42 by their admin account. Old secret is fully revoked, nothing to roll back on our side.", tr: "Teyit — pazartesi 17:42'de kendi yönetici hesaplarıyla yenilenmiş. Eski anahtar tamamen iptal, bizim tarafta geri alınacak bir şey yok." } },
  { id: "m4", authorId: "p-oskar", kind: "reply", at: minutesFromNow(-17), body: body("m4"), delivery: "opened" },
  {
    id: "m5",
    authorId: "customer",
    kind: "reply",
    at: minutesFromNow(-5),
    body: {
      en: "That was it, thank you. New orders are coming through again. But the 34 deliveries from last night are still in the failed list — do they retry on their own, or do we have to resend them?",
      tr: "Sorun buymuş, teşekkürler. Yeni siparişler tekrar geliyor. Ama dün geceki 34 gönderim hâlâ başarısız listesinde; kendiliğinden yeniden denenecek mi, yoksa bizim mi tekrar göndermemiz gerekiyor?",
    },
  },
];

/** Older tickets from the same company, newest first. */
export const related = tickets.filter((x) => x.companyId === ticket.companyId && x.id !== ticket.id).slice(0, 4);

export const channelLabels: Record<Ticket["channel"], L> = {
  email: { en: "Email", tr: "E-posta" },
  chat: { en: "Chat", tr: "Sohbet" },
  phone: { en: "Phone", tr: "Telefon" },
  "web-form": { en: "Web form", tr: "Web formu" },
  whatsapp: { en: "WhatsApp", tr: "WhatsApp" },
};

/** Suggested tags in the tag field. */
export const tagSuggestions = ["bug", "integration", "vip", "webhooks", "how-to", "refund", "invoice", "sso", "first-contact"];

/** Deliveries the customer is asking about, for the "Replay deliveries" quick action. */
export const failedDeliveries = { count: 34, endpoint: "https://orders.velvetanchor.example.com/hooks/vamos", since: minutesFromNow(-60 * 15) };

export const priorities: TicketPriority[] = ["low", "normal", "high", "urgent"];

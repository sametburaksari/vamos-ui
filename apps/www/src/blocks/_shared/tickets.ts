// Support desk: queues, tickets with SLA targets relative to NOW, one full conversation and
// reply macros. Used by shell-11 (inbox), dashboard-10 (SLA), detail-09 (ticket) and detail-04.
import type { L } from "./l10n";
import { contacts } from "./companies";
import { int, pick, seeded } from "./random";
import { minutesFromNow } from "./time";

export type TicketStatus = "new" | "open" | "pending" | "on-hold" | "solved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketChannel = "email" | "chat" | "phone" | "web-form" | "whatsapp";
export type QueueKey = "billing" | "technical" | "onboarding" | "returns";

export interface Ticket {
  id: string;
  number: number;
  subject: L;
  requesterId: string;
  companyId: string;
  assigneeId?: string;
  queue: QueueKey;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  createdAt: string;
  updatedAt: string;
  /** First-response target; `firstRespondedAt` when met. */
  firstResponseDue: string;
  firstRespondedAt?: string;
  /** Resolution target. */
  resolveDue: string;
  solvedAt?: string;
  tags: string[];
  /** 1–5 when the customer rated a solved ticket. */
  csat?: number;
  unread?: boolean;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  /** "customer" → requester; otherwise a people.ts id. */
  authorId: string;
  kind: "reply" | "internal-note" | "event";
  at: string;
  body: L;
}

export const queues: Array<{ key: QueueKey; label: L }> = [
  { key: "billing", label: { en: "Billing", tr: "Faturalama" } },
  { key: "technical", label: { en: "Technical", tr: "Teknik" } },
  { key: "onboarding", label: { en: "Onboarding", tr: "Kurulum" } },
  { key: "returns", label: { en: "Returns", tr: "İadeler" } },
];

export const ticketStatusLabels: Record<TicketStatus, L> = {
  new: { en: "New", tr: "Yeni" },
  open: { en: "Open", tr: "Açık" },
  pending: { en: "Waiting on customer", tr: "Müşteri bekleniyor" },
  "on-hold": { en: "On hold", tr: "Beklemede" },
  solved: { en: "Solved", tr: "Çözüldü" },
  closed: { en: "Closed", tr: "Kapandı" },
};

export const priorityLabels: Record<TicketPriority, L> = {
  low: { en: "Low", tr: "Düşük" },
  normal: { en: "Normal", tr: "Normal" },
  high: { en: "High", tr: "Yüksek" },
  urgent: { en: "Urgent", tr: "Acil" },
};

/** SLA policy in minutes per priority. */
export const slaPolicy: Record<TicketPriority, { firstResponse: number; resolve: number }> = {
  urgent: { firstResponse: 30, resolve: 240 },
  high: { firstResponse: 60, resolve: 480 },
  normal: { firstResponse: 240, resolve: 1440 },
  low: { firstResponse: 480, resolve: 2880 },
};

const subjects: Array<[QueueKey, string, string]> = [
  ["billing", "Charged twice for the November invoice", "Kasım faturası iki kez tahsil edildi"],
  ["billing", "Need the invoice issued to our new tax number", "Faturanın yeni vergi numaramıza kesilmesi gerekiyor"],
  ["billing", "Can we switch to annual billing mid-cycle?", "Dönem ortasında yıllık ödemeye geçebilir miyiz?"],
  ["technical", "Barcode scanner stops working after update", "Güncellemeden sonra barkod okuyucu çalışmıyor"],
  ["technical", "Webhook deliveries failing with 401", "Webhook gönderimleri 401 hatasıyla düşüyor"],
  ["technical", "Report export stuck at 90%", "Rapor dışa aktarımı %90'da takılı kalıyor"],
  ["technical", "Staff can't log in with SSO since this morning", "Personel bu sabahtan beri SSO ile giriş yapamıyor"],
  ["technical", "Stock counts differ between web and POS", "Web ve kasa arasında stok sayıları farklı"],
  ["onboarding", "Help importing 3,000 contacts from a spreadsheet", "Tablodan 3.000 kişiyi içe aktarmak için yardım"],
  ["onboarding", "How do we add a second warehouse?", "İkinci depoyu nasıl ekleriz?"],
  ["onboarding", "Training session for new branch staff", "Yeni şube personeli için eğitim"],
  ["returns", "Return label never arrived", "İade etiketi hiç gelmedi"],
  ["returns", "Refund still not on my card after 10 days", "10 gün geçti, iade hâlâ kartıma yansımadı"],
  ["returns", "Wrong colour delivered, want an exchange", "Yanlış renk geldi, değişim istiyorum"],
];

const agents = ["p-kerem", "p-hana", "p-oskar", "p-zeynep"];
const tagPool = ["vip", "bug", "how-to", "refund", "invoice", "sso", "integration", "first-contact"];

function build(): Ticket[] {
  const rand = seeded(5150);
  const out: Ticket[] = [];
  for (let i = 0; i < 30; i++) {
    const [queue, en, tr] = subjects[i % subjects.length]!;
    const contact = pick(rand, contacts);
    const priority = pick(rand, ["low", "normal", "normal", "normal", "high", "high", "urgent"] as const);
    const policy = slaPolicy[priority];
    const ageMin = i < 6 ? int(rand, 4, 50) : int(rand, 60, 60 * 24 * 6);
    const createdOffset = -ageMin;
    const status: TicketStatus = i < 4 ? "new" : ageMin > 60 * 48 ? pick(rand, ["solved", "solved", "closed", "pending"] as const) : pick(rand, ["open", "open", "pending", "on-hold", "solved"] as const);
    const responded = status !== "new";
    const firstRespondedAfter = Math.round(policy.firstResponse * (0.2 + rand() * 1.3)); // some breach
    const solved = status === "solved" || status === "closed";
    out.push({
      id: `t-${4810 + i}`,
      number: 4810 + i,
      subject: { en, tr },
      requesterId: contact.id,
      companyId: contact.companyId,
      assigneeId: status === "new" && rand() < 0.6 ? undefined : pick(rand, agents),
      queue,
      status,
      priority,
      channel: pick(rand, ["email", "email", "chat", "phone", "web-form", "whatsapp"] as const),
      createdAt: minutesFromNow(createdOffset),
      updatedAt: minutesFromNow(createdOffset + Math.floor(ageMin * rand())),
      firstResponseDue: minutesFromNow(createdOffset + policy.firstResponse),
      firstRespondedAt: responded ? minutesFromNow(Math.min(-1, createdOffset + firstRespondedAfter)) : undefined,
      resolveDue: minutesFromNow(createdOffset + policy.resolve),
      solvedAt: solved ? minutesFromNow(Math.min(-1, createdOffset + Math.round(policy.resolve * (0.3 + rand())))) : undefined,
      tags: [pick(rand, tagPool), ...(rand() < 0.4 ? [pick(rand, tagPool)] : [])].filter((t, j, a) => a.indexOf(t) === j),
      csat: solved && rand() < 0.7 ? pick(rand, [5, 5, 5, 4, 4, 3, 2]) : undefined,
      unread: status === "new" || (status === "open" && rand() < 0.3),
    });
  }
  return out;
}

/** 30 tickets: the first six are fresh (minutes old), older ones span six days. */
export const tickets: Ticket[] = build();
export const ticketsById: Record<string, Ticket> = Object.fromEntries(tickets.map((t) => [t.id, t]));

/** The conversation for tickets[4] ("Webhook deliveries failing with 401"). */
export const sampleThread: TicketMessage[] = [
  { id: "m1", ticketId: tickets[4]!.id, authorId: "customer", kind: "reply", at: tickets[4]!.createdAt, body: { en: "Since yesterday evening every webhook to our order system fails with 401 Unauthorized. We did not change anything on our side. Orders are piling up — can you check?", tr: "Dün akşamdan beri sipariş sistemimize giden her webhook 401 Unauthorized hatasıyla düşüyor. Bizim tarafta hiçbir şey değiştirmedik. Siparişler birikiyor, kontrol edebilir misiniz?" } },
  { id: "m2", ticketId: tickets[4]!.id, authorId: "p-oskar", kind: "event", at: minutesFromNow(-38), body: { en: "Oskar Lindahl assigned this ticket to Technical", tr: "Oskar Lindahl bu talebi Teknik kuyruğuna atadı" } },
  { id: "m3", ticketId: tickets[4]!.id, authorId: "p-oskar", kind: "internal-note", at: minutesFromNow(-31), body: { en: "Their signing secret was rotated by an admin on Monday (audit log). Endpoint still validates with the old one. @Kerem can you confirm before I reply?", tr: "İmza anahtarları pazartesi bir yönetici tarafından yenilenmiş (denetim kaydı). Uç nokta hâlâ eskisiyle doğruluyor. @Kerem yanıtlamadan önce teyit eder misin?" } },
  { id: "m4", ticketId: tickets[4]!.id, authorId: "p-oskar", kind: "reply", at: minutesFromNow(-12), body: { en: "Thanks for the details. The signing secret for this endpoint was rotated on Monday, so your server is still checking signatures with the previous key. Copy the new secret from Settings → Webhooks and the queued deliveries will retry automatically.", tr: "Ayrıntılar için teşekkürler. Bu uç noktanın imza anahtarı pazartesi yenilenmiş; sunucunuz imzaları hâlâ eski anahtarla kontrol ediyor. Yeni anahtarı Ayarlar → Webhook'lar'dan kopyaladığınızda bekleyen gönderimler otomatik olarak yeniden denenecek." } },
];

export const macros: Array<{ id: string; title: L; body: L }> = [
  { id: "mc-refund", title: { en: "Refund issued", tr: "İade yapıldı" }, body: { en: "We've issued the refund today. Depending on your bank it shows on your statement within 3–7 business days.", tr: "İadenizi bugün gerçekleştirdik. Bankanıza bağlı olarak 3–7 iş günü içinde ekstrenize yansır." } },
  { id: "mc-logs", title: { en: "Ask for logs", tr: "Kayıt iste" }, body: { en: "Could you send a screenshot and the time it happened (with your time zone)? That lets us find the exact request in our logs.", tr: "Ekran görüntüsü ve olayın saatini (saat diliminizle) paylaşabilir misiniz? Böylece kayıtlarımızda ilgili isteği bulabiliriz." } },
  { id: "mc-solved", title: { en: "Close as solved", tr: "Çözüldü olarak kapat" }, body: { en: "Glad that's working again. I'll mark this as solved — just reply if anything comes back.", tr: "Tekrar çalıştığına sevindim. Talebi çözüldü olarak işaretliyorum; sorun tekrarlarsa bu e-postayı yanıtlamanız yeterli." } },
];

/** CSAT per week for the last 8 weeks (oldest first), 0–100. */
export const csatTrend = [88, 91, 86, 90, 93, 89, 92, 94];

// Support desk data: the shared tickets fixture plus what the inbox derives from it —
// views with counts, a conversation per ticket and the signed-in agent.
import type { L } from "../../_shared/l10n";
import { companiesById, contactsById, type Company, type Contact } from "../../_shared/companies";
import { person, type Person } from "../../_shared/people";
import { NOW_MS, minutesFromNow } from "../../_shared/time";
import { sampleThread, tickets as fixtureTickets, type QueueKey, type Ticket, type TicketMessage } from "../../_shared/tickets";

export { macros, priorityLabels, queues, slaPolicy, ticketStatusLabels } from "../../_shared/tickets";
export type { QueueKey, Ticket, TicketChannel, TicketMessage, TicketPriority, TicketStatus } from "../../_shared/tickets";

/** The agent working the desk in this block. */
export const agent: Person = person("p-kerem");
export const agentIds = ["p-kerem", "p-hana", "p-oskar", "p-zeynep"] as const;
export const agents: Person[] = agentIds.map(person);

/**
 * The shared fixture cycles through 14 subjects, so an inbox of 30 would show each one twice.
 * Repeats get a different subject from the same queue.
 */
const moreSubjects: Record<QueueKey, L[]> = {
  billing: [
    { en: "VAT missing on the October credit note", tr: "Ekim iade faturasında KDV görünmüyor" },
    { en: "Card declined on renewal, but the bank says it's fine", tr: "Yenilemede kart reddedildi, banka sorun yok diyor" },
    { en: "Add our purchase order number to invoices", tr: "Faturalara satın alma sipariş numaramızı ekleyin" },
    { en: "Downgrade to the Starter plan from next month", tr: "Gelecek aydan itibaren Starter pakete geçiş" },
    { en: "Who receives the invoice emails?", tr: "Fatura e-postaları kime gidiyor?" },
  ],
  technical: [
    { en: "Receipt printer prints blank pages", tr: "Fiş yazıcısı boş sayfa basıyor" },
    { en: "Product images not loading on the shop", tr: "Mağazada ürün görselleri yüklenmiyor" },
    { en: "API returns 429 during the nightly sync", tr: "Gece senkronunda API 429 dönüyor" },
    { en: "Two-step codes arrive after they expire", tr: "İki adımlı doğrulama kodları süresi dolduktan sonra geliyor" },
    { en: "Duplicate customers after the CSV import", tr: "CSV içe aktarımından sonra müşteriler çift görünüyor" },
    { en: "Search shows archived products", tr: "Arama arşivlenmiş ürünleri gösteriyor" },
  ],
  onboarding: [
    { en: "Set up user roles for our franchise stores", tr: "Bayi mağazalarımız için kullanıcı rolleri kurulumu" },
    { en: "Connect our domain to the new shop", tr: "Alan adımızı yeni mağazaya bağlama" },
    { en: "Where do we set opening hours per branch?", tr: "Şube bazında çalışma saatlerini nereden ayarlıyoruz?" },
    { en: "Move our price lists over from the old system", tr: "Fiyat listelerimizi eski sistemden taşıma" },
  ],
  returns: [
    { en: "Courier didn't pick up the return", tr: "Kargo iadeyi teslim almaya gelmedi" },
    { en: "Parcel arrived damaged, mug broken", tr: "Koli hasarlı geldi, kupa kırık" },
    { en: "Return window for a gift order?", tr: "Hediye siparişinde iade süresi ne kadar?" },
    { en: "Refund went to an old card", tr: "İade eski karta yapılmış" },
  ],
};

function withUniqueSubjects(list: Ticket[]): Ticket[] {
  const seen = new Set<string>();
  const used: Record<QueueKey, number> = { billing: 0, technical: 0, onboarding: 0, returns: 0 };
  return list.map((t) => {
    if (!seen.has(t.subject.en)) {
      seen.add(t.subject.en);
      return t;
    }
    const alt = moreSubjects[t.queue][used[t.queue]++];
    return alt ? { ...t, subject: alt } : t;
  });
}

const deskTickets = withUniqueSubjects(fixtureTickets);

/** A fresh, mutable copy for local state. */
export const initialTickets = (): Ticket[] => deskTickets.map((t) => ({ ...t, tags: [...t.tags] }));

export const requester = (t: Ticket): Contact => contactsById[t.requesterId]!;
export const companyOf = (t: Ticket): Company => companiesById[t.companyId]!;

export const isOpen = (t: Ticket) => t.status !== "solved" && t.status !== "closed";

/** The SLA that matters right now: first response until answered, then resolution. */
export function activeSla(t: Ticket) {
  const first = !t.firstRespondedAt;
  return {
    kind: first ? ("first" as const) : ("resolve" as const),
    due: first ? t.firstResponseDue : t.resolveDue,
    start: t.createdAt,
    completedAt: first ? null : t.solvedAt ?? null,
    pausedAt: t.status === "pending" || t.status === "on-hold" ? t.updatedAt : null,
  };
}

/** Minutes left on the active SLA (negative = breached). Paused tickets never count as at risk. */
export function minutesLeft(t: Ticket) {
  const s = activeSla(t);
  return (Date.parse(s.due) - NOW_MS) / 60_000;
}
export const atRisk = (t: Ticket) => isOpen(t) && t.status !== "pending" && t.status !== "on-hold" && minutesLeft(t) < 60;

export type ViewKey = "mine" | "unassigned" | "at-risk" | "all" | "solved" | `queue:${QueueKey}`;

export const views: Array<{ key: ViewKey; label: L; test: (t: Ticket) => boolean }> = [
  { key: "mine", label: { en: "Assigned to me", tr: "Bana atanan" }, test: (t) => isOpen(t) && t.assigneeId === agent.id },
  { key: "unassigned", label: { en: "Unassigned", tr: "Atanmamış" }, test: (t) => isOpen(t) && !t.assigneeId },
  { key: "at-risk", label: { en: "SLA at risk", tr: "SLA riskte" }, test: atRisk },
  { key: "all", label: { en: "All open", tr: "Tüm açıklar" }, test: isOpen },
  { key: "solved", label: { en: "Recently solved", tr: "Son çözülenler" }, test: (t) => !isOpen(t) },
];

export const queueTest = (q: QueueKey) => (t: Ticket) => isOpen(t) && t.queue === q;

const opening: Record<QueueKey, L> = {
  billing: {
    en: "Hello, our finance team flagged this while closing the month. Could you take a look and let us know what you need from us? Our account email is the one this came from.",
    tr: "Merhaba, finans ekibimiz ay kapanışında bunu fark etti. Bakıp bizden neye ihtiyacınız olduğunu iletir misiniz? Hesap e-postamız bu mesajın geldiği adres.",
  },
  technical: {
    en: "Hi team, this started this morning and affects two of our branches. Nothing changed on our side as far as I know. Happy to jump on a call if that's quicker.",
    tr: "Merhaba, bu sabah başladı ve iki şubemizi etkiliyor. Bildiğim kadarıyla bizim tarafta bir değişiklik olmadı. Daha hızlı olacaksa görüşmeye de katılabilirim.",
  },
  onboarding: {
    en: "Hi! We're still setting things up and got stuck here. Is there a guide, or could someone walk us through it this week?",
    tr: "Merhaba! Kurulumu sürdürüyoruz ve burada takıldık. Bir rehber var mı, ya da bu hafta biri bize adım adım gösterebilir mi?",
  },
  returns: {
    en: "Hello, I'm writing about my recent order. I've attached the order number and photos. Please let me know the next step.",
    tr: "Merhaba, son siparişimle ilgili yazıyorum. Sipariş numarasını ve fotoğrafları ekledim. Sonraki adımı bildirir misiniz?",
  },
};

const firstReply: Record<QueueKey, L> = {
  billing: { en: "Thanks for flagging it. I've pulled up the account and I'm checking the payment records now — I'll come back to you today.", tr: "Bildirdiğiniz için teşekkürler. Hesabı açtım, ödeme kayıtlarını kontrol ediyorum; bugün içinde dönüş yapacağım." },
  technical: { en: "Thanks — I can see the errors on our side too. Engineering has been looped in and I'll update you as soon as we know more.", tr: "Teşekkürler, hataları biz de görüyoruz. Yazılım ekibine ilettim; bilgi gelir gelmez sizi güncelleyeceğim." },
  onboarding: { en: "Happy to help. I've shared our setup guide and suggested two slots for a 30-minute walkthrough on Thursday.", tr: "Memnuniyetle. Kurulum rehberimizi paylaştım ve perşembe için 30 dakikalık iki görüşme saati önerdim." },
  returns: { en: "Sorry about that. I've opened a return for this order — you'll get the prepaid label by email within the hour.", tr: "Bunun için üzgünüz. Sipariş için iade kaydı açtım; ön ödemeli etiket bir saat içinde e-postanıza gelecek." },
};

/** The conversation for any ticket: the full sample thread for #4814, a plausible one otherwise. */
export function threadFor(t: Ticket): TicketMessage[] {
  if (t.id === sampleThread[0]!.ticketId) return sampleThread;
  const out: TicketMessage[] = [{ id: `${t.id}-1`, ticketId: t.id, authorId: "customer", kind: "reply", at: t.createdAt, body: opening[t.queue] }];
  if (t.firstRespondedAt && t.assigneeId) {
    out.push({ id: `${t.id}-2`, ticketId: t.id, authorId: t.assigneeId, kind: "reply", at: t.firstRespondedAt, body: firstReply[t.queue] });
  }
  if (t.solvedAt && t.assigneeId) {
    out.push({ id: `${t.id}-3`, ticketId: t.id, authorId: t.assigneeId, kind: "event", at: t.solvedAt, body: { en: `${person(t.assigneeId).name} marked this ticket as solved`, tr: `${person(t.assigneeId).name} talebi çözüldü olarak işaretledi` } });
  }
  return out;
}

/** "Now" as an ISO string, for messages sent from the composer. */
export const nowIso = () => minutesFromNow(0);

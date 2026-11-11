// Customer 360 for one account: Lodestar Freight, an at-risk logistics customer.
// Everything comes from the shared fixtures (companies, deals, tickets, invoices, people);
// only the account's history (calls, meetings, notes) and a health trend are added here.
import type { L } from "../../_shared/l10n";
import { companiesById, contactsOf, type Contact } from "../../_shared/companies";
import { dealsOf, type Deal } from "../../_shared/deals";
import { tickets as allTickets } from "../../_shared/tickets";
import { receivables } from "../../_shared/finance";
import { at, day, minutesFromNow } from "../../_shared/time";

export const company = companiesById["c-lodestar"]!;

/** The fixture contacts plus a finance contact for this account. */
export const contacts: Contact[] = [
  ...contactsOf(company.id),
  { id: "ct-lodestar-fin", companyId: company.id, name: "Bora Ekinci", email: "bora@lodestar.example.com", title: { en: "Finance Manager", tr: "Finans Müdürü" } },
];

/** Account deals: the shared pipeline deal plus the renewal and an earlier add-on. */
export const deals: Deal[] = [
  {
    id: "d-lodestar-renewal",
    title: "Lodestar Freight · 2027 renewal",
    companyId: company.id,
    ownerId: company.ownerId,
    stage: "negotiation",
    amount: { amount: "466800.00", currency: "TRY" },
    probability: 75,
    createdDate: day(-41),
    closeDate: day(12),
    stageAge: 19,
  },
  ...dealsOf(company.id),
  {
    id: "d-lodestar-telematics",
    title: "Lodestar Freight · Telematics add-on",
    companyId: company.id,
    ownerId: "p-tomas",
    stage: "won",
    amount: { amount: "84000.00", currency: "TRY" },
    probability: 100,
    createdDate: day(-210),
    closeDate: day(-176),
    stageAge: 176,
  },
];

export const tickets = allTickets.filter((t) => t.companyId === company.id);
export const invoices = receivables.filter((i) => i.companyId === company.id).sort((a, b) => b.issueDate.localeCompare(a.issueDate));

/** Weekly health score, oldest first (12 weeks). */
export const healthTrend = [78, 77, 79, 74, 72, 70, 66, 61, 58, 52, 46, 41];

/** What drives the score today. */
export const healthSignals: Array<{ id: string; label: L; tone: "danger" | "warning" | "success"; detail: L }> = [
  { id: "usage", label: { en: "Active seats down 31%", tr: "Aktif kullanıcı %31 azaldı" }, tone: "danger", detail: { en: "48 of 70 seats used in the last 30 days", tr: "Son 30 günde 70 lisansın 48'i kullanıldı" } },
  { id: "support", label: { en: "High-priority ticket open", tr: "Yüksek öncelikli talep açık" }, tone: "warning", detail: { en: "Waiting on our side", tr: "Bizim tarafımızda bekliyor" } },
  { id: "billing", label: { en: "Invoices paid on time", tr: "Faturalar zamanında ödendi" }, tone: "success", detail: { en: "4 of the last 5", tr: "Son 5 faturanın 4'ü" } },
];

export type HistoryKind = "deal" | "ticket" | "invoice" | "call" | "meeting" | "email" | "note";

export interface HistoryEvent {
  id: string;
  kind: HistoryKind;
  at: string;
  actorId?: string;
  title: L;
  body?: L;
}

/** Calls, meetings and emails logged on the account (newest first). */
export const loggedActivity: HistoryEvent[] = [
  { id: "h-1", kind: "call", at: at(0, "09:10"), actorId: "p-tomas", title: { en: "Call with Cem Arıkan", tr: "Cem Arıkan ile görüşme" }, body: { en: "Cem wants the renewal price held at this year's rate. Says the new dispatch team hasn't been trained yet — that explains the seat drop.", tr: "Cem yenilemede bu yılın fiyatının korunmasını istiyor. Yeni sevkiyat ekibi henüz eğitim almamış; lisans düşüşünün nedeni bu." } },
  { id: "h-2", kind: "email", at: at(-2, "16:42"), actorId: "p-tomas", title: { en: "Sent revised renewal proposal", tr: "Güncellenmiş yenileme teklifi gönderildi" }, body: { en: "Two options: 70 seats at list, or 55 seats with onboarding for the dispatch team included.", tr: "İki seçenek: liste fiyatından 70 lisans ya da sevkiyat ekibi eğitimi dahil 55 lisans." } },
  { id: "h-3", kind: "meeting", at: at(-6, "11:00"), actorId: "p-tomas", title: { en: "Quarterly review at the Mersin depot", tr: "Mersin deposunda çeyrek değerlendirmesi" }, body: { en: "Attended by Cem Arıkan and Seda Karaca. Route planning is the feature they use most; driver app adoption is low.", tr: "Cem Arıkan ve Seda Karaca katıldı. En çok rota planlama kullanılıyor; sürücü uygulaması benimsenmemiş." } },
  { id: "h-4", kind: "call", at: at(-13, "14:20"), actorId: "p-kerem", title: { en: "Escalation call about GPS sync", tr: "GPS senkronizasyonu için eskalasyon görüşmesi" } },
  { id: "h-5", kind: "email", at: at(-27, "10:05"), actorId: "p-tomas", title: { en: "Shared the 2027 price list", tr: "2027 fiyat listesi paylaşıldı" } },
];

export interface Note {
  id: string;
  authorId: string;
  at: string;
  body: L;
  pinned?: boolean;
  status?: "saving";
}

export const initialNotes: Note[] = [
  { id: "n-1", authorId: "p-tomas", at: minutesFromNow(-70), pinned: true, body: { en: "Renewal decision sits with Cem; Bora signs off anything above ₺400k. Don't send a discount before the dispatch training is booked.", tr: "Yenileme kararı Cem'de; ₺400 bin üstünü Bora onaylıyor. Sevkiyat eğitimi planlanmadan indirim gönderme." } },
  { id: "n-2", authorId: "p-kerem", at: at(-4, "17:30"), body: { en: "GPS sync issue traced to their old handheld firmware. Workaround sent; permanent fix ships with the December release.", tr: "GPS senkron sorunu eski el terminali yazılımından kaynaklanıyor. Geçici çözüm gönderildi; kalıcı düzeltme aralık sürümünde." } },
];

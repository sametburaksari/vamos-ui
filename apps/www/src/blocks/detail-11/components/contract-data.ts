// Contract record for detail-11: the enterprise subscription agreement between Kiln & Linen
// and Tidewell Logistics (a customer in _shared/companies). Clauses, versions, signers and
// renewal reminders. Every human-readable field is { en, tr }.
import type { L } from "../../_shared/l10n";
import { m, type Money } from "../../_shared/money";
import { companiesById, contactsOf } from "../../_shared/companies";
import { person } from "../../_shared/people";
import { at, day, daysBetween, TODAY } from "../../_shared/time";

export type ClauseRisk = "standard" | "negotiated" | "attention";

export interface Redline {
  /** Who proposed the change (name). */
  by: string;
  at: string;
  text: L;
  reason: L;
}

export interface Clause {
  id: string;
  number: string;
  title: L;
  body: L;
  risk: ClauseRisk;
  /** Changed in the draft (v4) compared with the agreement in force (v3). */
  changed?: boolean;
  /** Counterparty proposal waiting for a decision. */
  redline?: Redline;
  comments: number;
}

export const riskLabels: Record<ClauseRisk, L> = {
  standard: { en: "Standard", tr: "Standart" },
  negotiated: { en: "Negotiated", tr: "Müzakereli" },
  attention: { en: "Needs review", tr: "İnceleme gerekli" },
};

const customer = companiesById["c-tidewell"]!;
const [gokhan, nur] = contactsOf("c-tidewell");
const owner = person("p-noah");
const counter = person("p-defne");
const legal = person("p-felix");

export const contract = {
  id: "CTR-2026-0412",
  title: { en: "Enterprise subscription agreement", tr: "Kurumsal abonelik sözleşmesi" } satisfies L,
  amendment: { en: "Amendment 3 · 2027 renewal", tr: "Ek protokol 3 · 2027 yenilemesi" } satisfies L,
  customer,
  owner,
  legal,
  /** Term of the agreement in force. */
  start: "2026-03-08",
  end: "2027-03-07",
  noticeDays: 60,
  autoRenew: true,
  renewalMonths: 12,
  annualValue: m("1536000.00", "TRY") as Money,
  proposedAnnualValue: m("1689600.00", "TRY") as Money,
  paymentTerms: { en: "Quarterly in advance · net 30", tr: "Üç ayda bir peşin · 30 gün vade" } satisfies L,
  governingLaw: { en: "Türkiye · Istanbul courts", tr: "Türkiye · İstanbul mahkemeleri" } satisfies L,
};

export const noticeDeadline = day(daysBetween(TODAY, contract.end) - contract.noticeDays);

export const clauses: Clause[] = [
  {
    id: "cl-1",
    number: "1",
    title: { en: "Definitions", tr: "Tanımlar" },
    body: {
      en: "“Service” means the Kiln & Linen operations platform, its mobile apps and the API. “Customer data” means any data Tidewell Logistics or its users upload. “Business day” means a working day in Istanbul.",
      tr: "“Hizmet”, Kiln & Linen operasyon platformu, mobil uygulamaları ve API’si anlamına gelir. “Müşteri verisi”, Tidewell Logistics veya kullanıcılarının yüklediği her türlü veridir. “İş günü”, İstanbul’da çalışılan gündür.",
    },
    risk: "standard",
    comments: 0,
  },
  {
    id: "cl-2",
    number: "2",
    title: { en: "Service levels", tr: "Hizmet seviyeleri" },
    body: {
      en: "The Service is available 99.9% of each calendar month, excluding announced maintenance. Priority 1 incidents get a first response within 30 minutes, around the clock. Missed targets earn service credits of 5% of the monthly fee per 0.1% below target, capped at 25%.",
      tr: "Hizmet, duyurulan bakımlar hariç her takvim ayının %99,9’unda erişilebilirdir. Öncelik 1 olaylara günün her saati 30 dakika içinde ilk yanıt verilir. Hedefin her %0,1 altı için aylık ücretin %5’i kadar hizmet kredisi doğar; üst sınır %25’tir.",
    },
    risk: "negotiated",
    comments: 2,
  },
  {
    id: "cl-3",
    number: "3",
    title: { en: "Fees and payment", tr: "Ücretler ve ödeme" },
    body: {
      en: "Tidewell Logistics pays ₺1,689,600 a year for 420 seats and 6 warehouses, invoiced quarterly in advance. Invoices are due 30 days after issue. Late amounts carry the statutory default interest.",
      tr: "Tidewell Logistics, 420 kullanıcı ve 6 depo için yıllık ₺1.689.600 öder; fatura üç ayda bir peşin kesilir. Faturalar düzenlendikten 30 gün sonra ödenir. Geciken tutarlara yasal temerrüt faizi uygulanır.",
    },
    risk: "negotiated",
    changed: true,
    comments: 3,
  },
  {
    id: "cl-4",
    number: "4",
    title: { en: "Price adjustment", tr: "Fiyat güncellemesi" },
    body: {
      en: "Fees may rise once a year at renewal by no more than the annual consumer price index published by TÜİK, capped at 12%. Kiln & Linen gives written notice at least 90 days before the renewal date.",
      tr: "Ücretler yılda bir kez, yenilemede, TÜİK’in açıkladığı yıllık TÜFE oranını aşmayacak ve %12’yi geçmeyecek şekilde artırılabilir. Kiln & Linen, yenileme tarihinden en az 90 gün önce yazılı bildirim yapar.",
    },
    risk: "attention",
    changed: true,
    redline: {
      by: gokhan?.name ?? "Gökhan Bal",
      at: at(-1, "16:40"),
      text: {
        en: "Fees may rise once a year at renewal by no more than the annual consumer price index published by TÜİK, capped at 8%. Kiln & Linen gives written notice at least 120 days before the renewal date.",
        tr: "Ücretler yılda bir kez, yenilemede, TÜİK’in açıkladığı yıllık TÜFE oranını aşmayacak ve %8’i geçmeyecek şekilde artırılabilir. Kiln & Linen, yenileme tarihinden en az 120 gün önce yazılı bildirim yapar.",
      },
      reason: {
        en: "Our 2027 budget is approved with an 8% ceiling for software. 120 days lets procurement react before year-end.",
        tr: "2027 bütçemiz yazılım için %8 tavanla onaylandı. 120 gün, satın almanın yıl sonundan önce hareket edebilmesini sağlar.",
      },
    },
    comments: 5,
  },
  {
    id: "cl-5",
    number: "5",
    title: { en: "Term and renewal", tr: "Süre ve yenileme" },
    body: {
      en: "This agreement runs until 7 March 2027 and then renews automatically for 12 months at a time. Either party may stop the renewal by written notice at least 60 days before the end of the current term.",
      tr: "Bu sözleşme 7 Mart 2027’ye kadar geçerlidir ve sonra her seferinde 12 ay otomatik olarak yenilenir. Taraflardan biri, yürürlükteki dönemin bitiminden en az 60 gün önce yazılı bildirimle yenilemeyi durdurabilir.",
    },
    risk: "standard",
    comments: 0,
  },
  {
    id: "cl-6",
    number: "6",
    title: { en: "Data protection", tr: "Kişisel verilerin korunması" },
    body: {
      en: "Kiln & Linen processes customer data only on documented instructions and under KVKK. Customer data is stored in Türkiye. Personal data breaches are reported within 48 hours of discovery.",
      tr: "Kiln & Linen, müşteri verisini yalnızca belgelenmiş talimatlarla ve KVKK kapsamında işler. Müşteri verisi Türkiye’de saklanır. Kişisel veri ihlalleri, fark edildikten sonra 48 saat içinde bildirilir.",
    },
    risk: "negotiated",
    redline: {
      by: nur?.name ?? "Nur Şimşek",
      at: at(-2, "11:05"),
      text: {
        en: "Kiln & Linen processes customer data only on documented instructions and under KVKK. Customer data is stored in Türkiye. Personal data breaches are reported within 24 hours of discovery.",
        tr: "Kiln & Linen, müşteri verisini yalnızca belgelenmiş talimatlarla ve KVKK kapsamında işler. Müşteri verisi Türkiye’de saklanır. Kişisel veri ihlalleri, fark edildikten sonra 24 saat içinde bildirilir.",
      },
      reason: {
        en: "Aligns with our own incident policy, which our auditors check every year.",
        tr: "Denetçilerimizin her yıl kontrol ettiği kendi olay politikamızla uyumlu hale getirir.",
      },
    },
    comments: 1,
  },
  {
    id: "cl-7",
    number: "7",
    title: { en: "Limitation of liability", tr: "Sorumluluğun sınırlandırılması" },
    body: {
      en: "Each party’s total liability is limited to the fees paid in the 12 months before the claim. The limit does not apply to breaches of confidentiality, data protection or payment obligations.",
      tr: "Her bir tarafın toplam sorumluluğu, talepten önceki 12 ayda ödenen ücretlerle sınırlıdır. Bu sınır gizlilik, veri koruma veya ödeme yükümlülüklerinin ihlalinde uygulanmaz.",
    },
    risk: "attention",
    comments: 2,
  },
  {
    id: "cl-8",
    number: "8",
    title: { en: "Termination", tr: "Fesih" },
    body: {
      en: "Either party may end the agreement if the other materially breaches it and does not cure the breach within 30 days of written notice. On termination, Kiln & Linen exports all customer data within 15 business days.",
      tr: "Taraflardan biri, diğer tarafın sözleşmeyi esaslı şekilde ihlal etmesi ve yazılı bildirimden itibaren 30 gün içinde ihlali gidermemesi halinde sözleşmeyi feshedebilir. Fesih halinde Kiln & Linen tüm müşteri verisini 15 iş günü içinde dışa aktarır.",
    },
    risk: "standard",
    comments: 0,
  },
  {
    id: "cl-9",
    number: "9",
    title: { en: "Governing law", tr: "Uygulanacak hukuk" },
    body: {
      en: "This agreement is governed by the laws of the Republic of Türkiye. The courts and enforcement offices of Istanbul (Anadolu) have jurisdiction.",
      tr: "Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. İstanbul (Anadolu) mahkemeleri ve icra daireleri yetkilidir.",
    },
    risk: "standard",
    comments: 0,
  },
];

export interface ContractVersion {
  id: string;
  label: L;
  summary: L;
  createdAt: string;
  author: string;
  kind: "manual" | "published" | "system";
  current?: boolean;
  terms: {
    annualFee: string;
    seats: number;
    priceCap: string;
    noticeDays: number;
    liability: L;
    uptime: string;
    breachHours: number;
  };
}

const liability12 = { en: "12 months of fees", tr: "12 aylık ücret" };

export const versions: ContractVersion[] = [
  {
    id: "v4",
    label: { en: "v4 · Amendment 3 (draft)", tr: "v4 · Ek protokol 3 (taslak)" },
    summary: { en: "2027 renewal: 420 seats, fee +10%, price cap 12%", tr: "2027 yenilemesi: 420 kullanıcı, ücret +%10, fiyat tavanı %12" },
    createdAt: at(-3, "14:12"),
    author: owner.name,
    kind: "manual",
    current: true,
    terms: { annualFee: "₺1,689,600", seats: 420, priceCap: "12%", noticeDays: 60, liability: liability12, uptime: "99.9%", breachHours: 48 },
  },
  {
    id: "v3",
    label: { en: "v3 · Amendment 2 (in force)", tr: "v3 · Ek protokol 2 (yürürlükte)" },
    summary: { en: "Signed 2026-03-02 · added 2 warehouses", tr: "2026-03-02’de imzalandı · 2 depo eklendi" },
    createdAt: "2026-03-02T17:30:00+03:00",
    author: counter.name,
    kind: "published",
    terms: { annualFee: "₺1,536,000", seats: 380, priceCap: "15%", noticeDays: 60, liability: liability12, uptime: "99.9%", breachHours: 48 },
  },
  {
    id: "v2",
    label: { en: "v2 · Amendment 1", tr: "v2 · Ek protokol 1" },
    summary: { en: "Signed 2024-02-20 · SLA credits introduced", tr: "2024-02-20’de imzalandı · SLA kredileri eklendi" },
    createdAt: "2024-02-20T12:00:00+03:00",
    author: counter.name,
    kind: "published",
    terms: { annualFee: "₺912,000", seats: 260, priceCap: "20%", noticeDays: 30, liability: liability12, uptime: "99.5%", breachHours: 72 },
  },
  {
    id: "v1",
    label: { en: "v1 · Original agreement", tr: "v1 · İlk sözleşme" },
    summary: { en: "Signed 2022-03-08", tr: "2022-03-08’de imzalandı" },
    createdAt: "2022-03-08T10:00:00+03:00",
    author: counter.name,
    kind: "published",
    terms: { annualFee: "₺384,000", seats: 120, priceCap: "—", noticeDays: 30, liability: { en: "6 months of fees", tr: "6 aylık ücret" }, uptime: "99.5%", breachHours: 72 },
  },
];

export type SignerState = "waiting" | "sent" | "viewed" | "signed" | "declined";

export const initialSigners: Array<{ id: string; name: string; email: string; role: L; status: SignerState; at?: string }> = [
  { id: "sg-1", name: owner.name, email: owner.email, role: { en: "Account owner", tr: "Müşteri sorumlusu" }, status: "signed", at: at(-3, "15:02") },
  { id: "sg-2", name: gokhan?.name ?? "Gökhan Bal", email: gokhan?.email ?? "gokhan@tidewell.example.com", role: { en: "VP Operations", tr: "Operasyon Bşk. Yrd." }, status: "viewed", at: at(-1, "16:22") },
  { id: "sg-3", name: nur?.name ?? "Nur Şimşek", email: nur?.email ?? "nur@tidewell.example.com", role: { en: "Data protection", tr: "Veri koruma" }, status: "waiting" },
  { id: "sg-4", name: counter.name, email: counter.email, role: { en: "Countersigns", tr: "Karşı imza" }, status: "waiting" },
];

export type ReminderChannel = "email" | "task";

export interface Reminder {
  id: string;
  /** Days before the anchor. */
  daysBefore: number;
  anchor: "notice" | "end";
  channel: ReminderChannel;
  recipients: string[];
  on: boolean;
}

export const anchorLabels: Record<Reminder["anchor"], L> = {
  notice: { en: "before the notice deadline", tr: "bildirim son gününden önce" },
  end: { en: "before the term ends", tr: "dönem bitmeden önce" },
};

export const channelLabels: Record<ReminderChannel, L> = {
  email: { en: "Email", tr: "E-posta" },
  task: { en: "Task", tr: "Görev" },
};

export const initialReminders: Reminder[] = [
  { id: "rm-1", daysBefore: 30, anchor: "notice", channel: "email", recipients: [owner.name, legal.name], on: true },
  { id: "rm-2", daysBefore: 7, anchor: "notice", channel: "task", recipients: [owner.name], on: true },
  { id: "rm-3", daysBefore: 90, anchor: "end", channel: "email", recipients: [owner.name, counter.name], on: true },
  { id: "rm-4", daysBefore: 14, anchor: "end", channel: "email", recipients: [legal.name], on: false },
];

export const reminderPeople = [owner, legal, counter, person("p-aylin"), person("p-gizem")];

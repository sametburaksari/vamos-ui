// Partner record for detail-12: Meridyen Digital (a Gold reseller from _shared/partners) with its
// tier requirements, deal registrations, MDF claims and certifications. Copy is { en, tr }.
import type { L } from "../../_shared/l10n";
import type { Money } from "../../_shared/money";
import { companies } from "../../_shared/companies";
import { certifications as sharedCerts, dealRegistrations as sharedRegs, partners, tierLabels, type Certification, type DealRegistration, type PartnerTier } from "../../_shared/partners";
import { person } from "../../_shared/people";
import { at, day } from "../../_shared/time";

export { tierLabels, type PartnerTier };

export const partner = partners.find((p) => p.id === "pt-1")!;
export const manager = person(partner.managerId);

const usd = (n: number): Money => ({ amount: n.toFixed(2), currency: "USD" });

export interface TierStep {
  tier: PartnerTier;
  revenue: number;
  certified: number;
  discount: number;
  mdfShare: L;
}

/** What each tier needs (sourced revenue in USD a year, certified staff) and gives. */
export const tierLadder: TierStep[] = [
  { tier: "registered", revenue: 0, certified: 1, discount: 10, mdfShare: { en: "No MDF", tr: "Pazarlama fonu yok" } },
  { tier: "silver", revenue: 50_000, certified: 2, discount: 15, mdfShare: { en: "3% of sourced revenue", tr: "Kaynaklanan gelirin %3’ü" } },
  { tier: "gold", revenue: 150_000, certified: 3, discount: 20, mdfShare: { en: "5% of sourced revenue", tr: "Kaynaklanan gelirin %5’i" } },
  { tier: "platinum", revenue: 500_000, certified: 8, discount: 25, mdfShare: { en: "6% + co-marketing", tr: "%6 + ortak pazarlama" } },
];

export const tierBenefits: Array<{ en: string; tr: string; from: PartnerTier }> = [
  { en: "Partner portal and sales kit", tr: "Partner portalı ve satış kiti", from: "registered" },
  { en: "Deal registration protection, 90 days", tr: "90 gün fırsat kaydı koruması", from: "silver" },
  { en: "Named partner manager", tr: "Atanmış partner yöneticisi", from: "gold" },
  { en: "Quarterly business reviews", tr: "Üç aylık iş değerlendirmesi", from: "gold" },
  { en: "Listed in the partner directory", tr: "Partner dizininde yer alma", from: "gold" },
  { en: "Early access to the roadmap", tr: "Yol haritasına erken erişim", from: "platinum" },
  { en: "Joint events and case studies", tr: "Ortak etkinlik ve başarı hikâyeleri", from: "platinum" },
];

export type RegStatus = DealRegistration["status"];

export interface Registration extends DealRegistration {
  contact: string;
  product: L;
  /** Prospect is already a customer or has an open deal of ours. */
  conflict?: L;
  note?: L;
}

const extra: Registration[] = [
  {
    id: "dr-6",
    partnerId: "pt-1",
    prospect: "Larkspur Analytics",
    value: usd(46_500),
    submitted: day(-1),
    expires: day(89),
    status: "submitted",
    contact: "Priya Menon",
    product: { en: "Operations platform · Scale", tr: "Operasyon platformu · Ölçek" },
    conflict: { en: "Already a direct customer (Scale plan, owner Tomás Herrera)", tr: "Zaten doğrudan müşteri (Ölçek paketi, sorumlu Tomás Herrera)" },
  },
  {
    id: "dr-7",
    partnerId: "pt-1",
    prospect: "Feribot Café Group",
    value: usd(17_800),
    submitted: day(-2),
    expires: day(88),
    status: "submitted",
    contact: "Ilgın Saraç",
    product: { en: "Point of sale · 14 sites", tr: "Satış noktası · 14 şube" },
  },
  {
    id: "dr-8",
    partnerId: "pt-1",
    prospect: "Bakır Atölye",
    value: usd(6_400),
    submitted: day(-22),
    expires: day(68),
    status: "approved",
    contact: "Doruk Er",
    product: { en: "Operations platform · Growth", tr: "Operasyon platformu · Büyüme" },
  },
];

const details: Record<string, Pick<Registration, "contact" | "product" | "conflict" | "note">> = {
  "dr-1": { contact: "Levent Aydemir", product: { en: "Operations platform · Scale", tr: "Operasyon platformu · Ölçek" } },
  "dr-2": { contact: "Volkan Ergin", product: { en: "Inventory add-on", tr: "Stok eklentisi" } },
  "dr-3": { contact: "Ebru Taş", product: { en: "Operations platform · Growth", tr: "Operasyon platformu · Büyüme" } },
  "dr-4": { contact: "Hülya Demir", product: { en: "Point of sale · 6 sites", tr: "Satış noktası · 6 şube" } },
  "dr-5": {
    contact: "Cem Arıkan",
    product: { en: "Fleet module", tr: "Filo modülü" },
    note: { en: "Rejected: existing customer, renewal handled by the direct team.", tr: "Reddedildi: mevcut müşteri, yenilemeyi doğrudan ekip yürütüyor." },
  },
};

export const registrations: Registration[] = [...extra, ...sharedRegs.map((r) => ({ ...r, ...details[r.id]! }))].sort((a, b) => b.submitted.localeCompare(a.submitted));

export const customerNames = new Set(companies.filter((c) => c.lifecycle === "customer" || c.lifecycle === "at-risk").map((c) => c.name));

export type ClaimStatus = "draft" | "submitted" | "approved" | "paid" | "rejected";

export interface MdfClaim {
  id: string;
  activity: L;
  kind: "event" | "digital" | "content" | "training";
  amount: Money;
  date: string;
  status: ClaimStatus;
  leads?: number;
  proof: boolean;
}

export const claimStatusLabels: Record<ClaimStatus, L> = {
  draft: { en: "Draft", tr: "Taslak" },
  submitted: { en: "Submitted", tr: "Gönderildi" },
  approved: { en: "Approved", tr: "Onaylandı" },
  paid: { en: "Paid", tr: "Ödendi" },
  rejected: { en: "Rejected", tr: "Reddedildi" },
};

export const claimKindLabels: Record<MdfClaim["kind"], L> = {
  event: { en: "Event", tr: "Etkinlik" },
  digital: { en: "Digital ads", tr: "Dijital reklam" },
  content: { en: "Content", tr: "İçerik" },
  training: { en: "Training", tr: "Eğitim" },
};

export const mdfClaims: MdfClaim[] = [
  { id: "md-1", activity: { en: "Retail ops breakfast, Izmir", tr: "Perakende operasyon kahvaltısı, İzmir" }, kind: "event", amount: usd(3_500), date: day(-9), status: "submitted", leads: 22, proof: true },
  { id: "md-2", activity: { en: "Search ads · Q4 POS campaign", tr: "Arama reklamları · 4. çeyrek POS kampanyası" }, kind: "digital", amount: usd(4_200), date: day(-15), status: "approved", leads: 61, proof: true },
  { id: "md-3", activity: { en: "Case study video · Kuzey Outdoor", tr: "Başarı hikâyesi videosu · Kuzey Outdoor" }, kind: "content", amount: usd(2_400), date: day(-38), status: "paid", proof: true },
  { id: "md-4", activity: { en: "Booth at a hospitality trade fair", tr: "Turizm fuarında stant" }, kind: "event", amount: usd(5_500), date: day(-70), status: "paid", leads: 140, proof: true },
  { id: "md-5", activity: { en: "Implementer bootcamp for 4 staff", tr: "4 kişilik uygulayıcı eğitim kampı" }, kind: "training", amount: usd(1_200), date: day(-4), status: "draft", proof: false },
  { id: "md-6", activity: { en: "Printed catalogue", tr: "Basılı katalog" }, kind: "content", amount: usd(800), date: day(-52), status: "rejected", proof: false },
];

export interface Cert extends Certification {
  track: "implementation" | "sales" | "admin";
}

export const certs: Cert[] = [
  ...sharedCerts.map((c) => ({ ...c, track: (c.name.en.startsWith("Sales") ? "sales" : c.name.en.startsWith("Admin") ? "admin" : "implementation") as Cert["track"] })),
  { id: "ce-5", partnerId: "pt-1", name: { en: "Certified Implementer", tr: "Sertifikalı Uygulayıcı" }, holder: "Selin Varol", earned: day(-210), expires: day(155), track: "implementation" },
  { id: "ce-6", partnerId: "pt-1", name: { en: "Sales Professional", tr: "Satış Uzmanı" }, holder: "Irmak Talay", earned: day(-330), expires: day(35), track: "sales" },
  { id: "ce-7", partnerId: "pt-1", name: { en: "Certified Implementer", tr: "Sertifikalı Uygulayıcı" }, holder: "Kaan Ateşoğlu", earned: day(-30), expires: day(335), track: "implementation" },
  { id: "ce-8", partnerId: "pt-1", name: { en: "Admin & Security", tr: "Yönetim ve Güvenlik" }, holder: "Selin Varol", earned: day(-500), expires: day(-135), track: "admin" },
];

export const nextReview = at(9, "14:00");

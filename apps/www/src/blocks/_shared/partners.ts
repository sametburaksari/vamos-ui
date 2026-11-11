// Partner programme (PRM): resellers with tiers, deal registrations, MDF funds and
// certifications. Used by detail-12 and the agency/partner shell (shell-08).
import type { L } from "./l10n";
import type { Money } from "./money";
import { day } from "./time";

export type PartnerTier = "registered" | "silver" | "gold" | "platinum";
export type RegistrationStatus = "submitted" | "approved" | "rejected" | "won" | "expired";

export interface Partner {
  id: string;
  name: string;
  domain: string;
  tier: PartnerTier;
  region: L;
  managerId: string;
  since: string;
  /** Partner-sourced revenue this year. */
  sourcedRevenue: Money;
  /** Revenue needed for the next tier (undefined at the top tier). */
  nextTierAt?: Money;
  mdf: { allocated: Money; claimed: Money; approved: Money };
  certifiedStaff: number;
}

export interface DealRegistration {
  id: string;
  partnerId: string;
  prospect: string;
  value: Money;
  submitted: string;
  expires: string;
  status: RegistrationStatus;
}

export interface Certification {
  id: string;
  partnerId: string;
  name: L;
  holder: string;
  earned: string;
  expires: string;
}

export const tierLabels: Record<PartnerTier, L> = {
  registered: { en: "Registered", tr: "Kayıtlı" },
  silver: { en: "Silver", tr: "Gümüş" },
  gold: { en: "Gold", tr: "Altın" },
  platinum: { en: "Platinum", tr: "Platin" },
};

export const registrationStatusLabels: Record<RegistrationStatus, L> = {
  submitted: { en: "Awaiting review", tr: "İnceleme bekliyor" },
  approved: { en: "Approved", tr: "Onaylandı" },
  rejected: { en: "Rejected", tr: "Reddedildi" },
  won: { en: "Closed won", tr: "Kazanıldı" },
  expired: { en: "Expired", tr: "Süresi doldu" },
};

const usd = (n: number): Money => ({ amount: n.toFixed(2), currency: "USD" });

export const partners: Partner[] = [
  { id: "pt-1", name: "Meridyen Digital", domain: "meridyen.example.com", tier: "gold", region: { en: "Türkiye", tr: "Türkiye" }, managerId: "p-noah", since: day(-900), sourcedRevenue: usd(412_000), nextTierAt: usd(500_000), mdf: { allocated: usd(24_000), claimed: usd(15_600), approved: usd(12_100) }, certifiedStaff: 9 },
  { id: "pt-2", name: "Brightline Integrators", domain: "brightline.example.com", tier: "platinum", region: { en: "DACH", tr: "DACH" }, managerId: "p-noah", since: day(-1400), sourcedRevenue: usd(1_180_000), mdf: { allocated: usd(60_000), claimed: usd(41_000), approved: usd(41_000) }, certifiedStaff: 23 },
  { id: "pt-3", name: "Sahil Systems", domain: "sahil.example.com", tier: "silver", region: { en: "Gulf", tr: "Körfez" }, managerId: "p-ines", since: day(-420), sourcedRevenue: usd(96_000), nextTierAt: usd(150_000), mdf: { allocated: usd(8_000), claimed: usd(2_400), approved: usd(2_400) }, certifiedStaff: 3 },
  { id: "pt-4", name: "Coastline Retail Tech", domain: "coastline.example.com", tier: "registered", region: { en: "Iberia", tr: "İberya" }, managerId: "p-tomas", since: day(-60), sourcedRevenue: usd(0), nextTierAt: usd(50_000), mdf: { allocated: usd(0), claimed: usd(0), approved: usd(0) }, certifiedStaff: 1 },
];

export const dealRegistrations: DealRegistration[] = [
  { id: "dr-1", partnerId: "pt-1", prospect: "Orchard & Oak Furniture", value: usd(38_000), submitted: day(-3), expires: day(87), status: "submitted" },
  { id: "dr-2", partnerId: "pt-1", prospect: "Yelken Marine Supply", value: usd(12_500), submitted: day(-40), expires: day(50), status: "approved" },
  { id: "dr-3", partnerId: "pt-1", prospect: "Kuzey Outdoor", value: usd(21_000), submitted: day(-110), expires: day(-20), status: "won" },
  { id: "dr-4", partnerId: "pt-1", prospect: "Saffronia Kitchens", value: usd(9_000), submitted: day(-130), expires: day(-40), status: "expired" },
  { id: "dr-5", partnerId: "pt-1", prospect: "Lodestar Freight", value: usd(54_000), submitted: day(-8), expires: day(82), status: "rejected" },
];

export const certifications: Certification[] = [
  { id: "ce-1", partnerId: "pt-1", name: { en: "Certified Implementer", tr: "Sertifikalı Uygulayıcı" }, holder: "Okan Sevim", earned: day(-300), expires: day(65) },
  { id: "ce-2", partnerId: "pt-1", name: { en: "Certified Implementer", tr: "Sertifikalı Uygulayıcı" }, holder: "Irmak Talay", earned: day(-120), expires: day(245) },
  { id: "ce-3", partnerId: "pt-1", name: { en: "Sales Professional", tr: "Satış Uzmanı" }, holder: "Barış Yener", earned: day(-400), expires: day(-35) },
  { id: "ce-4", partnerId: "pt-1", name: { en: "Admin & Security", tr: "Yönetim ve Güvenlik" }, holder: "Okan Sevim", earned: day(-40), expires: day(325) },
];

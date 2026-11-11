// Quote Q-2026-0418 for Velvet Anchor Hotels: a service catalogue with unit costs (for margin),
// the deal-desk discount rules, the customer's change request on revision 2 and the signers.
// People and the company come from the shared fixtures, so the same faces show up in the CRM.
import type { LineItem } from "@vamos-ui/react/business";
import { companiesById, contacts } from "../../_shared/companies";
import { dealsOf } from "../../_shared/deals";
import type { L } from "../../_shared/l10n";
import { person } from "../../_shared/people";
import { at, day } from "../../_shared/time";

export const company = companiesById["c-velvet"]!;
const companyContacts = contacts.filter((x) => x.companyId === company.id);
/** Director of Guest Services, signs first. */
export const champion = companyContacts.find((x) => x.name === "Kaan Toprak")!;
/** Finance Controller, signs second and asked for revision 3. */
export const controller = companyContacts.find((x) => x.name === "Pınar Ilgaz")!;
export const preparedBy = person("p-tomas");
export const salesManager = person("p-noah");
export const financeManager = person("p-felix");
export const deal = dealsOf(company.id).find((d) => d.stage !== "won" && d.stage !== "lost") ?? dealsOf(company.id)[0];

export const quote = {
  number: "Q-2026-0418",
  revision: 3,
  title: { en: "Guest platform · six-property rollout", tr: "Misafir platformu · altı otel kurulumu" } satisfies L,
  createdAt: day(-15),
  validUntil: day(12),
  currency: "TRY" as const,
};

export interface CatalogueItem {
  id: string;
  code: string;
  name: L;
  unit: string;
  /** Net list price, decimal string. */
  price: string;
  /** Delivery cost per unit — margin only, never shown to the customer. */
  cost: string;
  /** Billed once or every year. */
  recurring: boolean;
}

export const catalogue: CatalogueItem[] = [
  { id: "sc-ann", code: "SC-ANN", name: { en: "Scale plan · annual licence (per seat)", tr: "Ölçek paketi · yıllık lisans (kullanıcı başı)" }, unit: "seat", price: "3600.00", cost: "900.00", recurring: true },
  { id: "pr-out", code: "PR-OUT", name: { en: "Property rollout (per hotel)", tr: "Otel kurulumu (otel başı)" }, unit: "hotel", price: "42000.00", cost: "26000.00", recurring: false },
  { id: "onb-pkg", code: "ONB-PKG", name: { en: "Onboarding & data migration", tr: "Kurulum ve veri taşıma" }, unit: "package", price: "85000.00", cost: "52000.00", recurring: false },
  { id: "trn-day", code: "TRN-DAY", name: { en: "On-site training day", tr: "Yerinde eğitim günü" }, unit: "day", price: "18500.00", cost: "9000.00", recurring: false },
  { id: "sup-pri", code: "SUP-PRI", name: { en: "Priority support · 24/7, annual", tr: "Öncelikli destek · 7/24, yıllık" }, unit: "year", price: "64000.00", cost: "20000.00", recurring: true },
  { id: "api-chm", code: "API-CHM", name: { en: "Channel manager & API add-on, annual", tr: "Kanal yöneticisi ve API eklentisi, yıllık" }, unit: "year", price: "48000.00", cost: "8000.00", recurring: true },
  { id: "sso-aud", code: "SSO-AUD", name: { en: "SSO & audit log, annual", tr: "SSO ve denetim kaydı, yıllık" }, unit: "year", price: "24000.00", cost: "3000.00", recurring: true },
];
export const catalogueById: Record<string, CatalogueItem> = Object.fromEntries(catalogue.map((i) => [i.id, i]));

export const units = ["seat", "hotel", "package", "day", "year"];
export const unitLabels: Record<string, L> = {
  seat: { en: "seat", tr: "kullanıcı" },
  hotel: { en: "hotel", tr: "otel" },
  package: { en: "package", tr: "paket" },
  day: { en: "day", tr: "gün" },
  year: { en: "year", tr: "yıl" },
};

/** Revision 3 as the rep left it this morning. */
export const initialLines = (lang: "en" | "tr"): LineItem[] => [
  { id: "ln-1", itemId: "sc-ann", description: catalogueById["sc-ann"]!.name[lang], quantity: "180", unit: "seat", unitPrice: "3600.00", discount: { type: "percent", value: "10" }, taxRate: "20" },
  { id: "ln-2", itemId: "pr-out", description: catalogueById["pr-out"]!.name[lang], quantity: "6", unit: "hotel", unitPrice: "42000.00", taxRate: "20" },
  { id: "ln-3", itemId: "onb-pkg", description: catalogueById["onb-pkg"]!.name[lang], quantity: "1", unit: "package", unitPrice: "85000.00", taxRate: "20" },
  { id: "ln-4", itemId: "trn-day", description: catalogueById["trn-day"]!.name[lang], quantity: "3", unit: "day", unitPrice: "18500.00", taxRate: "20" },
  { id: "ln-5", itemId: "sup-pri", description: catalogueById["sup-pri"]!.name[lang], quantity: "1", unit: "year", unitPrice: "64000.00", taxRate: "20" },
];

/** Deal desk: effective discount (all discounts ÷ list subtotal) decides who must approve. */
export const discountBands = [
  { upTo: 10, approver: null, label: { en: "Rep can send", tr: "Temsilci gönderebilir" } },
  { upTo: 20, approver: salesManager, label: { en: "Sales manager approves", tr: "Satış müdürü onaylar" } },
  { upTo: 100, approver: financeManager, label: { en: "Finance approves", tr: "Finans onaylar" } },
] as const;
export const MIN_MARGIN = 55;

export const paymentTerms: Array<{ value: string; label: L }> = [
  { value: "net30", label: { en: "Net 30", tr: "30 gün vadeli" } },
  { value: "net45", label: { en: "Net 45", tr: "45 gün vadeli" } },
  { value: "split", label: { en: "50% on signature, 50% at go-live", tr: "%50 imzada, %50 canlıya geçişte" } },
];
export const billingCycles: Array<{ value: string; label: L }> = [
  { value: "annual", label: { en: "Annual, in advance", tr: "Yıllık, peşin" } },
  { value: "quarterly", label: { en: "Quarterly, in advance", tr: "Üç aylık, peşin" } },
];

export const changeRequest = {
  by: controller,
  at: at(-6, "16:12"),
  revision: 2,
  body: {
    en: "The licence price works for us. Could you split onboarding across two invoices, and is there anything you can do on the per-hotel rollout fee? We are budgeting all six properties in this fiscal year.",
    tr: "Lisans fiyatı bizim için uygun. Kurulum bedelini iki faturaya bölebilir misiniz, otel başı kurulum ücretinde bir şey yapabilir misiniz? Altı oteli de bu mali yıl bütçesine koyuyoruz.",
  } satisfies L,
};

export type QuoteEvent = { id: string; at: string; who: string; kind: "created" | "sent" | "viewed" | "changes" | "edited" | "approved" | "approval"; text: L };

export const history: QuoteEvent[] = [
  { id: "e1", at: at(-15, "11:05"), who: preparedBy.name, kind: "created", text: { en: "created revision 1 from the deal", tr: "fırsattan 1. revizyonu oluşturdu" } },
  { id: "e2", at: at(-14, "09:40"), who: preparedBy.name, kind: "sent", text: { en: "sent revision 1 to Kaan Toprak", tr: "1. revizyonu Kaan Toprak'a gönderdi" } },
  { id: "e3", at: at(-9, "14:22"), who: preparedBy.name, kind: "sent", text: { en: "sent revision 2 with the channel manager removed", tr: "kanal yöneticisi çıkarılmış 2. revizyonu gönderdi" } },
  { id: "e4", at: at(-8, "10:03"), who: "Kaan Toprak", kind: "viewed", text: { en: "viewed revision 2 · 4 min", tr: "2. revizyonu görüntüledi · 4 dk" } },
  { id: "e5", at: at(-6, "15:58"), who: "Pınar Ilgaz", kind: "viewed", text: { en: "viewed revision 2 · 11 min", tr: "2. revizyonu görüntüledi · 11 dk" } },
  { id: "e6", at: at(-6, "16:12"), who: "Pınar Ilgaz", kind: "changes", text: { en: "requested changes on revision 2", tr: "2. revizyonda değişiklik istedi" } },
  { id: "e7", at: at(0, "09:12"), who: preparedBy.name, kind: "edited", text: { en: "started revision 3", tr: "3. revizyonu başlattı" } },
];

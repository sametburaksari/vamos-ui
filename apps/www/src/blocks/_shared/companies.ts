// Fictional customer companies and their contacts. Names are invented; domains are
// subdomains of example.com and phones the reserved +90 216 000 00 00 pattern.
import type { L } from "./l10n";
import type { Money } from "./money";

export type Industry = "retail" | "hospitality" | "healthcare" | "logistics" | "manufacturing" | "software" | "education" | "professional";
export type CompanySize = "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";
export type Lifecycle = "lead" | "trial" | "customer" | "at-risk" | "churned";
export type Plan = "starter" | "growth" | "scale" | "enterprise";

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: Industry;
  size: CompanySize;
  city: string;
  country: string;
  lifecycle: Lifecycle;
  plan: Plan;
  /** Monthly recurring revenue, decimal string. */
  mrr: Money;
  /** Account owner (people.ts id). */
  ownerId: string;
  /** YYYY-MM-DD. */
  customerSince: string;
  /** 0–100 health score. */
  health: number;
  phone: string;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  email: string;
  title: L;
  primary?: boolean;
}

export const industryLabels: Record<Industry, L> = {
  retail: { en: "Retail", tr: "Perakende" },
  hospitality: { en: "Hospitality", tr: "Konaklama" },
  healthcare: { en: "Healthcare", tr: "Sağlık" },
  logistics: { en: "Logistics", tr: "Lojistik" },
  manufacturing: { en: "Manufacturing", tr: "Üretim" },
  software: { en: "Software", tr: "Yazılım" },
  education: { en: "Education", tr: "Eğitim" },
  professional: { en: "Professional services", tr: "Profesyonel hizmetler" },
};

export const lifecycleLabels: Record<Lifecycle, L> = {
  lead: { en: "Lead", tr: "Aday" },
  trial: { en: "Trial", tr: "Deneme" },
  customer: { en: "Customer", tr: "Müşteri" },
  "at-risk": { en: "At risk", tr: "Risk altında" },
  churned: { en: "Churned", tr: "Kayıp" },
};

export const planLabels: Record<Plan, L> = {
  starter: { en: "Starter", tr: "Başlangıç" },
  growth: { en: "Growth", tr: "Büyüme" },
  scale: { en: "Scale", tr: "Ölçek" },
  enterprise: { en: "Enterprise", tr: "Kurumsal" },
};

type Row = [id: string, name: string, slug: string, industry: Industry, size: CompanySize, city: string, country: string, lifecycle: Lifecycle, plan: Plan, mrr: string, cur: Money["currency"], owner: string, since: string, health: number];

const rows: Row[] = [
  ["c-quill", "Quillfeather Books", "quillfeather", "retail", "11-50", "Istanbul", "TR", "customer", "growth", "18400.00", "TRY", "p-aylin", "2024-03-12", 82],
  ["c-halcyon", "Halcyon Ferments", "halcyon", "manufacturing", "51-200", "Bursa", "TR", "customer", "scale", "42750.00", "TRY", "p-aylin", "2023-09-04", 91],
  ["c-brightwater", "Brightwater Optics", "brightwater", "healthcare", "201-1000", "Rotterdam", "NL", "customer", "enterprise", "6200.00", "EUR", "p-noah", "2022-11-21", 74],
  ["c-lodestar", "Lodestar Freight", "lodestar", "logistics", "201-1000", "Mersin", "TR", "at-risk", "scale", "38900.00", "TRY", "p-tomas", "2023-05-30", 41],
  ["c-northpaw", "Northpaw Pet Supply", "northpaw", "retail", "51-200", "Leeds", "GB", "customer", "growth", "1450.00", "USD", "p-ines", "2025-01-08", 88],
  ["c-velvet", "Velvet Anchor Hotels", "velvetanchor", "hospitality", "1000+", "Antalya", "TR", "customer", "enterprise", "96500.00", "TRY", "p-noah", "2021-06-15", 79],
  ["c-calderwood", "Calderwood Labs", "calderwood", "software", "11-50", "Austin", "US", "trial", "growth", "0.00", "USD", "p-tomas", "2026-11-03", 63],
  ["c-yelken", "Yelken Marine Supply", "yelken", "retail", "11-50", "Izmir", "TR", "customer", "starter", "4900.00", "TRY", "p-ines", "2025-07-19", 70],
  ["c-kuzey", "Kuzey Outdoor", "kuzeyoutdoor", "retail", "51-200", "Trabzon", "TR", "customer", "growth", "21300.00", "TRY", "p-aylin", "2024-10-02", 86],
  ["c-orchard", "Orchard & Oak Furniture", "orchardoak", "manufacturing", "201-1000", "Kayseri", "TR", "lead", "scale", "0.00", "TRY", "p-tomas", "2026-10-28", 50],
  ["c-tessellate", "Tessellate Architects", "tessellate", "professional", "11-50", "Copenhagen", "DK", "customer", "growth", "980.00", "EUR", "p-ines", "2024-02-26", 93],
  ["c-saffronia", "Saffronia Kitchens", "saffronia", "hospitality", "51-200", "Gaziantep", "TR", "churned", "growth", "0.00", "TRY", "p-noah", "2023-01-17", 12],
  ["c-pinewood", "Pinewood Learning Centre", "pinewood", "education", "51-200", "Ankara", "TR", "customer", "scale", "15600.00", "TRY", "p-aylin", "2025-04-11", 77],
  ["c-mistral", "Mistral Dental Studio", "mistraldental", "healthcare", "11-50", "Marseille", "FR", "at-risk", "starter", "240.00", "EUR", "p-ines", "2025-09-23", 38],
  ["c-tidewell", "Tidewell Logistics", "tidewell", "logistics", "1000+", "Kocaeli", "TR", "customer", "enterprise", "128000.00", "TRY", "p-noah", "2022-03-08", 84],
  ["c-larkspur", "Larkspur Analytics", "larkspur", "software", "51-200", "Toronto", "CA", "customer", "scale", "3400.00", "USD", "p-tomas", "2024-08-14", 90],
];

export const companies: Company[] = rows.map(([id, name, slug, industry, size, city, country, lifecycle, plan, mrr, currency, ownerId, customerSince, health], i) => ({
  id,
  name,
  domain: `${slug}.example.com`,
  industry,
  size,
  city,
  country,
  lifecycle,
  plan,
  mrr: { amount: mrr, currency },
  ownerId,
  customerSince,
  health,
  phone: `+90 216 000 00 ${String(40 + i).padStart(2, "0")}`,
}));

export const companiesById: Record<string, Company> = Object.fromEntries(companies.map((c) => [c.id, c]));

type ContactRow = [companyId: string, name: string, en: string, tr: string];
const contactRows: ContactRow[] = [
  ["c-quill", "Elif Sarı", "Store Owner", "Mağaza Sahibi"],
  ["c-quill", "Mert Güneş", "E-commerce Manager", "E-ticaret Müdürü"],
  ["c-halcyon", "Deniz Akın", "Plant Manager", "Fabrika Müdürü"],
  ["c-halcyon", "Ozan Bilgin", "Procurement Lead", "Satın Alma Sorumlusu"],
  ["c-brightwater", "Femke de Vries", "Head of IT", "BT Müdürü"],
  ["c-lodestar", "Cem Arıkan", "COO", "Operasyon Direktörü"],
  ["c-lodestar", "Seda Karaca", "Fleet Coordinator", "Filo Koordinatörü"],
  ["c-northpaw", "Harriet Moss", "Operations Lead", "Operasyon Sorumlusu"],
  ["c-velvet", "Kaan Toprak", "Director of Guest Services", "Misafir Hizmetleri Direktörü"],
  ["c-velvet", "Pınar Ilgaz", "Finance Controller", "Finans Kontrolörü"],
  ["c-calderwood", "Jordan Reyes", "Founder", "Kurucu"],
  ["c-yelken", "Volkan Ergin", "Owner", "İşletme Sahibi"],
  ["c-kuzey", "Ebru Taş", "Marketing Manager", "Pazarlama Müdürü"],
  ["c-orchard", "Levent Aydemir", "Sales Director", "Satış Direktörü"],
  ["c-tessellate", "Mads Kjær", "Studio Manager", "Ofis Müdürü"],
  ["c-saffronia", "Hülya Demir", "General Manager", "Genel Müdür"],
  ["c-pinewood", "Serkan Ateş", "Principal", "Okul Müdürü"],
  ["c-mistral", "Claire Dubois", "Practice Manager", "Klinik Müdürü"],
  ["c-tidewell", "Gökhan Bal", "VP Operations", "Operasyon Başkan Yardımcısı"],
  ["c-tidewell", "Nur Şimşek", "IT Manager", "BT Müdürü"],
  ["c-larkspur", "Priya Menon", "Head of Data", "Veri Bölümü Başkanı"],
];

const slugName = (n: string) =>
  n
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .split(" ")[0];

export const contacts: Contact[] = contactRows.map(([companyId, name, en, tr], i) => ({
  id: `ct-${i + 1}`,
  companyId,
  name,
  email: `${slugName(name)}@${companiesById[companyId]!.domain}`,
  title: { en, tr },
  primary: i === 0 || contactRows[i - 1]![0] !== companyId,
}));

export const contactsById: Record<string, Contact> = Object.fromEntries(contacts.map((c) => [c.id, c]));
export const contactsOf = (companyId: string) => contacts.filter((c) => c.companyId === companyId);

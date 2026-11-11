// CRM contacts for list-05. The first 21 are the shared contacts (same people as Customer 360);
// the rest are seeded leads at the same fictional companies. Deterministic, so SSR matches.
import type { L } from "../../_shared/l10n";
import { companies, companiesById, contacts as sharedContacts } from "../../_shared/companies";
import { me, peopleById } from "../../_shared/people";
import { int, pick, seeded } from "../../_shared/random";
import { day } from "../../_shared/time";

export type Stage = "subscriber" | "lead" | "qualified" | "opportunity" | "customer" | "churned";
export type Source = "website" | "referral" | "event" | "outbound" | "partner" | "webinar";

export interface CrmContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: L;
  companyId: string;
  company: string;
  country: string;
  stage: Stage;
  owner: { id: string; name: string } | null;
  source: Source;
  /** 0–100 lead score. */
  score: number;
  /** YYYY-MM-DD. */
  lastTouch: string;
  /** YYYY-MM-DD. */
  created: string;
  tags: string[];
}

export const stageLabels: Record<Stage, L> = {
  subscriber: { en: "Subscriber", tr: "Abone" },
  lead: { en: "Lead", tr: "Aday" },
  qualified: { en: "Qualified", tr: "Nitelikli" },
  opportunity: { en: "Opportunity", tr: "Fırsat" },
  customer: { en: "Customer", tr: "Müşteri" },
  churned: { en: "Churned", tr: "Kaybedildi" },
};
export const stageTone: Record<Stage, "neutral" | "info" | "accent" | "warning" | "success" | "danger"> = {
  subscriber: "neutral",
  lead: "info",
  qualified: "accent",
  opportunity: "warning",
  customer: "success",
  churned: "danger",
};

export const sourceLabels: Record<Source, L> = {
  website: { en: "Website form", tr: "Web formu" },
  referral: { en: "Referral", tr: "Tavsiye" },
  event: { en: "Trade show", tr: "Fuar" },
  outbound: { en: "Outbound", tr: "Dış arama" },
  partner: { en: "Partner", tr: "İş ortağı" },
  webinar: { en: "Webinar", tr: "Webinar" },
};

export const countryLabels: Record<string, L> = {
  TR: { en: "Türkiye", tr: "Türkiye" },
  NL: { en: "Netherlands", tr: "Hollanda" },
  GB: { en: "United Kingdom", tr: "Birleşik Krallık" },
  US: { en: "United States", tr: "ABD" },
  DK: { en: "Denmark", tr: "Danimarka" },
  FR: { en: "France", tr: "Fransa" },
  CA: { en: "Canada", tr: "Kanada" },
};

export const tagLabels: Record<string, L> = {
  "decision-maker": { en: "Decision maker", tr: "Karar verici" },
  hot: { en: "Hot", tr: "Sıcak" },
  renewal: { en: "Renewal due", tr: "Yenileme yaklaşıyor" },
  newsletter: { en: "Newsletter", tr: "Bülten" },
  "q4-campaign": { en: "Q4 campaign", tr: "4. çeyrek kampanyası" },
  champion: { en: "Champion", tr: "Savunucu" },
};

/** Account owners on the sales team, plus the current user. */
export const owners = [me, ...["p-aylin", "p-tomas", "p-noah", "p-ines"].map((id) => peopleById[id]!)].map((p) => ({ id: p.id, name: p.name }));

const extraNames = [
  "Berk Yazıcı", "Ayşe Ünal", "Jasper Hollis", "Nora Vidal", "Emir Sezer", "Lotte Bakker", "Tuğba Koral", "Ravi Shah",
  "İlker Sönmez", "Gemma Rowe", "Okan Durmaz", "Selma Iversen", "Hakan Yurt", "Clara Morel", "Derya Kılıç", "Owen Price",
  "Melis Erkan", "Bastien Roy", "Sinem Aktaş", "Theo Lambert", "Yasemin Oral", "Leo Brandt", "Cemre Öz", "Marta Kowal",
  "Tolga Ekinci", "Ingrid Holm", "Damla Arı", "Felipe Costa", "Burak Sezgin", "Hazel Quinn", "Esra Duman", "Mikkel Berg",
  "Kaan Uçar", "Elodie Martin", "Rüya Tan",
];
const extraTitles: L[] = [
  { en: "Operations Manager", tr: "Operasyon Müdürü" },
  { en: "Finance Director", tr: "Finans Direktörü" },
  { en: "Head of Marketing", tr: "Pazarlama Müdürü" },
  { en: "Purchasing Specialist", tr: "Satın Alma Uzmanı" },
  { en: "IT Lead", tr: "BT Sorumlusu" },
  { en: "Founder", tr: "Kurucu" },
  { en: "Office Manager", tr: "Ofis Müdürü" },
];

const slug = (n: string) =>
  n
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z ]/g, "")
    .trim()
    .split(/\s+/)
    .join(".");

function build(): CrmContact[] {
  const rand = seeded(5051);
  const stages: Stage[] = ["subscriber", "lead", "lead", "qualified", "qualified", "opportunity", "customer", "customer", "churned"];
  const sources = Object.keys(sourceLabels) as Source[];
  const tagKeys = Object.keys(tagLabels);
  const base = sharedContacts.map((ct) => ({ name: ct.name, email: ct.email, title: ct.title, companyId: ct.companyId, primary: ct.primary }));
  const extra = extraNames.map((name) => {
    const co = pick(rand, companies);
    return { name, email: `${slug(name)}@${co.domain}`, title: pick(rand, extraTitles), companyId: co.id, primary: false };
  });
  return [...base, ...extra].map((x, i) => {
    const co = companiesById[x.companyId]!;
    const stage: Stage =
      co.lifecycle === "churned" ? "churned" : co.lifecycle === "customer" && x.primary ? "customer" : co.lifecycle === "lead" ? pick(rand, ["lead", "qualified"] as const) : pick(rand, stages);
    const ownerRoll = rand();
    const owner = ownerRoll < 0.12 ? null : ownerRoll < 0.32 ? owners[0]! : peopleById[co.ownerId] ? { id: co.ownerId, name: peopleById[co.ownerId]!.name } : pick(rand, owners);
    const tags = tagKeys.filter(() => rand() < 0.18);
    if (x.primary && !tags.includes("decision-maker")) tags.unshift("decision-maker");
    return {
      id: `cc-${i + 1}`,
      name: x.name,
      email: x.email,
      phone: `+90 216 000 0${Math.floor(i / 100)} ${String(i % 100).padStart(2, "0")}`,
      title: x.title,
      companyId: co.id,
      company: co.name,
      country: co.country,
      stage,
      owner,
      source: pick(rand, sources),
      score: stage === "churned" ? int(rand, 4, 25) : stage === "subscriber" ? int(rand, 8, 40) : int(rand, 30, 98),
      lastTouch: day(-int(rand, 0, i % 5 === 0 ? 75 : 28)),
      created: day(-int(rand, 20, 540)),
      tags,
    };
  });
}

export const crmContacts: CrmContact[] = build();

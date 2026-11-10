// Example CRM contacts. Deterministic (seeded), so server and client render the same rows.
import type { FilterOption } from "@vamos-ui/react/data-table";

export type Lifecycle = "subscriber" | "lead" | "qualified" | "opportunity" | "customer" | "churned";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  lifecycle: Lifecycle;
  owner: { id: string; name: string };
  tags: string[];
  source: string;
  /** Open deal value, decimal string. */
  openDeals: string;
  /** YYYY-MM-DD */
  lastActivity: string;
  city: string;
}

export const me = { id: "u-meltem", name: "Meltem Aydın" };

export const owners = [me, { id: "u-can", name: "Can Demir" }, { id: "u-ece", name: "Ece Yılmaz" }, { id: "u-marco", name: "Marco Silva" }];

export const lifecycleOptions: FilterOption[] = [
  { value: "subscriber", label: "Subscriber", tone: "neutral" },
  { value: "lead", label: "Lead", tone: "info" },
  { value: "qualified", label: "Qualified", tone: "accent" },
  { value: "opportunity", label: "Opportunity", tone: "warning" },
  { value: "customer", label: "Customer", tone: "success" },
  { value: "churned", label: "Churned", tone: "danger" },
];

export const sourceOptions: FilterOption[] = ["Website form", "Referral", "Trade show", "LinkedIn", "Outbound", "Partner"].map((s) => ({ value: s, label: s }));

export const tagOptions: FilterOption[] = ["Decision maker", "Hot", "Newsletter", "Q4 campaign", "Partner", "Renewal due", "Enterprise"].map((t) => ({ value: t, label: t }));

const people: Array<[string, string, string, string]> = [
  ["Laura Callahan", "Head of Operations", "Northwind Traders", "Seattle"],
  ["Jonas Weber", "Logistics Director", "Kessler Logistik", "Hamburg"],
  ["Priya Nair", "Practice Manager", "Lotus Health", "Bengaluru"],
  ["Kenji Sato", "Creative Director", "Hikari Studio", "Osaka"],
  ["Amara Okafor", "COO", "Baobab Energy", "Lagos"],
  ["Elif Arslan", "Marketing Lead", "Olive & Thyme", "İzmir"],
  ["Mateo Fernández", "Owner", "Casa Brava Tapas", "Valencia"],
  ["Sofia Lindgren", "Head of Digital", "Fjord Logistics", "Oslo"],
  ["Daniel Mensah", "IT Manager", "Meridian Clinics", "Accra"],
  ["Hannah Becker", "Brand Manager", "Kite Outdoor", "Munich"],
  ["Omar Haddad", "General Manager", "Blue Harbor Coffee", "Dubai"],
  ["Chloé Martin", "E-commerce Manager", "Maison Lumière", "Lyon"],
  ["Burak Şahin", "Founder", "Urban Bakehouse", "Istanbul"],
  ["Grace Liu", "Procurement Lead", "Pacific Rim Foods", "Vancouver"],
  ["Lukas Novák", "CTO", "Vltava Systems", "Prague"],
  ["Isabela Costa", "Guest Experience Lead", "Lena Spa & Wellness", "Lisbon"],
  ["Ahmed Karimi", "Finance Director", "Saffron Hotels", "Doha"],
  ["Emily Carter", "Office Manager", "Studio Parallel", "London"],
  ["Thabo Nkosi", "Head of Sales", "Highveld Outfitters", "Johannesburg"],
  ["Yuki Tanaka", "Product Owner", "Sakura Mobility", "Tokyo"],
  ["Nora Jensen", "Operations Analyst", "Nordlys Retail", "Copenhagen"],
  ["Diego Ramírez", "Marketing Director", "Altamira Wines", "Mendoza"],
  ["Zeynep Koç", "Clinic Owner", "Koç Dental", "Ankara"],
  ["Oliver Grant", "VP Partnerships", "Granite Capital", "Boston"],
  ["Mira Patel", "Head of Growth", "Juniper Learning", "Toronto"],
  ["Felix Wagner", "Store Manager", "Alpenhaus Sports", "Innsbruck"],
  ["Aisha Bello", "Events Manager", "Lagoon Events", "Abuja"],
  ["Tom Hughes", "Director", "Hughes & Rowe Architects", "Bristol"],
  ["Camille Dubois", "Communications Lead", "Atelier Seine", "Paris"],
  ["Ravi Shankar", "Head of IT", "Monsoon Retail", "Mumbai"],
  ["Selin Kaya", "Owner", "Kaya Pilates", "Istanbul"],
  ["Lars Eriksson", "CFO", "Baltic Freight", "Stockholm"],
];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: () => number, list: readonly T[]) => list[Math.floor(r() * list.length)]!;

const ascii = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toLowerCase();

function dayBefore(days: number) {
  return new Date(Date.UTC(2026, 10, 10 - days)).toISOString().slice(0, 10);
}

export function makeContacts(): Contact[] {
  const r = rng(1284);
  return people.map(([name, jobTitle, company, city], i) => {
    const lifecycle = pick(r, ["lead", "lead", "qualified", "opportunity", "customer", "customer", "subscriber", "churned"] as const);
    const [first, ...rest] = ascii(name).split(" ");
    const domain = ascii(company).replace(/ /g, "").slice(0, 16) + ".com";
    const tags = tagOptions.filter(() => r() < 0.22).map((t) => t.value).slice(0, 3);
    const hasDeal = lifecycle === "opportunity" || lifecycle === "qualified" || (lifecycle === "customer" && r() < 0.5);
    return {
      id: `ct-${2200 + i}`,
      name,
      email: `${first}.${rest.join("")}@${domain}`,
      phone: `+1 415 555 0${String(100 + i).padStart(3, "0")}`,
      jobTitle,
      company,
      lifecycle,
      owner: owners[i % owners.length]!,
      tags,
      source: pick(r, sourceOptions).value,
      openDeals: hasDeal ? (Math.round(2 + r() * 90) * 500).toFixed(2) : "",
      lastActivity: dayBefore(Math.floor(r() * r() * 75)),
      city,
    };
  });
}

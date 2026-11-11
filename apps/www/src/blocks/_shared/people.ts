// Fictional people. Avatars follow the kit approach: no photos, `<Avatar name={p.name} />`
// draws initials on a colour seeded from the name, so every block shows the same face for
// the same person. Emails are @example.com; phones use the reserved +90 216 000 00 xx range.
import type { L } from "./l10n";

export type TeamKey = "sales" | "support" | "ops" | "finance" | "people" | "engineering" | "marketing" | "design" | "leadership";

export interface Person {
  id: string;
  name: string;
  email: string;
  /** Reserved fictional number. */
  phone: string;
  title: L;
  team: TeamKey;
  city: string;
  timeZone: string;
  /** Presence for avatars with a status dot. */
  status: "online" | "away" | "busy" | "offline";
}

export const teamLabels: Record<TeamKey, L> = {
  sales: { en: "Sales", tr: "Satış" },
  support: { en: "Customer support", tr: "Müşteri destek" },
  ops: { en: "Operations", tr: "Operasyon" },
  finance: { en: "Finance", tr: "Finans" },
  people: { en: "People", tr: "İnsan kaynakları" },
  engineering: { en: "Engineering", tr: "Yazılım" },
  marketing: { en: "Marketing", tr: "Pazarlama" },
  design: { en: "Design", tr: "Tasarım" },
  leadership: { en: "Leadership", tr: "Yönetim" },
};

const mail = (name: string) =>
  `${name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z]+/g, ".")
    .replace(/^\.|\.$/g, "")}@example.com`;

type Row = [id: string, name: string, en: string, tr: string, team: TeamKey, city: string, tz: string, status: Person["status"]];

const rows: Row[] = [
  ["p-defne", "Defne Kaya", "Head of Operations", "Operasyon Direktörü", "leadership", "Istanbul", "Europe/Istanbul", "online"],
  ["p-tomas", "Tomás Herrera", "Account Executive", "Satış Temsilcisi", "sales", "Madrid", "Europe/Madrid", "online"],
  ["p-aylin", "Aylin Demirtaş", "Senior Account Executive", "Kıdemli Satış Temsilcisi", "sales", "Istanbul", "Europe/Istanbul", "busy"],
  ["p-noah", "Noah Brennan", "Sales Manager", "Satış Müdürü", "sales", "Dublin", "Europe/Dublin", "away"],
  ["p-ines", "Inês Carvalho", "Account Executive", "Satış Temsilcisi", "sales", "Lisbon", "Europe/Lisbon", "online"],
  ["p-kerem", "Kerem Yıldız", "Support Lead", "Destek Ekip Lideri", "support", "Ankara", "Europe/Istanbul", "online"],
  ["p-hana", "Hana Kobayashi", "Support Specialist", "Destek Uzmanı", "support", "Osaka", "Asia/Tokyo", "offline"],
  ["p-oskar", "Oskar Lindahl", "Support Specialist", "Destek Uzmanı", "support", "Gothenburg", "Europe/Stockholm", "online"],
  ["p-zeynep", "Zeynep Aksoy", "Support Specialist", "Destek Uzmanı", "support", "Izmir", "Europe/Istanbul", "away"],
  ["p-malik", "Malik Osei", "Field Technician", "Saha Teknisyeni", "ops", "Istanbul", "Europe/Istanbul", "online"],
  ["p-selin", "Selin Öztürk", "Field Technician", "Saha Teknisyeni", "ops", "Istanbul", "Europe/Istanbul", "online"],
  ["p-baran", "Baran Çelik", "Field Technician", "Saha Teknisyeni", "ops", "Istanbul", "Europe/Istanbul", "busy"],
  ["p-ruth", "Ruth Adeyemi", "Warehouse Manager", "Depo Müdürü", "ops", "Kocaeli", "Europe/Istanbul", "online"],
  ["p-felix", "Felix Hartmann", "Finance Manager", "Finans Müdürü", "finance", "Berlin", "Europe/Berlin", "online"],
  ["p-gizem", "Gizem Uysal", "Accountant", "Muhasebe Uzmanı", "finance", "Istanbul", "Europe/Istanbul", "offline"],
  ["p-amaru", "Amaru Quispe", "People Partner", "İK İş Ortağı", "people", "Lima", "America/Lima", "away"],
  ["p-ece", "Ece Tunalı", "Head of People", "İK Direktörü", "people", "Istanbul", "Europe/Istanbul", "online"],
  ["p-viktor", "Viktor Petrov", "Engineering Manager", "Yazılım Müdürü", "engineering", "Sofia", "Europe/Sofia", "busy"],
  ["p-yusuf", "Yusuf Erdem", "Backend Engineer", "Backend Geliştirici", "engineering", "Eskişehir", "Europe/Istanbul", "online"],
  ["p-maya", "Maya Lindqvist", "Frontend Engineer", "Frontend Geliştirici", "engineering", "Malmö", "Europe/Stockholm", "online"],
  ["p-camille", "Camille Rousseau", "Marketing Lead", "Pazarlama Lideri", "marketing", "Lyon", "Europe/Paris", "online"],
  ["p-arda", "Arda Koç", "Performance Marketer", "Performans Pazarlama Uzmanı", "marketing", "Istanbul", "Europe/Istanbul", "away"],
  ["p-nadia", "Nadia Haddad", "Product Designer", "Ürün Tasarımcısı", "design", "Beirut", "Asia/Beirut", "online"],
  ["p-jun", "Jun Park", "Content Designer", "İçerik Tasarımcısı", "design", "Seoul", "Asia/Seoul", "offline"],
];

export const people: Person[] = rows.map(([id, name, en, tr, team, city, timeZone, status], i) => ({
  id,
  name,
  email: mail(name),
  phone: `+90 216 000 00 ${String(10 + i).padStart(2, "0")}`,
  title: { en, tr },
  team,
  city,
  timeZone,
  status,
}));

export const peopleById: Record<string, Person> = Object.fromEntries(people.map((p) => [p.id, p]));

/** The signed-in user in every admin block. */
export const me: Person = peopleById["p-defne"]!;

/** People in a team, in fixture order. */
export const teamOf = (team: TeamKey) => people.filter((p) => p.team === team);

/** Lookup that never returns undefined (fixtures are consistent; throws in development if not). */
export function person(id: string): Person {
  const p = peopleById[id];
  if (!p) throw new Error(`Unknown person ${id}`);
  return p;
}

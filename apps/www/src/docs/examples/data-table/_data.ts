// Example data shared by the Data Table, Filter bar and Saved views docs. Deterministic, so
// server and client render the same rows.

export interface Post {
  id: string;
  title: string;
  author: { id: string; name: string };
  status: "published" | "draft" | "scheduled" | "review";
  category: string;
  views: number;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  title: string;
  department: "engineering" | "sales" | "design" | "people" | "finance" | "support";
  location: string;
  manager: { id: string; name: string };
  salary: string;
  startDate: string;
  status: "active" | "probation" | "leave";
  remote: boolean;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  stage: "lead" | "qualified" | "proposal" | "won" | "lost";
  value: string;
  owner: { id: string; name: string };
  country: string;
  lastContacted: string;
  tags: string[];
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: { id: string; name: string };
  action: "login" | "update" | "export" | "delete" | "invite" | "create";
  target: string;
  ip: string;
}

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
const pad = (n: number) => String(n).padStart(2, "0");
const day = (base: string, offset: number) => {
  const d = new Date(`${base}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};

const FIRST = ["Jane", "Kemal", "Priya", "Lucas", "Amara", "Elif", "Noah", "Sofia", "Mateo", "Hana", "Omar", "Chloé", "Daniel", "Zeynep", "Arjun", "Maya", "Leo", "Ines", "Tomás", "Aylin", "Grace", "Ravi", "Freya", "Hugo", "Mei", "Yusuf", "Clara", "Ethan", "Nadia", "Jonas"];
const LAST = ["Cooper", "Aydın", "Raman", "Moreau", "Okafor", "Şahin", "Becker", "Rossi", "García", "Kimura", "Haddad", "Laurent", "Novak", "Çelik", "Mehta", "Lindqvist", "Fischer", "Costa", "Silva", "Yıldız", "Whitfield", "Iyer", "Andersen", "Dubois", "Chen", "Demir", "Weber", "Brooks", "Petrov", "Berg"];
const COMPANIES = ["Northwind Traders", "Corvane Health", "Halden Works", "Brightmoor Foods", "Lumora Labs", "Tessel Imports", "Ridgeway Logistics", "Quarry Analytics", "Orchard Systems", "Kestrel Robotics", "Fernhill Media", "Basalt Dynamics", "Selvane Bio", "Coldharbor Systems", "Marrow Capital", "Ostrava Labs", "Pemberly Confectionery", "İstanbul Kahve Co.", "Anadolu Lojistik", "Ege Tekstil"];
const COUNTRIES = ["United States", "United Kingdom", "Germany", "Türkiye", "France", "Netherlands", "Spain", "Canada", "Japan", "India"];
const TAGS = ["Enterprise", "Inbound", "Partner", "Renewal", "Event", "Referral", "Trial"];
const LOCATIONS = ["Istanbul", "London", "Berlin", "Remote — EU", "New York", "Lisbon", "Remote — US"];

export const owners = [
  { id: "u_ada", name: "Ada Park" },
  { id: "u_selin", name: "Selin Kaya" },
  { id: "u_marcus", name: "Marcus Webb" },
  { id: "u_leila", name: "Leila Haddad" },
  { id: "u_tom", name: "Tom Brennan" },
];

export const managers = [
  { id: "m_ines", name: "Ines Laurent" },
  { id: "m_omar", name: "Omar Haddad" },
  { id: "m_grace", name: "Grace Whitfield" },
  { id: "m_kerem", name: "Kerem Yıldız" },
];

/* ---------------------------------- CMS posts ---------------------------------- */

const POST_TITLES = [
  "How we cut onboarding time in half",
  "Pricing page teardown: what changed in 2026",
  "A field guide to customer interviews",
  "Release notes — November",
  "Why we moved our docs to the edge",
  "Designing empty states that convert",
  "The quiet power of saved views",
  "Hiring our first support engineer in Istanbul",
  "Five dashboards every ops team needs",
  "Accessibility audit: what we fixed",
  "From spreadsheet to CRM in a weekend",
  "Writing release notes people read",
  "Our remote-first handbook, revisited",
  "Case study: Northwind Traders",
  "Year in review: product",
  "What we learned shipping dark mode",
  "A checklist for safer bulk actions",
  "Localising for Turkish: İ, ı and friends",
];
const CATEGORIES = ["Product", "Engineering", "Design", "Company", "Customers"];

export const posts: Post[] = POST_TITLES.map((title, i) => {
  const r = rng(100 + i);
  return {
    id: `post_${1040 + i}`,
    title,
    author: pick(r, owners),
    status: pick(r, ["published", "published", "published", "draft", "scheduled", "review"] as const),
    category: pick(r, CATEGORIES),
    views: Math.round(r() * 18000 + 120),
    updatedAt: `${day("2026-08-01", Math.floor(r() * 100))}T${pad(8 + Math.floor(r() * 10))}:${pad(Math.floor(r() * 60))}:00Z`,
  };
});

/* ---------------------------------- HR employees ---------------------------------- */

const TITLES: Record<Employee["department"], string[]> = {
  engineering: ["Senior Engineer", "Staff Engineer", "Engineering Manager", "Frontend Engineer", "Platform Engineer"],
  sales: ["Account Executive", "Sales Development Rep", "Head of Sales", "Solutions Consultant"],
  design: ["Product Designer", "Design Lead", "Brand Designer"],
  people: ["People Partner", "Recruiter", "Head of People"],
  finance: ["Financial Analyst", "Controller"],
  support: ["Support Engineer", "Support Lead", "Customer Success Manager"],
};
const BANDS: Record<Employee["department"], [number, number]> = { engineering: [92000, 168000], sales: [64000, 142000], design: [78000, 132000], people: [62000, 118000], finance: [70000, 126000], support: [52000, 96000] };

export function makeEmployees(count = 48): Employee[] {
  return Array.from({ length: count }, (_, i) => {
    const r = rng(2000 + i);
    const first = FIRST[i % FIRST.length]!;
    const last = LAST[(i * 7) % LAST.length]!;
    const department = pick(r, ["engineering", "engineering", "sales", "sales", "design", "people", "finance", "support"] as const);
    const [lo, hi] = BANDS[department];
    const start = day("2019-01-07", Math.floor(r() * 2500));
    return {
      id: `emp_${3100 + i}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}.${last.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}@vamos.example`,
      title: pick(r, TITLES[department]),
      department,
      location: pick(r, LOCATIONS),
      manager: pick(r, managers),
      salary: String(Math.round((lo + r() * (hi - lo)) / 500) * 500),
      startDate: start,
      status: start > "2026-05-15" ? "probation" : r() < 0.06 ? "leave" : "active",
      remote: r() < 0.4,
    };
  });
}

export const departmentOptions = [
  { value: "engineering", label: "Engineering", tone: "info" as const },
  { value: "sales", label: "Sales", tone: "accent" as const },
  { value: "design", label: "Design", tone: "warning" as const },
  { value: "people", label: "People", tone: "success" as const },
  { value: "finance", label: "Finance", tone: "neutral" as const },
  { value: "support", label: "Support", tone: "neutral" as const },
];

export const employeeStatusOptions = [
  { value: "active", label: "Active", tone: "success" as const },
  { value: "probation", label: "Probation", tone: "warning" as const },
  { value: "leave", label: "On leave", tone: "neutral" as const },
];

/* ---------------------------------- CRM contacts ---------------------------------- */

export function makeContact(i: number): Contact {
  const r = rng(9000 + i);
  const first = pick(r, FIRST);
  const last = pick(r, LAST);
  const company = pick(r, COMPANIES);
  const stage = pick(r, ["lead", "lead", "lead", "qualified", "qualified", "proposal", "won", "lost"] as const);
  return {
    id: `ct_${(100000 + i).toString(36)}`,
    name: `${first} ${last}`,
    company,
    email: `${first.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}@${company.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "").slice(0, 12)}.example`,
    stage,
    value: String(Math.round(r() * 48000 + 800) * (stage === "lead" ? 1 : 2)),
    owner: pick(r, owners),
    country: pick(r, COUNTRIES),
    lastContacted: day("2026-03-01", Math.floor(r() * 254)),
    tags: TAGS.filter(() => r() < 0.22),
  };
}

export const stageOptions = [
  { value: "lead", label: "Lead", tone: "neutral" as const },
  { value: "qualified", label: "Qualified", tone: "info" as const },
  { value: "proposal", label: "Proposal", tone: "warning" as const },
  { value: "won", label: "Won", tone: "success" as const },
  { value: "lost", label: "Lost", tone: "danger" as const },
];

/* ---------------------------------- Audit log ---------------------------------- */

const ACTIONS = ["login", "login", "login", "update", "update", "export", "invite", "create", "delete"] as const;
const TARGETS = ["Contact · Jane Cooper", "Deal · Northwind renewal", "Invoice INV-2041", "Workspace settings", "Role · Billing admin", "Report · Q3 pipeline", "Post · Release notes — November", "API key ••••4f2a"];

export function makeEvents(count: number): AuditEvent[] {
  const startMs = Date.UTC(2026, 10, 10, 9, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const r = rng(50000 + i);
    return {
      id: `evt_${i}`,
      at: new Date(startMs - i * 47_000 - Math.floor(r() * 30_000)).toISOString(),
      actor: pick(r, [...owners, ...managers]),
      action: pick(r, ACTIONS),
      target: pick(r, TARGETS),
      ip: `10.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}`,
    };
  });
}

export const actionOptions = [
  { value: "login", label: "Signed in", tone: "neutral" as const },
  { value: "update", label: "Updated", tone: "info" as const },
  { value: "export", label: "Exported", tone: "warning" as const },
  { value: "delete", label: "Deleted", tone: "danger" as const },
  { value: "invite", label: "Invited", tone: "success" as const },
  { value: "create", label: "Created", tone: "accent" as const },
];

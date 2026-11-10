// Example employee directory. Deterministic (seeded), so server and client render the same rows.
import type { FilterOption } from "@vamos-ui/react/data-table";

export type Department = "engineering" | "design" | "sales" | "marketing" | "people" | "finance" | "support";
export type WorkStatus = "active" | "leave" | "onboarding";

export interface Employee {
  id: string;
  name: string;
  title: string;
  department: Department;
  location: string;
  workMode: "office" | "hybrid" | "remote";
  manager: { id: string; name: string } | null;
  email: string;
  phone: string;
  /** YYYY-MM-DD */
  startDate: string;
  status: WorkStatus;
}

export const departmentOptions: FilterOption[] = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "people", label: "People" },
  { value: "finance", label: "Finance" },
  { value: "support", label: "Customer support" },
];

export const statusOptions: FilterOption[] = [
  { value: "active", label: "Active", tone: "success" },
  { value: "onboarding", label: "Onboarding", tone: "info" },
  { value: "leave", label: "On leave", tone: "warning" },
];

export const workModeOptions: FilterOption[] = [
  { value: "office", label: "Office" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

export const locationOptions: FilterOption[] = ["Istanbul", "Berlin", "London", "Lisbon", "Remote — EU"].map((l) => ({ value: l, label: l }));

const leads: Record<Department, { id: string; name: string }> = {
  engineering: { id: "e-100", name: "Marcus Lindqvist" },
  design: { id: "e-101", name: "Selin Öztürk" },
  sales: { id: "e-102", name: "Tomás Ribeiro" },
  marketing: { id: "e-103", name: "Hannah Becker" },
  people: { id: "e-104", name: "Aylin Çelik" },
  finance: { id: "e-105", name: "David Osei" },
  support: { id: "e-106", name: "Noor Haddad" },
};

const staff: Array<[string, string, Department]> = [
  ["Marcus Lindqvist", "VP Engineering", "engineering"],
  ["Selin Öztürk", "Head of Design", "design"],
  ["Tomás Ribeiro", "Head of Sales", "sales"],
  ["Hannah Becker", "Marketing Director", "marketing"],
  ["Aylin Çelik", "People Partner", "people"],
  ["David Osei", "Finance Manager", "finance"],
  ["Noor Haddad", "Support Lead", "support"],
  ["Kaan Yıldız", "Senior Backend Engineer", "engineering"],
  ["Lea Fischer", "Frontend Engineer", "engineering"],
  ["Arjun Mehta", "Staff Engineer", "engineering"],
  ["Emma Novak", "Product Designer", "design"],
  ["Felix Wagner", "Support Specialist", "support"],
  ["Inés García", "Account Executive", "sales"],
  ["Oliver Grant", "Sales Development Rep", "sales"],
  ["Zeynep Aksoy", "Content Strategist", "marketing"],
  ["Lucas Moreau", "Mobile Engineer", "engineering"],
  ["Asli Tan", "Support Specialist", "support"],
  ["Mia Johansson", "UX Researcher", "design"],
  ["Ben Carter", "Data Engineer", "engineering"],
  ["Sara Romano", "Recruiter", "people"],
  ["Yusuf Demir", "Accountant", "finance"],
  ["Chloe Evans", "Growth Marketer", "marketing"],
  ["Daniel Kim", "DevOps Engineer", "engineering"],
  ["Elena Petrova", "QA Engineer", "engineering"],
  ["Mehmet Kılıç", "Account Manager", "sales"],
  ["Julia Santos", "Brand Designer", "design"],
  ["Ravi Shankar", "Solutions Engineer", "sales"],
  ["Ece Yılmaz", "People Operations", "people"],
  ["Jonas Weber", "Backend Engineer", "engineering"],
  ["Amara Okafor", "Customer Success Manager", "support"],
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
    .toLowerCase();

export function makeEmployees(): Employee[] {
  const r = rng(86);
  return staff.map(([name, title, department], i) => {
    const isLead = i < 7;
    const [first, last] = ascii(name).split(" ");
    const location = pick(r, locationOptions).value;
    const year = isLead ? 2019 + Math.floor(r() * 3) : 2021 + Math.floor(r() * 6);
    const month = 1 + Math.floor(r() * (year === 2026 ? 10 : 12));
    const status: WorkStatus = year === 2026 && month >= 9 ? "onboarding" : r() < 0.12 ? "leave" : "active";
    return {
      id: `e-${100 + i}`,
      name,
      title,
      department,
      location,
      workMode: location === "Remote — EU" ? "remote" : pick(r, ["office", "hybrid", "hybrid"] as const),
      manager: isLead ? (i === 0 ? null : leads.engineering) : leads[department],
      email: `${first}.${last}@northpoint.studio`,
      phone: `+44 20 7946 0${String(100 + i * 7).slice(-3)}`,
      startDate: `${year}-${String(month).padStart(2, "0")}-${String(1 + Math.floor(r() * 27)).padStart(2, "0")}`,
      status,
    };
  });
}

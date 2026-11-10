import type { ChartConfig } from "@vamos-ui/react/charts";

/** Today in the demo (date-only, YYYY-MM-DD). */
export const TODAY = "2026-11-10";

export const headcount = [
  { month: "2026-06-01", engineering: 52, sales: 28, operations: 31, people: 9, finance: 11 },
  { month: "2026-07-01", engineering: 54, sales: 29, operations: 31, people: 9, finance: 11 },
  { month: "2026-08-01", engineering: 55, sales: 31, operations: 32, people: 10, finance: 11 },
  { month: "2026-09-01", engineering: 57, sales: 30, operations: 33, people: 10, finance: 12 },
  { month: "2026-10-01", engineering: 58, sales: 32, operations: 34, people: 10, finance: 12 },
  { month: "2026-11-01", engineering: 61, sales: 33, operations: 34, people: 10, finance: 10 },
];

export const headcountConfig = {
  engineering: { label: "Engineering", color: "chart-1" },
  sales: { label: "Sales", color: "chart-2" },
  operations: { label: "Operations", color: "chart-3" },
  people: { label: "People", color: "chart-5" },
  finance: { label: "Finance", color: "chart-4" },
} satisfies ChartConfig;

export const employment = [
  { type: "full", people: 121 },
  { type: "part", people: 11 },
  { type: "contract", people: 12 },
  { type: "intern", people: 4 },
];

export const employmentConfig = {
  full: { label: "Full-time" },
  part: { label: "Part-time" },
  contract: { label: "Contractor" },
  intern: { label: "Intern" },
} satisfies ChartConfig;

export type LeaveType = "annual" | "sick" | "parental" | "unpaid";

export const leaveTypes: Record<LeaveType, { label: string; className: string }> = {
  annual: { label: "Annual leave", className: "bg-chart-2" },
  sick: { label: "Sick leave", className: "bg-chart-3" },
  parental: { label: "Parental leave", className: "bg-chart-5" },
  unpaid: { label: "Unpaid leave", className: "bg-fg-subtle" },
};

export type Department = "Engineering" | "Sales" | "Operations" | "People";

export interface Absence {
  id: string;
  name: string;
  role: string;
  department: Department;
  type: LeaveType;
  /** Inclusive, YYYY-MM-DD. */
  from: string;
  to: string;
}

export const absences: Absence[] = [
  { id: "l1", name: "Zeynep Aydın", role: "Product designer", department: "Engineering", type: "annual", from: "2026-11-09", to: "2026-11-13" },
  { id: "l2", name: "Marcus Chen", role: "Backend engineer", department: "Engineering", type: "sick", from: "2026-11-10", to: "2026-11-11" },
  { id: "l3", name: "Hannah Weiss", role: "Account executive", department: "Sales", type: "annual", from: "2026-11-16", to: "2026-11-20" },
  { id: "l4", name: "Burak Yıldız", role: "Warehouse lead", department: "Operations", type: "parental", from: "2026-10-26", to: "2026-12-04" },
  { id: "l5", name: "Priya Nair", role: "Recruiter", department: "People", type: "annual", from: "2026-11-12", to: "2026-11-13" },
  { id: "l6", name: "Leo Martins", role: "Support specialist", department: "Operations", type: "unpaid", from: "2026-11-18", to: "2026-11-19" },
  { id: "l7", name: "Selin Koç", role: "Sales development rep", department: "Sales", type: "sick", from: "2026-11-09", to: "2026-11-09" },
];

export const birthdays = [
  { name: "Ece Şahin", role: "Content lead", date: "2026-11-10" },
  { name: "Daniel Okoro", role: "Frontend engineer", date: "2026-11-12" },
  { name: "Marta Nowak", role: "Office manager", date: "2026-11-15" },
  { name: "Kerem Polat", role: "Data analyst", date: "2026-11-19" },
];

export const anniversaries = [
  { name: "Ayla Demir", role: "Head of Operations", date: "2026-11-11", years: 5 },
  { name: "Tom Fischer", role: "Solutions engineer", date: "2026-11-14", years: 3 },
  { name: "Nadia Haddad", role: "Payroll specialist", date: "2026-11-17", years: 1 },
];

export interface Opening {
  id: string;
  title: string;
  department: Department;
  location: string;
  applicants: number;
  /** Candidates in final interviews. */
  finalists: number;
  manager: string;
  priority?: boolean;
  openedDaysAgo: number;
}

export const openings: Opening[] = [
  { id: "p1", title: "Senior backend engineer", department: "Engineering", location: "Istanbul · Hybrid", applicants: 86, finalists: 3, manager: "Marcus Chen", priority: true, openedDaysAgo: 34 },
  { id: "p2", title: "Account executive, DACH", department: "Sales", location: "Berlin · Remote", applicants: 41, finalists: 2, manager: "Hannah Weiss", openedDaysAgo: 19 },
  { id: "p3", title: "Customer support specialist", department: "Operations", location: "Istanbul · On-site", applicants: 128, finalists: 4, manager: "Ayla Demir", openedDaysAgo: 12 },
  { id: "p4", title: "People partner", department: "People", location: "Remote, EU", applicants: 23, finalists: 0, manager: "Priya Nair", openedDaysAgo: 6 },
];

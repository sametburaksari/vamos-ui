import type { BarListItem, ChartConfig } from "@vamos-ui/react/charts";

/** Hours logged per working day, last two weeks. */
export const hours = [
  { day: "2026-10-28", billable: 48, internal: 11 },
  { day: "2026-10-29", billable: 52, internal: 9 },
  { day: "2026-10-30", billable: 44, internal: 14 },
  { day: "2026-10-31", billable: 39, internal: 12 },
  { day: "2026-11-02", billable: 55, internal: 8 },
  { day: "2026-11-03", billable: 57, internal: 10 },
  { day: "2026-11-04", billable: 50, internal: 13 },
  { day: "2026-11-05", billable: 53, internal: 9 },
  { day: "2026-11-06", billable: 41, internal: 16 },
  { day: "2026-11-09", billable: 58, internal: 7 },
  { day: "2026-11-10", billable: 31, internal: 6 },
];

export const hoursConfig = {
  billable: { label: "Billable", format: "integer", color: "chart-1" },
  internal: { label: "Internal", format: "integer", color: "chart-2" },
} satisfies ChartConfig;

/** Hours this week per person (target 40). */
export const people: BarListItem[] = [
  { key: "deniz", label: "Deniz Kaplan", textLabel: "Deniz Kaplan", value: 38 },
  { key: "olivia", label: "Olivia Grant", textLabel: "Olivia Grant", value: 36 },
  { key: "emre", label: "Emre Toprak", textLabel: "Emre Toprak", value: 33 },
  { key: "sara", label: "Sara Lindqvist", textLabel: "Sara Lindqvist", value: 29 },
  { key: "omar", label: "Omar Haddad", textLabel: "Omar Haddad", value: 22 },
];

export type ProjectStatus = "On track" | "At risk" | "Blocked" | "Done";

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  /** Completion, 0–100. */
  progress: number;
  /** Decimal strings, USD. */
  spent: string;
  budget: string;
  /** YYYY-MM-DD */
  due: string;
  team: string[];
}

export const projects: Project[] = [
  { id: "PRJ-114", name: "Booking engine v2", client: "Lumen Dental Clinics", status: "On track", progress: 72, spent: "28400.00", budget: "42000.00", due: "2026-12-12", team: ["Deniz Kaplan", "Olivia Grant", "Emre Toprak"] },
  { id: "PRJ-109", name: "POS rollout, 6 sites", client: "Copperleaf Bistro Group", status: "At risk", progress: 48, spent: "31900.00", budget: "38000.00", due: "2026-11-28", team: ["Emre Toprak", "Omar Haddad"] },
  { id: "PRJ-121", name: "Partner portal pilot", client: "Brightwave Energy", status: "On track", progress: 15, spent: "4200.00", budget: "39500.00", due: "2027-01-30", team: ["Sara Lindqvist", "Deniz Kaplan"] },
  { id: "PRJ-102", name: "Brand site relaunch", client: "Atlas Fitness", status: "Blocked", progress: 64, spent: "17800.00", budget: "24000.00", due: "2026-11-20", team: ["Olivia Grant", "Sara Lindqvist", "Omar Haddad", "Deniz Kaplan"] },
  { id: "PRJ-118", name: "Menu QR + ordering", client: "Saffron Street Kitchen", status: "On track", progress: 36, spent: "3100.00", budget: "7900.00", due: "2026-12-19", team: ["Emre Toprak", "Sara Lindqvist"] },
  { id: "PRJ-111", name: "Ads retainer, Q4", client: "Atlas Fitness", status: "At risk", progress: 55, spent: "9600.00", budget: "10400.00", due: "2026-12-31", team: ["Olivia Grant"] },
  { id: "PRJ-097", name: "NFC staff cards", client: "Harbor & Pine Hotels", status: "Done", progress: 100, spent: "11250.00", budget: "12000.00", due: "2026-11-06", team: ["Omar Haddad"] },
];

export type InvoiceStatus = "Paid" | "Sent" | "Overdue" | "Draft";

export interface Invoice {
  number: string;
  client: string;
  amount: string;
  /** YYYY-MM-DD */
  due: string;
  status: InvoiceStatus;
}

export const invoices: Invoice[] = [
  { number: "INV-2026-0418", client: "Atlas Fitness", amount: "8400.00", due: "2026-10-31", status: "Overdue" },
  { number: "INV-2026-0421", client: "Copperleaf Bistro Group", amount: "12650.00", due: "2026-11-15", status: "Sent" },
  { number: "INV-2026-0423", client: "Lumen Dental Clinics", amount: "9800.00", due: "2026-11-24", status: "Sent" },
  { number: "INV-2026-0419", client: "Harbor & Pine Hotels", amount: "11250.00", due: "2026-11-06", status: "Paid" },
  { number: "INV-2026-0425", client: "Brightwave Energy", amount: "6200.00", due: "2026-12-10", status: "Draft" },
];

/** Outstanding receivables by age. */
export const aging: BarListItem[] = [
  { key: "current", label: "Not yet due", value: 28_650 },
  { key: "1-30", label: "1–30 days late", value: 11_200 },
  { key: "31-60", label: "31–60 days late", value: 8_400 },
  { key: "60+", label: "Over 60 days", value: 0 },
];

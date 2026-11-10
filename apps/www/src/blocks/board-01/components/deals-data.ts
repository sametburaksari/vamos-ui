// Example sales pipeline. Plain data — replace with your API.
import type { FilterFieldDef } from "@vamos-ui/react/data-table";
import type { Stage } from "@vamos-ui/react/sortable";

export interface Deal {
  id: string;
  title: string;
  company: string;
  stage: string;
  /** Decimal string; empty until the deal is sized. */
  value: string;
  owner: { id: string; name: string };
  /** YYYY-MM-DD */
  closeDate: string;
  nextStep?: string;
  priority?: "hot" | "at-risk";
}

export const me = { id: "u-selin", name: "Selin Kaya" };
export const owners = [me, { id: "u-marco", name: "Marco Silva" }, { id: "u-ada", name: "Ada Okafor" }, { id: "u-can", name: "Can Demir" }];
const [selin, marco, ada, can] = owners as [typeof me, typeof me, typeof me, typeof me];

export const stages: Stage[] = [
  { key: "lead", label: "Lead", tone: "chart-1", category: "open", probability: 0.1 },
  { key: "qualified", label: "Qualified", tone: "chart-2", category: "open", probability: 0.25 },
  { key: "proposal", label: "Proposal", tone: "chart-3", category: "active", probability: 0.5, wipLimit: 5 },
  { key: "negotiation", label: "Negotiation", tone: "chart-4", category: "active", probability: 0.75 },
  { key: "won", label: "Closed won", tone: "success", category: "done", probability: 1 },
  { key: "lost", label: "Closed lost", tone: "danger", category: "canceled", probability: 0, collapsed: true },
];

export const fields: FilterFieldDef[] = [
  { field: "owner", label: "Owner", type: "user", quick: true, options: owners.map((o) => ({ value: o.id, label: o.name })) },
  {
    field: "priority",
    label: "Priority",
    type: "enum",
    quick: true,
    options: [
      { value: "hot", label: "Hot", tone: "warning" },
      { value: "at-risk", label: "At risk", tone: "danger" },
    ],
  },
  { field: "value", label: "Value", type: "currency", currency: "USD" },
  { field: "closeDate", label: "Expected close", type: "date" },
];

export const initialDeals: Deal[] = [
  { id: "d-101", title: "Website relaunch", company: "Northwind Traders", stage: "lead", value: "18500.00", owner: selin, closeDate: "2026-12-12", nextStep: "Intro call Thu" },
  { id: "d-102", title: "Loyalty app, phase 1", company: "Blue Harbor Coffee", stage: "lead", value: "42000.00", owner: marco, closeDate: "2027-01-20" },
  { id: "d-103", title: "Booking widget", company: "Kaya Pilates", stage: "lead", value: "", owner: can, closeDate: "2027-01-08", nextStep: "Size the scope" },
  { id: "d-104", title: "POS rollout, 14 stores", company: "Urban Bakehouse", stage: "qualified", value: "63750.00", owner: selin, closeDate: "2026-12-30", priority: "hot", nextStep: "Site visit Mon" },
  { id: "d-105", title: "Booking engine", company: "Defne Spa & Wellness", stage: "qualified", value: "9800.00", owner: ada, closeDate: "2026-11-28" },
  { id: "d-106", title: "Patient portal", company: "Meridian Clinics", stage: "qualified", value: "54000.00", owner: marco, closeDate: "2027-02-02" },
  { id: "d-107", title: "Annual SEO retainer", company: "Kite Outdoor", stage: "proposal", value: "24000.00", owner: marco, closeDate: "2026-12-05", nextStep: "Proposal sent Nov 6" },
  { id: "d-108", title: "Partner portal", company: "Fjord Logistics", stage: "proposal", value: "88000.00", owner: ada, closeDate: "2027-02-14", priority: "hot" },
  { id: "d-109", title: "Menu QR + ordering", company: "Olive & Thyme", stage: "proposal", value: "6400.00", owner: selin, closeDate: "2026-11-21" },
  { id: "d-110", title: "Fleet tracking dashboard", company: "Baltic Freight", stage: "proposal", value: "37200.00", owner: can, closeDate: "2026-12-18", priority: "at-risk", nextStep: "Waiting on IT review" },
  { id: "d-111", title: "Data migration", company: "Meridian Clinics", stage: "negotiation", value: "31200.00", owner: ada, closeDate: "2026-11-30", nextStep: "Legal redlines" },
  { id: "d-112", title: "Guest Wi-Fi + CRM sync", company: "Saffron Hotels", stage: "negotiation", value: "47500.00", owner: selin, closeDate: "2026-11-25", priority: "hot" },
  { id: "d-113", title: "Brand refresh", company: "Studio Parallel", stage: "won", value: "15000.00", owner: marco, closeDate: "2026-11-02" },
  { id: "d-114", title: "E-commerce migration", company: "Maison Lumière", stage: "won", value: "29900.00", owner: ada, closeDate: "2026-10-28" },
  { id: "d-115", title: "Event ticketing", company: "Lagoon Events", stage: "lost", value: "12000.00", owner: can, closeDate: "2026-10-30" },
];

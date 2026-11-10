import type { FunnelStep, BarListItem } from "@vamos-ui/react/charts";
import type { TimelineEntry } from "@vamos-ui/react";
import { Mail, PhoneCall, Trophy, FileSignature, CalendarCheck } from "lucide-react";

/** Fixed "now" so relative times and day groups stay stable in previews. */
export const NOW = "2026-11-10T15:30:00Z";

export const pipeline: FunnelStep[] = [
  { key: "lead", label: "New lead", value: 486, amount: 3_920_000 },
  { key: "qualified", label: "Qualified", value: 214, amount: 2_610_000 },
  { key: "demo", label: "Demo held", value: 131, amount: 1_870_000 },
  { key: "proposal", label: "Proposal", value: 72, amount: 1_240_000 },
  { key: "won", label: "Won", value: 29, amount: 412_000 },
];

export const lastQuarter: FunnelStep[] = [
  { key: "lead", label: "New lead", value: 441 },
  { key: "qualified", label: "Qualified", value: 187 },
  { key: "demo", label: "Demo held", value: 104 },
  { key: "proposal", label: "Proposal", value: 61 },
  { key: "won", label: "Won", value: 22 },
];

export const reps: BarListItem[] = [
  { key: "elif", label: "Elif Demir", textLabel: "Elif Demir", value: 128_400, delta: 0.18 },
  { key: "jonas", label: "Jonas Becker", textLabel: "Jonas Becker", value: 96_250, delta: 0.07 },
  { key: "maya", label: "Maya Okafor", textLabel: "Maya Okafor", value: 84_900, delta: -0.04 },
  { key: "tomas", label: "Tomás Rivera", textLabel: "Tomás Rivera", value: 61_700, delta: 0.22 },
  { key: "can", label: "Can Arslan", textLabel: "Can Arslan", value: 40_750, delta: -0.11 },
];

export type DealStage = "Qualified" | "Demo held" | "Proposal" | "Negotiation" | "Won";

export interface Deal {
  id: string;
  name: string;
  company: string;
  stage: DealStage;
  owner: string;
  /** Decimal string, USD. */
  value: string;
  /** YYYY-MM-DD */
  close: string;
  probability: number;
  risk?: string;
  mine?: boolean;
}

export const deals: Deal[] = [
  { id: "D-2291", name: "Annual platform licence", company: "Northwind Logistics", stage: "Negotiation", owner: "Elif Demir", value: "84000.00", close: "2026-11-14", probability: 80, mine: true },
  { id: "D-2287", name: "120 NFC staff cards", company: "Harbor & Pine Hotels", stage: "Proposal", owner: "Jonas Becker", value: "18600.00", close: "2026-11-18", probability: 55, risk: "No reply in 9 days" },
  { id: "D-2275", name: "Multi-site POS rollout", company: "Copperleaf Bistro Group", stage: "Demo held", owner: "Maya Okafor", value: "46250.00", close: "2026-11-21", probability: 40 },
  { id: "D-2268", name: "Website + booking engine", company: "Lumen Dental Clinics", stage: "Proposal", owner: "Elif Demir", value: "22400.00", close: "2026-11-24", probability: 60, mine: true },
  { id: "D-2259", name: "Ads retainer, 12 months", company: "Atlas Fitness", stage: "Negotiation", owner: "Tomás Rivera", value: "31200.00", close: "2026-11-26", probability: 70, risk: "Budget cut flagged" },
  { id: "D-2244", name: "Menu QR + ordering", company: "Saffron Street Kitchen", stage: "Qualified", owner: "Can Arslan", value: "7900.00", close: "2026-11-28", probability: 25 },
  { id: "D-2238", name: "Partner portal pilot", company: "Brightwave Energy", stage: "Won", owner: "Elif Demir", value: "39500.00", close: "2026-11-06", probability: 100, mine: true },
];

export const activity: TimelineEntry[] = [
  { id: "a1", at: "2026-11-10T14:52:00Z", icon: Trophy, tone: "success", actor: "Elif Demir", title: <>closed <b className="font-medium text-fg">Partner portal pilot</b> · $39,500</> },
  { id: "a2", at: "2026-11-10T13:05:00Z", avatar: { name: "Jonas Becker" }, actor: "Jonas Becker", title: "sent a proposal to Harbor & Pine Hotels", body: "v3 with the volume discount on 120 cards." },
  { id: "a3", at: "2026-11-10T10:20:00Z", icon: PhoneCall, actor: "Maya Okafor", title: "logged a call with Copperleaf Bistro Group" },
  { id: "a4", at: "2026-11-09T16:40:00Z", icon: FileSignature, tone: "info", actor: "Tomás Rivera", title: "moved Atlas Fitness to Negotiation" },
  { id: "a5", at: "2026-11-09T11:15:00Z", icon: CalendarCheck, actor: "Can Arslan", title: "booked a demo with Saffron Street Kitchen for Nov 12" },
  { id: "a6", at: "2026-11-09T09:02:00Z", icon: Mail, actor: "Elif Demir", title: "replied to Lumen Dental Clinics" },
];

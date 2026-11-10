import { CalendarCheck, FileSignature, Mail, Phone, StickyNote, Trophy } from "lucide-react";
import type { AttachmentData, CommentData, TaskData, TimelineEntry } from "@vamos-ui/react";

// Fixed "now" keeps server and client renders identical.
export const NOW = "2026-11-10T10:00:00Z";
export const TODAY = "2026-11-10";

export const me = { id: "u_meltem", name: "Meltem Aydın" };

export const contact = {
  name: "Laura Callahan",
  role: "Head of Operations",
  company: "Northwind Traders",
  email: "laura.callahan@northwind.example",
  phone: "+1 (415) 555-0132",
};

export const activity: TimelineEntry[] = [
  { id: "a1", at: "2026-11-10T08:42:00Z", icon: Phone, actor: "Meltem Aydın", title: "logged a call · 14 min", body: "Agreed on the 3-year option if onboarding hours are included. Wants the revised quote before the board pack goes out." },
  { id: "a2", at: "2026-11-09T15:10:00Z", icon: Mail, actor: "Laura Callahan", title: "replied to “Renewal — revised quote”" },
  { id: "a3", at: "2026-11-07T11:30:00Z", icon: Trophy, tone: "success", actor: "Can Demir", title: "moved Northwind renewal 2027 to Proposal" },
  { id: "a4", at: "2026-11-06T13:00:00Z", icon: CalendarCheck, actor: "Meltem Aydın", title: "held a meeting · Quarterly business review", body: "Usage up 31% since May. Two new warehouses go live in February." },
  { id: "a5", at: "2026-11-04T09:05:00Z", icon: StickyNote, actor: "Meltem Aydın", title: "added a note", body: "Board meets on December 3 — wants a signed draft before then." },
  { id: "a6", at: "2026-10-28T16:20:00Z", icon: FileSignature, tone: "info", actor: "Laura Callahan", title: "signed the security questionnaire" },
];

export const comments: CommentData[] = [
  { id: "c1", author: { id: "u_can", name: "Can Demir" }, createdAt: "2026-11-09T16:40:00Z", body: "@[Meltem Aydın](user:u_meltem) Laura hinted at a 12-month price lock. Can we offer it if they sign before Dec 15?", reactions: [{ key: "like", count: 1 }] },
  { id: "c2", parentId: "c1", author: me, createdAt: "2026-11-09T17:05:00Z", body: "Yes, if the seat count stays at 40 or more. Finance already approved the band." },
  { id: "c3", author: { id: "u_ece", name: "Ece Şahin" }, createdAt: "2026-11-10T08:55:00Z", body: "SSO setup is included either way — I've added it to the onboarding plan." },
];

export const files: AttachmentData[] = [
  { id: "f1", name: "Master services agreement — Northwind 2027.pdf", size: 1_240_000, mime: "application/pdf", url: "#", uploadedBy: "Meltem Aydın", uploadedAt: "2026-11-04" },
  { id: "f2", name: "Revised quote Q-2026-114.pdf", size: 312_000, mime: "application/pdf", url: "#", uploadedBy: "Can Demir", uploadedAt: "2026-11-09" },
  { id: "f3", name: "Seat forecast 2027.xlsx", size: 86_400, mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", url: "#", uploadedBy: "Meltem Aydın", uploadedAt: "2026-10-28" },
  { id: "f4", name: "QBR deck — November.pptx", size: 8_700_000, mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", url: "#", uploadedBy: "Ece Şahin", uploadedAt: "2026-11-06" },
];

export const tasks: TaskData[] = [
  { id: "t1", title: "Send revised quote with 12-month price lock", done: false, due: "2026-11-10", priority: "high", assignee: me },
  { id: "t2", title: "Confirm SSO requirements with Northwind IT", done: false, due: "2026-11-08", priority: "urgent", assignee: { id: "u_ece", name: "Ece Şahin" } },
  { id: "t3", title: "Book on-site demo for the Oakland warehouse", done: false, due: "2026-11-13", priority: "medium", assignee: { id: "u_can", name: "Can Demir" } },
  { id: "t4", title: "Share security questionnaire", done: true, due: "2026-10-28", assignee: { id: "u_ece", name: "Ece Şahin" } },
];

export const deals = [
  { id: "d1", name: "Northwind renewal 2027", amount: 36000, stage: "Proposal", tone: "info", close: "Dec 15, 2026", probability: 70 },
  { id: "d2", name: "Analytics add-on", amount: 12500, stage: "Qualified", tone: "neutral", close: "Jan 31, 2027", probability: 40 },
  { id: "d3", name: "Initial subscription 2024", amount: 28000, stage: "Won", tone: "success", close: "Dec 2, 2024", probability: 100 },
] as const;

export const colleagues = [
  { name: "Daniel Okafor", role: "IT Director", email: "daniel.okafor@northwind.example" },
  { name: "Priya Raman", role: "Finance Controller", email: "priya.raman@northwind.example" },
];

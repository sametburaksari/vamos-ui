import type { AttachmentData, TaskData } from "@vamos-ui/react";
import type { ApprovalStageData } from "@vamos-ui/react/business";

// Fixed "now" keeps server and client renders identical.
export const NOW = "2026-11-10T09:00:00Z";
export const TODAY = "2026-11-10";

export const employee = {
  name: "Deniz Aydın",
  title: "Senior Product Designer",
  team: "Design · Product",
  email: "deniz.aydin@harbor.example",
  workPhone: "+90 212 555 01 42 · ext. 214",
  location: "İstanbul office · Hybrid",
};

/** Leave balances for the 2026 leave year, in working days. */
export const balances = [
  { id: "annual", label: "Annual leave", used: 9, entitled: 20, note: "3 days carry over to 2027" },
  { id: "sick", label: "Sick leave", used: 2, entitled: 10, note: "Self-certified up to 3 days" },
  { id: "wfh", label: "Remote days", used: 31, entitled: 48, note: "Up to 1 per week" },
  { id: "learning", label: "Learning days", used: 1, entitled: 3, note: "Conference or course" },
];

export const leaveHistory = [
  { id: "l1", type: "Annual leave", from: "2026-11-17", to: "2026-11-28", days: 10, status: "Pending", tone: "warning" },
  { id: "l2", type: "Learning day", from: "2026-10-09", to: "2026-10-09", days: 1, status: "Approved", tone: "success" },
  { id: "l3", type: "Annual leave", from: "2026-08-03", to: "2026-08-14", days: 9, status: "Taken", tone: "neutral" },
  { id: "l4", type: "Sick leave", from: "2026-03-23", to: "2026-03-24", days: 2, status: "Taken", tone: "neutral" },
] as const;

export const leaveStages: ApprovalStageData[] = [
  {
    id: "manager",
    title: "Manager approval",
    mode: "all",
    status: "approved",
    approvers: [{ id: "u_ayse", name: "Ayşe Yılmaz", role: "Head of Design", decision: { value: "approved", at: "2026-11-03T11:02:00Z", note: "Fine by me — Mert covers design reviews that fortnight." } }],
  },
  {
    id: "hr",
    title: "HR review",
    mode: "any",
    status: "active",
    dueAt: "2026-11-12T17:00:00Z",
    approvers: [
      { id: "u_selin", name: "Selin Arslan", role: "People partner" },
      { id: "u_burak", name: "Burak Koç", role: "People operations" },
    ],
  },
  { id: "payroll", title: "Payroll update", mode: "all", status: "waiting", approvers: [{ id: "u_gizem", name: "Gizem Er", role: "Payroll" }] },
];

export const documents: AttachmentData[] = [
  { id: "d1", name: "Employment contract — signed.pdf", size: 412_000, mime: "application/pdf", url: "#", uploadedBy: "Selin Arslan", uploadedAt: "2023-02-27" },
  { id: "d2", name: "Salary review letter 2026.pdf", size: 98_000, mime: "application/pdf", url: "#", uploadedBy: "Gizem Er", uploadedAt: "2026-03-01" },
  { id: "d3", name: "Remote work agreement.pdf", size: 156_000, mime: "application/pdf", url: "#", uploadedBy: "Selin Arslan", uploadedAt: "2025-09-15" },
  { id: "d4", name: "ID card — front and back.jpg", size: 1_820_000, mime: "image/jpeg", url: "#", uploadedBy: "Deniz Aydın", uploadedAt: "2023-02-27" },
  { id: "d5", name: "Diploma — Bilkent University.pdf", size: 640_000, mime: "application/pdf", url: "#", uploadedBy: "Deniz Aydın", uploadedAt: "2023-02-28" },
];

export const reviewChecklist: TaskData[] = [
  { id: "r1", title: "Self-assessment submitted", done: true },
  { id: "r2", title: "Peer feedback from 3 colleagues", done: true },
  { id: "r3", title: "Manager review written", done: false, due: "2026-11-21", assignee: { id: "u_ayse", name: "Ayşe Yılmaz" } },
  { id: "r4", title: "Calibration session", done: false, due: "2026-12-02" },
  { id: "r5", title: "Goals for 2027 agreed", done: false, due: "2026-12-12" },
];

export const directReports = [
  { name: "Mert Kaplan", role: "Product Designer" },
  { name: "Zeynep Ünal", role: "Junior Product Designer" },
];

// HR: every person in people.ts is also an employee here (manager chain, contract, leave,
// documents, reviews). Plus open roles and leave requests for dashboard-07 / detail-06.
import type { L } from "./l10n";
import { people, type TeamKey } from "./people";
import { day } from "./time";

export type Employment = "full-time" | "part-time" | "contractor";
export type LeaveType = "annual" | "sick" | "parental" | "unpaid";
export type LeaveStatus = "approved" | "pending" | "declined";

export interface Employee {
  personId: string;
  employeeNo: string;
  department: TeamKey;
  managerId?: string;
  startDate: string;
  employment: Employment;
  location: "Istanbul HQ" | "Ankara office" | "Remote";
  /** Annual leave days: entitlement and used this year. */
  leave: { entitlement: number; used: number; planned: number };
  /** Last review rating 1–5. */
  rating?: number;
}

export interface LeaveRequest {
  id: string;
  personId: string;
  type: LeaveType;
  start: string;
  end: string;
  days: number;
  status: LeaveStatus;
  note?: L;
}

export interface OpenRole {
  id: string;
  title: L;
  department: TeamKey;
  location: string;
  openedDate: string;
  applicants: number;
  stage: "sourcing" | "interviewing" | "offer";
  hiringManagerId: string;
}

export interface EmployeeDocument {
  id: string;
  personId: string;
  name: L;
  kind: "contract" | "id" | "certificate" | "payslip" | "policy";
  uploaded: string;
  /** Bytes. */
  size: number;
  expires?: string;
}

export const employmentLabels: Record<Employment, L> = {
  "full-time": { en: "Full-time", tr: "Tam zamanlı" },
  "part-time": { en: "Part-time", tr: "Yarı zamanlı" },
  contractor: { en: "Contractor", tr: "Sözleşmeli" },
};

export const leaveTypeLabels: Record<LeaveType, L> = {
  annual: { en: "Annual leave", tr: "Yıllık izin" },
  sick: { en: "Sick leave", tr: "Hastalık izni" },
  parental: { en: "Parental leave", tr: "Ebeveyn izni" },
  unpaid: { en: "Unpaid leave", tr: "Ücretsiz izin" },
};

const managers: Partial<Record<TeamKey, string>> = {
  sales: "p-noah",
  support: "p-kerem",
  ops: "p-ruth",
  finance: "p-felix",
  people: "p-ece",
  engineering: "p-viktor",
  marketing: "p-camille",
  design: "p-camille",
};

export const employees: Employee[] = people.map((p, i) => {
  const isManager = Object.values(managers).includes(p.id);
  const managerId = p.team === "leadership" ? undefined : isManager ? "p-defne" : managers[p.team];
  return {
    personId: p.id,
    employeeNo: `E-${String(1040 + i * 3)}`,
    department: p.team,
    managerId: managerId === p.id ? "p-defne" : managerId,
    startDate: day(-(120 + ((i * 173 + 1400) % 1900))),
    employment: i % 9 === 4 ? "contractor" : i % 11 === 7 ? "part-time" : "full-time",
    location: p.city === "Istanbul" ? "Istanbul HQ" : p.city === "Ankara" ? "Ankara office" : "Remote",
    leave: { entitlement: i % 5 === 0 ? 20 : 14, used: (i * 5) % 13, planned: i % 4 },
    rating: i % 6 === 3 ? undefined : 3 + ((i * 7) % 3),
  };
});
export const employeesById: Record<string, Employee> = Object.fromEntries(employees.map((e) => [e.personId, e]));
export const reportsOf = (managerId: string) => employees.filter((e) => e.managerId === managerId);

export const leaveRequests: LeaveRequest[] = [
  { id: "lv-1", personId: "p-hana", type: "annual", start: day(2), end: day(6), days: 5, status: "approved" },
  { id: "lv-2", personId: "p-arda", type: "annual", start: day(9), end: day(10), days: 2, status: "pending", note: { en: "Moving house", tr: "Taşınma" } },
  { id: "lv-3", personId: "p-gizem", type: "sick", start: day(-1), end: day(0), days: 2, status: "approved" },
  { id: "lv-4", personId: "p-maya", type: "parental", start: day(-20), end: day(70), days: 64, status: "approved" },
  { id: "lv-5", personId: "p-tomas", type: "annual", start: day(14), end: day(18), days: 5, status: "pending" },
  { id: "lv-6", personId: "p-selin", type: "unpaid", start: day(23), end: day(24), days: 2, status: "declined", note: { en: "Clashes with stock count", tr: "Stok sayımıyla çakışıyor" } },
  { id: "lv-7", personId: "p-jun", type: "annual", start: day(1), end: day(3), days: 3, status: "approved" },
];

export const openRoles: OpenRole[] = [
  { id: "r-1", title: { en: "Senior Backend Engineer", tr: "Kıdemli Backend Geliştirici" }, department: "engineering", location: "Istanbul / Remote", openedDate: day(-34), applicants: 87, stage: "interviewing", hiringManagerId: "p-viktor" },
  { id: "r-2", title: { en: "Customer Support Specialist (Arabic)", tr: "Müşteri Destek Uzmanı (Arapça)" }, department: "support", location: "Istanbul", openedDate: day(-12), applicants: 41, stage: "sourcing", hiringManagerId: "p-kerem" },
  { id: "r-3", title: { en: "Field Technician", tr: "Saha Teknisyeni" }, department: "ops", location: "Kocaeli", openedDate: day(-21), applicants: 19, stage: "offer", hiringManagerId: "p-ruth" },
  { id: "r-4", title: { en: "Account Executive, DACH", tr: "Satış Temsilcisi, DACH" }, department: "sales", location: "Remote (EU)", openedDate: day(-48), applicants: 63, stage: "interviewing", hiringManagerId: "p-noah" },
];

export const employeeDocuments: EmployeeDocument[] = [
  { id: "doc-1", personId: "p-kerem", name: { en: "Employment contract", tr: "İş sözleşmesi" }, kind: "contract", uploaded: day(-610), size: 284_112 },
  { id: "doc-2", personId: "p-kerem", name: { en: "First aid certificate", tr: "İlk yardım sertifikası" }, kind: "certificate", uploaded: day(-200), size: 512_004, expires: day(25) },
  { id: "doc-3", personId: "p-kerem", name: { en: "October payslip", tr: "Ekim bordrosu" }, kind: "payslip", uploaded: day(-18), size: 96_310 },
  { id: "doc-4", personId: "p-kerem", name: { en: "Remote work policy (signed)", tr: "Uzaktan çalışma politikası (imzalı)" }, kind: "policy", uploaded: day(-90), size: 140_880 },
];

/** Headcount at the start of each of the last 12 months, with hires and leavers (oldest first). */
export const headcountTrend = [
  [96, 4, 1], [99, 3, 2], [100, 5, 1], [104, 2, 3], [103, 6, 2], [107, 3, 1],
  [109, 4, 4], [109, 7, 2], [114, 2, 1], [115, 5, 3], [117, 3, 2], [118, 4, 1],
].map(([headcount, hires, leavers], i) => ({ month: day(-(11 - i) * 30).slice(0, 7), headcount: headcount!, hires: hires!, leavers: leavers! }));

/** Employee NPS survey result (−100…100) and response breakdown. */
export const enps = { score: 34, promoters: 52, passives: 30, detractors: 18, responses: 96, previous: 27 };

// HR dashboard data. People, leave requests, open roles, headcount trend and eNPS come from the
// shared fixtures; this file adds the company-wide department split (118 people, of whom the
// 24 fixture people are the ones you meet in every block) and the calendar window.
import { enps, headcountTrend, leaveRequests, leaveTypeLabels, openRoles, type LeaveRequest, type LeaveType, type OpenRole } from "../../_shared/hr";
import type { L } from "../../_shared/l10n";
import type { TeamKey } from "../../_shared/people";
import { day, TODAY } from "../../_shared/time";

export { enps, headcountTrend, leaveRequests, leaveTypeLabels, openRoles };
export type { LeaveRequest, LeaveType, OpenRole };

/** Headcount per department today — sums to the last month of `headcountTrend`. */
export const departments: Array<{ key: TeamKey; count: number; delta: number }> = [
  { key: "engineering", count: 34, delta: 3 },
  { key: "support", count: 22, delta: 1 },
  { key: "ops", count: 21, delta: 2 },
  { key: "sales", count: 15, delta: -1 },
  { key: "marketing", count: 8, delta: 0 },
  { key: "design", count: 7, delta: 1 },
  { key: "finance", count: 5, delta: 0 },
  { key: "people", count: 4, delta: 0 },
  { key: "leadership", count: 2, delta: 0 },
];

/** Three calendar weeks from the Monday of this week (TODAY is a Wednesday). */
export const calendarDays = Array.from({ length: 21 }, (_, i) => day(i - 2));
export { TODAY };
export const isWeekend = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return d === 0 || d === 6;
};

/** Leave type → colour token for the calendar bars. */
export const leaveColor: Record<LeaveType, string> = {
  annual: "var(--color-chart-2)",
  sick: "var(--color-chart-4)",
  parental: "var(--color-chart-3)",
  unpaid: "var(--color-fg-subtle)",
};

export type RoleStage = OpenRole["stage"];
export const roleStages: Array<{ key: RoleStage; label: L }> = [
  { key: "sourcing", label: { en: "Sourcing", tr: "Aday arama" } },
  { key: "interviewing", label: { en: "Interviewing", tr: "Mülakat" } },
  { key: "offer", label: { en: "Offer out", tr: "Teklif verildi" } },
];

/** Hires and leavers year to date (Jan–Nov) and attrition over the trailing 12 months. */
export const ytd = (() => {
  const thisYear = headcountTrend.filter((m) => m.month.startsWith("2026"));
  const hires = thisYear.reduce((s, m) => s + m.hires, 0);
  const leavers = thisYear.reduce((s, m) => s + m.leavers, 0);
  const avg = headcountTrend.reduce((s, m) => s + m.headcount, 0) / headcountTrend.length;
  const leavers12 = headcountTrend.reduce((s, m) => s + m.leavers, 0);
  return { hires, leavers, attrition: leavers12 / avg };
})();

import type { PickerUser, UploadHandler } from "@vamos-ui/react";

/** "Today" for the example, so validation reads the same on every visit. */
export const TODAY = "2026-11-10";

export type LeaveTypeId = "annual" | "sick" | "unpaid" | "parental" | "remote";

export interface LeaveType {
  id: LeaveTypeId;
  label: string;
  description: string;
  /** Days left this year; `null` = no allowance. */
  balance: number | null;
  /** Needs a document when longer than this many days. */
  documentAfter?: number;
}

export const leaveTypes: LeaveType[] = [
  { id: "annual", label: "Annual leave", description: "Paid holiday from your yearly allowance.", balance: 14 },
  { id: "sick", label: "Sick leave", description: "A doctor’s note is needed for more than 2 days.", balance: null, documentAfter: 2 },
  { id: "remote", label: "Work from elsewhere", description: "Up to 20 days a year outside Türkiye.", balance: 11 },
  { id: "unpaid", label: "Unpaid leave", description: "Agreed with your manager first. Affects payroll.", balance: null },
  { id: "parental", label: "Parental leave", description: "Birth, adoption or foster care.", balance: 70 },
];

/** Public holidays in Türkiye that fall in the example's range (YYYY-MM-DD). */
export const holidays: Record<string, string> = {
  "2026-10-29": "Republic Day",
  "2027-01-01": "New Year’s Day",
};

export const colleagues: PickerUser[] = [
  { id: "u03", name: "Ece Yılmaz", email: "ece@northwind.studio", meta: "Content designer · Site", status: "online" },
  { id: "u06", name: "Zeynep Kaya", email: "zeynep@northwind.studio", meta: "Editor · Site", status: "away" },
  { id: "u13", name: "Kerem Aksoy", email: "kerem@northwind.studio", meta: "Account lead · CRM", status: "online" },
  { id: "u14", name: "Ilgın Tunç", email: "ilgin@northwind.studio", meta: "Editor · Site", status: "offline" },
  { id: "u07", name: "Burak Demir", email: "burak@northwind.studio", meta: "Sales · CRM", status: "busy" },
  { id: "u09", name: "Can Şahin", email: "can@northwind.studio", meta: "Left in September", disabled: true },
];

export const approvers = [
  { id: "u02", name: "Meltem Aydın", role: "Your manager" },
  { id: "u05", name: "Deniz Arslan", role: "HR" },
];

/** Who else is out — shown while you pick dates. */
export const teamAway = [
  { name: "Zeynep Kaya", from: "2026-11-24", to: "2026-11-26", type: "Annual leave" },
  { name: "Burak Demir", from: "2026-12-01", to: "2026-12-05", type: "Work from elsewhere" },
];

const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
export const isoOf = (d: Date) => d.toISOString().slice(0, 10);

/** Working days in an inclusive range: weekends and public holidays don't count. */
export function workingDays(from: string, to: string): { days: number; skipped: string[] } {
  const skipped: string[] = [];
  let days = 0;
  for (let d = toDate(from); d <= toDate(to); d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = isoOf(d);
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    if (holidays[iso]) {
      skipped.push(`${holidays[iso]} (${iso})`);
      continue;
    }
    days += 1;
  }
  return { days, skipped };
}

export const overlaps = (a: { from: string; to: string }, b: { from: string; to: string }) => a.from <= b.to && b.from <= a.to;

/** Simulated upload with progress — swap for your storage API. */
export const uploadDocument: UploadHandler = (_file, { signal, onProgress }) =>
  new Promise((resolve, reject) => {
    let pct = 0;
    const timer = window.setInterval(() => {
      pct = Math.min(100, pct + 18);
      onProgress(pct);
      if (pct >= 100) {
        window.clearInterval(timer);
        resolve({ id: `doc-${Date.now()}` });
      }
    }, 160);
    signal.addEventListener("abort", () => {
      window.clearInterval(timer);
      reject(signal.reason);
    });
  });

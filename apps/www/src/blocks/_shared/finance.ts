// Invoices (receivable and payable), cash position and monthly burn for the finance blocks
// (dashboard-09 cash flow, settings-03 billing history, detail-04 customer 360).
import type { L } from "./l10n";
import type { Money } from "./money";
import { companies } from "./companies";
import { seeded, int, pick } from "./random";
import { day, daysBetween, TODAY, month } from "./time";

export type InvoiceDirection = "receivable" | "payable";
export type InvoiceStatus = "draft" | "sent" | "partially-paid" | "paid" | "overdue" | "void";

export interface Invoice {
  id: string;
  number: string;
  direction: InvoiceDirection;
  /** Customer (receivable) or supplier name (payable). */
  counterparty: string;
  companyId?: string;
  issueDate: string;
  dueDate: string;
  amount: Money;
  /** Amount still open. */
  balance: Money;
  status: InvoiceStatus;
  paidDate?: string;
}

export const invoiceStatusLabels: Record<InvoiceStatus, L> = {
  draft: { en: "Draft", tr: "Taslak" },
  sent: { en: "Sent", tr: "Gönderildi" },
  "partially-paid": { en: "Partially paid", tr: "Kısmen ödendi" },
  paid: { en: "Paid", tr: "Ödendi" },
  overdue: { en: "Overdue", tr: "Vadesi geçti" },
  void: { en: "Void", tr: "İptal" },
};

export const invoiceStatusTone: Record<InvoiceStatus, "neutral" | "info" | "warning" | "success" | "danger"> = {
  draft: "neutral",
  sent: "info",
  "partially-paid": "warning",
  paid: "success",
  overdue: "danger",
  void: "neutral",
};

const suppliers = ["Anatolia Packaging Co.", "Mavi Hat Cloud Hosting", "Kırlangıç Couriers", "Pera Office Lease", "Delta Print House", "Sarnıç Water & Coffee", "Northgate Insurance Brokers"];

function build(): Invoice[] {
  const rand = seeded(909);
  const out: Invoice[] = [];
  const payers = companies.filter((c) => c.lifecycle !== "lead");
  for (let i = 0; i < 36; i++) {
    const direction: InvoiceDirection = i % 3 === 2 ? "payable" : "receivable";
    const issueOffset = -int(rand, 0, 95);
    const issueDate = day(issueOffset);
    const dueDate = day(issueOffset + pick(rand, [14, 30, 30, 45, 60]));
    const company = direction === "receivable" ? pick(rand, payers) : undefined;
    const currency = company?.mrr.currency ?? "TRY";
    const base = currency === "TRY" ? int(rand, 8, 240) * 500 : int(rand, 4, 90) * 50;
    const amount = base.toFixed(2);
    const overdue = daysBetween(dueDate, TODAY) > 0;
    const roll = rand();
    const status: InvoiceStatus =
      issueOffset > -2 && roll < 0.3 ? "draft"
      : roll < 0.5 ? "paid"
      : overdue ? (roll < 0.62 ? "partially-paid" : "overdue")
      : roll < 0.6 ? "partially-paid"
      : "sent";
    const balance = status === "paid" || status === "draft" ? (status === "paid" ? "0.00" : amount) : status === "partially-paid" ? (base * 0.4).toFixed(2) : amount;
    out.push({
      id: `inv-${i + 1}`,
      number: direction === "receivable" ? `INV-2026-${String(318 + i).padStart(4, "0")}` : `BILL-${String(7710 + i * 13)}`,
      direction,
      counterparty: company?.name ?? pick(rand, suppliers),
      companyId: company?.id,
      issueDate,
      dueDate,
      amount: { amount, currency },
      balance: { amount: balance, currency },
      status,
      paidDate: status === "paid" ? day(Math.min(0, issueOffset + int(rand, 3, 30))) : undefined,
    });
  }
  return out.sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1));
}

/** 36 invoices (two thirds receivable), newest first. */
export const invoices: Invoice[] = build();
export const receivables = invoices.filter((i) => i.direction === "receivable");
export const payables = invoices.filter((i) => i.direction === "payable");

/** Ageing bucket for an open invoice: current, 1–30, 31–60, 61–90, 90+ days past due. */
export type AgeingBucket = "current" | "1-30" | "31-60" | "61-90" | "90+";
export function ageingBucket(inv: Pick<Invoice, "dueDate">, today = TODAY): AgeingBucket {
  const late = daysBetween(inv.dueDate, today);
  return late <= 0 ? "current" : late <= 30 ? "1-30" : late <= 60 ? "31-60" : late <= 90 ? "61-90" : "90+";
}
export const ageingLabels: Record<AgeingBucket, L> = {
  current: { en: "Not yet due", tr: "Vadesi gelmedi" },
  "1-30": { en: "1–30 days", tr: "1–30 gün" },
  "31-60": { en: "31–60 days", tr: "31–60 gün" },
  "61-90": { en: "61–90 days", tr: "61–90 gün" },
  "90+": { en: "Over 90 days", tr: "90 günden fazla" },
};

/** Cash position, TRY, end of each of the last 12 months (oldest first) — month: YYYY-MM-01. */
export const cashBalance: Array<{ month: string; cashIn: string; cashOut: string; balance: string }> = (() => {
  const rand = seeded(1201);
  let balance = 4_180_000;
  return Array.from({ length: 12 }, (_, i) => {
    const cashIn = 1_150_000 + i * 21_000 + int(rand, -90, 90) * 1000;
    const cashOut = 1_290_000 + i * 18_500 + int(rand, -70, 70) * 1000;
    balance += cashIn - cashOut;
    return { month: month(i - 11), cashIn: cashIn.toFixed(2), cashOut: cashOut.toFixed(2), balance: balance.toFixed(2) };
  });
})();

/** Average monthly net burn over the last 3 months and the runway it implies. */
export const burn = (() => {
  const last = cashBalance.slice(-3);
  const net = last.reduce((s, r) => s + (Number(r.cashOut) - Number(r.cashIn)), 0) / 3;
  const balance = Number(cashBalance.at(-1)!.balance);
  return { monthlyNetBurn: net.toFixed(2), cash: balance.toFixed(2), runwayMonths: Math.round((balance / Math.max(net, 1)) * 10) / 10 };
})();

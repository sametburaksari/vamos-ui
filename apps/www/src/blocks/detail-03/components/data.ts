import { CircleDollarSign, Eye, FilePlus2, Send, BellRing, CheckCircle2 } from "lucide-react";
import type { AttachmentData, TimelineEntry } from "@vamos-ui/react";
import type { LineDiscount, LineItem } from "@vamos-ui/react/business";

// Fixed "now" keeps server and client renders identical.
export const NOW = "2026-11-10T10:00:00Z";

export const invoice = {
  number: "INV-2026-0418",
  quote: "Q-2026-114",
  project: "Website rebuild & booking flow",
  currency: "EUR",
  issued: "2026-10-27",
  due: "2026-11-26",
  terms: "Net 30",
  po: "PO-88412",
};

export const seller = {
  name: "Northpoint Studio",
  lines: ["Rıhtım Caddesi 41, Karaköy", "34425 Beyoğlu, İstanbul, Türkiye"],
  taxId: "VAT TR 9250 4417 30",
  email: "billing@northpoint.example",
};

export const customer = {
  name: "Harbor & Pine Hospitality B.V.",
  contact: "Sanne de Vries · Finance",
  lines: ["Prinsengracht 412", "1016 JA Amsterdam, Netherlands"],
  taxId: "VAT NL 8634 21907 B01",
  email: "ap@harborpine.example",
};

export const lines: LineItem[] = [
  { id: "l1", description: "Discovery workshop — 2 days on site", quantity: "2", unit: "day", unitPrice: "1450.00", taxRate: "20" },
  { id: "l2", description: "UX design — booking flow (12 screens)", quantity: "36", unit: "hour", unitPrice: "95.00", taxRate: "20" },
  { id: "l3", description: "Front-end build, Next.js + CMS", quantity: "80", unit: "hour", unitPrice: "85.00", taxRate: "20", discount: { type: "percent", value: "10" } },
  { id: "l4", description: "Hosting & maintenance, Nov 2026 – Oct 2027", quantity: "12", unit: "month", unitPrice: "40.00", taxRate: "20" },
];

/** Loyalty discount agreed on the quote. */
export const documentDiscount: LineDiscount = { type: "amount", value: "250.00" };

/** Payments received so far, decimal strings. */
export const payments = [
  { id: "p1", date: "2026-11-03", method: "Bank transfer · ING ****4021", reference: "HPH-TRX-55120", amount: "5000.00" },
];

export const activity: TimelineEntry[] = [
  { id: "a1", at: "2026-11-10T08:10:00Z", icon: BellRing, actor: "System", title: "scheduled a reminder for Nov 24", tone: "info" },
  { id: "a2", at: "2026-11-03T14:22:00Z", icon: CircleDollarSign, tone: "success", actor: "Sanne de Vries", title: "paid €5,000.00 by bank transfer" },
  { id: "a3", at: "2026-10-28T09:41:00Z", icon: Eye, actor: "Sanne de Vries", title: "viewed the invoice" },
  { id: "a4", at: "2026-10-27T16:05:00Z", icon: Send, actor: "Samet Sarı", title: "sent the invoice to ap@harborpine.example" },
  { id: "a5", at: "2026-10-27T15:58:00Z", icon: CheckCircle2, actor: "Ece Şahin", title: "approved the invoice" },
  { id: "a6", at: "2026-10-27T15:30:00Z", icon: FilePlus2, actor: "Samet Sarı", title: "created the invoice from quote Q-2026-114" },
];

export const attachments: AttachmentData[] = [
  { id: "f1", name: "INV-2026-0418.pdf", size: 184_000, mime: "application/pdf", url: "#", uploadedBy: "Samet Sarı", uploadedAt: "2026-10-27" },
  { id: "f2", name: "Signed quote Q-2026-114.pdf", size: 226_000, mime: "application/pdf", url: "#", uploadedBy: "Sanne de Vries", uploadedAt: "2026-10-20" },
  { id: "f3", name: "Purchase order PO-88412.pdf", size: 91_000, mime: "application/pdf", url: "#", uploadedBy: "Sanne de Vries", uploadedAt: "2026-10-21" },
];

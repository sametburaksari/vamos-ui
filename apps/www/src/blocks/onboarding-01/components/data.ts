import type { TaskData } from "@vamos-ui/react";

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  /** Minutes. */
  minutes: number;
  action: string;
  help: string;
  done: boolean;
}

export interface SetupStage {
  id: string;
  title: string;
  steps: SetupStep[];
}

export const stages: SetupStage[] = [
  {
    id: "workspace",
    title: "Make it yours",
    steps: [
      { id: "profile", title: "Add your logo and company details", description: "They appear on quotes, invoices and the client portal.", minutes: 3, action: "Open workspace settings", help: "What goes on documents", done: true },
      { id: "domain", title: "Connect your domain", description: "Publish the site on northwind.studio and send email from it. We check DNS every few minutes.", minutes: 10, action: "Connect domain", help: "DNS records explained", done: true },
      { id: "brand", title: "Pick fonts and an accent", description: "Choose from 16 tested pairings or mix your own from 59 Google Fonts.", minutes: 2, action: "Open appearance", help: "Choosing a pairing", done: true },
    ],
  },
  {
    id: "data",
    title: "Bring your data",
    steps: [
      { id: "contacts", title: "Import contacts", description: "Upload a CSV or Excel file from your old CRM. Columns are matched for you; duplicates are merged.", minutes: 5, action: "Import contacts", help: "Supported formats", done: true },
      { id: "pipeline", title: "Set up your sales pipeline", description: "Rename the stages to match how you sell, and set a win probability for each.", minutes: 4, action: "Edit pipeline", help: "Pipeline best practices", done: false },
      { id: "products", title: "Add products and prices", description: "Used by quotes and invoices. Import a price list or add the first five by hand.", minutes: 6, action: "Add products", help: "Taxes and price lists", done: false },
    ],
  },
  {
    id: "launch",
    title: "Invite and go live",
    steps: [
      { id: "team", title: "Invite your team", description: "Give each person a role. You can change what roles can do under Users & roles.", minutes: 2, action: "Invite people", help: "Roles and permissions", done: false },
      { id: "payments", title: "Turn on online payments", description: "Let clients pay invoices by card. Payouts arrive in 2 business days.", minutes: 8, action: "Connect iyzico", help: "Fees and payouts", done: false },
      { id: "publish", title: "Publish your site", description: "Your home page, services and contact form are ready to go.", minutes: 1, action: "Review and publish", help: "Pre-launch checklist", done: false },
    ],
  },
];

export const firstWeek: TaskData[] = [
  { id: "t1", title: "Walkthrough call with the Vamos team", done: true, assignee: { id: "u01", name: "Samet Burak Sarı" }, due: "2026-11-09" },
  { id: "t2", title: "Move November quotes from spreadsheets", done: false, assignee: { id: "u13", name: "Kerem Aksoy" }, due: "2026-11-10", priority: "high" },
  {
    id: "t3",
    title: "Rewrite service pages for the new site",
    done: false,
    assignee: { id: "u03", name: "Ece Yılmaz" },
    due: "2026-11-12",
    children: [
      { id: "t3a", title: "Brand & web", done: true },
      { id: "t3b", title: "Google Ads management", done: false },
      { id: "t3c", title: "QR menus and NFC cards", done: false },
    ],
  },
  { id: "t4", title: "Add employee records and leave balances", done: false, assignee: { id: "u05", name: "Deniz Arslan" }, due: "2026-11-13", priority: "medium" },
  { id: "t5", title: "Set up the weekly pipeline review", done: false, assignee: { id: "u02", name: "Meltem Aydın" }, due: "2026-11-07", priority: "low" },
];

export const resources = [
  { title: "Admin guide", description: "Settings, roles and billing in 12 short chapters", href: "#guide" },
  { title: "Video: your first quote", description: "4 minutes · from product to signed PDF", href: "#video" },
  { title: "Migration service", description: "We move your data from another tool for you", href: "#migration" },
];

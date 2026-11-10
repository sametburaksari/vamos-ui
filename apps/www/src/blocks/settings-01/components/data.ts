import type { SelectOption } from "@vamos-ui/react";

export interface WorkspaceForm {
  name: string;
  slug: string;
  industry: string;
  about: string;
  supportEmail: string;
  phone: string;
  website: string;
  address: string;
  landingApp: string;
  fiscalStart: string;
  weekStart: string;
  require2fa: boolean;
  sessionTimeout: string;
  allowedDomains: string[];
  ssoOnly: boolean;
  digest: boolean;
  mentions: boolean;
  billingAlerts: boolean;
}

/** What the server returned. The save bar compares the form against it. */
export const savedWorkspace: WorkspaceForm = {
  name: "Northwind Studio",
  slug: "northwind",
  industry: "agency",
  about: "Brand, web and growth studio for hospitality and retail teams in Istanbul and Izmir.",
  supportEmail: "hello@northwind.studio",
  phone: "+90 216 807 29 07",
  website: "https://northwind.studio",
  address: "Office Link, Piazza AVM, Cevizli Mah.\nMaltepe, Istanbul 34846",
  landingApp: "crm",
  fiscalStart: "01",
  weekStart: "monday",
  require2fa: true,
  sessionTimeout: "12h",
  allowedDomains: ["northwind.studio", "northwind.com.tr"],
  ssoOnly: false,
  digest: true,
  mentions: true,
  billingAlerts: false,
};

export const industries: SelectOption[] = [
  { value: "agency", label: "Agency & studio" },
  { value: "hospitality", label: "Hospitality" },
  { value: "retail", label: "Retail & e-commerce" },
  { value: "health", label: "Health & wellness" },
  { value: "education", label: "Education" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "other", label: "Something else" },
];

export const landingApps: SelectOption[] = [
  { value: "site", label: "Site", description: "Pages, posts, media and forms" },
  { value: "crm", label: "CRM", description: "Pipeline, contacts and quotes" },
  { value: "people", label: "People", description: "Employees, leave and shifts" },
  { value: "work", label: "Work", description: "Projects, tasks and invoices" },
];

export const months: SelectOption[] = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
].map((label, i) => ({ value: String(i + 1).padStart(2, "0"), label }));

export const sessionTimeouts: SelectOption[] = [
  { value: "1h", label: "1 hour" },
  { value: "8h", label: "8 hours" },
  { value: "12h", label: "12 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

const domain = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/;
export const validateDomain = (v: string) => domain.test(v) || "Enter a domain like company.com";

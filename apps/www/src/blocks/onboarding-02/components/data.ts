export interface WelcomeForm {
  name: string;
  slug: string;
  teamSize: string;
  apps: string[];
  invites: string[];
  inviteRole: string;
  accent: string;
  pairing: string;
}

export const initialWelcome: WelcomeForm = {
  name: "",
  slug: "",
  teamSize: "2-10",
  apps: ["site", "crm"],
  invites: [],
  inviteRole: "editor",
  accent: "lime",
  pairing: "editorial",
};

export const appChoices = [
  { value: "site", label: "Site", description: "Pages, blog, media library and forms." },
  { value: "crm", label: "CRM", description: "Contacts, pipeline, quotes and invoices." },
  { value: "people", label: "People", description: "Employees, leave requests and shifts." },
  { value: "work", label: "Work", description: "Projects, tasks, timesheets and partners." },
];

export const teamSizes = [
  { value: "1", label: "Just me" },
  { value: "2-10", label: "2–10" },
  { value: "11-50", label: "11–50" },
  { value: "51+", label: "51+" },
];

export const inviteRoles = [
  { value: "admin", label: "Admin", description: "Everything except billing" },
  { value: "editor", label: "Editor", description: "Site content and media" },
  { value: "sales", label: "Sales", description: "CRM pipeline and quotes" },
  { value: "viewer", label: "Viewer", description: "Read-only" },
];

export const accentChoices = [
  { value: "lime", label: "Lime" },
  { value: "ocean", label: "Ocean" },
  { value: "ember", label: "Ember" },
  { value: "rose", label: "Rose" },
  { value: "graphite", label: "Graphite" },
];

/** Four starting pairings; the full list of 16 lives in Settings → Appearance. */
export const starterPairings = ["editorial", "grotesk", "corporate", "boutique"];

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Not a valid email address";

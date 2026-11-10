// Example data for Users & roles. Deterministic, so server and client render the same rows.

export type RoleId = "owner" | "admin" | "editor" | "sales" | "hr" | "viewer";
export type MemberStatus = "active" | "invited" | "suspended";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  apps: string[];
  status: MemberStatus;
  twoFactor: boolean;
  lastActive: string | null;
}

export const members: Member[] = [
  { id: "u01", name: "Samet Burak Sarı", email: "samet@northwind.studio", role: "owner", apps: ["Site", "CRM", "People", "Work"], status: "active", twoFactor: true, lastActive: "2026-11-10T09:12:00Z" },
  { id: "u02", name: "Meltem Aydın", email: "meltem@northwind.studio", role: "admin", apps: ["Site", "CRM", "People", "Work"], status: "active", twoFactor: true, lastActive: "2026-11-10T08:41:00Z" },
  { id: "u03", name: "Ece Yılmaz", email: "ece@northwind.studio", role: "editor", apps: ["Site"], status: "active", twoFactor: true, lastActive: "2026-11-09T16:05:00Z" },
  { id: "u04", name: "Ahmet Koç", email: "ahmet@northwind.studio", role: "sales", apps: ["CRM", "Work"], status: "active", twoFactor: false, lastActive: "2026-11-10T07:58:00Z" },
  { id: "u05", name: "Deniz Arslan", email: "deniz@northwind.studio", role: "hr", apps: ["People"], status: "active", twoFactor: true, lastActive: "2026-11-08T13:20:00Z" },
  { id: "u06", name: "Zeynep Kaya", email: "zeynep@northwind.studio", role: "editor", apps: ["Site", "Work"], status: "active", twoFactor: true, lastActive: "2026-11-07T10:44:00Z" },
  { id: "u07", name: "Burak Demir", email: "burak@northwind.studio", role: "sales", apps: ["CRM"], status: "active", twoFactor: true, lastActive: "2026-11-10T06:30:00Z" },
  { id: "u08", name: "Selin Öztürk", email: "selin.ozturk@gmail.com", role: "viewer", apps: ["Work"], status: "invited", twoFactor: false, lastActive: null },
  { id: "u09", name: "Can Şahin", email: "can@northwind.studio", role: "editor", apps: ["Site"], status: "suspended", twoFactor: false, lastActive: "2026-09-21T11:00:00Z" },
  { id: "u10", name: "Elif Çelik", email: "elif@northwind.studio", role: "hr", apps: ["People", "Work"], status: "active", twoFactor: true, lastActive: "2026-11-09T09:15:00Z" },
  { id: "u11", name: "Mert Yıldız", email: "mert@northwind.studio", role: "sales", apps: ["CRM"], status: "invited", twoFactor: false, lastActive: null },
  { id: "u12", name: "Ayşe Polat", email: "ayse@harborpine.co", role: "viewer", apps: ["Work"], status: "active", twoFactor: false, lastActive: "2026-11-05T15:52:00Z" },
  { id: "u13", name: "Kerem Aksoy", email: "kerem@northwind.studio", role: "admin", apps: ["Site", "CRM", "Work"], status: "active", twoFactor: true, lastActive: "2026-11-10T05:03:00Z" },
  { id: "u14", name: "Ilgın Tunç", email: "ilgin@northwind.studio", role: "editor", apps: ["Site"], status: "active", twoFactor: true, lastActive: "2026-11-06T18:27:00Z" },
];

export const roleOptions = [
  { value: "owner", label: "Owner", tone: "accent" },
  { value: "admin", label: "Admin", tone: "info" },
  { value: "editor", label: "Editor", tone: "neutral" },
  { value: "sales", label: "Sales", tone: "neutral" },
  { value: "hr", label: "HR manager", tone: "neutral" },
  { value: "viewer", label: "Viewer", tone: "neutral" },
] as const;

export const statusOptions = [
  { value: "active", label: "Active", tone: "success" },
  { value: "invited", label: "Invited", tone: "info" },
  { value: "suspended", label: "Suspended", tone: "warning" },
] as const;

/* ------------------------------------------------------------------ */
/* Roles & permissions                                                 */
/* ------------------------------------------------------------------ */

export const actions = [
  { id: "view", label: "View" },
  { id: "create", label: "Create" },
  { id: "edit", label: "Edit" },
  { id: "delete", label: "Delete" },
  { id: "export", label: "Export" },
] as const;
export type ActionId = (typeof actions)[number]["id"];

export interface Resource {
  id: string;
  label: string;
  description: string;
  /** Actions that exist for this resource (others render as "—"). */
  actions: ActionId[];
}

export const resourceGroups: { app: string; resources: Resource[] }[] = [
  {
    app: "Site",
    resources: [
      { id: "posts", label: "Posts & pages", description: "Write, schedule and publish content", actions: ["view", "create", "edit", "delete", "export"] },
      { id: "media", label: "Media library", description: "Upload, crop and replace files", actions: ["view", "create", "edit", "delete"] },
      { id: "forms", label: "Form submissions", description: "Read and export what visitors send", actions: ["view", "delete", "export"] },
    ],
  },
  {
    app: "CRM",
    resources: [
      { id: "contacts", label: "Contacts & companies", description: "People, organisations and their history", actions: ["view", "create", "edit", "delete", "export"] },
      { id: "deals", label: "Deals", description: "Pipeline stages and forecast", actions: ["view", "create", "edit", "delete", "export"] },
      { id: "quotes", label: "Quotes", description: "Create and send priced proposals", actions: ["view", "create", "edit", "delete"] },
    ],
  },
  {
    app: "People",
    resources: [
      { id: "employees", label: "Employee records", description: "Profiles, contracts and documents", actions: ["view", "create", "edit", "delete", "export"] },
      { id: "leave", label: "Leave requests", description: "Approve and plan time off", actions: ["view", "create", "edit", "delete"] },
      { id: "payroll", label: "Salaries", description: "Compensation and payroll exports", actions: ["view", "edit", "export"] },
    ],
  },
  {
    app: "Workspace",
    resources: [
      { id: "users", label: "Users & roles", description: "Invite people and change access", actions: ["view", "create", "edit", "delete"] },
      { id: "billing", label: "Billing", description: "Plan, invoices and payment method", actions: ["view", "edit"] },
      { id: "settings", label: "Settings", description: "Workspace-wide configuration", actions: ["view", "edit"] },
    ],
  },
];

export const allResources = resourceGroups.flatMap((g) => g.resources);

/** `"<resource>.<action>"` keys. */
export type PermissionSet = string[];

const every = (ids: string[], acts: ActionId[] = ["view", "create", "edit", "delete", "export"]) =>
  ids.flatMap((id) => {
    const r = allResources.find((x) => x.id === id)!;
    return r.actions.filter((a) => acts.includes(a)).map((a) => `${id}.${a}`);
  });

export interface Role {
  id: RoleId;
  label: string;
  description: string;
  /** Owner can't be edited. */
  locked?: boolean;
  permissions: PermissionSet;
}

export const roles: Role[] = [
  { id: "owner", label: "Owner", description: "Everything, including billing and deleting the workspace.", locked: true, permissions: every(allResources.map((r) => r.id)) },
  { id: "admin", label: "Admin", description: "Everything except billing.", permissions: every(allResources.map((r) => r.id).filter((id) => id !== "billing")).concat("billing.view") },
  { id: "editor", label: "Editor", description: "Site content and media.", permissions: every(["posts", "media"]).concat(every(["forms"], ["view"])) },
  { id: "sales", label: "Sales", description: "CRM pipeline and quotes.", permissions: every(["contacts", "deals", "quotes"], ["view", "create", "edit", "export"]) },
  { id: "hr", label: "HR manager", description: "Employee records, leave and salaries.", permissions: every(["employees", "leave", "payroll"]).concat("users.view") },
  { id: "viewer", label: "Viewer", description: "Read-only access to the apps they are added to.", permissions: every(allResources.filter((r) => !["payroll", "billing", "users", "settings"].includes(r.id)).map((r) => r.id), ["view"]) },
];

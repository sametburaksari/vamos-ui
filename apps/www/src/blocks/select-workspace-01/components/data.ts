import type { LucideIcon } from "lucide-react";
import { Briefcase, Globe, KanbanSquare, Users } from "lucide-react";

export type Plan = "Enterprise" | "Team" | "Trial";
export type AppId = "site" | "crm" | "people" | "work";

export interface Workspace {
  id: string;
  name: string;
  domain: string;
  role: "Owner" | "Admin" | "Editor" | "Member";
  members: number;
  plan: Plan;
  /** Days left, for trials. */
  trialDays?: number;
  /** ISO timestamp of the last visit. */
  lastOpened: string;
  apps: AppId[];
}

export interface Invitation {
  id: string;
  workspace: Workspace;
  invitedBy: string;
}

export const apps: Record<AppId, { name: string; description: string; icon: LucideIcon }> = {
  site: { name: "Site", description: "Pages, blog, media and forms", icon: Globe },
  crm: { name: "CRM", description: "Contacts, deals and pipelines", icon: Briefcase },
  people: { name: "People", description: "Employees, leave and payroll", icon: Users },
  work: { name: "Work", description: "Projects, tasks and time", icon: KanbanSquare },
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const workspaces: Workspace[] = [
  { id: "ws_northwind", name: "Northwind Labs", domain: "northwind.northpoint.app", role: "Admin", members: 48, plan: "Enterprise", lastOpened: hoursAgo(2), apps: ["site", "crm", "people", "work"] },
  { id: "ws_brightline", name: "Brightline Logistics", domain: "brightline.northpoint.app", role: "Editor", members: 112, plan: "Team", lastOpened: hoursAgo(27), apps: ["crm", "work"] },
  { id: "ws_kestrel", name: "Kestrel Dental Group", domain: "kestrel.northpoint.app", role: "Owner", members: 9, plan: "Trial", trialDays: 6, lastOpened: hoursAgo(96), apps: ["site", "crm"] },
  { id: "ws_oakline", name: "Oakline Coffee Roasters", domain: "oakline.northpoint.app", role: "Member", members: 23, plan: "Team", lastOpened: hoursAgo(24 * 19), apps: ["site", "people"] },
];

export const invitations: Invitation[] = [
  {
    id: "inv_harbor",
    invitedBy: "Lena Ortiz",
    workspace: { id: "ws_harbor", name: "Harbor & Pine Studio", domain: "harborpine.northpoint.app", role: "Editor", members: 14, plan: "Team", lastOpened: hoursAgo(0), apps: ["site", "work"] },
  },
];

// Workspaces for an agency that runs client portals and a partner programme.
// Clients, partner, projects and registrations come from the shared fixtures.
import {
  BadgeCheck, CheckSquare, FileText, FolderKanban, Handshake, HeartHandshake, Home, Megaphone, MessagesSquare, Receipt, Users, Wallet,
  type LucideIcon,
} from "lucide-react";
import { workspaces as sharedWorkspaces, type Workspace } from "../_shared/account";
import type { L } from "../_shared/l10n";
import { day, minutesFromNow } from "../_shared/time";

/**
 * The shared fixtures name the home workspace after the retail brand; in this block the home
 * workspace is the agency that serves those clients, so it gets its own fictional name.
 */
export const workspaces: Workspace[] = sharedWorkspaces.map((w) =>
  w.kind === "company" ? { ...w, name: "Saltmarsh Studio", initials: "SS", plan: { en: "Agency", tr: "Ajans" } } : w,
);

export type WorkspaceKind = Workspace["kind"];

export const kindLabels: Record<WorkspaceKind, L> = {
  company: { en: "Your agency", tr: "Ajansınız" },
  client: { en: "Client portals", tr: "Müşteri portalları" },
  partner: { en: "Partner portals", tr: "İş ortağı portalları" },
};

export interface NavItem {
  id: string;
  label: L;
  icon: LucideIcon;
  count?: number;
}

export const navByKind: Record<WorkspaceKind, NavItem[]> = {
  company: [
    { id: "home", label: { en: "Overview", tr: "Genel bakış" }, icon: Home },
    { id: "clients", label: { en: "Clients", tr: "Müşteriler" }, icon: Users },
    { id: "projects", label: { en: "Projects", tr: "Projeler" }, icon: FolderKanban },
    { id: "partners", label: { en: "Partners", tr: "İş ortakları" }, icon: HeartHandshake },
    { id: "registrations", label: { en: "Deal registrations", tr: "Fırsat kayıtları" }, icon: Handshake, count: 1 },
    { id: "invoices", label: { en: "Invoices", tr: "Faturalar" }, icon: Receipt },
  ],
  client: [
    { id: "home", label: { en: "Home", tr: "Ana sayfa" }, icon: Home },
    { id: "approvals", label: { en: "Approvals", tr: "Onaylar" }, icon: CheckSquare },
    { id: "files", label: { en: "Files", tr: "Dosyalar" }, icon: FileText },
    { id: "invoices", label: { en: "Invoices", tr: "Faturalar" }, icon: Receipt },
    { id: "messages", label: { en: "Messages", tr: "Mesajlar" }, icon: MessagesSquare, count: 2 },
  ],
  partner: [
    { id: "home", label: { en: "Programme home", tr: "Program ana sayfası" }, icon: Home },
    { id: "registrations", label: { en: "Deal registrations", tr: "Fırsat kayıtları" }, icon: Handshake },
    { id: "certifications", label: { en: "Certifications", tr: "Sertifikalar" }, icon: BadgeCheck },
    { id: "mdf", label: { en: "Marketing funds", tr: "Pazarlama fonları" }, icon: Wallet },
    { id: "resources", label: { en: "Sales kit", tr: "Satış kiti" }, icon: Megaphone },
  ],
};

export interface Approval {
  id: string;
  companyId: string;
  title: L;
  kind: L;
  sentAt: string;
  due: string;
  version: number;
}

export const approvals: Approval[] = [
  { id: "ap-1", companyId: "c-velvet", title: { en: "Booking flow — final screens", tr: "Rezervasyon akışı — son ekranlar" }, kind: { en: "Design", tr: "Tasarım" }, sentAt: minutesFromNow(-26 * 60), due: day(2), version: 3 },
  { id: "ap-2", companyId: "c-velvet", title: { en: "Loyalty tiers copy", tr: "Sadakat seviyeleri metinleri" }, kind: { en: "Copy", tr: "Metin" }, sentAt: minutesFromNow(-200), due: day(4), version: 1 },
  { id: "ap-3", companyId: "c-tidewell", title: { en: "Driver scorecard layout", tr: "Sürücü karnesi yerleşimi" }, kind: { en: "Design", tr: "Tasarım" }, sentAt: minutesFromNow(-3 * 24 * 60), due: day(-1), version: 2 },
  { id: "ap-4", companyId: "c-halcyon", title: { en: "Go-live checklist sign-off", tr: "Canlıya geçiş kontrol listesi onayı" }, kind: { en: "Release", tr: "Yayın" }, sentAt: minutesFromNow(-90), due: day(1), version: 1 },
];

/** Last time someone from the client opened their portal. */
export const lastClientVisit: Record<string, string> = {
  "c-velvet": minutesFromNow(-75),
  "c-tidewell": minutesFromNow(-4 * 24 * 60),
  "c-halcyon": minutesFromNow(-20),
};

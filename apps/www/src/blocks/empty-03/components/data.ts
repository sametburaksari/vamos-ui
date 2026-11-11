// First-run data for the Projects app: templates to start from, the sample projects that
// "Load sample data" brings in (the shared fixtures), and the CSV import fields.
import type { ImportField } from "@vamos-ui/react/business";
import type { L } from "../../_shared/l10n";
import { companies } from "../../_shared/companies";
import { projects, type Project } from "../../_shared/projects";
import { tasks } from "../../_shared/projects";
import { day } from "../../_shared/time";

export { projects as sampleProjects, tasks as sampleTasks, companies };
export type { Project };

export interface Template {
  id: string;
  name: L;
  blurb: L;
  /** Phases with their share of the timeline (weeks). */
  phases: Array<{ name: L; weeks: number }>;
  tasks: number;
  roles: L;
}

export const templates: Template[] = [
  {
    id: "website",
    name: { en: "Client website", tr: "Müşteri web sitesi" },
    blurb: { en: "From discovery workshop to launch day, with content and QA built in.", tr: "Keşif atölyesinden yayın gününe; içerik ve test dahil." },
    phases: [
      { name: { en: "Discovery", tr: "Keşif" }, weeks: 2 },
      { name: { en: "Design", tr: "Tasarım" }, weeks: 3 },
      { name: { en: "Build", tr: "Geliştirme" }, weeks: 4 },
      { name: { en: "Content", tr: "İçerik" }, weeks: 2 },
      { name: { en: "Launch", tr: "Yayın" }, weeks: 1 },
    ],
    tasks: 34,
    roles: { en: "Lead, designer, 2 developers", tr: "Lider, tasarımcı, 2 geliştirici" },
  },
  {
    id: "retainer",
    name: { en: "Monthly retainer", tr: "Aylık hizmet" },
    blurb: { en: "A repeating month of requests, a reporting call and an invoice on the 1st.", tr: "Tekrarlayan bir ay: talepler, rapor görüşmesi ve ayın 1'inde fatura." },
    phases: [
      { name: { en: "Intake", tr: "Talep" }, weeks: 1 },
      { name: { en: "Delivery", tr: "Teslim" }, weeks: 2 },
      { name: { en: "Report", tr: "Rapor" }, weeks: 1 },
    ],
    tasks: 12,
    roles: { en: "Account lead, specialist", tr: "Müşteri lideri, uzman" },
  },
  {
    id: "rollout",
    name: { en: "Software rollout", tr: "Yazılım kurulumu" },
    blurb: { en: "Pilot one team, train the rest, switch off the old tool.", tr: "Bir ekiple pilot, diğerlerine eğitim, eski aracı kapatma." },
    phases: [
      { name: { en: "Plan", tr: "Plan" }, weeks: 2 },
      { name: { en: "Pilot", tr: "Pilot" }, weeks: 3 },
      { name: { en: "Training", tr: "Eğitim" }, weeks: 2 },
      { name: { en: "Cut-over", tr: "Geçiş" }, weeks: 1 },
    ],
    tasks: 27,
    roles: { en: "Project lead, trainer, IT contact", tr: "Proje lideri, eğitmen, BT sorumlusu" },
  },
  {
    id: "event",
    name: { en: "Launch event", tr: "Lansman etkinliği" },
    blurb: { en: "Venue, guest list, suppliers and the follow-up after the day.", tr: "Mekân, davetli listesi, tedarikçiler ve etkinlik sonrası takip." },
    phases: [
      { name: { en: "Brief", tr: "Brif" }, weeks: 1 },
      { name: { en: "Suppliers", tr: "Tedarikçi" }, weeks: 3 },
      { name: { en: "Invites", tr: "Davet" }, weeks: 2 },
      { name: { en: "Day", tr: "Gün" }, weeks: 1 },
      { name: { en: "Follow-up", tr: "Takip" }, weeks: 1 },
    ],
    tasks: 22,
    roles: { en: "Producer, coordinator", tr: "Yapımcı, koordinatör" },
  },
];

export const weeksOf = (tp: Template) => tp.phases.reduce((s, p) => s + p.weeks, 0);

/** A new project from a template, starting next Monday. */
export function projectFromTemplate(tp: Template, name: string, clientId: string, seq: number): Project {
  const start = day(5);
  return {
    id: `pj-new-${seq}`,
    code: `${clientId.slice(2, 5).toUpperCase()}-${String(30 + seq).padStart(2, "0")}`,
    name: { en: name, tr: name },
    clientId,
    leadId: "p-defne",
    memberIds: ["p-defne"],
    status: "planning",
    health: "on-track",
    start,
    due: day(5 + weeksOf(tp) * 7),
    progress: 0,
    budget: { amount: "0.00", currency: "TRY" },
    spent: { amount: "0.00", currency: "TRY" },
    milestones: tp.phases.map((p, i) => ({ id: `m${i + 1}`, title: p.name, due: day(5 + tp.phases.slice(0, i + 1).reduce((s, x) => s + x.weeks, 0) * 7), done: false })),
    risks: [],
  };
}

export const importFields: ImportField[] = [
  { id: "name", label: "Project name", aliases: ["Name", "Project", "Proje adı"], required: true, type: "text", example: "Guest app relaunch" },
  { id: "client", label: "Client", aliases: ["Customer", "Company", "Müşteri"], required: true, type: "text", example: "Velvet Anchor Hotels" },
  { id: "start", label: "Start date", aliases: ["Start", "Başlangıç"], type: "date", example: "2026-12-01" },
  { id: "due", label: "Due date", aliases: ["Due", "Deadline", "Bitiş"], type: "date", example: "2027-02-15" },
  { id: "budget", label: "Budget", aliases: ["Bütçe"], type: "money", example: "480000" },
];

export const sampleCsv = [
  "Project name,Client,Start date,Due date,Budget",
  "Winter lookbook shoot,Kuzey Outdoor,2026-11-24,2026-12-19,120000",
  "Dealer portal phase 2,Halcyon Ferments,2026-12-01,2027-03-01,540000",
  "Front desk tablets,Velvet Anchor Hotels,2026-12-08,2027-01-30,260000",
].join("\n");

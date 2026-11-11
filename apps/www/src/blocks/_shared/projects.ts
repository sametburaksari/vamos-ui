// Client projects (agency / professional services). Used by dashboard-11 (portfolio),
// detail-10 (project overview), list-13 (tasks) and shell-08 (client portals).
import type { L } from "./l10n";
import type { Money } from "./money";
import { day } from "./time";

export type ProjectStatus = "planning" | "active" | "on-hold" | "completed";
export type Health = "on-track" | "at-risk" | "off-track";
export type TaskStatus = "todo" | "in-progress" | "review" | "done";

export interface Milestone {
  id: string;
  title: L;
  due: string;
  done: boolean;
}

export interface Project {
  id: string;
  code: string;
  name: L;
  clientId: string;
  leadId: string;
  memberIds: string[];
  status: ProjectStatus;
  health: Health;
  start: string;
  due: string;
  /** 0–100. */
  progress: number;
  budget: Money;
  spent: Money;
  milestones: Milestone[];
  risks: Array<{ id: string; title: L; impact: "low" | "medium" | "high" }>;
}

export interface Task {
  id: string;
  projectId: string;
  title: L;
  assigneeId: string;
  status: TaskStatus;
  due: string;
  priority: "low" | "medium" | "high";
  estimateHours: number;
}

export const projectStatusLabels: Record<ProjectStatus, L> = {
  planning: { en: "Planning", tr: "Planlama" },
  active: { en: "Active", tr: "Devam ediyor" },
  "on-hold": { en: "On hold", tr: "Beklemede" },
  completed: { en: "Completed", tr: "Tamamlandı" },
};
export const healthLabels: Record<Health, L> = {
  "on-track": { en: "On track", tr: "Yolunda" },
  "at-risk": { en: "At risk", tr: "Riskli" },
  "off-track": { en: "Off track", tr: "Hedeften saptı" },
};
export const taskStatusLabels: Record<TaskStatus, L> = {
  todo: { en: "To do", tr: "Yapılacak" },
  "in-progress": { en: "In progress", tr: "Sürüyor" },
  review: { en: "In review", tr: "İncelemede" },
  done: { en: "Done", tr: "Bitti" },
};

const ms = (id: string, en: string, tr: string, due: number, done: boolean): Milestone => ({ id, title: { en, tr }, due: day(due), done });
const try_ = (n: number): Money => ({ amount: n.toFixed(2), currency: "TRY" });

export const projects: Project[] = [
  {
    id: "pj-1", code: "VEL-24", name: { en: "Guest app relaunch", tr: "Misafir uygulaması yenileme" }, clientId: "c-velvet", leadId: "p-viktor",
    memberIds: ["p-viktor", "p-yusuf", "p-maya", "p-nadia"], status: "active", health: "on-track", start: day(-96), due: day(41), progress: 64,
    budget: try_(1_850_000), spent: try_(1_120_400),
    milestones: [ms("m1", "Discovery workshops", "Keşif atölyeleri", -80, true), ms("m2", "Booking flow beta", "Rezervasyon akışı beta", -12, true), ms("m3", "Loyalty integration", "Sadakat entegrasyonu", 9, false), ms("m4", "Store submission", "Mağaza başvurusu", 34, false)],
    risks: [{ id: "rk1", title: { en: "Payment provider sandbox unstable", tr: "Ödeme sağlayıcı test ortamı kararsız" }, impact: "medium" }],
  },
  {
    id: "pj-2", code: "TDW-11", name: { en: "Fleet tracking dashboard", tr: "Filo takip paneli" }, clientId: "c-tidewell", leadId: "p-viktor",
    memberIds: ["p-viktor", "p-yusuf", "p-jun"], status: "active", health: "at-risk", start: day(-60), due: day(12), progress: 71,
    budget: try_(920_000), spent: try_(838_600),
    milestones: [ms("m1", "Telematics API access", "Telematik API erişimi", -48, true), ms("m2", "Live map", "Canlı harita", -6, true), ms("m3", "Driver scorecards", "Sürücü karneleri", 5, false)],
    risks: [{ id: "rk1", title: { en: "Budget 91% used with 3 weeks left", tr: "Bütçenin %91'i kullanıldı, 3 hafta kaldı" }, impact: "high" }, { id: "rk2", title: { en: "Client data feed arrives late", tr: "Müşteri veri akışı gecikiyor" }, impact: "medium" }],
  },
  {
    id: "pj-3", code: "HAL-07", name: { en: "B2B ordering portal", tr: "B2B sipariş portalı" }, clientId: "c-halcyon", leadId: "p-defne",
    memberIds: ["p-defne", "p-maya", "p-nadia"], status: "active", health: "off-track", start: day(-140), due: day(-4), progress: 82,
    budget: try_(640_000), spent: try_(702_300),
    milestones: [ms("m1", "Catalogue sync", "Katalog senkronu", -90, true), ms("m2", "Price lists per dealer", "Bayi bazlı fiyat listeleri", -30, true), ms("m3", "Go-live", "Canlıya geçiş", -4, false)],
    risks: [{ id: "rk1", title: { en: "Go-live date missed; ERP export blocked", tr: "Canlıya geçiş tarihi kaçtı; ERP aktarımı bekliyor" }, impact: "high" }],
  },
  {
    id: "pj-4", code: "PIN-03", name: { en: "Parent communication app", tr: "Veli iletişim uygulaması" }, clientId: "c-pinewood", leadId: "p-nadia",
    memberIds: ["p-nadia", "p-jun"], status: "planning", health: "on-track", start: day(6), due: day(110), progress: 5,
    budget: try_(480_000), spent: try_(22_000),
    milestones: [ms("m1", "Kick-off", "Başlangıç toplantısı", 6, false), ms("m2", "Prototype review", "Prototip incelemesi", 30, false)],
    risks: [],
  },
  {
    id: "pj-5", code: "KUZ-15", name: { en: "Spring campaign site", tr: "İlkbahar kampanya sitesi" }, clientId: "c-kuzey", leadId: "p-camille",
    memberIds: ["p-camille", "p-arda", "p-jun"], status: "completed", health: "on-track", start: day(-75), due: day(-15), progress: 100,
    budget: try_(260_000), spent: try_(241_900),
    milestones: [ms("m1", "Creative concept", "Kreatif konsept", -60, true), ms("m2", "Launch", "Yayına alma", -15, true)],
    risks: [],
  },
  {
    id: "pj-6", code: "LAR-02", name: { en: "Data warehouse migration", tr: "Veri ambarı taşıma" }, clientId: "c-larkspur", leadId: "p-yusuf",
    memberIds: ["p-yusuf", "p-viktor"], status: "on-hold", health: "at-risk", start: day(-30), due: day(60), progress: 22,
    budget: { amount: "48000.00", currency: "USD" }, spent: { amount: "11250.00", currency: "USD" },
    milestones: [ms("m1", "Schema audit", "Şema denetimi", -10, true), ms("m2", "Pilot migration", "Pilot taşıma", 21, false)],
    risks: [{ id: "rk1", title: { en: "Paused: client security review", tr: "Durduruldu: müşteri güvenlik incelemesi" }, impact: "medium" }],
  },
];
export const projectsById: Record<string, Project> = Object.fromEntries(projects.map((p) => [p.id, p]));

const t = (id: string, projectId: string, en: string, tr: string, assigneeId: string, status: TaskStatus, due: number, priority: Task["priority"], estimateHours: number): Task => ({ id, projectId, title: { en, tr }, assigneeId, status, due: day(due), priority, estimateHours });

export const tasks: Task[] = [
  t("tk-1", "pj-1", "Loyalty points API contract", "Sadakat puanı API sözleşmesi", "p-yusuf", "in-progress", 2, "high", 8),
  t("tk-2", "pj-1", "Room upgrade upsell screen", "Oda yükseltme satış ekranı", "p-nadia", "review", 1, "medium", 6),
  t("tk-3", "pj-1", "Accessibility pass on booking flow", "Rezervasyon akışında erişilebilirlik kontrolü", "p-maya", "todo", 6, "medium", 5),
  t("tk-4", "pj-1", "App store screenshots", "Mağaza ekran görüntüleri", "p-jun", "todo", 20, "low", 4),
  t("tk-5", "pj-2", "Driver scorecard formula", "Sürücü karnesi formülü", "p-yusuf", "in-progress", 0, "high", 10),
  t("tk-6", "pj-2", "Map clustering for 400+ vehicles", "400+ araç için harita kümeleme", "p-viktor", "review", -1, "high", 12),
  t("tk-7", "pj-2", "Empty states copy", "Boş durum metinleri", "p-jun", "done", -3, "low", 2),
  t("tk-8", "pj-3", "ERP export: unblock VAT field mapping", "ERP aktarımı: KDV alan eşlemesini çöz", "p-defne", "in-progress", -2, "high", 6),
  t("tk-9", "pj-3", "Dealer onboarding emails", "Bayi karşılama e-postaları", "p-nadia", "todo", 3, "medium", 3),
  t("tk-10", "pj-3", "Price list import QA", "Fiyat listesi içe aktarma testi", "p-maya", "done", -6, "medium", 4),
  t("tk-11", "pj-4", "Kick-off agenda", "Başlangıç gündemi", "p-nadia", "todo", 5, "medium", 2),
  t("tk-12", "pj-6", "Security questionnaire answers", "Güvenlik anketi yanıtları", "p-yusuf", "todo", 4, "high", 5),
];

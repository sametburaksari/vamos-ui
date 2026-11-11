// Agency task list: the 12 shared tasks (`_shared/projects.ts`) plus a seeded set that fills
// the month so list, board and calendar all have something to show. One shape for all views.
import type { L } from "../../_shared/l10n";
import { projects, tasks as sharedTasks, taskStatusLabels, type TaskStatus } from "../../_shared/projects";
import { int, pick, seeded } from "../../_shared/random";
import { TODAY, day, daysBetween } from "../../_shared/time";

export type Priority = "low" | "medium" | "high";

export interface WorkTask {
  id: string;
  key: string;
  projectId: string;
  title: L;
  assigneeId: string;
  status: TaskStatus;
  /** YYYY-MM-DD */
  due: string;
  priority: Priority;
  estimateHours: number;
  /** Comments and subtasks, display only. */
  comments: number;
  subtasks?: { done: number; total: number };
}

export { projects, taskStatusLabels };
export type { TaskStatus };

export const statuses: TaskStatus[] = ["todo", "in-progress", "review", "done"];

export const priorityLabels: Record<Priority, L> = {
  high: { en: "High", tr: "Yüksek" },
  medium: { en: "Medium", tr: "Orta" },
  low: { en: "Low", tr: "Düşük" },
};

/** Scheduler / chart tone per project, so a project keeps one colour in every view. */
export const projectTone: Record<string, `chart-${1 | 2 | 3 | 4 | 5 | 6}`> = {
  "pj-1": "chart-1",
  "pj-2": "chart-2",
  "pj-3": "chart-3",
  "pj-4": "chart-4",
  "pj-5": "chart-5",
  "pj-6": "chart-6",
};
export const projectToneClass: Record<string, string> = {
  "pj-1": "bg-chart-1",
  "pj-2": "bg-chart-2",
  "pj-3": "bg-chart-3",
  "pj-4": "bg-chart-4",
  "pj-5": "bg-chart-5",
  "pj-6": "bg-chart-6",
};

const extra: Array<[string, string, string]> = [
  ["pj-1", "Push notification copy for check-in", "Giriş bildirimi metinleri"],
  ["pj-1", "Late checkout request flow", "Geç çıkış talep akışı"],
  ["pj-1", "QA on Android 12 devices", "Android 12 cihazlarda test"],
  ["pj-2", "Geofence alerts settings page", "Coğrafi sınır uyarı ayarları"],
  ["pj-2", "Weekly fuel report export", "Haftalık yakıt raporu dışa aktarımı"],
  ["pj-2", "Client demo script", "Müşteri demo senaryosu"],
  ["pj-3", "Dealer price tiers review", "Bayi fiyat kademeleri incelemesi"],
  ["pj-3", "Go-live checklist with client IT", "Müşteri BT ile canlıya geçiş listesi"],
  ["pj-3", "Order history pagination bug", "Sipariş geçmişi sayfalama hatası"],
  ["pj-4", "Stakeholder interviews: teachers", "Paydaş görüşmeleri: öğretmenler"],
  ["pj-4", "Messaging moderation rules draft", "Mesaj moderasyon kuralları taslağı"],
  ["pj-6", "Pilot dataset anonymisation", "Pilot veri setinin anonimleştirilmesi"],
  ["pj-6", "Data retention policy summary", "Veri saklama politikası özeti"],
  ["pj-1", "Room service menu sync", "Oda servisi menü senkronu"],
  ["pj-2", "Driver app offline mode spike", "Sürücü uygulaması çevrimdışı mod araştırması"],
  ["pj-3", "Invoice PDF template polish", "Fatura PDF şablonu düzenlemesi"],
];

const r = seeded(1313);
const generated = extra.map(([projectId, en, tr], i): WorkTask => {
  const project = projects.find((p) => p.id === projectId)!;
  const offset = int(r, -9, 24);
  const status: TaskStatus = offset < -3 ? pick(r, ["done", "done", "review"] as const) : pick(r, ["todo", "todo", "in-progress", "review"] as const);
  return {
    id: `tk-${13 + i}`,
    key: `${project.code}-${40 + i}`,
    projectId,
    title: { en, tr },
    assigneeId: pick(r, project.memberIds),
    status,
    due: day(offset),
    priority: pick(r, ["low", "medium", "medium", "high"] as const),
    estimateHours: int(r, 1, 10),
    comments: int(r, 0, 9),
    subtasks: r() > 0.55 ? { done: int(r, 0, 2), total: int(r, 3, 5) } : undefined,
  };
});

export const initialTasks: WorkTask[] = [
  ...sharedTasks.map((t, i): WorkTask => {
    const project = projects.find((p) => p.id === t.projectId)!;
    return { ...t, key: `${project.code}-${21 + i}`, comments: (i * 7) % 6, subtasks: i % 3 === 0 ? { done: 1, total: 4 } : undefined };
  }),
  ...generated,
];

export type DueBucket = "overdue" | "today" | "week" | "later" | "done";

export const bucketLabels: Record<DueBucket, L> = {
  overdue: { en: "Overdue", tr: "Gecikmiş" },
  today: { en: "Today", tr: "Bugün" },
  week: { en: "Next 7 days", tr: "Önümüzdeki 7 gün" },
  later: { en: "Later", tr: "Daha sonra" },
  done: { en: "Done", tr: "Bitti" },
};

export function bucketOf(t: WorkTask): DueBucket {
  if (t.status === "done") return "done";
  const d = daysBetween(TODAY, t.due);
  if (d < 0) return "overdue";
  if (d === 0) return "today";
  if (d <= 7) return "week";
  return "later";
}

/** Open and past its due date. */
export const isOverdue = (t: WorkTask) => t.status !== "done" && t.due < TODAY;

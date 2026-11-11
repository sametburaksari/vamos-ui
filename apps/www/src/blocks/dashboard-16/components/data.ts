// Dispatch data: today's home-service jobs and the crew, built on the shared field jobs and
// technician positions. Two contractors and six more jobs are added here for a fuller board.
import type { L } from "../../_shared/l10n";
import { fieldJobs, istanbulBounds, jobStatusLabels, technicianPositions, type FieldJob, type JobStatus } from "../../_shared/geo";
import { person } from "../../_shared/people";
import { NOW_MS, minutesFromNow } from "../../_shared/time";

export { istanbulBounds, jobStatusLabels, NOW_MS };
export type { JobStatus };

export type Skill = "electrical" | "install" | "measure" | "delivery" | "repair";
export const skillLabels: Record<Skill, L> = {
  electrical: { en: "Electrical", tr: "Elektrik" },
  install: { en: "Installation", tr: "Montaj" },
  measure: { en: "Measuring", tr: "Ölçü" },
  delivery: { en: "Delivery", tr: "Teslimat" },
  repair: { en: "Repair", tr: "Onarım" },
};

export interface Job extends FieldJob {
  skill: Skill;
  priority: "normal" | "urgent";
  address: string;
  phone: string;
  /** Minutes the job takes on site. */
  duration: number;
  notified?: boolean;
}

const extra: Record<string, Pick<Job, "skill" | "priority" | "address" | "duration">> = {
  "jb-1": { skill: "electrical", priority: "normal", address: "Kestane Sk. 12, Şişli", duration: 90 },
  "jb-2": { skill: "measure", priority: "normal", address: "Ardıç Sk. 4, Üsküdar", duration: 40 },
  "jb-3": { skill: "repair", priority: "urgent", address: "Mimoza Sk. 8, Beylikdüzü", duration: 60 },
  "jb-4": { skill: "install", priority: "normal", address: "Leylak Cd. 40, Maltepe", duration: 120 },
  "jb-5": { skill: "delivery", priority: "normal", address: "Defne Sk. 3, Kağıthane", duration: 20 },
  "jb-6": { skill: "delivery", priority: "urgent", address: "Akasya Sk. 27, Beşiktaş", duration: 45 },
};

const more: Job[] = [
  { id: "jb-7", title: { en: "Hang gallery wall", tr: "Tablo duvarı asma" }, customer: "Tuna Esen", district: "Kadıköy", lat: 40.99, lng: 29.03, status: "unassigned", windowStart: minutesFromNow(60), windowEnd: minutesFromNow(150), skill: "install", priority: "normal", address: "Ihlamur Sk. 6, Kadıköy", phone: "", duration: 75 },
  { id: "jb-8", title: { en: "Fix dimmer switch", tr: "Dimmer anahtarı onarımı" }, customer: "Melis Arslan", district: "Ataşehir", lat: 40.99, lng: 29.11, status: "unassigned", windowStart: minutesFromNow(30), windowEnd: minutesFromNow(90), skill: "electrical", priority: "urgent", address: "Sedir Sk. 5, Ataşehir", phone: "", duration: 30 },
  { id: "jb-9", title: { en: "Deliver dining table", tr: "Yemek masası teslimatı" }, customer: "Kaan Yüce", district: "Bakırköy", lat: 40.98, lng: 28.86, status: "en-route", technicianId: "p-doruk", windowStart: minutesFromNow(5), windowEnd: minutesFromNow(65), eta: minutesFromNow(22), skill: "delivery", priority: "normal", address: "Manolya Cd. 33, Bakırköy", phone: "", duration: 25 },
  { id: "jb-10", title: { en: "Measure for blinds", tr: "Stor perde ölçüsü" }, customer: "Nehir Altın", district: "Sarıyer", lat: 41.11, lng: 29.03, status: "on-site", technicianId: "p-lale", windowStart: minutesFromNow(-25), windowEnd: minutesFromNow(35), skill: "measure", priority: "normal", address: "Çınar Sk. 25, Sarıyer", phone: "", duration: 40 },
  { id: "jb-11", title: { en: "Replace cracked lampshade", tr: "Çatlak abajur değişimi" }, customer: "Barış Okan", district: "Fatih", lat: 41.01, lng: 28.95, status: "done", technicianId: "p-selin", windowStart: minutesFromNow(-150), windowEnd: minutesFromNow(-100), skill: "repair", priority: "normal", address: "Lale Sk. 9, Fatih", phone: "", duration: 30 },
  { id: "jb-12", title: { en: "Wall-mount shelving", tr: "Duvara raf montajı" }, customer: "Derin Kılıç", district: "Kartal", lat: 40.89, lng: 29.19, status: "unassigned", windowStart: minutesFromNow(150), windowEnd: minutesFromNow(270), skill: "install", priority: "normal", address: "Zeytin Sk. 14, Kartal", phone: "", duration: 90 },
];

export const initialJobs: Job[] = [
  ...fieldJobs.map((j) => ({ ...j, ...extra[j.id]!, phone: "" })),
  ...more,
].map((j, i) => ({ ...j, phone: `+90 216 000 00 ${String(60 + i).padStart(2, "0")}` }));

export interface Technician {
  id: string;
  name: string;
  skills: Skill[];
  lat: number;
  lng: number;
  /** Jobs finished today. */
  done: number;
  /** Planned for the day. */
  capacity: number;
  vehicle: string;
  lastPing: string;
}

const crew: Array<Omit<Technician, "name" | "lat" | "lng" | "lastPing"> & { name?: string; lat?: number; lng?: number; lastPing?: string }> = [
  { id: "p-malik", skills: ["electrical", "install", "repair"], done: 2, capacity: 6, vehicle: "34 KL 118" },
  { id: "p-selin", skills: ["measure", "install", "repair"], done: 3, capacity: 6, vehicle: "34 KL 204" },
  { id: "p-baran", skills: ["repair", "install", "delivery"], done: 1, capacity: 5, vehicle: "34 KL 311" },
  { id: "p-doruk", name: "Doruk Ersoy", skills: ["delivery", "install"], done: 2, capacity: 7, vehicle: "34 KL 425", lat: 40.995, lng: 28.9, lastPing: minutesFromNow(-1) },
  { id: "p-lale", name: "Lale Tekin", skills: ["measure", "electrical"], done: 1, capacity: 5, vehicle: "34 KL 502", lat: 41.108, lng: 29.025, lastPing: minutesFromNow(-3) },
];

export const technicians: Technician[] = crew.map((t) => {
  const pos = technicianPositions.find((p) => p.personId === t.id);
  return {
    ...t,
    name: t.name ?? person(t.id).name,
    lat: pos?.lat ?? t.lat!,
    lng: pos?.lng ?? t.lng!,
    lastPing: pos?.updatedAt ?? t.lastPing!,
  };
});

/** Straight-line km between two points. */
export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Rough drive time in the city: 1.35 × straight line at 22 km/h, plus 5 minutes to park. */
export const driveMinutes = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => Math.round(((km(a, b) * 1.35) / 22) * 60 + 5);

export const statusTone: Record<JobStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  unassigned: "neutral",
  "en-route": "info",
  "on-site": "success",
  done: "neutral",
  delayed: "warning",
};

export const minutesUntil = (iso: string) => Math.round((Date.parse(iso) - NOW_MS) / 60_000);

// Places on a map, Istanbul area (lat/lng are approximate district centres, not addresses).
// Pair with `<PinMap bounds={istanbulBounds} pins={…} />` from @vamos-ui/react.
import type { L } from "./l10n";
import { minutesFromNow } from "./time";

export interface GeoBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

/** Fits every location below with a little margin. */
export const istanbulBounds: GeoBounds = { north: 41.16, south: 40.8, west: 28.62, east: 29.42 };

export interface Site {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  kind: "store" | "warehouse" | "pickup";
  /** Today's sales or open jobs — whatever the block shows. */
  metric: number;
  open: boolean;
}

export const sites: Site[] = [
  { id: "st-1", name: "Kiln & Linen Karaköy", district: "Beyoğlu", lat: 41.024, lng: 28.976, kind: "store", metric: 38, open: true },
  { id: "st-2", name: "Kiln & Linen Moda", district: "Kadıköy", lat: 40.984, lng: 29.027, kind: "store", metric: 52, open: true },
  { id: "st-3", name: "Kiln & Linen Bebek", district: "Beşiktaş", lat: 41.077, lng: 29.043, kind: "store", metric: 21, open: true },
  { id: "st-4", name: "Kiln & Linen Ataşehir", district: "Ataşehir", lat: 40.992, lng: 29.124, kind: "store", metric: 17, open: false },
  { id: "st-5", name: "Kiln & Linen Bakırköy", district: "Bakırköy", lat: 40.98, lng: 28.872, kind: "store", metric: 29, open: true },
  { id: "st-6", name: "Pickup point Maslak", district: "Sarıyer", lat: 41.11, lng: 29.02, kind: "pickup", metric: 12, open: true },
  { id: "st-7", name: "Pickup point Kartal", district: "Kartal", lat: 40.889, lng: 29.19, kind: "pickup", metric: 8, open: true },
  { id: "st-8", name: "Tuzla cross-dock", district: "Tuzla", lat: 40.83, lng: 29.3, kind: "warehouse", metric: 140, open: true },
  { id: "st-9", name: "Esenyurt depot", district: "Esenyurt", lat: 41.03, lng: 28.68, kind: "warehouse", metric: 96, open: true },
];

export type JobStatus = "unassigned" | "en-route" | "on-site" | "done" | "delayed";

export interface FieldJob {
  id: string;
  title: L;
  customer: string;
  district: string;
  lat: number;
  lng: number;
  status: JobStatus;
  technicianId?: string;
  /** Scheduled window start/end. */
  windowStart: string;
  windowEnd: string;
  /** ETA for en-route jobs. */
  eta?: string;
}

export const jobStatusLabels: Record<JobStatus, L> = {
  unassigned: { en: "Unassigned", tr: "Atanmadı" },
  "en-route": { en: "En route", tr: "Yolda" },
  "on-site": { en: "On site", tr: "Sahada" },
  done: { en: "Done", tr: "Tamamlandı" },
  delayed: { en: "Delayed", tr: "Gecikti" },
};

export const fieldJobs: FieldJob[] = [
  { id: "jb-1", title: { en: "Install pendant lights", tr: "Sarkıt lamba montajı" }, customer: "Aslı Korkmaz", district: "Şişli", lat: 41.06, lng: 28.987, status: "on-site", technicianId: "p-malik", windowStart: minutesFromNow(-50), windowEnd: minutesFromNow(40) },
  { id: "jb-2", title: { en: "Measure for curtains", tr: "Perde ölçüsü alma" }, customer: "Emre Doğan", district: "Üsküdar", lat: 41.023, lng: 29.015, status: "en-route", technicianId: "p-selin", windowStart: minutesFromNow(10), windowEnd: minutesFromNow(70), eta: minutesFromNow(14) },
  { id: "jb-3", title: { en: "Replace damaged mirror", tr: "Hasarlı aynayı değiştirme" }, customer: "Ilgın Er", district: "Beylikdüzü", lat: 40.99, lng: 28.64, status: "delayed", technicianId: "p-baran", windowStart: minutesFromNow(-30), windowEnd: minutesFromNow(30), eta: minutesFromNow(48) },
  { id: "jb-4", title: { en: "Assemble shelving", tr: "Raf montajı" }, customer: "Oğuz Kalkan", district: "Maltepe", lat: 40.935, lng: 29.13, status: "unassigned", windowStart: minutesFromNow(120), windowEnd: minutesFromNow(240) },
  { id: "jb-5", title: { en: "Collect return", tr: "İade teslim alma" }, customer: "Sena Gürel", district: "Kağıthane", lat: 41.08, lng: 28.97, status: "done", technicianId: "p-malik", windowStart: minutesFromNow(-180), windowEnd: minutesFromNow(-120) },
  { id: "jb-6", title: { en: "Showroom delivery", tr: "Showroom teslimatı" }, customer: "Kiln & Linen Bebek", district: "Beşiktaş", lat: 41.074, lng: 29.04, status: "unassigned", windowStart: minutesFromNow(200), windowEnd: minutesFromNow(260) },
];

/** Technicians' last known positions. */
export const technicianPositions: Array<{ personId: string; lat: number; lng: number; updatedAt: string }> = [
  { personId: "p-malik", lat: 41.059, lng: 28.986, updatedAt: minutesFromNow(-1) },
  { personId: "p-selin", lat: 41.01, lng: 29.03, updatedAt: minutesFromNow(-2) },
  { personId: "p-baran", lat: 41.0, lng: 28.72, updatedAt: minutesFromNow(-4) },
];

/** Live visitors by city (realtime analytics map). Lat/lng are city centres. */
export const liveVisitorsByCity: Array<{ city: string; country: string; lat: number; lng: number; visitors: number }> = [
  { city: "Istanbul", country: "TR", lat: 41.01, lng: 28.98, visitors: 86 },
  { city: "Ankara", country: "TR", lat: 39.93, lng: 32.86, visitors: 31 },
  { city: "Izmir", country: "TR", lat: 38.42, lng: 27.14, visitors: 24 },
  { city: "Berlin", country: "DE", lat: 52.52, lng: 13.4, visitors: 12 },
  { city: "London", country: "GB", lat: 51.51, lng: -0.13, visitors: 9 },
  { city: "Amsterdam", country: "NL", lat: 52.37, lng: 4.9, visitors: 6 },
  { city: "Dubai", country: "AE", lat: 25.2, lng: 55.27, visitors: 5 },
  { city: "Baku", country: "AZ", lat: 40.41, lng: 49.87, visitors: 4 },
];
/** Fits liveVisitorsByCity. */
export const europeBounds: GeoBounds = { north: 56, south: 22, west: -6, east: 58 };

// Kiln & Linen locations: the shared `sites` (stores, pickup points, warehouses) with the
// operational details this screen needs. Addresses and phone numbers are fictional.
import { istanbulBounds, sites, type Site } from "../../_shared/geo";
import type { L } from "../../_shared/l10n";
import { series } from "../../_shared/random";

export type LocationKind = Site["kind"];

export interface Location extends Site {
  /** Two-digit number shared by the list row and the map pin. */
  no: string;
  street: string;
  phone: string;
  managerId: string;
  hours: { open: string; close: string };
  /** People working right now / planned for today. */
  staff: { on: number; planned: number };
  /** Same metric as `metric`, last 14 days, oldest first. */
  trend: number[];
  /** Why it is closed, when it is. */
  closedReason?: L;
}

export const kindLabels: Record<LocationKind, L> = {
  store: { en: "Store", tr: "Mağaza" },
  pickup: { en: "Pickup point", tr: "Teslim noktası" },
  warehouse: { en: "Warehouse", tr: "Depo" },
};

export const kindPlural: Record<LocationKind, L> = {
  store: { en: "Stores", tr: "Mağazalar" },
  pickup: { en: "Pickup", tr: "Teslim" },
  warehouse: { en: "Warehouses", tr: "Depolar" },
};

/** What `metric` counts for each kind of place. */
export const metricLabels: Record<LocationKind, L> = {
  store: { en: "Orders today", tr: "Bugünkü sipariş" },
  pickup: { en: "Parcels collected", tr: "Teslim edilen koli" },
  warehouse: { en: "Parcels dispatched", tr: "Çıkan koli" },
};

export const closeReasons: Array<{ value: string; label: L }> = [
  { value: "stocktake", label: { en: "Stocktake", tr: "Sayım" } },
  {
    value: "maintenance",
    label: { en: "Maintenance or repairs", tr: "Bakım veya tadilat" },
  },
  {
    value: "staff",
    label: { en: "Not enough staff", tr: "Yetersiz personel" },
  },
  { value: "event", label: { en: "Private event", tr: "Özel etkinlik" } },
];

const extra: Record<string, Omit<Location, keyof Site | "no" | "trend">> = {
  "st-1": {
    street: "Lodos Sk. 14",
    phone: "+90 216 000 00 41",
    managerId: "p-aylin",
    hours: { open: "10:00", close: "21:00" },
    staff: { on: 5, planned: 6 },
  },
  "st-2": {
    street: "Kumru Cd. 62",
    phone: "+90 216 000 00 42",
    managerId: "p-zeynep",
    hours: { open: "10:00", close: "21:30" },
    staff: { on: 7, planned: 7 },
  },
  "st-3": {
    street: "Martı Sahil Yolu 3",
    phone: "+90 216 000 00 43",
    managerId: "p-ines",
    hours: { open: "10:00", close: "20:00" },
    staff: { on: 3, planned: 4 },
  },
  "st-4": {
    street: "Çınaraltı Bulvarı 118",
    phone: "+90 216 000 00 44",
    managerId: "p-tomas",
    hours: { open: "10:00", close: "22:00" },
    staff: { on: 0, planned: 5 },
    closedReason: { en: "Stocktake until 14:00", tr: "14:00'e kadar sayım" },
  },
  "st-5": {
    street: "Poyraz Sk. 9",
    phone: "+90 216 000 00 45",
    managerId: "p-noah",
    hours: { open: "10:00", close: "21:00" },
    staff: { on: 4, planned: 5 },
  },
  "st-6": {
    street: "Yıldız Plaza, B Blok zemin",
    phone: "+90 216 000 00 46",
    managerId: "p-kerem",
    hours: { open: "08:00", close: "22:00" },
    staff: { on: 2, planned: 2 },
  },
  "st-7": {
    street: "Sahil Pasajı 27",
    phone: "+90 216 000 00 47",
    managerId: "p-oskar",
    hours: { open: "09:00", close: "22:00" },
    staff: { on: 1, planned: 2 },
  },
  "st-8": {
    street: "Liman Lojistik Köyü, Kapı 4",
    phone: "+90 216 000 00 48",
    managerId: "p-ruth",
    hours: { open: "06:00", close: "23:00" },
    staff: { on: 22, planned: 24 },
  },
  "st-9": {
    street: "Dokumacılar OSB, 7. Cadde 2",
    phone: "+90 216 000 00 49",
    managerId: "p-malik",
    hours: { open: "06:00", close: "23:00" },
    staff: { on: 15, planned: 18 },
  },
};

export const locations: Location[] = sites.map((s, i) => ({
  ...s,
  ...extra[s.id]!,
  no: String(i + 1).padStart(2, "0"),
  trend: [
    ...series(13, {
      start: s.metric * 0.9,
      drift: 0.004,
      noise: 0.18,
      seed: 40 + i,
      weekly: [0.8, 0.9, 1, 1, 1.1, 1.35, 1.25],
    }).map(Math.round),
    s.metric,
  ],
}));

/** The whole network, a little wider than the shared bounds so edge pins keep their callouts. */
export const networkBounds = {
  ...istanbulBounds,
  west: istanbulBounds.west - 0.02,
};

/** District centres offered when adding a location (lat/lng approximate). */
export const districts: Array<{ name: string; lat: number; lng: number }> = [
  { name: "Beşiktaş", lat: 41.043, lng: 29.007 },
  { name: "Şişli", lat: 41.06, lng: 28.987 },
  { name: "Üsküdar", lat: 41.023, lng: 29.015 },
  { name: "Maltepe", lat: 40.935, lng: 29.13 },
  { name: "Beylikdüzü", lat: 40.99, lng: 28.64 },
  { name: "Pendik", lat: 40.877, lng: 29.258 },
];

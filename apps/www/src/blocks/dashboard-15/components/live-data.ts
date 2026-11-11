// Realtime web analytics, simulated. The first render uses the shared fixtures exactly (same on
// server and client); after mount a seeded generator advances a fake clock every few seconds.
import type { L } from "../../_shared/l10n";
import { liveVisitorsByCity, europeBounds } from "../../_shared/geo";
import { liveVisitorsPerMinute, topPagesNow, trafficSourcesNow } from "../../_shared/metrics";
import { int, pick, seeded } from "../../_shared/random";
import { NOW_MS } from "../../_shared/time";

export { europeBounds };

export type EventKind = "view" | "cart" | "checkout" | "order" | "signup";
export const eventLabels: Record<EventKind, L> = {
  view: { en: "Viewed", tr: "Görüntüledi" },
  cart: { en: "Added to cart", tr: "Sepete ekledi" },
  checkout: { en: "Started checkout", tr: "Ödemeye geçti" },
  order: { en: "Placed an order", tr: "Sipariş verdi" },
  signup: { en: "Joined the newsletter", tr: "Bültene katıldı" },
};

export interface LiveEvent {
  id: string;
  at: number;
  kind: EventKind;
  city: string;
  country: string;
  path: string;
  source: string;
  device: "mobile" | "desktop" | "tablet";
  /** Order value in TRY. */
  value?: number;
}

export interface LiveState {
  clock: number;
  /** Visitors per minute, oldest first, 30 entries. */
  perMinute: Array<{ at: number; visitors: number }>;
  cities: Array<{ city: string; country: string; lat: number; lng: number; visitors: number }>;
  pages: Array<{ path: string; title: L; visitors: number }>;
  sources: Array<{ source: string; visitors: number }>;
  events: LiveEvent[];
  orders: number;
  revenue: number;
  seq: number;
}

const productPaths = ["/products/washed-linen-duvet-cover", "/products/stoneware-mug-set", "/products/wool-throw-oat", "/collections/winter-textiles", "/journal/how-to-care-for-linen", "/", "/cart"];

function makeEvent(rand: () => number, seq: number, at: number, cities: LiveState["cities"], sources: LiveState["sources"]): LiveEvent {
  const c = pick(rand, cities.flatMap((x) => Array.from({ length: Math.max(1, Math.round(x.visitors / 10)) }, () => x)));
  const kind = pick(rand, ["view", "view", "view", "view", "view", "cart", "cart", "checkout", "order", "signup"] as const);
  const path = kind === "checkout" || kind === "order" ? "/checkout" : kind === "signup" ? "/" : pick(rand, productPaths);
  return {
    id: `ev-${seq}`,
    at,
    kind,
    city: c.city,
    country: c.country,
    path,
    source: pick(rand, sources).source,
    device: pick(rand, ["mobile", "mobile", "mobile", "desktop", "desktop", "tablet"] as const),
    value: kind === "order" ? int(rand, 9, 64) * 100 - 10 : undefined,
  };
}

export function initialState(): LiveState {
  const rand = seeded(1518);
  const cities = liveVisitorsByCity.map((c) => ({ ...c }));
  const sources = trafficSourcesNow.map((s) => ({ ...s }));
  const events: LiveEvent[] = [];
  for (let i = 0; i < 9; i++) events.push(makeEvent(rand, i, NOW_MS - (i * 23 + 7) * 1000, cities, sources));
  return {
    clock: NOW_MS,
    perMinute: liveVisitorsPerMinute.map((p) => ({ at: Date.parse(p.at), visitors: p.visitors })),
    cities,
    pages: topPagesNow.map((p) => ({ ...p })),
    sources,
    events,
    orders: 14,
    revenue: 38_420,
    seq: 9,
  };
}

const drift = (rand: () => number, v: number, spread: number, min = 0) => Math.max(min, Math.round(v + (rand() - 0.5) * 2 * spread));

/** One step of the simulation: `ms` of fake time pass. */
export function advance(s: LiveState, rand: () => number, ms: number): LiveState {
  const clock = s.clock + ms;
  const cities = s.cities.map((c) => ({ ...c, visitors: drift(rand, c.visitors, Math.max(1, c.visitors * 0.06), 1) }));
  const pages = s.pages.map((p) => ({ ...p, visitors: drift(rand, p.visitors, Math.max(1, p.visitors * 0.08), 1) }));
  const sources = s.sources.map((p) => ({ ...p, visitors: drift(rand, p.visitors, Math.max(1, p.visitors * 0.06), 1) }));
  const now = cities.reduce((t, c) => t + c.visitors, 0);
  // A new minute bucket every 60 s of fake time; otherwise the current bucket follows the live count.
  let perMinute = s.perMinute;
  const lastAt = perMinute[perMinute.length - 1]!.at;
  if (clock - lastAt >= 60_000) perMinute = [...perMinute.slice(1), { at: lastAt + 60_000, visitors: now }];
  else perMinute = [...perMinute.slice(0, -1), { at: lastAt, visitors: Math.round((perMinute[perMinute.length - 1]!.visitors + now) / 2) }];

  const fresh: LiveEvent[] = [];
  let seq = s.seq;
  const n = int(rand, 1, 2);
  for (let i = 0; i < n; i++) fresh.push(makeEvent(rand, ++seq, clock - int(rand, 0, ms / 1000) * 1000, cities, sources));
  const placed = fresh.filter((e) => e.kind === "order");
  return {
    clock,
    perMinute,
    cities,
    pages,
    sources,
    events: [...fresh.sort((a, b) => b.at - a.at), ...s.events].slice(0, 14),
    orders: s.orders + placed.length,
    revenue: s.revenue + placed.reduce((t, e) => t + (e.value ?? 0), 0),
    seq,
  };
}

export const totalNow = (s: LiveState) => s.cities.reduce((t, c) => t + c.visitors, 0);
export const countryNames: Record<string, L> = {
  TR: { en: "Türkiye", tr: "Türkiye" },
  DE: { en: "Germany", tr: "Almanya" },
  GB: { en: "United Kingdom", tr: "Birleşik Krallık" },
  NL: { en: "Netherlands", tr: "Hollanda" },
  AE: { en: "United Arab Emirates", tr: "Birleşik Arap Emirlikleri" },
  AZ: { en: "Azerbaijan", tr: "Azerbaycan" },
};

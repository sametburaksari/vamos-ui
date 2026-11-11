// Workspace activity feed: the shared audit stream (`_shared/events.ts`) plus a seeded
// generator for older pages (infinite scroll) and for "live" events that arrive while the
// page is open. Everything is deterministic: page N and live event N are the same on every run.
import { activity, type ActivityEvent } from "../../_shared/events";
import type { L } from "../../_shared/l10n";
import { int, pick, seeded } from "../../_shared/random";
import { NOW_MS } from "../../_shared/time";

export type FeedTopic = "sales" | "orders" | "support" | "finance" | "access";

export interface FeedEvent extends ActivityEvent {
  topic: FeedTopic;
  /** Arrived through the live stream while the page was open. */
  live?: boolean;
}

export const topicLabels: Record<FeedTopic, L> = {
  sales: { en: "Sales", tr: "Satış" },
  orders: { en: "Orders & stock", tr: "Sipariş ve stok" },
  support: { en: "Support", tr: "Destek" },
  finance: { en: "Finance", tr: "Finans" },
  access: { en: "Access & settings", tr: "Erişim ve ayarlar" },
};

export const topicOf = (e: ActivityEvent): FeedTopic => {
  switch (e.entity.type) {
    case "deal":
      return "sales";
    case "order":
    case "product":
      return "orders";
    case "ticket":
      return "support";
    case "invoice":
      return "finance";
    default:
      return "access";
  }
};

export const sourceLabels: Record<ActivityEvent["source"], L> = {
  web: { en: "Web app", tr: "Web uygulaması" },
  api: { en: "API", tr: "API" },
  mobile: { en: "Mobile", tr: "Mobil" },
  system: { en: "Automation", tr: "Otomasyon" },
};

/** The first page: the shared audit stream. */
export const firstPage: FeedEvent[] = activity.map((e) => ({ ...e, topic: topicOf(e) }));

const companies = ["Quillfeather Books", "Halcyon Ferments", "Brightwater Optics", "Lodestar Freight", "Northpaw Pet Supply", "Velvet Anchor Hotels", "Calderwood Labs", "Yelken Marine Supply", "Kuzey Outdoor", "Orchard & Oak Furniture", "Tessellate Architects", "Saffronia Kitchens"];
const products = [
  ["KL-CER-101", "Speckled stoneware mug", "Benekli taş kupa"],
  ["KL-TEX-201", "Washed linen duvet cover", "Yıkanmış keten nevresim"],
  ["KL-LGT-301", "Paper lantern pendant", "Kâğıt fener sarkıt"],
  ["KL-KIT-409", "Copper coffee pot", "Bakır cezve"],
  ["KL-DEC-501", "Rattan wall mirror", "Hasır duvar aynası"],
  ["KL-KIT-401", "Olive-wood cutting board", "Zeytin ağacı kesme tahtası"],
] as const;
const stages = [
  ["Qualified", "Nitelikli"],
  ["Proposal sent", "Teklif gönderildi"],
  ["Negotiation", "Pazarlık"],
] as const;

type Template = (r: () => number, n: number) => Omit<FeedEvent, "id" | "at" | "topic">;

const templates: Template[] = [
  (r) => {
    const co = pick(r, companies);
    const [from, to] = [pick(r, stages), pick(r, stages)];
    return {
      actorId: pick(r, ["p-aylin", "p-tomas", "p-ines", "p-noah"]),
      action: "deal.stage_changed",
      summary: { en: `moved ${co} · Expansion to ${to[0]}`, tr: `${co} · Büyüme fırsatını ${to[1]} aşamasına taşıdı` },
      entity: { type: "deal", id: `d-${int(r, 40, 90)}`, label: `${co} · Expansion` },
      source: "web",
      changes: from[0] === to[0] ? undefined : [{ field: "stage", from: from[0], to: to[0] }],
    };
  },
  (r) => {
    const no = int(r, 24100, 24260);
    return {
      actorId: "system",
      action: "order.paid",
      summary: { en: `captured payment for order #KL-${no}`, tr: `#KL-${no} siparişinin ödemesini aldı` },
      entity: { type: "order", id: `o-${no}`, label: `#KL-${no}` },
      source: "system",
    };
  },
  (r) => {
    const no = int(r, 24100, 24260);
    const carrier = pick(r, ["Martı Express", "Kargo Kuşu", "Poyraz Lojistik"]);
    return {
      actorId: pick(r, ["p-ruth", "p-malik"]),
      action: "order.shipped",
      summary: { en: `shipped order #KL-${no} with ${carrier}`, tr: `#KL-${no} siparişini ${carrier} ile gönderdi` },
      entity: { type: "order", id: `o-${no}`, label: `#KL-${no}` },
      source: "mobile",
    };
  },
  (r) => {
    const p = pick(r, products);
    const a = int(r, 4, 60);
    const b = Math.max(0, a - int(r, 2, 20));
    return {
      actorId: pick(r, ["p-ruth", "system"]),
      action: "product.updated",
      summary: { en: `adjusted stock for ${p[1]}`, tr: `${p[2]} stoğunu güncelledi` },
      entity: { type: "product", id: p[0], label: p[0] },
      source: "mobile",
      changes: [{ field: "stock", from: String(a), to: String(b) }],
    };
  },
  (r) => {
    const no = int(r, 4790, 4840);
    return {
      actorId: pick(r, ["p-oskar", "p-kerem", "p-zeynep", "p-hana"]),
      action: "ticket.replied",
      summary: { en: `replied to ticket #${no}`, tr: `#${no} numaralı talebi yanıtladı` },
      entity: { type: "ticket", id: `t-${no}`, label: `#${no}` },
      source: "web",
    };
  },
  (r) => {
    const no = int(r, 4790, 4840);
    return {
      actorId: pick(r, ["p-kerem", "p-zeynep"]),
      action: "ticket.solved",
      summary: { en: `solved ticket #${no}`, tr: `#${no} numaralı talebi çözdü` },
      entity: { type: "ticket", id: `t-${no}`, label: `#${no}` },
      source: "web",
      changes: [{ field: "status", from: "Pending", to: "Solved" }],
    };
  },
  (r) => {
    const no = String(int(r, 300, 345)).padStart(4, "0");
    const co = pick(r, companies);
    return {
      actorId: pick(r, ["p-felix", "p-gizem"]),
      action: "invoice.sent",
      summary: { en: `sent invoice INV-2026-${no} to ${co}`, tr: `INV-2026-${no} faturasını ${co} firmasına gönderdi` },
      entity: { type: "invoice", id: `inv-${no}`, label: `INV-2026-${no}` },
      source: "web",
    };
  },
  (r) => {
    const no = String(int(r, 280, 330)).padStart(4, "0");
    const amt = (int(r, 8, 96) * 500).toLocaleString("en-US");
    return {
      actorId: "system",
      action: "invoice.paid",
      summary: { en: `matched a ₺${amt}.00 bank transfer to INV-2026-${no}`, tr: `₺${amt},00 havaleyi INV-2026-${no} ile eşleştirdi` },
      entity: { type: "invoice", id: `inv-${no}`, label: `INV-2026-${no}` },
      source: "system",
    };
  },
  (r) => {
    const who = pick(r, [["p-maya", "Maya Lindqvist"], ["p-jun", "Jun Park"], ["p-amaru", "Amaru Quispe"]] as const);
    return {
      actorId: pick(r, ["p-defne", "system"]),
      action: "user.signed_in",
      summary: { en: `recorded a new-device sign-in for ${who[1]}`, tr: `${who[1]} için yeni cihazdan giriş kaydetti` },
      entity: { type: "user", id: who[0], label: who[1] },
      source: "system",
      ip: pick(r, ["203.0.113.61", "198.51.100.8", "192.0.2.44"]),
    };
  },
];

let liveCounter = 0;

function make(seed: number, at: number, live: boolean): FeedEvent {
  const r = seeded(seed);
  const tpl = templates[Math.floor(r() * templates.length)]!;
  const base = tpl(r, seed);
  const iso = new Date(at + 3 * 3_600_000).toISOString().slice(0, 19) + "+03:00";
  const ev = { ...base, id: `${live ? "lv" : "old"}-${seed}`, at: iso } as ActivityEvent;
  return { ...ev, topic: topicOf(ev), live };
}

export const PAGE_SIZE = 14;
/** Older pages available behind the first one (then the feed ends). */
export const OLDER_PAGES = 5;

/** Older events, page 1…OLDER_PAGES, continuing back in time from `beforeMs`. */
export function olderPage(page: number, beforeMs: number): FeedEvent[] {
  const r = seeded(9100 + page);
  const out: FeedEvent[] = [];
  let t = beforeMs;
  for (let i = 0; i < PAGE_SIZE; i++) {
    t -= int(r, 18, 190) * 60_000;
    out.push(make(page * 100 + i, t, false));
  }
  return out;
}

/** The next live event. Arrives "now" (just after the fixtures' NOW, advancing per event). */
export function nextLiveEvent(): FeedEvent {
  liveCounter += 1;
  return make(50_000 + liveCounter, NOW_MS + liveCounter * 20_000, true);
}

/** Hourly counts for the pulse strip: the 12 hours up to NOW. */
export function hourlyCounts(events: FeedEvent[]): number[] {
  const buckets = Array.from({ length: 12 }, () => 0);
  for (const e of events) {
    const h = Math.floor((NOW_MS - Date.parse(e.at)) / 3_600_000);
    if (h >= 0 && h < 12) buckets[11 - h]! += 1;
    else if (h < 0) buckets[11]! += 1;
  }
  // Same events as the feed and the topic breakdown, so the three numbers always agree.
  return buckets;
}

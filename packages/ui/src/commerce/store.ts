/**
 * Server-side order storage for payment providers whose result arrives server to server (PayTR's
 * notification), where the signed cookie of the iyzico flow cannot travel. It keeps the order
 * snapshot between "Pay" and the provider's notification and an idempotency marker per paid order.
 *
 *   memoryOrderStore()             one process only (tests, `next dev`); lost on restart
 *   cloudflareKvOrderStore(kv)     a Cloudflare Workers KV binding (Pages Functions: env.ORDERS)
 *   upstashOrderStore({ url, token })  Upstash Redis over its REST API, also what Vercel's
 *                                  Marketplace Redis exposes (KV_REST_API_URL / KV_REST_API_TOKEN)
 *
 * `markPaid` answers true only the first time for an order id: run side effects (emails, webhooks)
 * only when it does. Upstash makes that atomic with SET NX. Workers KV is eventually consistent
 * (a write can take up to ~60 s to be seen in other locations, and there is no compare-and-set),
 * so there it is best effort: two notifications for the same order at the same moment in two
 * locations could both pass. PayTR spaces its retries minutes apart, which keeps that unlikely;
 * use Upstash when a duplicate email is not acceptable.
 *
 * Only fetch and the KV binding API are used: Node 20+, edge runtimes, Deno and Bun alike.
 */
import type { OrderSnapshot } from "./order";

export interface OrderStore {
  /** Keeps the snapshot for `ttlSeconds`. */
  put(id: string, snapshot: OrderSnapshot, ttlSeconds: number): Promise<void>;
  /** The snapshot, or null when it is unknown or expired. */
  get(id: string): Promise<OrderSnapshot | null>;
  /** True the first time it is called for `id`, false afterwards (the paid marker lives `ttlSeconds`, default 30 days). */
  markPaid(id: string, ttlSeconds?: number): Promise<boolean>;
  /** Removes the snapshot (not the paid marker). */
  delete(id: string): Promise<void>;
}

/** How long the paid marker is kept by default: longer than any provider retries. */
export const PAID_MARKER_TTL = 30 * 24 * 3600;

const orderKey = (prefix: string, id: string) => `${prefix}order:${id}`;
const paidKey = (prefix: string, id: string) => `${prefix}paid:${id}`;

function parse(raw: unknown): OrderSnapshot | null {
  if (raw === null || raw === undefined) return null;
  try {
    const order = (typeof raw === "string" ? JSON.parse(raw) : raw) as OrderSnapshot;
    return order?.v === 1 && typeof order.id === "string" ? order : null;
  } catch {
    return null;
  }
}

/** In-process store. Not shared between server instances and lost on restart: tests and local development only. */
export function memoryOrderStore(opts: { now?: () => number } = {}): OrderStore {
  const now = opts.now ?? Date.now;
  const orders = new Map<string, { value: string; expires: number }>();
  const paid = new Map<string, number>();
  const live = <T>(map: Map<string, T>, id: string, expires: (v: T) => number) => {
    const entry = map.get(id);
    if (entry === undefined) return undefined;
    if (expires(entry) <= now()) {
      map.delete(id);
      return undefined;
    }
    return entry;
  };
  return {
    async put(id, snapshot, ttlSeconds) {
      orders.set(id, { value: JSON.stringify(snapshot), expires: now() + ttlSeconds * 1000 });
    },
    async get(id) {
      const entry = live(orders, id, (e) => e.expires);
      return entry ? parse(entry.value) : null;
    },
    async markPaid(id, ttlSeconds = PAID_MARKER_TTL) {
      if (live(paid, id, (e) => e) !== undefined) return false;
      paid.set(id, now() + ttlSeconds * 1000);
      return true;
    },
    async delete(id) {
      orders.delete(id);
    },
  };
}

/** The part of a Workers KV namespace binding this store uses. */
export interface KvNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

// Workers KV refuses an expirationTtl under 60 seconds.
const kvTtl = (seconds: number) => Math.max(60, Math.ceil(seconds));

/**
 * Orders in a Cloudflare Workers KV namespace (bind one, e.g. ORDERS, in the Pages project or
 * wrangler.toml and pass `env.ORDERS`). `markPaid` is best effort: KV has no atomic
 * set-if-absent and is eventually consistent between locations (see the module comment).
 */
export function cloudflareKvOrderStore(kv: KvNamespaceLike, opts: { prefix?: string } = {}): OrderStore {
  if (!kv || typeof kv.get !== "function" || typeof kv.put !== "function") throw new TypeError("commerce: cloudflareKvOrderStore needs a KV namespace binding (env.ORDERS)");
  const prefix = opts.prefix ?? "vb:";
  return {
    async put(id, snapshot, ttlSeconds) {
      await kv.put(orderKey(prefix, id), JSON.stringify(snapshot), { expirationTtl: kvTtl(ttlSeconds) });
    },
    async get(id) {
      return parse(await kv.get(orderKey(prefix, id)));
    },
    async markPaid(id, ttlSeconds = PAID_MARKER_TTL) {
      if ((await kv.get(paidKey(prefix, id))) !== null) return false;
      await kv.put(paidKey(prefix, id), new Date().toISOString(), { expirationTtl: kvTtl(ttlSeconds) });
      return true;
    },
    async delete(id) {
      await kv.delete(orderKey(prefix, id));
    },
  };
}

export interface UpstashOrderStoreOptions {
  /** REST URL: UPSTASH_REDIS_REST_URL (or KV_REST_API_URL on Vercel). */
  url: string;
  /** REST token: UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_TOKEN on Vercel). */
  token: string;
  /** Key prefix. Default "vb:". */
  prefix?: string;
  fetch?: (url: string, init: RequestInit) => Promise<Response>;
}

/**
 * Orders in Upstash Redis through its REST API (one command per request, JSON array body). The
 * paid marker uses SET NX, so `markPaid` is atomic. The token is sent as a bearer header only and
 * never appears in errors.
 */
export function upstashOrderStore(opts: UpstashOrderStoreOptions): OrderStore {
  if (!opts?.url || !opts.token) throw new TypeError("commerce: upstashOrderStore needs url and token (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)");
  const base = opts.url.replace(/\/+$/, "");
  const prefix = opts.prefix ?? "vb:";
  const send = opts.fetch ?? ((url: string, init: RequestInit) => globalThis.fetch(url, init));
  async function command(...args: (string | number)[]): Promise<unknown> {
    const res = await send(base, { method: "POST", headers: { Authorization: `Bearer ${opts.token}`, "Content-Type": "application/json" }, body: JSON.stringify(args.map(String)) });
    let body: { result?: unknown; error?: string };
    try {
      body = (await res.json()) as typeof body;
    } catch {
      throw new Error(`Upstash answered HTTP ${res.status} without JSON (${String(args[0])})`);
    }
    if (!res.ok || body.error) throw new Error(`Upstash ${String(args[0])} failed: ${body.error ?? `HTTP ${res.status}`}`);
    return body.result ?? null;
  }
  return {
    async put(id, snapshot, ttlSeconds) {
      await command("SET", orderKey(prefix, id), JSON.stringify(snapshot), "EX", Math.max(1, Math.ceil(ttlSeconds)));
    },
    async get(id) {
      return parse(await command("GET", orderKey(prefix, id)));
    },
    async markPaid(id, ttlSeconds = PAID_MARKER_TTL) {
      return (await command("SET", paidKey(prefix, id), new Date().toISOString(), "NX", "EX", Math.max(1, Math.ceil(ttlSeconds)))) === "OK";
    },
    async delete(id) {
      await command("DEL", orderKey(prefix, id));
    },
  };
}

import { createHmac } from "node:crypto";
import { cloudflareKvOrderStore, createPaytrCheckout, createPaytrOrderId, memoryOrderStore, upstashOrderStore, type Catalog, type KvNamespaceLike, type OrderSnapshot, type OrderStore, type PaidOrder } from "./index";
import { PAYTR_IFRAME_URL } from "../payments/paytr";

// Fixture credentials — not real keys. Hashes are computed independently with node:crypto from the
// formulas in PayTR's public docs (dev.paytr.com, iFrame API steps 1 and 2).
const PAYTR = { merchantId: "100000", merchantKey: "fixtureMerchantKey", merchantSalt: "fixtureMerchantSalt" };
const hmacB64 = (key: string, msg: string) => createHmac("sha256", key).update(msg, "utf8").digest("base64");

const catalog: Catalog = {
  currency: "TRY",
  vatRate: 20,
  shipping: { flat: 79_90, freeOver: 1000_00, label: "Kargo" },
  products: [
    { id: "mug", name: "Stoneware mug", price: 349_90, category: "Kitchen", variants: [{ id: "sand", name: "Sand" }, { id: "ink", name: "Ink", price: 379_90 }] },
    { id: "guide", name: "Glaze guide (PDF)", price: 120_00, itemType: "VIRTUAL" },
  ],
};
const buyer = { name: "Deniz", surname: "Kaya", email: "deniz@example.com", phone: "0532 000 00 00", address: "Rıhtım Caddesi 14 Daire 3", city: "İstanbul", district: "Kadıköy" };

const snapshot = (id: string): OrderSnapshot => ({
  v: 1,
  id,
  createdAt: "2026-11-18T10:00:00.000Z",
  locale: "tr",
  buyer,
  quote: { currency: "TRY", lines: [], subtotal: 100_00, shipping: 0, shippingLabel: "Kargo", discount: 0, vatByRate: {}, vat: 16_67, total: 100_00, physical: false },
});

describe("memoryOrderStore", () => {
  it("keeps snapshots until they expire and marks an order paid only once", async () => {
    let t = 1_000_000;
    const store = memoryOrderStore({ now: () => t });
    await store.put("VB1", snapshot("VB1"), 60);
    expect((await store.get("VB1"))?.id).toBe("VB1");
    expect(await store.get("VB2")).toBeNull();
    expect(await store.markPaid("VB1")).toBe(true);
    expect(await store.markPaid("VB1")).toBe(false);
    t += 61_000;
    expect(await store.get("VB1")).toBeNull();
    expect(await store.markPaid("VB1")).toBe(false); // the paid marker outlives the snapshot
    await store.put("VB3", snapshot("VB3"), 60);
    await store.delete("VB3");
    expect(await store.get("VB3")).toBeNull();
  });
});

/** A small Redis behind Upstash's REST protocol (POST a JSON command array, `{ result }` back). */
function fakeUpstash(token: string) {
  const data = new Map<string, { value: string; ex?: number }>();
  const calls: { url: string; auth: string | null; command: string[] }[] = [];
  const fetch = async (url: string, init: RequestInit) => {
    const auth = new Headers(init.headers).get("authorization");
    const command = JSON.parse(String(init.body)) as string[];
    calls.push({ url, auth, command });
    if (auth !== `Bearer ${token}`) return Response.json({ error: "WRONGPASS invalid token" }, { status: 401 });
    const [op, key, value, ...rest] = command;
    if (op === "GET") return Response.json({ result: data.get(key!)?.value ?? null });
    if (op === "DEL") return Response.json({ result: data.delete(key!) ? 1 : 0 });
    if (op === "SET") {
      const nx = rest.includes("NX");
      if (nx && data.has(key!)) return Response.json({ result: null });
      const ex = rest.indexOf("EX");
      data.set(key!, { value: value!, ex: ex >= 0 ? Number(rest[ex + 1]) : undefined });
      return Response.json({ result: "OK" });
    }
    return Response.json({ error: `ERR unknown command '${op}'` }, { status: 400 });
  };
  return { fetch, data, calls };
}

describe("upstashOrderStore", () => {
  it("SET EX / GET / DEL with a bearer token; markPaid uses SET NX", async () => {
    const redis = fakeUpstash("fixture-upstash-token");
    const store = upstashOrderStore({ url: "https://eu1-fixture.upstash.io/", token: "fixture-upstash-token", fetch: redis.fetch });
    await store.put("VB1", snapshot("VB1"), 7200);
    expect(redis.calls[0]).toMatchObject({ url: "https://eu1-fixture.upstash.io", auth: "Bearer fixture-upstash-token" });
    expect(redis.calls[0]!.command.slice(0, 2)).toEqual(["SET", "vb:order:VB1"]);
    expect(redis.calls[0]!.command.slice(3)).toEqual(["EX", "7200"]);
    expect((await store.get("VB1"))?.id).toBe("VB1");
    expect(await store.markPaid("VB1")).toBe(true);
    expect(await store.markPaid("VB1")).toBe(false);
    expect(redis.calls.at(-1)!.command).toEqual(["SET", "vb:paid:VB1", expect.any(String), "NX", "EX", String(30 * 24 * 3600)]);
    await store.delete("VB1");
    expect(await store.get("VB1")).toBeNull();
  });

  it("errors name the command, never the token", async () => {
    const redis = fakeUpstash("right-token");
    const store = upstashOrderStore({ url: "https://eu1-fixture.upstash.io", token: "wrong-token-value", fetch: redis.fetch });
    const error = await store.get("VB1").catch((e: Error) => e);
    expect(String(error)).toContain("GET");
    expect(String(error)).not.toContain("wrong-token-value");
    expect(() => upstashOrderStore({ url: "", token: "x" })).toThrow(/UPSTASH_REDIS_REST_URL/);
  });
});

function fakeKv() {
  const data = new Map<string, string>();
  const puts: { key: string; ttl?: number }[] = [];
  const kv: KvNamespaceLike = {
    async get(key) {
      return data.get(key) ?? null;
    },
    async put(key, value, options) {
      puts.push({ key, ttl: options?.expirationTtl });
      data.set(key, value);
    },
    async delete(key) {
      data.delete(key);
    },
  };
  return { kv, data, puts };
}

describe("cloudflareKvOrderStore", () => {
  it("stores JSON with expirationTtl (at least 60 s) and keeps a paid marker", async () => {
    const { kv, puts } = fakeKv();
    const store = cloudflareKvOrderStore(kv);
    await store.put("VB1", snapshot("VB1"), 7200);
    await store.put("VB2", snapshot("VB2"), 5);
    expect(puts).toEqual([
      { key: "vb:order:VB1", ttl: 7200 },
      { key: "vb:order:VB2", ttl: 60 },
    ]);
    expect((await store.get("VB1"))?.quote.total).toBe(100_00);
    expect(await store.markPaid("VB1")).toBe(true);
    expect(await store.markPaid("VB1")).toBe(false);
    await store.delete("VB1");
    expect(await store.get("VB1")).toBeNull();
    expect(() => cloudflareKvOrderStore(undefined as unknown as KvNamespaceLike)).toThrow(/ORDERS/);
  });
});

describe("createPaytrCheckout", () => {
  const tokenCalls: Record<string, string>[] = [];
  const paytrFetch = async (_url: string, init: RequestInit) => {
    tokenCalls.push(Object.fromEntries(new URLSearchParams(String(init.body))));
    return Response.json({ status: "success", token: "fixturetoken123" });
  };

  const setup = (extra: { store?: OrderStore } = {}) => {
    const notified: PaidOrder[] = [];
    const logs: string[] = [];
    const orphans: unknown[] = [];
    const store = extra.store ?? memoryOrderStore();
    const checkout = createPaytrCheckout({
      catalog,
      paytr: { ...PAYTR, fetch: paytrFetch },
      store,
      notify: (o) => void notified.push(o),
      onOrphanPayment: (i) => void orphans.push(i),
      log: (m, d) => void logs.push(`${m} ${JSON.stringify(d ?? "")}`),
    });
    return { checkout, store, notified, logs, orphans };
  };

  const startRequest = (body: unknown, headers: Record<string, string> = {}) =>
    new Request("https://kiln.test/api/checkout", { method: "POST", headers: { "content-type": "application/json", origin: "https://kiln.test", "cf-connecting-ip": "203.0.113.7", ...headers }, body: JSON.stringify(body) });

  const notification = (fields: Record<string, string>, hash?: string) => {
    const form = new URLSearchParams({ ...fields, hash: hash ?? hmacB64(PAYTR.merchantKey, fields.merchant_oid! + PAYTR.merchantSalt + fields.status! + fields.total_amount!) });
    return new Request("https://kiln.test/api/checkout/paytr-notify", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form.toString() });
  };

  it("start prices from the catalog, stores the order and answers the iframe URL", async () => {
    tokenCalls.length = 0;
    const { checkout, store } = setup();
    const res = await checkout.start(startRequest({ lines: [{ productId: "mug", variantId: "ink", qty: 1, price: 1 }], buyer }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { order: string; iframeUrl: string; token: string; paymentPageUrl: string };
    expect(data.order).toMatch(/^VB\d{6}[A-Z0-9]{8}$/);
    expect(data).toMatchObject({ token: "fixturetoken123", iframeUrl: PAYTR_IFRAME_URL + "fixturetoken123", paymentPageUrl: PAYTR_IFRAME_URL + "fixturetoken123" });
    const sent = tokenCalls[0]!;
    // 379.90 + 79.90 shipping, in kuruş
    expect(sent).toMatchObject({ merchant_oid: data.order, payment_amount: "45980", currency: "TL", test_mode: "1", user_ip: "203.0.113.7", email: "deniz@example.com" });
    expect(JSON.parse(Buffer.from(sent.user_basket!, "base64").toString("utf8"))).toEqual([
      ["Stoneware mug · Ink", "379.90", 1],
      ["Kargo", "79.90", 1],
    ]);
    const hashStr = PAYTR.merchantId + "203.0.113.7" + data.order + "deniz@example.com" + "45980" + sent.user_basket + "0" + "0" + "TL" + "1";
    expect(sent.paytr_token).toBe(hmacB64(PAYTR.merchantKey, hashStr + PAYTR.merchantSalt));
    expect(sent.merchant_ok_url).toBe(`https://kiln.test/order/confirmation?order=${data.order}`);
    expect(sent.merchant_fail_url).toBe("https://kiln.test/checkout?payment=failed");
    expect(JSON.stringify(sent)).not.toContain(PAYTR.merchantSalt);
    expect((await store.get(data.order))?.quote.total).toBe(459_80);
  });

  it("start charges the discounted total for a discount code and refuses an unknown code", async () => {
    tokenCalls.length = 0;
    const store = memoryOrderStore();
    const checkout = createPaytrCheckout({ catalog: { ...catalog, coupons: [{ code: "ONLUK", kind: "amount", value: 10_00 }] }, paytr: { ...PAYTR, fetch: paytrFetch }, store, log: () => {} });
    const res = await checkout.start(startRequest({ lines: [{ productId: "mug", variantId: "ink", qty: 1 }], buyer, coupon: "onluk" }));
    expect(res.status).toBe(200);
    const sent = tokenCalls[0]!;
    // 379.90 − 10.00 + 79.90 shipping
    expect(sent.payment_amount).toBe("44980");
    const basket = JSON.parse(Buffer.from(sent.user_basket!, "base64").toString("utf8")) as [string, string, number][];
    expect(basket.reduce((s, [, p, q]) => s + Math.round(Number(p) * 100) * q, 0)).toBe(449_80);
    const bad = await checkout.start(startRequest({ lines: [{ productId: "mug", variantId: "ink", qty: 1 }], buyer, coupon: "NOPE" }));
    expect([bad.status, ((await bad.json()) as { error: string }).error]).toEqual([422, "invalid-cart"]);
  });

  it("start refuses other origins, bad carts and non-ASCII emails before calling PayTR", async () => {
    tokenCalls.length = 0;
    const { checkout } = setup();
    expect((await checkout.start(startRequest({ lines: [{ productId: "guide", qty: 1 }], buyer }, { origin: "https://evil.test" }))).status).toBe(403);
    expect((await checkout.start(startRequest({ lines: [{ productId: "nope", qty: 1 }], buyer }))).status).toBe(422);
    const r = await checkout.start(startRequest({ lines: [{ productId: "guide", qty: 1 }], buyer: { ...buyer, email: "çağrı@example.com" } }));
    expect(r.status).toBe(422);
    expect(await r.json()).toEqual({ error: "invalid-buyer", fields: ["email"] });
    expect(tokenCalls).toHaveLength(0);
  });

  it("start forgets the order when PayTR refuses the token", async () => {
    const store = memoryOrderStore();
    const checkout = createPaytrCheckout({ catalog, store, paytr: { ...PAYTR, fetch: async () => Response.json({ status: "failed", reason: "Zorunlu alan degeri gecersiz" }) }, log: () => {} });
    const res = await checkout.start(startRequest({ lines: [{ productId: "guide", qty: 1 }], buyer }));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "payment-unavailable" });
  });

  async function started(ctx: ReturnType<typeof setup>) {
    const res = await ctx.checkout.start(startRequest({ lines: [{ productId: "mug", variantId: "sand", qty: 2 }], buyer }));
    return ((await res.json()) as { order: string }).order; // 2 × 349.90 + 79.90 = 779.70
  }

  it("a paid notification runs notify once; a retry answers OK without a second notify", async () => {
    const ctx = setup();
    const oid = await started(ctx);
    const fields = { merchant_oid: oid, status: "success", total_amount: "77970", payment_amount: "77970", currency: "TL", test_mode: "1", installment_count: "1" };
    const first = await ctx.checkout.notify(notification(fields));
    expect([first.status, await first.text()]).toEqual([200, "OK"]);
    expect(first.headers.get("content-type")).toContain("text/plain");
    expect(ctx.notified).toHaveLength(1);
    expect(ctx.notified[0]).toMatchObject({ id: oid, provider: "paytr", paidPrice: "779.70", installment: 1, buyer: { email: "deniz@example.com" } });
    const retry = await ctx.checkout.notify(notification(fields));
    expect([retry.status, await retry.text()]).toEqual([200, "OK"]);
    expect(ctx.notified).toHaveLength(1);
    expect(ctx.logs.join("\n")).toContain("already processed");
  });

  it("installment interest may raise total_amount; it may never lower it", async () => {
    const ctx = setup();
    const oid = await started(ctx);
    expect(await (await ctx.checkout.notify(notification({ merchant_oid: oid, status: "success", total_amount: "77969" }))).text()).toBe("OK");
    expect(ctx.notified).toHaveLength(0);
    expect(ctx.logs.join("\n")).toContain("does not match");
    expect(await (await ctx.checkout.notify(notification({ merchant_oid: oid, status: "success", total_amount: "81858", installment_count: "3" }))).text()).toBe("OK");
    expect(ctx.notified.map((o) => [o.paidPrice, o.installment])).toEqual([["818.58", 3]]);
  });

  it("a bad hash gets a non-OK answer and changes nothing", async () => {
    const ctx = setup();
    const oid = await started(ctx);
    const res = await ctx.checkout.notify(notification({ merchant_oid: oid, status: "success", total_amount: "77970" }, hmacB64("wrongKey", oid + PAYTR.merchantSalt + "success77970")));
    expect(res.status).toBe(400);
    expect(await res.text()).not.toBe("OK");
    expect(ctx.notified).toHaveLength(0);
    expect(await ctx.store.markPaid(oid)).toBe(true); // still unpaid
    expect(ctx.logs.join("\n")).not.toContain(PAYTR.merchantKey);
  });

  it("an unknown order answers OK, logs and reports the orphan once", async () => {
    const ctx = setup();
    const fields = { merchant_oid: "VB261118UNKNOWN1", status: "success", total_amount: "12000" };
    expect(await (await ctx.checkout.notify(notification(fields))).text()).toBe("OK");
    expect(await (await ctx.checkout.notify(notification(fields))).text()).toBe("OK");
    expect(ctx.notified).toHaveLength(0);
    expect(ctx.orphans).toEqual([{ merchantOid: "VB261118UNKNOWN1", totalAmount: "120.00" }]);
    expect(ctx.logs.join("\n")).toContain("unknown order");
  });

  it("a failed payment answers OK without notify; a store outage asks PayTR to retry", async () => {
    const ctx = setup();
    const oid = await started(ctx);
    expect(await (await ctx.checkout.notify(notification({ merchant_oid: oid, status: "failed", total_amount: "77970", failed_reason_code: "6" }))).text()).toBe("OK");
    expect(ctx.notified).toHaveLength(0);

    const broken: OrderStore = { ...memoryOrderStore(), get: async () => Promise.reject(new Error("timeout")) };
    const down = setup({ store: broken });
    const res = await down.checkout.notify(notification({ merchant_oid: oid, status: "success", total_amount: "77970" }));
    expect(res.status).toBe(503);
  });

  it("works on Upstash and KV the same way", async () => {
    for (const store of [upstashOrderStore({ url: "https://eu1-fixture.upstash.io", token: "t", fetch: fakeUpstash("t").fetch }), cloudflareKvOrderStore(fakeKv().kv)]) {
      const ctx = setup({ store });
      const oid = await started(ctx);
      const fields = { merchant_oid: oid, status: "success", total_amount: "77970" };
      await ctx.checkout.notify(notification(fields));
      await ctx.checkout.notify(notification(fields));
      expect(ctx.notified.map((o) => o.id)).toEqual([oid]);
    }
  });

  it("refuses a currency PayTR does not take; order ids are letters and digits", () => {
    expect(() => createPaytrCheckout({ catalog: { ...catalog, currency: "JPY" }, paytr: PAYTR, store: memoryOrderStore() })).toThrow(/JPY/);
    expect(createPaytrOrderId("V-B", new Date("2026-11-18T00:00:00Z"))).toMatch(/^VB261118[A-Z0-9]{8}$/);
  });
});

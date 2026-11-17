import { createCheckout, createOrderId, notifyAll, orderText, priceCart, readBuyer, resendNotifier, signOrder, toDecimal, verifyOrder, webhookNotifier, type Catalog, type OrderSnapshot, type PaidOrder } from "./index";
import { iyzicoSignature } from "../payments/iyzico";

const catalog: Catalog = {
  currency: "TRY",
  vatRate: 20,
  shipping: { flat: 79_90, freeOver: 1000_00, label: "Kargo" },
  products: [
    { id: "mug", name: "Stoneware mug", price: 349_90, category: "Kitchen", variants: [{ id: "sand", name: "Sand" }, { id: "ink", name: "Ink", price: 379_90 }, { id: "moss", name: "Moss", available: false }] },
    { id: "guide", name: "Glaze guide (PDF)", price: 120_00, itemType: "VIRTUAL", vatRate: 10 },
    { id: "kiln", name: "Kiln", price: 5000_00, available: false },
    { id: "bowl", name: "Bowl", price: 250_00, maxQty: 3 },
  ],
};

const buyer = { name: "Deniz", surname: "Kaya", email: "deniz@example.com", phone: "0532 000 00 00", address: "Rıhtım Caddesi 14 Daire 3", city: "İstanbul", district: "Kadıköy" };
const SECRET = "test-order-secret-0123456789abcdefghij";
const IYZ = { apiKey: "sandbox-fixtureApiKey0000000000000000", secretKey: "sandbox-fixtureSecretKey000000000000" };

describe("priceCart", () => {
  it("prices lines from the catalog with variant prices, VAT shares and shipping", () => {
    const r = priceCart(catalog, [
      { productId: "mug", variantId: "ink", qty: 2 },
      { productId: "guide", qty: 1 },
    ]);
    if (!r.ok) throw new Error("expected ok");
    const q = r.quote;
    expect(q.lines.map((l) => [l.name, l.unit, l.total])).toEqual([
      ["Stoneware mug · Ink", 379_90, 759_80],
      ["Glaze guide (PDF)", 120_00, 120_00],
    ]);
    expect(q.subtotal).toBe(879_80);
    expect(q.shipping).toBe(79_90);
    expect(q.total).toBe(959_70);
    // 759.80 × 20/120 = 126.63; 120 × 10/110 = 10.91; 79.90 × 20/120 = 13.32
    expect(q.vatByRate).toEqual({ "20": 126_63 + 13_32, "10": 10_91 });
    expect(q.vat).toBe(126_63 + 13_32 + 10_91);
    expect(q.physical).toBe(true);
  });

  it("drops shipping above the free threshold and for digital-only carts", () => {
    const free = priceCart(catalog, [{ productId: "mug", variantId: "sand", qty: 3 }]);
    expect(free.ok && free.quote.shipping).toBe(0);
    const digital = priceCart(catalog, [{ productId: "guide", qty: 1 }]);
    expect(digital.ok && [digital.quote.shipping, digital.quote.physical]).toEqual([0, false]);
  });

  it("refuses unknown, unavailable, duplicate and out-of-range lines", () => {
    const r = priceCart(catalog, [
      { productId: "nope", qty: 1 },
      { productId: "mug", qty: 1 },
      { productId: "mug", variantId: "moss", qty: 1 },
      { productId: "kiln", qty: 1 },
      { productId: "bowl", qty: 4 },
      { productId: "guide", qty: 1.5 },
      { productId: "guide", qty: 1 },
      { productId: "guide", qty: 1 },
    ]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.issues.map((i) => [i.index, i.code])).toEqual([
      [0, "unknown-product"],
      [1, "unknown-variant"],
      [2, "unavailable"],
      [3, "unavailable"],
      [4, "bad-quantity"],
      [5, "bad-quantity"],
      [7, "duplicate"],
    ]);
    expect(priceCart(catalog, [])).toEqual({ ok: false, issues: [{ index: -1, code: "empty" }] });
  });

  it("toDecimal keeps two places", () => {
    expect([toDecimal(14990), toDecimal(5), toDecimal(100000), toDecimal(-250)]).toEqual(["149.90", "0.05", "1000.00", "-2.50"]);
    expect(() => toDecimal(1.5)).toThrow();
  });
});

describe("signed orders", () => {
  const order = (createdAt = new Date().toISOString()): OrderSnapshot => {
    const r = priceCart(catalog, [{ productId: "bowl", qty: 1 }]);
    if (!r.ok) throw new Error("expected ok");
    return { v: 1, id: createOrderId("TEST"), createdAt, locale: "tr", quote: r.quote, buyer: { ...buyer } };
  };

  it("round-trips and rejects tampering, other secrets and expired orders", async () => {
    const o = order();
    const token = await signOrder(o, SECRET);
    expect(await verifyOrder(token, SECRET)).toEqual(o);
    const [body, sig] = token.split(".");
    const forged = JSON.parse(Buffer.from(body!, "base64url").toString("utf8")) as OrderSnapshot;
    forged.quote.total = 1;
    expect(await verifyOrder(`${Buffer.from(JSON.stringify(forged)).toString("base64url")}.${sig}`, SECRET)).toBeNull();
    expect(await verifyOrder(token, "another-secret-0123456789abcdefghijkl")).toBeNull();
    const old = await signOrder(order(new Date(Date.now() - 2 * 3600_000).toISOString()), SECRET);
    expect(await verifyOrder(old, SECRET)).toBeNull();
    expect(await verifyOrder("garbage", SECRET)).toBeNull();
    await expect(signOrder(o, "short")).rejects.toThrow(/32 characters/);
  });

  it("order ids are readable and unique", () => {
    const ids = new Set(Array.from({ length: 200 }, () => createOrderId("VB", new Date("2026-11-18T10:00:00Z"))));
    expect(ids.size).toBe(200);
    expect([...ids][0]).toMatch(/^VB-261118-[2-9A-HJ-NP-Z]{8}$/);
  });
});

describe("readBuyer", () => {
  it("accepts a complete buyer and names the missing fields", () => {
    expect(readBuyer(buyer, true).buyer?.email).toBe("deniz@example.com");
    expect(readBuyer({ ...buyer, email: "nope", phone: "12", identityNumber: "0123" }, true).invalid).toEqual(["email", "phone", "identityNumber"]);
    expect(readBuyer({ ...buyer, address: "Online" }, false).buyer).toBeDefined();
  });
});

/** A fake iyzico that answers with correctly signed responses. */
function fakeIyzico(opts: { paymentStatus?: string; price?: string; basketId?: (conversationId: string) => string } = {}) {
  let conversationId = "";
  const calls: { path: string; body: Record<string, unknown> }[] = [];
  const fetch = async (url: string, init: RequestInit) => {
    const path = new URL(url).pathname;
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    calls.push({ path, body });
    if (path.endsWith("/initialize/auth/ecom")) {
      conversationId = String(body.conversationId);
      const res = { status: "success", token: "tok-1", conversationId, paymentPageUrl: "https://sandbox-cpp.iyzipay.com?token=tok-1", tokenExpireTime: 1800 };
      return Response.json({ ...res, signature: await iyzicoSignature(IYZ.secretKey, [conversationId, "tok-1"]) });
    }
    const initBody = calls.find((c) => c.path.endsWith("/initialize/auth/ecom"))?.body ?? {};
    const res = {
      status: "success",
      paymentStatus: opts.paymentStatus ?? "SUCCESS",
      paymentId: "pay-9",
      currency: "TRY",
      basketId: opts.basketId ? opts.basketId(conversationId) : conversationId,
      conversationId,
      paidPrice: String(opts.price ?? initBody.paidPrice),
      price: String(opts.price ?? initBody.price),
      token: "tok-1",
      installment: 1,
    };
    const sig = await iyzicoSignature(IYZ.secretKey, [res.paymentStatus, res.paymentId, res.currency, res.basketId, res.conversationId, res.paidPrice.replace(/0+$/, "").replace(/\.$/, ""), res.price.replace(/0+$/, "").replace(/\.$/, ""), res.token]);
    return Response.json({ ...res, signature: sig });
  };
  return { fetch, calls };
}

const start = (checkout: ReturnType<typeof createCheckout>, body: unknown, headers: Record<string, string> = {}) =>
  checkout.start(new Request("https://shop.test/api/checkout", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://shop.test", ...headers }, body: JSON.stringify(body) }));

const callback = (checkout: ReturnType<typeof createCheckout>, cookie: string) =>
  checkout.callback(new Request("https://shop.test/api/checkout/callback", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookie }, body: "token=tok-1" }));

const cookiePair = (res: Response) => (res.headers.get("set-cookie") ?? "").split(";")[0]!;

describe("createCheckout", () => {
  it("prices on the server, starts iyzico and completes a paid order once", async () => {
    const iyz = fakeIyzico();
    const paid: PaidOrder[] = [];
    const checkout = createCheckout({ catalog, iyzico: { ...IYZ, fetch: iyz.fetch }, orderSecret: SECRET, notify: (o) => void paid.push(o), log: () => {} });

    // The browser's prices are ignored: only ids and quantities are read.
    const res = await start(checkout, { lines: [{ productId: "mug", variantId: "sand", qty: 2, price: 1 }], buyer, locale: "tr" });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { order: string; paymentPageUrl: string };
    expect(data.paymentPageUrl).toContain("token=tok-1");
    expect(res.headers.get("set-cookie")).toMatch(/^vb_order=.+; Path=\/; Max-Age=3600; HttpOnly; Secure; SameSite=None$/);
    const init = iyz.calls[0]!.body;
    expect(init.price).toBe("779.7");
    expect(init.basketId).toBe(data.order);
    expect(init.callbackUrl).toBe("https://shop.test/api/checkout/callback");
    expect((init.basketItems as { price: string; name: string }[]).map((b) => [b.name, b.price])).toEqual([
      ["Stoneware mug · Sand", "699.8"],
      ["Kargo", "79.9"],
    ]);
    expect((init.buyer as Record<string, string>).gsmNumber).toBe("+905320000000");

    const done = await callback(checkout, cookiePair(res));
    expect(done.status).toBe(303);
    expect(done.headers.get("location")).toBe(`https://shop.test/order/confirmation?order=${data.order}`);
    expect(paid).toHaveLength(1);
    expect(paid[0]).toMatchObject({ id: data.order, paymentId: "pay-9", provider: "iyzico", buyer: { email: "deniz@example.com" } });

    // A second post of the same callback (refresh) lands on the confirmation without notifying again.
    const doneCookie = done.headers.getSetCookie().find((c) => c.startsWith("vb_order_done="))!.split(";")[0]!;
    const again = await callback(checkout, doneCookie);
    expect(again.headers.get("location")).toContain(`order=${data.order}`);
    expect(paid).toHaveLength(1);
  });

  it("refuses other origins, bad carts and bad buyers before calling iyzico", async () => {
    const iyz = fakeIyzico();
    const checkout = createCheckout({ catalog, iyzico: { ...IYZ, fetch: iyz.fetch }, orderSecret: SECRET, log: () => {} });
    expect((await start(checkout, { lines: [{ productId: "mug", variantId: "sand", qty: 1 }], buyer }, { Origin: "https://evil.test" })).status).toBe(403);
    const cart = await start(checkout, { lines: [{ productId: "kiln", qty: 1 }], buyer });
    expect([cart.status, ((await cart.json()) as { error: string }).error]).toEqual([422, "invalid-cart"]);
    const who = await start(checkout, { lines: [{ productId: "bowl", qty: 1 }], buyer: { ...buyer, email: "x" } });
    expect(await who.json()).toEqual({ error: "invalid-buyer", fields: ["email"] });
    expect(iyz.calls).toHaveLength(0);
  });

  it("sends a declined, mismatched or forged payment back to checkout without notifying", async () => {
    for (const fake of [fakeIyzico({ paymentStatus: "FAILURE" }), fakeIyzico({ price: "1.0" }), fakeIyzico({ basketId: () => "OTHER" })]) {
      const paid: PaidOrder[] = [];
      const checkout = createCheckout({ catalog, iyzico: { ...IYZ, fetch: fake.fetch }, orderSecret: SECRET, notify: (o) => void paid.push(o), log: () => {} });
      const res = await start(checkout, { lines: [{ productId: "bowl", qty: 1 }], buyer });
      const done = await callback(checkout, cookiePair(res));
      expect(done.headers.get("location")).toMatch(/^https:\/\/shop\.test\/checkout\?payment=failed&reason=(declined|mismatch)$/);
      expect(paid).toHaveLength(0);
    }
  });

  it("reports a paid order whose cookie is missing", async () => {
    const iyz = fakeIyzico();
    const orphans: unknown[] = [];
    const checkout = createCheckout({ catalog, iyzico: { ...IYZ, fetch: iyz.fetch }, orderSecret: SECRET, onOrphanPayment: (i) => void orphans.push(i), log: () => {} });
    await start(checkout, { lines: [{ productId: "bowl", qty: 1 }], buyer });
    const done = await callback(checkout, "");
    expect(done.headers.get("location")).toContain("/order/confirmation?order=");
    expect(orphans).toEqual([expect.objectContaining({ paymentId: "pay-9" })]);
  });

  it("needs a long order secret", () => {
    expect(() => createCheckout({ catalog, iyzico: IYZ, orderSecret: "short" })).toThrow(/ORDER_SECRET/);
  });
});

describe("notifiers", () => {
  const paidOrder = (): PaidOrder => {
    const r = priceCart(catalog, [{ productId: "mug", variantId: "sand", qty: 1 }]);
    if (!r.ok) throw new Error("expected ok");
    return { v: 1, id: "VB-261118-ABCDEFGH", createdAt: "2026-11-18T10:00:00Z", locale: "tr", quote: r.quote, buyer: { ...buyer, identityNumber: "10000000146" }, paidAt: "2026-11-18T10:05:00Z", provider: "iyzico", paymentId: "pay-9", installment: 3 };
  };

  it("orderText: the receipt hides the TCKN and payment id, the business copy shows them", () => {
    const o = paidOrder();
    const receipt = orderText(o);
    const business = orderText(o, { forBusiness: true });
    expect(receipt).toContain("Merhaba Deniz,");
    expect(receipt).toContain("1 × Stoneware mug · Sand");
    expect(receipt).toContain("3 taksit");
    expect(receipt).not.toContain("10000000146");
    expect(business).toContain("TCKN: 10000000146");
    expect(business).toContain("iyzico paymentId: pay-9");
  });

  it("resendNotifier emails the business and the buyer", async () => {
    const sent: Record<string, unknown>[] = [];
    const fetch = (async (_url: string, init: RequestInit) => {
      sent.push(JSON.parse(String(init.body)));
      return new Response("{}", { status: 200 });
    }) as typeof globalThis.fetch;
    await resendNotifier({ apiKey: "re_test", from: "Shop <orders@shop.test>", to: "owner@shop.test", siteName: "Shop", fetch })(paidOrder());
    expect(sent.map((m) => [m.to, m.subject])).toEqual([
      ["owner@shop.test", "Shop · Yeni sipariş VB-261118-ABCDEFGH"],
      ["deniz@example.com", "Shop · Siparişiniz alındı · VB-261118-ABCDEFGH"],
    ]);
    expect(sent[0]!.reply_to).toBe("deniz@example.com");
  });

  it("webhookNotifier signs the body; notifyAll runs every notifier", async () => {
    let headers: Record<string, string> = {};
    let body = "";
    const fetch = (async (_url: string, init: RequestInit) => {
      headers = init.headers as Record<string, string>;
      body = String(init.body);
      return new Response("", { status: 204 });
    }) as typeof globalThis.fetch;
    const { createHmac } = await import("node:crypto");
    let ran = false;
    await expect(notifyAll(() => Promise.reject(new Error("mail down")), webhookNotifier({ url: "https://hooks.test/orders", secret: "whsec", fetch }), () => void (ran = true))(paidOrder())).rejects.toThrow("mail down");
    expect(ran).toBe(true);
    expect(headers["X-Vamos-Signature"]).toBe(`sha256=${createHmac("sha256", "whsec").update(body).digest("hex")}`);
    expect(JSON.parse(body).event).toBe("order.paid");
  });
});

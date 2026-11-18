import { createCheckout, normalizeCouponCode, orderText, priceCart, toDecimal, type CartLine, type Catalog, type Coupon, type PaidOrder } from "./index";
import { iyzicoSignature } from "../payments/iyzico";

const NOW = new Date("2026-11-18T12:00:00Z");

const catalog: Catalog = {
  currency: "TRY",
  vatRate: 20,
  shipping: { flat: 79_90, freeOver: 1000_00, label: "Kargo" },
  coupons: [
    { code: "YAZ10", kind: "percent", value: 10 },
    { code: "Indirim50", kind: "amount", value: 50_00, minSubtotal: 300_00 },
    { code: "KARGO", kind: "free-shipping" },
    { code: "MUTFAK20", kind: "percent", value: 20, categories: ["Kitchen"], maxDiscount: 100_00 },
    { code: "REHBER", kind: "amount", value: 30_00, productIds: ["guide"] },
    { code: "KASIM", kind: "percent", value: 15, startsAt: "2026-11-01T00:00:00Z", endsAt: "2026-12-01T00:00:00Z" },
    { code: "HEPSI", kind: "percent", value: 100 },
    { code: "BOZUK", kind: "percent", value: 0 },
  ],
  products: [
    { id: "mug", name: "Stoneware mug", price: 349_90, category: "Kitchen" },
    { id: "bowl", name: "Bowl", price: 250_00, category: "Kitchen" },
    { id: "guide", name: "Glaze guide (PDF)", price: 120_00, itemType: "VIRTUAL", vatRate: 10 },
    { id: "pin", name: "Enamel pin", price: 1, vatRate: 20 },
  ],
};

const vatOf = (gross: number, rate: number) => (rate > 0 ? Math.round((gross * rate) / (100 + rate)) : 0);

function quote(lines: CartLine[], coupon?: string, now: Date | number = NOW) {
  const r = priceCart(catalog, lines, { coupon, now });
  if (!r.ok) throw new Error(`expected ok, got ${JSON.stringify(r.issues)}`);
  return r.quote;
}
const issue = (lines: CartLine[], coupon: string, now: Date | number = NOW) => {
  const r = priceCart(catalog, lines, { coupon, now });
  return r.ok ? null : r.issues;
};

describe("priceCart with a coupon", () => {
  it("takes a percent off, computes VAT on the discounted lines and keeps the shipping rule", () => {
    const q = quote([{ productId: "mug", qty: 2 }, { productId: "guide", qty: 1 }], "  yaz10 ");
    // 819.80 × 10% = 81.98, split 699.80 : 120.00
    expect(q.discount).toBe(81_98);
    expect(q.coupon).toEqual({ code: "YAZ10", kind: "percent" });
    expect(q.lines.map((l) => l.discount)).toEqual([69_98, 12_00]);
    expect(q.lines.map((l) => l.vat)).toEqual([vatOf(699_80 - 69_98, 20), vatOf(120_00 - 12_00, 10)]);
    expect(q.subtotal).toBe(819_80);
    expect(q.shipping).toBe(79_90);
    expect(q.total).toBe(819_80 - 81_98 + 79_90);
  });

  it("judges free shipping on the subtotal before the discount", () => {
    const q = quote([{ productId: "mug", qty: 3 }], "YAZ10"); // 1049.70, 944.73 after the code
    expect([q.subtotal, q.discount, q.shipping]).toEqual([1049_70, 104_97, 0]);
  });

  it("amount, free-shipping, restricted and capped codes", () => {
    const amount = quote([{ productId: "bowl", qty: 2 }], "INDIRIM50");
    expect([amount.discount, amount.total]).toEqual([50_00, 450_00 + 79_90]);

    const free = quote([{ productId: "bowl", qty: 1 }], "kargo");
    expect([free.discount, free.shipping, free.total, free.coupon?.kind]).toEqual([0, 0, 250_00, "free-shipping"]);
    expect(free.vatByRate).toEqual({ "20": vatOf(250_00, 20) });

    const kitchen = quote([{ productId: "mug", qty: 1 }, { productId: "guide", qty: 1 }], "MUTFAK20");
    expect(kitchen.lines.map((l) => l.discount)).toEqual([69_98, 0]);
    const capped = quote([{ productId: "mug", qty: 3 }, { productId: "bowl", qty: 3 }], "MUTFAK20");
    expect(capped.discount).toBe(100_00);

    const guide = quote([{ productId: "guide", qty: 1 }, { productId: "bowl", qty: 1 }], "REHBER");
    expect(guide.lines.map((l) => l.discount)).toEqual([30_00, 0]);
  });

  it("never prices a line below one minor unit", () => {
    const q = quote([{ productId: "pin", qty: 3 }, { productId: "bowl", qty: 1 }], "HEPSI");
    expect(q.lines.map((l) => l.total - l.discount)).toEqual([1, 1]);
    expect(q.discount).toBe(250_03 - 2);
  });

  it("names why a code does not apply", () => {
    const bowl = [{ productId: "bowl", qty: 1 }];
    expect(issue(bowl, "NOPE")).toEqual([{ index: -1, code: "coupon-invalid" }]);
    expect(issue(bowl, "BOZUK")).toEqual([{ index: -1, code: "coupon-invalid" }]);
    expect(issue(bowl, "INDIRIM50")).toEqual([{ index: -1, code: "coupon-min-subtotal" }]);
    expect(issue([{ productId: "guide", qty: 1 }], "MUTFAK20")).toEqual([{ index: -1, code: "coupon-not-applicable" }]);
    expect(issue([{ productId: "guide", qty: 1 }], "KARGO")).toEqual([{ index: -1, code: "coupon-not-applicable" }]);
    expect(issue(bowl, "KASIM", new Date("2026-12-01T00:00:00Z"))).toEqual([{ index: -1, code: "coupon-expired" }]);
    // Line problems come first; the code is judged only on a cart that prices.
    expect(issue([{ productId: "nope", qty: 1 }], "NOPE")).toEqual([{ index: 0, code: "unknown-product", productId: "nope" }]);
    // No code, or only spaces: no coupon at all.
    expect(quote(bowl, "   ").coupon).toBeUndefined();
  });

  it("honours the date window with an injected clock", () => {
    const bowl = [{ productId: "bowl", qty: 1 }];
    expect(issue(bowl, "KASIM", new Date("2026-10-31T23:59:59Z"))).toEqual([{ index: -1, code: "coupon-invalid" }]);
    expect(quote(bowl, "KASIM", new Date("2026-11-01T00:00:00Z")).discount).toBe(37_50);
    expect(quote(bowl, "KASIM", Date.parse("2026-11-30T23:59:59Z")).discount).toBe(37_50);
    expect(issue(bowl, "KASIM", new Date("2027-01-01T00:00:00Z"))).toEqual([{ index: -1, code: "coupon-expired" }]);
  });

  it("folds Turkish i forms and case", () => {
    expect(["indirim50", " İNDİRİM50", "ındırım50"].map(normalizeCouponCode)).toEqual(["INDIRIM50", "INDIRIM50", "INDIRIM50"]);
    expect(quote([{ productId: "bowl", qty: 2 }], "İndirim50").coupon?.code).toBe("Indirim50");
  });
});

/** Small seeded PRNG so a failure is reproducible. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

describe("discount allocation over random carts", () => {
  it("is exact, proportional, keeps every line ≥ 1 and VAT consistent", () => {
    const rand = rng(20261118);
    const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
    let split = 0;
    for (let run = 0; run < 400; run++) {
      const n = int(1, 12);
      const products = Array.from({ length: n }, (_, i) => ({
        id: `p${i}`,
        name: `Product ${i}`,
        price: rand() < 0.2 ? int(1, 9) : int(100, 5_000_000),
        vatRate: [0, 1, 10, 20][int(0, 3)],
        category: rand() < 0.5 ? "A" : "B",
        itemType: (rand() < 0.2 ? "VIRTUAL" : "PHYSICAL") as "VIRTUAL" | "PHYSICAL",
      }));
      const coupon: Coupon =
        rand() < 0.5
          ? { code: "R", kind: "percent", value: int(1, 100), ...(rand() < 0.3 ? { maxDiscount: int(0, 1_000_000) } : {}), ...(rand() < 0.3 ? { categories: ["A"] } : {}) }
          : { code: "R", kind: "amount", value: int(1, 50_000_000), ...(rand() < 0.3 ? { categories: ["B"] } : {}) };
      const cat: Catalog = { currency: "TRY", shipping: { flat: int(0, 20_000), freeOver: rand() < 0.5 ? int(1, 10_000_000) : undefined }, products, coupons: [coupon] };
      const lines = products.map((p) => ({ productId: p.id, qty: int(1, 20) }));
      const plain = priceCart(cat, lines);
      const r = priceCart(cat, lines, { coupon: "r", now: NOW });
      if (!plain.ok) throw new Error("plain cart should price");
      if (!r.ok) {
        expect(r.issues).toEqual([{ index: -1, code: "coupon-not-applicable" }]);
        continue;
      }
      const q = r.quote;
      const eligible = q.lines.filter((l) => !coupon.categories || coupon.categories.includes(l.category));
      const base = eligible.reduce((s, l) => s + l.total, 0);
      expect(q.lines.reduce((s, l) => s + l.discount, 0)).toBe(q.discount);
      expect(q.discount).toBeLessThanOrEqual(base - eligible.length);
      for (const l of q.lines) {
        expect(Number.isInteger(l.discount) && l.discount >= 0).toBe(true);
        expect(l.total - l.discount).toBeGreaterThanOrEqual(1);
        expect(l.vat).toBe(vatOf(l.total - l.discount, l.vatRate));
        if (!eligible.includes(l)) expect(l.discount).toBe(0);
        else expect(Math.abs(l.discount - (q.discount * l.total) / base)).toBeLessThanOrEqual(eligible.length);
      }
      const shippingVat = q.shipping > 0 ? vatOf(q.shipping, 20) : 0;
      expect(q.vat).toBe(q.lines.reduce((s, l) => s + l.vat, 0) + shippingVat);
      expect(Object.values(q.vatByRate).reduce((a, b) => a + b, 0)).toBe(q.vat);
      expect(q.total).toBe(q.subtotal - q.discount + q.shipping);
      expect(q.total).toBeGreaterThanOrEqual(q.shipping);
      expect(q.total).toBeLessThanOrEqual(plain.quote.total);
      expect(q.shipping).toBe(plain.quote.shipping);
      if (q.discount > 0 && eligible.length > 1) split++;
    }
    expect(split).toBeGreaterThan(250);
  });
});

const buyer = { name: "Deniz", surname: "Kaya", email: "deniz@example.com", phone: "0532 000 00 00", address: "Rıhtım Caddesi 14 Daire 3", city: "İstanbul", district: "Kadıköy" };
const SECRET = "test-order-secret-0123456789abcdefghij";
const IYZ = { apiKey: "sandbox-fixtureApiKey0000000000000000", secretKey: "sandbox-fixtureSecretKey000000000000" };

function fakeIyzico() {
  const calls: { path: string; body: Record<string, unknown> }[] = [];
  const fetch = async (url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    calls.push({ path: new URL(url).pathname, body });
    const conversationId = String(body.conversationId);
    return Response.json({ status: "success", token: "tok-1", conversationId, paymentPageUrl: "https://sandbox-cpp.iyzipay.com?token=tok-1", tokenExpireTime: 1800, signature: await iyzicoSignature(IYZ.secretKey, [conversationId, "tok-1"]) });
  };
  return { fetch, calls };
}

const start = (checkout: ReturnType<typeof createCheckout>, body: unknown) =>
  checkout.start(new Request("https://shop.test/api/checkout", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://shop.test" }, body: JSON.stringify(body) }));

const cents = (decimal: string) => Math.round(Number(decimal) * 100);

describe("checkout with a coupon", () => {
  it("sends discounted basket items that add up to the price, each above zero", async () => {
    const iyz = fakeIyzico();
    const checkout = createCheckout({ catalog, iyzico: { ...IYZ, fetch: iyz.fetch }, orderSecret: SECRET, now: () => NOW, log: () => {} });
    const res = await start(checkout, { lines: [{ productId: "mug", qty: 2 }, { productId: "guide", qty: 1 }, { productId: "pin", qty: 1 }], buyer, coupon: "yaz10" });
    expect(res.status).toBe(200);
    const init = iyz.calls[0]!.body;
    const items = init.basketItems as { price: string; name: string }[];
    expect(items.map((b) => b.name)).toEqual(["Stoneware mug", "Glaze guide (PDF)", "Enamel pin", "Kargo"]);
    expect(items.every((b) => cents(b.price) > 0)).toBe(true);
    expect(items.reduce((s, b) => s + cents(b.price), 0)).toBe(cents(String(init.price)));
    expect(init.price).toBe(init.paidPrice);
    const q = quote([{ productId: "mug", qty: 2 }, { productId: "guide", qty: 1 }, { productId: "pin", qty: 1 }], "YAZ10");
    expect(cents(String(init.price))).toBe(q.total);
    expect(toDecimal(q.total)).toMatch(/^\d+\.\d\d$/);
  });

  it("refuses a code that does not apply as an invalid cart, and uses its clock for the window", async () => {
    const iyz = fakeIyzico();
    const late = createCheckout({ catalog, iyzico: { ...IYZ, fetch: iyz.fetch }, orderSecret: SECRET, now: () => new Date("2026-12-02T00:00:00Z"), log: () => {} });
    const res = await start(late, { lines: [{ productId: "bowl", qty: 1 }], buyer, coupon: "KASIM" });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: "invalid-cart", issues: [{ index: -1, code: "coupon-expired" }] });
    expect(iyz.calls).toHaveLength(0);
    const ontime = createCheckout({ catalog, iyzico: { ...IYZ, fetch: iyz.fetch }, orderSecret: SECRET, now: () => NOW, log: () => {} });
    expect((await start(ontime, { lines: [{ productId: "bowl", qty: 1 }], buyer, coupon: "KASIM" })).status).toBe(200);
    expect(iyz.calls[0]!.body.price).toBe("292.4"); // 250 − 37.50 + 79.90
  });
});

describe("orderText with a coupon", () => {
  const paid = (coupon: string, lines: CartLine[]): PaidOrder => ({ v: 1, id: "VB-261118-ABCDEFGH", createdAt: "2026-11-18T10:00:00Z", locale: "tr", quote: quote(lines, coupon), buyer: { ...buyer }, paidAt: "2026-11-18T10:05:00Z", provider: "iyzico", paymentId: "pay-9" });

  it("shows the discount line with the code, or free shipping", () => {
    const text = orderText(paid("yaz10", [{ productId: "bowl", qty: 1 }]));
    expect(text).toMatch(/ {2}İndirim \(YAZ10\) — −₺25/);
    expect(text).toContain("Kargo — ₺79,90");
    const en = orderText(paid("kargo", [{ productId: "bowl", qty: 1 }]), { lang: "en" });
    expect(en).toContain("Shipping — free (KARGO)");
    expect(en).not.toContain("Discount");
  });
});

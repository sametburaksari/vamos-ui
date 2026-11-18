import { act, render, screen, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";
import type { Catalog } from "./pricing";

const catalog: Catalog = {
  currency: "TRY",
  shipping: { flat: 50_00, freeOver: 500_00 },
  coupons: [
    { code: "TEA10", kind: "percent", value: 10 },
    { code: "BIG", kind: "amount", value: 100_00, minSubtotal: 400_00 },
  ],
  products: [
    { id: "mug", name: "Mug", price: 200_00, maxQty: 3 },
    { id: "tea", name: "Tea", price: 90_00 },
  ],
};

let api: ReturnType<typeof useCart>;
function Probe() {
  api = useCart();
  return (
    <p>
      {api.ready ? "ready" : "loading"} · {api.count} items · {api.quote ? api.quote.total : "none"} · issues {api.issues.length}
      {api.coupon ? ` · code ${api.coupon} ${api.couponIssue ? api.couponIssue.code : `-${api.quote?.discount}`}` : ""}
    </p>
  );
}

beforeEach(() => window.localStorage.clear());

describe("CartProvider", () => {
  it("adds, caps quantities, prices and persists the cart", async () => {
    render(<CartProvider catalog={catalog}><Probe /></CartProvider>);
    await screen.findByText(/ready/);
    act(() => api.add("mug", { qty: 2 }));
    act(() => api.add("mug", { qty: 5 }));
    act(() => api.add("tea"));
    expect(screen.getByText("ready · 4 items · 69000 · issues 0")).toBeInTheDocument();
    act(() => api.setQty("mug", undefined, 1));
    expect(screen.getByText("ready · 2 items · 34000 · issues 0")).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem("vb-cart")!)).toEqual([{ productId: "mug", qty: 1 }, { productId: "tea", qty: 1 }]));
    act(() => api.setQty("tea", undefined, 0));
    expect(api.lines).toEqual([{ productId: "mug", qty: 1 }]);
  });

  it("restores a saved cart and reports lines the catalog no longer has", async () => {
    window.localStorage.setItem("vb-cart", JSON.stringify([{ productId: "gone", qty: 1 }, { productId: "tea", qty: 2 }, { junk: true }]));
    render(<CartProvider catalog={catalog}><Probe /></CartProvider>);
    expect(await screen.findByText("ready · 3 items · none · issues 1")).toBeInTheDocument();
    act(() => api.remove("gone"));
    expect(screen.getByText("ready · 2 items · 23000 · issues 0")).toBeInTheDocument();
  });

  it("checkout posts the lines and buyer and returns the provider's answer", async () => {
    const calls: { url: string; body: unknown }[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)) });
      return Response.json({ error: "invalid-buyer", fields: ["phone"] }, { status: 422 });
    }) as typeof fetch;
    try {
      render(<CartProvider catalog={catalog} redirect={false}><Probe /></CartProvider>);
      await screen.findByText(/ready/);
      act(() => api.add("tea"));
      const buyer = { name: "A", surname: "B", email: "a@b.test", phone: "1", address: "Street 1", city: "X" };
      await expect(api.checkout({ buyer, locale: "en" })).resolves.toEqual({ ok: false, error: "invalid-buyer", fields: ["phone"] });
      expect(calls).toEqual([{ url: "/api/checkout", body: { lines: [{ productId: "tea", qty: 1 }], buyer, locale: "en" } }]);
    } finally {
      globalThis.fetch = original;
    }
  });

  it("applies, reports, persists and removes a discount code", async () => {
    const { unmount } = render(<CartProvider catalog={catalog}><Probe /></CartProvider>);
    await screen.findByText(/ready/);
    act(() => api.add("mug", { qty: 1 }));
    let result: unknown;
    act(() => void (result = api.applyCoupon(" big ")));
    // Below the minimum: the issue is separate and the quote stays undiscounted.
    expect(result).toEqual({ index: -1, code: "coupon-min-subtotal" });
    expect(screen.getByText("ready · 1 items · 25000 · issues 0 · code big coupon-min-subtotal")).toBeInTheDocument();
    act(() => api.add("mug", { qty: 1 }));
    expect(screen.getByText("ready · 2 items · 35000 · issues 0 · code big -10000")).toBeInTheDocument();
    act(() => void (result = api.applyCoupon("tea10")));
    expect(result).toBeNull();
    expect(screen.getByText("ready · 2 items · 41000 · issues 0 · code tea10 -4000")).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem("vb-cart")!)).toEqual({ lines: [{ productId: "mug", qty: 2 }], coupon: "tea10" }));
    unmount();

    render(<CartProvider catalog={catalog}><Probe /></CartProvider>);
    expect(await screen.findByText("ready · 2 items · 41000 · issues 0 · code tea10 -4000")).toBeInTheDocument();
    act(() => api.removeCoupon());
    expect(screen.getByText("ready · 2 items · 45000 · issues 0")).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem("vb-cart")!)).toEqual([{ productId: "mug", qty: 2 }]));
    act(() => void api.applyCoupon("TEA10"));
    act(() => api.clear());
    expect(api.coupon).toBeNull();
  });

  it("checkout sends the code", async () => {
    window.localStorage.setItem("vb-cart", JSON.stringify({ lines: [{ productId: "tea", qty: 1 }], coupon: "TEA10" }));
    const bodies: unknown[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      bodies.push(JSON.parse(String(init.body)));
      return Response.json({ order: "VB-1", paymentPageUrl: "https://pay.test/x" });
    }) as typeof fetch;
    try {
      render(<CartProvider catalog={catalog} redirect={false}><Probe /></CartProvider>);
      await screen.findByText(/code TEA10/);
      const buyer = { name: "A", surname: "B", email: "a@b.test", phone: "1", address: "Street 1", city: "X" };
      await expect(api.checkout({ buyer })).resolves.toEqual({ ok: true, order: "VB-1", paymentPageUrl: "https://pay.test/x" });
      expect(bodies).toEqual([{ lines: [{ productId: "tea", qty: 1 }], buyer, coupon: "TEA10" }]);
    } finally {
      globalThis.fetch = original;
    }
  });
});

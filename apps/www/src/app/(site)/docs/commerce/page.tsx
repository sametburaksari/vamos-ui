import { A, C, Callout, Code, DocPage, H2, P, Step, Steps, Table, UL } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Online store checkout",
  description: "A working store without a store platform: one catalog for cart and server, iyzico Checkout Form, a signed order instead of a database, and order emails.",
  path: "/docs/commerce/",
});

export default function CommercePage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="Online store checkout"
      description="@vamos-ui/react/commerce turns the store blocks into a shop that takes money: the cart and the server price from the same catalog, iyzico takes the card on its own page, and every paid order is emailed to the business and the buyer. No database and no monthly store platform."
      toc={[
        { id: "flow", title: "How an order flows" },
        { id: "setup", title: "Set it up" },
        { id: "catalog", title: "The catalog" },
        { id: "coupons", title: "Discount codes", sub: true },
        { id: "cart", title: "Cart and checkout form" },
        { id: "server", title: "The endpoints", sub: true },
        { id: "orders", title: "Where orders go" },
        { id: "limits", title: "What it does not do yet" },
      ]}
      prev={{ href: "/docs/payments", title: "Payments (iyzico, PayTR)" }}
      next={{ href: "/docs/deploying", title: "Deploying a site" }}
    >
      <H2 id="flow">How an order flows</H2>
      <Steps>
        <Step title="Cart">
          <C>CartProvider</C> keeps product ids and quantities in localStorage and shows prices from <C>store/catalog.ts</C>.
        </Step>
        <Step title="Pay">
          The checkout form calls <C>useCart().checkout({"{ buyer }"})</C>. <C>POST /api/checkout</C> prices the cart again from
          the catalog (a price sent by the browser is never read), starts an iyzico Checkout Form and keeps the order in a
          signed, HttpOnly cookie. The buyer goes to iyzico&apos;s page and enters the card there.
        </Step>
        <Step title="Callback">
          iyzico posts a token to <C>/api/checkout/callback</C>. The server asks iyzico for the result, checks its signature,
          and accepts it only when the order number and the amount match the signed order.
        </Step>
        <Step title="Done">
          The business gets the order by email (and, optionally, a signed webhook), the buyer gets a receipt, and the buyer
          lands on <C>/order/confirmation?order=…</C>. A failed payment returns to <C>/checkout?payment=failed</C>.
        </Step>
      </Steps>

      <H2 id="setup">Set it up</H2>
      <Code
        code={`npx vamos-ui add site-store-01        # or cart-01, checkout-01, product-01
npx vamos-ui site store                # catalog, checkout endpoints, order emails
npx vamos-ui site essentials           # distance-sales contract, pre-information, returns pages`}
      />
      <P>
        <C>site store</C> picks the runtime: route handlers for a Next.js server (Vercel, a VPS), edge functions for a static
        export on Cloudflare Pages or Spacefast. A static site on shared hosting has no server to keep the payment keys, so
        the command refuses it and names the options. It never replaces a file you already have.
      </P>
      <Table
        head={["Variable", "What"]}
        rows={[
          [<C key="a">IYZICO_API_KEY</C>, "iyzico API key (sandbox-… while testing)"],
          [<C key="b">IYZICO_SECRET_KEY</C>, "iyzico secret key"],
          [<C key="c">IYZICO_MODE</C>, <>sandbox (default) or live</>],
          [<C key="d">ORDER_SECRET</C>, <>32+ random characters (<C>openssl rand -hex 32</C>); signs the order cookie</>],
          [<C key="e">RESEND_API_KEY</C>, "sends the order emails"],
          [<C key="f">ORDER_FROM / ORDER_TO</C>, "sender on your domain; where orders go (comma-separated)"],
          [<C key="g">ORDER_WEBHOOK_URL</C>, "optional: each paid order as JSON, signed with ORDER_WEBHOOK_SECRET"],
          [<C key="h">SITE_URL</C>, "optional: the public origin, when it differs from the request's"],
        ]}
      />

      <H2 id="catalog">The catalog</H2>
      <P>
        Prices include VAT and are integer minor units (<C>349_90</C> is ₺349.90), so totals never pick up floating-point
        cents. The VAT share of each line is worked out for the receipt.
      </P>
      <Code
        code={`import type { Catalog } from "@vamos-ui/react/commerce";

export const catalog: Catalog = {
  currency: "TRY",
  vatRate: 20,
  shipping: { flat: 89_90, freeOver: 1500_00, label: "Kargo" },
  products: [
    { id: "tide-plate", name: "Tide plate", price: 649_00, category: "Tableware",
      variants: [{ id: "sea-salt", name: "Sea salt" }, { id: "iron", name: "Iron", price: 699_00 }, { id: "moss", name: "Moss", available: false }] },
    { id: "glaze-guide", name: "Glaze guide (PDF)", price: 120_00, itemType: "VIRTUAL" },
  ],
  coupons: [
    { code: "KASIM15", kind: "percent", value: 15, maxDiscount: 300_00,
      startsAt: "2026-11-01T00:00:00+03:00", endsAt: "2026-12-01T00:00:00+03:00" },
    { code: "SOFRA100", kind: "amount", value: 100_00, minSubtotal: 750_00, categories: ["Tableware"] },
    { code: "KARGOBEDAVA", kind: "free-shipping" },
  ],
};`}
      />
      <P>
        <C>priceCart(catalog, lines)</C> refuses unknown products and variants, sold-out items, duplicate lines and quantities
        outside 1–<C>maxQty</C> (default 20). Digital-only carts pay no shipping and need no delivery address.
      </P>

      <H2 id="coupons">Discount codes</H2>
      <P>
        A code is <C>percent</C> (with an optional <C>maxDiscount</C>), a fixed <C>amount</C> in minor units, or{" "}
        <C>free-shipping</C>. It can need a <C>minSubtotal</C>, work only between <C>startsAt</C> and <C>endsAt</C>, and
        apply only to some <C>productIds</C> or <C>categories</C>. Codes match trimmed and case-insensitively (Turkish{" "}
        <C>i</C>/<C>İ</C>/<C>ı</C> included). <C>priceCart(catalog, lines, {"{ coupon }"})</C> spreads the discount over the
        lines it applies to in proportion to their totals, exactly to the minor unit and never below 1 minor unit a line, so
        the VAT on the receipt and the iyzico basket are worked out on the discounted amounts.
      </P>
      <UL>
        <li><C>quote.total</C> is subtotal − discount + shipping. Free shipping over <C>freeOver</C> is judged on the subtotal before the discount, so a code never makes a cart more expensive.</li>
        <li>A code that does not apply fails the price with <C>coupon-invalid</C> (unknown, malformed or not started), <C>coupon-expired</C>, <C>coupon-min-subtotal</C> or <C>coupon-not-applicable</C>; checkout refuses it as <C>invalid-cart</C>.</li>
        <li>In the browser: <C>cart.applyCoupon(code)</C> returns the issue or null, <C>cart.couponIssue</C> keeps it while <C>cart.quote</C> stays the undiscounted price, and <C>cart.removeCoupon()</C> drops it. The code is saved with the cart and sent by <C>checkout()</C>.</li>
      </UL>
      <Callout tone="warning" title="Codes are public">
        The catalog ships to the browser, so anyone can read its codes: use them for codes you would print on a flyer.
        Per-customer, single-use or secret codes need a server-side store and are out of scope; the server re-checks every
        code, window and condition on each checkout, so a code cannot be stretched past its rules. The PHP runtime for
        shared hosting does not support discount codes yet.
      </Callout>

      <H2 id="cart">Cart and checkout form</H2>
      <Code
        code={`"use client";
import { CartProvider, useCart } from "@vamos-ui/react/commerce/cart";
import { formatMoney } from "@vamos-ui/react/commerce";
import { catalog } from "@/store/catalog";

export function Shop({ children }: { children: React.ReactNode }) {
  return <CartProvider catalog={catalog}>{children}</CartProvider>;
}

function PayButton({ buyer }: { buyer: OrderBuyer }) {
  const cart = useCart();
  const [error, setError] = React.useState<string | null>(null);
  return (
    <>
      <Button disabled={!cart.quote} onClick={async () => {
        const res = await cart.checkout({ buyer, locale: "tr" });   // redirects on success
        if (!res.ok) setError(res.error);                           // invalid-buyer lists res.fields
      }}>
        Pay {cart.quote ? formatMoney(cart.quote.total, cart.quote.currency) : ""}
      </Button>
      {error ? <p role="alert">{error}</p> : null}
    </>
  );
}`}
      />
      <P>
        The cart survives reloads and syncs across tabs. Lines the catalog no longer accepts show up in <C>cart.issues</C>
        instead of silently disappearing; <C>cart.quote</C> is null until they are removed.
      </P>

      <H2 id="server">The endpoints</H2>
      <P>
        The written files are thin; the logic is <C>createCheckout</C>, a pair of Web-standard <C>Request → Response</C>{" "}
        handlers you can also mount yourself:
      </P>
      <Code
        code={`import { createCheckout, notifyAll, resendNotifier, webhookNotifier } from "@vamos-ui/react/commerce";

const checkout = createCheckout({
  catalog,
  iyzico: { apiKey, secretKey, mode: "sandbox" },
  orderSecret,                                  // ORDER_SECRET
  notify: notifyAll(
    resendNotifier({ apiKey: resendKey, from: "Shop <orders@shop.example>", to: "owner@shop.example" }),
    webhookNotifier({ url: "https://panel.example/hooks/orders", secret: hookSecret }),
  ),
});

export const POST = checkout.start;            // app/api/checkout/route.ts
// app/api/checkout/callback/route.ts: export const POST = checkout.callback;`}
      />
      <UL>
        <li>Only the page&apos;s own origin may call <C>start</C> (add others with <C>allowedOrigins</C>).</li>
        <li>The order cookie is HttpOnly, Secure, <C>SameSite=None</C> (iyzico&apos;s callback is a cross-site POST) and expires after an hour.</li>
        <li><C>notify</C> runs once per order: a refreshed callback lands on the confirmation page without sending the emails again.</li>
        <li>If a payment succeeds but the cookie is gone (blocked cookies, another device), <C>onOrphanPayment</C> receives the iyzico payment id so nothing is lost silently.</li>
      </UL>

      <H2 id="orders">Where orders go</H2>
      <P>
        There is no order database: the business&apos;s email is the record, and the buyer gets a receipt with the same summary
        (the receipt leaves out the TCKN and the payment id). To keep orders in a panel, a sheet or an ERP, set{" "}
        <C>ORDER_WEBHOOK_URL</C>: each paid order is posted as <C>{`{ "event": "order.paid", "order": … }`}</C> with an{" "}
        <C>X-Vamos-Signature: sha256=…</C> header (HMAC of the body with <C>ORDER_WEBHOOK_SECRET</C>).
      </P>

      <H2 id="limits">What it does not do yet</H2>
      <Callout tone="warning" title="Phase one">
        Stock counts, per-customer or single-use codes, shipping carriers and labels, refunds, PayTR and e-Arşiv invoices are not part of the
        checkout yet; handle them in the iyzico panel and your accounting tool. A store on shared hosting (PHP) is not
        supported. Test with iyzico&apos;s sandbox and test cards before switching <C>IYZICO_MODE</C> to live.
      </Callout>
      <P>
        Card handling stays with iyzico (<A href="/docs/payments">Payments</A>); the legal pages a Turkish store needs come
        from <C>site essentials</C> (<A href="/docs/kvkk">KVKK</A>).
      </P>
    </DocPage>
  );
}

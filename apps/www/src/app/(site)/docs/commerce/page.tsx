import { A, C, Callout, Code, DocPage, H2, P, Step, Steps, Table, UL } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Online store checkout",
  description: "A working store without a store platform: one catalog for cart and server, iyzico Checkout Form or PayTR iFrame, a signed order or a small order store instead of a database, and order emails.",
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
        { id: "blocks", title: "Return pages for the store blocks", sub: true },
        { id: "paytr", title: "PayTR instead of iyzico" },
        { id: "order-store", title: "Order storage", sub: true },
        { id: "php", title: "Shared hosting (PHP)", sub: true },
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
        export on Cloudflare Pages or Spacefast, and PHP endpoints for a static export on shared hosting (cPanel;{" "}
        <C>--runtime php</C> anywhere else with Apache and PHP, see <A href="#php">Shared hosting</A>). It never replaces a
        file you already have.
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

      <H2 id="blocks">Return pages for the store blocks</H2>
      <P>
        After payment the buyer comes back with <C>?order=…</C> (paid) or <C>?payment=failed</C>. The defaults fit the
        Commerce blocks: <C>order-confirmation-01</C> at <C>/order/confirmation</C> empties the cart and shows the order,{" "}
        <C>checkout-01</C> at <C>/checkout</C> explains a failed payment. <C>site-store-01</C> is one page with its own{" "}
        <C>?page=</C> switch and no confirmation route: its checkout page handles both returns itself, so point both paths at
        it.
      </P>
      <Code
        code={`// site-store-01 mounted at "/" (use "/shop?page=checkout" if it lives at /shop)
createCheckout({ catalog, iyzico, orderSecret, successPath: "/?page=checkout", failurePath: "/?page=checkout" });

// PayTR: the same with okPath / failPath
createPaytrCheckout({ catalog, paytr, store, okPath: "/?page=checkout", failPath: "/?page=checkout" });`}
      />
      <P>
        The query keeps the page: the buyer lands on <C>/?page=checkout&amp;order=…</C>, sees the thank-you state and the cart is
        cleared; <C>/?page=checkout&amp;payment=failed</C> keeps the cart and shows why. Each block takes <C>demo</C> for the docs
        gallery (its own cart, no request); leave it off in your app.
      </P>

      <H2 id="paytr">PayTR instead of iyzico</H2>
      <Code
        code={`npx vamos-ui site store --provider paytr   # default: iyzico`}
      />
      <P>
        The cart, the catalog and the <C>start</C> request are the same. What differs is how the result comes back. iyzico
        sends the buyer&apos;s browser back with a token, so the signed order can ride along in a cookie. PayTR tells the
        result only to your notification URL (Bildirim URL), from its own servers: <C>merchant_oid</C>, <C>status</C>,{" "}
        <C>total_amount</C> in kuruş and a <C>hash</C>. There is no cookie on that request, and the browser&apos;s return to{" "}
        <C>merchant_ok_url</C> proves nothing about the payment. So the order snapshot has to wait on the server until the
        notification arrives.
      </P>
      <Steps>
        <Step title="Start">
          <C>POST /api/checkout</C> prices the cart, stores the order under an alphanumeric order number for two hours, asks
          PayTR for an iframe token and answers <C>{"{ order, iframeUrl, token, paymentPageUrl }"}</C>. The cart opens PayTR&apos;s
          page (<C>paymentPageUrl</C> is the iframe URL); to embed it, pass <C>redirect={"{false}"}</C> to{" "}
          <C>CartProvider</C> and show the URL in an iframe with <C>PAYTR_IFRAME_RESIZER</C>.
        </Step>
        <Step title="Notification">
          PayTR posts to <C>/api/checkout/paytr-notify</C>. The hash is checked, the order is loaded, the charged amount must
          be at least the order total (installment interest can raise it), and <C>notify</C> runs once. The answer is the
          plain text <C>OK</C>.
        </Step>
        <Step title="Buyer returns">
          The ok URL lands on <C>/order/confirmation?order=…</C>, the fail URL on <C>/checkout?payment=failed</C>. Word the
          confirmation page as &quot;we are confirming your payment; the receipt comes by email&quot;: the email is the proof.
        </Step>
      </Steps>
      <Table
        head={["Variable", "What"]}
        rows={[
          [<C key="a">PAYTR_MERCHANT_ID</C>, "merchant number from the PayTR panel"],
          [<C key="b">PAYTR_MERCHANT_KEY / PAYTR_MERCHANT_SALT</C>, "merchant key and salt (secrets)"],
          [<C key="c">PAYTR_TEST_MODE</C>, <>1 (default, test transactions) or 0 (live)</>],
          [<C key="d">ORDERS</C>, "edge on Cloudflare Pages: a KV namespace binding (npx wrangler kv namespace create ORDERS)"],
          [<C key="e">UPSTASH_REDIS_REST_URL / _TOKEN</C>, <>Next.js server or Spacefast: Upstash Redis; on Vercel the Marketplace Redis sets <C>KV_REST_API_URL</C> / <C>_TOKEN</C>, read as well</>],
        ]}
      />
      <UL>
        <li>PayTR retries until it reads <C>OK</C>, so every answer is <C>OK</C> except a bad hash (400: not from PayTR) and an unreachable store (503, so the retry can still succeed).</li>
        <li>A repeated notification, a failed payment, an amount below the order total and an unknown order number are logged and answered <C>OK</C>; an unknown paid order also reaches <C>onOrphanPayment</C>, once.</li>
        <li><C>ORDER_SECRET</C> is not needed: nothing is signed into a cookie.</li>
      </UL>

      <H2 id="order-store">Order storage</H2>
      <P>
        <C>createPaytrCheckout</C> takes any <C>OrderStore</C>: <C>put(id, snapshot, ttlSeconds)</C>, <C>get(id)</C>,{" "}
        <C>markPaid(id)</C> and <C>delete(id)</C>. <C>markPaid</C> answers true only the first time for an order, and the
        order emails go out only then; its marker is kept for 30 days, longer than the snapshot.
      </P>
      <Code
        code={`import { createPaytrCheckout, cloudflareKvOrderStore, upstashOrderStore, memoryOrderStore } from "@vamos-ui/react/commerce";

const checkout = createPaytrCheckout({
  catalog,
  paytr: { merchantId, merchantKey, merchantSalt, testMode: true },
  store: upstashOrderStore({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! }),
  // store: cloudflareKvOrderStore(env.ORDERS)   Cloudflare Pages Functions
  // store: memoryOrderStore()                   tests only: one process, lost on restart
  notify,
});

export const POST = checkout.start;            // app/api/checkout/route.ts
// app/api/checkout/paytr-notify/route.ts: export const POST = checkout.notify;`}
      />
      <Table
        head={["Store", "markPaid", "Notes"]}
        rows={[
          [<C key="u">upstashOrderStore</C>, "atomic (SET NX)", "REST over fetch, any runtime; also Vercel Marketplace Redis"],
          [<C key="k">cloudflareKvOrderStore</C>, "best effort", "KV is eventually consistent (up to ~60 s between locations) and has no set-if-absent"],
          [<C key="m">memoryOrderStore</C>, "atomic", "a single process: tests and local experiments"],
        ]}
      />
      <Callout tone="info" title="Workers KV and duplicates">
        Two notifications for the same order at the same moment in two Cloudflare locations could both pass{" "}
        <C>markPaid</C> on KV. PayTR spaces its retries minutes apart, so this is unlikely; use Upstash when a duplicate
        order email is not acceptable.
      </Callout>

      <H2 id="php">Shared hosting (PHP)</H2>
      <P>
        On cPanel the static export is uploaded to <C>public_html</C> and the checkout runs as two PHP files next to it. They
        follow the same rules as <C>createCheckout</C> (the same prices, VAT shares, cart issues, buyer checks, signed cookie
        and iyzico signature checks), and the package&apos;s tests run them with a real PHP against the TypeScript core.
      </P>
      <Code
        code={`npx vamos-ui site store --runtime php    # automatic with --host cpanel
# public/api/checkout.php            POST /api/checkout
# public/api/checkout-callback.php   POST /api/checkout/callback (routed by public/api/.htaccess)
# public/api/_store/store.php        the logic; the folder is denied to the web
# public/api/_store/catalog.json     the products: store/catalog.ts imports this same file
# store/php-config.example.php       the settings, to copy outside the web root`}
      />
      <Steps>
        <Step title="Products">
          Edit <C>public/api/_store/catalog.json</C> (prices in minor units, VAT included). The cart reads it at build time
          and the PHP at payment time, so there is no copy to forget. Rebuild and upload after a price change.
        </Step>
        <Step title="Settings">
          In cPanel&apos;s File Manager, copy <C>store/php-config.example.php</C> to your home directory as{" "}
          <C>vamos-store-config.php</C> (next to <C>public_html</C>, never inside it), fill in the same variables as above and
          set its permissions to 600. Another location: put its full path in <C>VAMOS_STORE_CONFIG</C>. Empty values fall
          back to <C>getenv</C>.
        </Step>
        <Step title="PHP">
          MultiPHP Manager: PHP 8.1 or newer with <C>curl</C> and <C>mbstring</C> (<C>intl</C> for nicer amounts in the
          emails). The site must be served over HTTPS: the order cookie is <C>Secure</C>.
        </Step>
        <Step title="Emails">
          Orders go out through the host&apos;s <C>mail()</C>, like the contact form sender: <C>ORDER_FROM</C> must be a real
          mailbox on the site&apos;s domain so SPF and DKIM pass. <C>RESEND_API_KEY</C> is not used. The optional webhook is
          signed exactly like <C>webhookNotifier</C>.
        </Step>
        <Step title="Try it">
          Locally: <C>next build</C>, then <C>php -S localhost:8080 -t out store/php-dev-router.php</C> with{" "}
          <C>VAMOS_STORE_CONFIG</C> set. iyzico must reach the callback URL, so test a full payment on the host with sandbox
          keys and iyzico&apos;s test cards.
        </Step>
      </Steps>
      <P>
        A marker file per paid order (in <C>STATE_DIR</C>, default the system temp folder) makes the emails go out once even
        when the same callback is posted twice with the same cookie.
      </P>

      <H2 id="orders">Where orders go</H2>
      <P>
        There is no order database: the business&apos;s email is the record, and the buyer gets a receipt with the same summary
        (the receipt leaves out the TCKN and the payment id). To keep orders in a panel, a sheet or an ERP, set{" "}
        <C>ORDER_WEBHOOK_URL</C>: each paid order is posted as <C>{`{ "event": "order.paid", "order": … }`}</C> with an{" "}
        <C>X-Vamos-Signature: sha256=…</C> header (HMAC of the body with <C>ORDER_WEBHOOK_SECRET</C>).
      </P>

      <H2 id="limits">What it does not do yet</H2>
      <Callout tone="warning" title="Not yet">
        Stock counts, per-customer or single-use codes, shipping carriers and labels, refunds and e-Arşiv invoices are not part of the
        checkout yet; handle them in the iyzico or PayTR panel and your accounting tool. The PHP runtime supports iyzico only and
        refuses a request that carries a discount code (<C>invalid-cart</C>, <C>coupon-unsupported</C>) instead of charging the
        full price; it needs Apache (<C>.htaccess</C>) with PHP 8.1+. Test with iyzico&apos;s sandbox and test cards before switching{" "}
        <C>IYZICO_MODE</C> to live.
      </Callout>
      <P>
        Card handling stays with iyzico or PayTR (<A href="/docs/payments">Payments</A>); the legal pages a Turkish store needs come
        from <C>site essentials</C> (<A href="/docs/kvkk">KVKK</A>).
      </P>
    </DocPage>
  );
}

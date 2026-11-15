import { C, Callout, Code, DocPage, H2, H3, P, Table, UL } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Payments (iyzico, PayTR)",
  description: "Server-side helpers for iyzico Checkout Form and the PayTR iFrame API: session and token creation, result and notification signature checks, sandbox / test mode by default.",
  path: "/docs/payments/",
});

export default function PaymentsPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="Payments (iyzico, PayTR)"
      description="@vamos-ui/react/payments talks to iyzico's hosted Checkout Form and PayTR's iFrame API from your server: it signs requests, checks response and notification signatures, and never handles card data. Sandbox / test mode unless you switch it off."
      toc={[
        { id: "rules", title: "Ground rules" },
        { id: "iyzico", title: "iyzico Checkout Form" },
        { id: "iyzico-webhook", title: "iyzico notifications", sub: true },
        { id: "paytr", title: "PayTR iFrame API" },
        { id: "reference", title: "Reference" },
      ]}
      prev={{ href: "/docs/kvkk", title: "KVKK consent records" }}
      next={{ href: "/docs/cli", title: "CLI & registry" }}
    >
      <H2 id="rules">Ground rules</H2>
      <UL>
        <li>Server only: route handlers, server actions, a Node or edge function. Web Crypto and <C>fetch</C>, no SDK dependency.</li>
        <li>Keys come only from the config you pass — read them from environment variables. They are never logged and never appear in error messages.</li>
        <li>iyzico defaults to <C>mode: &quot;sandbox&quot;</C> (sandbox-api.iyzipay.com); PayTR defaults to <C>testMode: true</C> (<C>test_mode=1</C>). Real payments need an explicit <C>mode: &quot;live&quot;</C> / <C>testMode: false</C>.</li>
        <li>Card details are entered on the provider&apos;s hosted page or iframe, never in your form.</li>
        <li>A redirect back to your site is not proof of payment. Only a verified result (<C>paid: true</C>) is.</li>
      </UL>

      <H2 id="iyzico">iyzico Checkout Form</H2>
      <P>
        <C>initializeCheckoutForm</C> starts a session and returns <C>paymentPageUrl</C> (redirect) and{" "}
        <C>checkoutFormContent</C> (inline form). The basket total must equal the sum of the items; prices are decimal
        strings. After payment iyzico posts a <C>token</C> to your <C>callbackUrl</C>; <C>retrieveCheckoutForm(token)</C> asks
        iyzico for the result and checks its signature.
      </P>
      <Code code={`// lib/iyzico.ts
import { createIyzicoClient } from "@vamos-ui/react/payments";

export const iyzico = createIyzicoClient({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  mode: process.env.IYZICO_MODE === "live" ? "live" : "sandbox",
});

// app/odeme/actions.ts
"use server";
export async function startCheckout(orderId: string) {
  const order = await orders.get(orderId);
  const { paymentPageUrl } = await iyzico.initializeCheckoutForm({
    price: order.total,                       // "349.90" = sum of basketItems[].price
    basketId: order.id,
    conversationId: order.id,
    callbackUrl: "https://ornek.com.tr/odeme/sonuc",
    buyer: { id: order.customerId, name: "Deniz", surname: "Kaya", identityNumber: "10000000146", email: "deniz@ornek.com.tr",
             gsmNumber: "+902160000000", registrationAddress: "Rasimpaşa Mah. Rıhtım Cad. No: 14", city: "İstanbul", country: "Turkey" },
    billingAddress: { contactName: "Deniz Kaya", city: "İstanbul", country: "Turkey", address: "Rasimpaşa Mah. Rıhtım Cad. No: 14" },
    basketItems: [{ id: "W1", name: "Seramik atölyesi", category1: "Atölye", itemType: "VIRTUAL", price: "349.90" }],
  });
  redirect(paymentPageUrl!);
}

// app/odeme/sonuc/route.ts — iyzico posts the token here
export async function POST(req: Request) {
  const token = (await req.formData()).get("token");
  const result = await iyzico.retrieveCheckoutForm(token);
  if (result.paid) await orders.markPaid(result.basketId!, { paymentId: result.paymentId, amount: result.paidPrice });
  return Response.redirect(new URL(result.paid ? "/odeme/tamam" : "/odeme/hata", req.url), 303);
}`} />
      <Table
        head={["Result field", "Meaning"]}
        rows={[
          [<C key="1">paid</C>, "status success, signature verified and paymentStatus SUCCESS — the only field to act on."],
          [<C key="2">verified</C>, "The response signature (paymentStatus, paymentId, currency, basketId, conversationId, paidPrice, price, token) matched."],
          [<C key="3">paidPrice / price</C>, "As iyzico returned them; compare with your order before fulfilling it."],
          [<C key="4">errorCode / errorMessage</C>, "iyzico's own error, for failures."],
          [<C key="5">raw</C>, "The full response (keep it out of client responses)."],
        ]}
      />

      <H3 id="iyzico-webhook">iyzico notifications</H3>
      <P>
        If merchant notifications are enabled for your account, iyzico posts JSON to your notification URL with an{" "}
        <C>X-IYZ-SIGNATURE-V3</C> header. <C>verifyIyzicoWebhook</C> supports the direct and the HPP (checkout form)
        formats; answer with a 2xx once handled.
      </P>
      <Code code={`import { verifyIyzicoWebhook } from "@vamos-ui/react/payments";

export async function POST(req: Request) {
  const body = await req.json();
  if (!(await verifyIyzicoWebhook(process.env.IYZICO_SECRET_KEY!, req.headers.get("x-iyz-signature-v3"), body))) {
    return new Response("bad signature", { status: 400 });
  }
  // body.status, body.paymentConversationId … — re-check with retrieveCheckoutForm(body.token) before fulfilling
  return new Response(null, { status: 204 });
}`} />

      <H2 id="paytr">PayTR iFrame API</H2>
      <P>
        Step 1: <C>createPaytrIframeToken</C> computes <C>paytr_token</C>, asks PayTR for an iframe token and returns the
        iframe URL. Amounts are decimal strings, sent as kuruş. Step 2: PayTR posts the result to the notification URL set in
        the merchant panel; <C>verifyPaytrCallback</C> checks its hash, and the route answers with the plain text{" "}
        <C>OK</C> — also for repeated notifications of an order already handled.
      </P>
      <Code code={`import { createPaytrIframeToken, verifyPaytrCallback, PAYTR_CALLBACK_OK, PAYTR_IFRAME_RESIZER } from "@vamos-ui/react/payments";

const paytr = {
  merchantId: process.env.PAYTR_MERCHANT_ID!,
  merchantKey: process.env.PAYTR_MERCHANT_KEY!,
  merchantSalt: process.env.PAYTR_MERCHANT_SALT!,
  testMode: process.env.PAYTR_TEST_MODE !== "0",
};

// Step 1 (server component or action)
const { iframeUrl } = await createPaytrIframeToken(paytr, {
  merchantOid: "YA20261115001",           // letters and digits, unique per order
  email: "deniz@ornek.com.tr",
  amount: "349.90",
  userIp,                                  // the customer's public IP
  basket: [{ name: "Seramik atölyesi", price: "349.90", quantity: 1 }],
  userName: "Deniz Kaya", userAddress: "Rasimpaşa Mah. Rıhtım Cad. No: 14, Kadıköy/İstanbul", userPhone: "+902160000000",
  okUrl: "https://ornek.com.tr/odeme/tamam", failUrl: "https://ornek.com.tr/odeme/hata",
});
// <iframe src={iframeUrl} id="paytriframe" className="w-full" /> + <Script src={PAYTR_IFRAME_RESIZER} />

// Step 2: app/api/paytr/bildirim/route.ts
export async function POST(req: Request) {
  const result = await verifyPaytrCallback(paytr, await req.formData());
  if (!result.verified) return new Response("bad hash", { status: 400 });
  if (result.paid) await orders.markPaidOnce(result.merchantOid, result.totalAmount); // idempotent
  return new Response(PAYTR_CALLBACK_OK, { headers: { "Content-Type": "text/plain" } });
}`} />
      <Callout tone="warning" title="The notification URL">
        PayTR&apos;s notification URL must be reachable without a login and must answer with nothing but <C>OK</C>. Customers
        never visit it; session data is not available there — find the order by <C>merchantOid</C>.
      </Callout>

      <H2 id="reference">Reference</H2>
      <Table
        head={["Export", "Does"]}
        rows={[
          [<C key="1">createIyzicoClient(config)</C>, "{ mode, initializeCheckoutForm(req), retrieveCheckoutForm(token, opts?) }. config: apiKey, secretKey, mode?, baseUrl?, fetch?."],
          [<C key="2">verifyIyzicoWebhook(secretKey, signature, body)</C>, "X-IYZ-SIGNATURE-V3 check (direct and HPP formats)."],
          [<C key="3">iyzicoSignature · iyzicoAuthorization · iyzicoTrimPrice · iyzicoCheckoutBody</C>, "The building blocks: response signature, IYZWSv2 header, trailing-zero rule, validated request body."],
          [<C key="4">createPaytrIframeToken(config, req)</C>, "Step 1: { token, iframeUrl }. config: merchantId, merchantKey, merchantSalt, testMode? (default true), fetch?."],
          [<C key="5">paytrTokenFields(config, req)</C>, "The form fields of the token request, paytr_token included, without sending them."],
          [<C key="6">verifyPaytrCallback(config, form)</C>, "Step 2: { verified, paid, merchantOid, status, totalAmount, paymentAmount, testMode, failedReasonCode? … }."],
        ]}
      />
      <P>
        Tests cover iyzico&apos;s published response-signature sample and its trailing-zero table; the other signatures are
        checked against an independent node:crypto implementation of the documented formulas.
      </P>
    </DocPage>
  );
}

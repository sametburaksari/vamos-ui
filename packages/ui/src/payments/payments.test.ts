import { createHmac } from "node:crypto";
import {
  createIyzicoClient,
  createPaytrIframeToken,
  iyzicoAuthorization,
  iyzicoCheckoutBody,
  iyzicoSignature,
  iyzicoTrimPrice,
  paytrTokenFields,
  verifyIyzicoRetrieveSignature,
  verifyIyzicoWebhook,
  verifyPaytrCallback,
  IYZICO_BASE_URL,
  PAYTR_IFRAME_URL,
  type IyzicoCheckoutRequest,
  type PaytrTokenRequest,
} from "./index";

// Fixture credentials — not real keys. Expected values are computed independently with node:crypto
// from the formulas in the providers' public docs.
const IYZ = { apiKey: "sandbox-fixtureApiKey0000000000000000", secretKey: "sandbox-fixtureSecretKey000000000000" };
const PAYTR = { merchantId: "100000", merchantKey: "fixtureMerchantKey", merchantSalt: "fixtureMerchantSalt" };
const hmacHex = (key: string, msg: string) => createHmac("sha256", key).update(msg, "utf8").digest("hex");
const hmacB64 = (key: string, msg: string) => createHmac("sha256", key).update(msg, "utf8").digest("base64");

type Call = { url: string; init: RequestInit };
const mockFetch = (respond: (call: Call) => unknown) => {
  const calls: Call[] = [];
  const fetch = async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(respond({ url, init })), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  return { fetch, calls };
};

const checkout: IyzicoCheckoutRequest = {
  price: "349.90",
  currency: "TRY",
  basketId: "B1001",
  conversationId: "C1001",
  callbackUrl: "https://ornek.com.tr/odeme/sonuc",
  buyer: {
    id: "U1",
    name: "Deniz",
    surname: "Kaya",
    identityNumber: "10000000146",
    email: "deniz@ornek.com.tr",
    gsmNumber: "+902160000000",
    registrationAddress: "Rasimpaşa Mah. Rıhtım Cad. No: 14",
    city: "İstanbul",
    country: "Turkey",
    ip: "203.0.113.7",
  },
  billingAddress: { contactName: "Deniz Kaya", city: "İstanbul", country: "Turkey", address: "Rasimpaşa Mah. Rıhtım Cad. No: 14" },
  basketItems: [
    { id: "W1", name: "Seramik atölyesi", category1: "Atölye", itemType: "VIRTUAL", price: "300" },
    { id: "W2", name: "Malzeme paketi", category1: "Atölye", itemType: "VIRTUAL", price: "49.90" },
  ],
};

describe("iyzico", () => {
  it("matches the documented response-signature sample (docs.iyzico.com, Response Signature Validation)", async () => {
    // Published sandbox sample from iyzico's documentation, not a real key.
    const sig = await iyzicoSignature("sandbox-qaIiLIxhjMgx3LSKIVvp6j17NunHOFtD", ["22416032", "TRY", "basketId", "conversationId", "10.5", "10.5"]);
    expect(sig).toBe("836c3a6c8db86c81043f2ca74edb13518b54a813f454f8dd762f0dd658610173");
  });

  it("trims prices like the docs' Trailing Zero table", () => {
    expect(["10", "10.0", "10.5", "10.50", "10.510", "10.5105", "10.51050"].map(iyzicoTrimPrice)).toEqual(["10", "10", "10.5", "10.5", "10.51", "10.5105", "10.5105"]);
    expect(() => iyzicoTrimPrice("1,5")).toThrow(RangeError);
  });

  it("builds the IYZWSv2 header from randomKey + path + body", async () => {
    const body = '{"locale":"tr","binNumber":"535805","conversationId":"docsTest-v1"}';
    const auth = await iyzicoAuthorization({ ...IYZ, randomKey: "123456789", path: "/payment/bin/check", body });
    const decoded = Buffer.from(auth.replace(/^IYZWSv2 /, ""), "base64").toString("utf8");
    expect(decoded).toBe(`apiKey:${IYZ.apiKey}&randomKey:123456789&signature:${hmacHex(IYZ.secretKey, "123456789/payment/bin/check" + body)}`);
  });

  it("validates and normalises the checkout body", () => {
    const body = iyzicoCheckoutBody(checkout);
    expect(body).toMatchObject({ price: "349.9", paidPrice: "349.9", currency: "TRY", locale: "tr", paymentGroup: "PRODUCT" });
    expect((body.basketItems as { price: string }[]).map((i) => i.price)).toEqual(["300.0", "49.9"]);
    expect(() => iyzicoCheckoutBody({ ...checkout, price: "350" })).toThrow("sum of basketItems");
    expect(() => iyzicoCheckoutBody({ ...checkout, basketItems: [{ ...checkout.basketItems[0]!, itemType: "PHYSICAL", price: "349.90" }] })).toThrow("shippingAddress");
    expect(() => iyzicoCheckoutBody({ ...checkout, callbackUrl: "/sonuc" })).toThrow("absolute");
  });

  it("initializes a checkout form against the sandbox and checks the response signature", async () => {
    const { fetch, calls } = mockFetch(() => ({
      status: "success",
      conversationId: "C1001",
      token: "tok-1",
      paymentPageUrl: "https://sandbox-cpp.iyzipay.com?token=tok-1",
      checkoutFormContent: "<script></script>",
      signature: hmacHex(IYZ.secretKey, "C1001:tok-1"),
    }));
    const client = createIyzicoClient({ ...IYZ, fetch, randomKey: () => "42" });
    expect(client.mode).toBe("sandbox");
    const session = await client.initializeCheckoutForm(checkout);
    expect(session).toMatchObject({ token: "tok-1", paymentPageUrl: "https://sandbox-cpp.iyzipay.com?token=tok-1" });
    const [call] = calls;
    expect(call!.url).toBe(IYZICO_BASE_URL.sandbox + "/payment/iyzipos/checkoutform/initialize/auth/ecom");
    const headers = call!.init.headers as Record<string, string>;
    expect(headers["x-iyzi-rnd"]).toBe("42");
    const decoded = Buffer.from(headers.Authorization!.slice(8), "base64").toString();
    expect(decoded).toContain(`signature:${hmacHex(IYZ.secretKey, "42/payment/iyzipos/checkoutform/initialize/auth/ecom" + call!.init.body)}`);

    const bad = createIyzicoClient({ ...IYZ, fetch: mockFetch(() => ({ status: "success", conversationId: "C1001", token: "tok-1", signature: "00" })).fetch });
    await expect(bad.initializeCheckoutForm(checkout)).rejects.toThrow("signature does not match");
    const failing = createIyzicoClient({ ...IYZ, fetch: mockFetch(() => ({ status: "failure", errorCode: "1001", errorMessage: "api bilgileri bulunamadı" })).fetch });
    await expect(failing.initializeCheckoutForm(checkout)).rejects.toMatchObject({ name: "IyzicoError", errorCode: "1001" });
  });

  it("uses the live URL only when asked", async () => {
    const { fetch, calls } = mockFetch(() => ({ status: "failure" }));
    await createIyzicoClient({ ...IYZ, mode: "live", fetch }).retrieveCheckoutForm("tok");
    expect(calls[0]!.url.startsWith(IYZICO_BASE_URL.live)).toBe(true);
  });

  it("retrieves a result: paid only with a matching signature and paymentStatus SUCCESS", async () => {
    const res = { status: "success", paymentStatus: "SUCCESS", paymentId: "22416032", currency: "TRY", basketId: "B1001", conversationId: "C1001", paidPrice: 349.9, price: "349.90", token: "tok-1" };
    const signature = hmacHex(IYZ.secretKey, "SUCCESS:22416032:TRY:B1001:C1001:349.9:349.9:tok-1");
    expect(await verifyIyzicoRetrieveSignature(IYZ.secretKey, { ...res, signature })).toBe(true);

    const ok = await createIyzicoClient({ ...IYZ, fetch: mockFetch(() => ({ ...res, signature })).fetch }).retrieveCheckoutForm("tok-1");
    expect(ok).toMatchObject({ paid: true, verified: true, paymentId: "22416032", paidPrice: "349.9" });
    const forged = await createIyzicoClient({ ...IYZ, fetch: mockFetch(() => ({ ...res, paidPrice: 1, signature })).fetch }).retrieveCheckoutForm("tok-1");
    expect(forged).toMatchObject({ paid: false, verified: false });
    const failed = await createIyzicoClient({ ...IYZ, fetch: mockFetch(() => ({ status: "failure", errorCode: "10051", errorMessage: "Kart limiti yetersiz" })).fetch }).retrieveCheckoutForm("tok-1");
    expect(failed).toMatchObject({ paid: false, status: "failure", errorCode: "10051" });
    await expect(createIyzicoClient(IYZ).retrieveCheckoutForm(null)).rejects.toThrow("token");
  });

  it("verifies X-IYZ-SIGNATURE-V3 for direct and HPP webhooks", async () => {
    const hpp = { iyziEventType: "CHECKOUT_FORM_AUTH", iyziPaymentId: 22416032, token: "tok-1", paymentConversationId: "C1001", status: "SUCCESS" };
    const hppSig = hmacHex(IYZ.secretKey, IYZ.secretKey + "CHECKOUT_FORM_AUTH22416032tok-1C1001SUCCESS");
    expect(await verifyIyzicoWebhook(IYZ.secretKey, hppSig, hpp)).toBe(true);
    expect(await verifyIyzicoWebhook(IYZ.secretKey, hppSig.toUpperCase(), hpp)).toBe(true);
    expect(await verifyIyzicoWebhook(IYZ.secretKey, hppSig, { ...hpp, status: "FAILURE" })).toBe(false);

    const direct = { iyziEventType: "THREE_DS_AUTH", paymentId: "22416032", paymentConversationId: "C1001", status: "SUCCESS" };
    expect(await verifyIyzicoWebhook(IYZ.secretKey, hmacHex(IYZ.secretKey, IYZ.secretKey + "THREE_DS_AUTH22416032C1001SUCCESS"), direct)).toBe(true);
    expect(await verifyIyzicoWebhook(IYZ.secretKey, null, direct)).toBe(false);
  });

  it("never puts keys in errors", async () => {
    expect(() => createIyzicoClient({ apiKey: "", secretKey: IYZ.secretKey })).toThrow(/apiKey is missing/);
    const failing = createIyzicoClient({ ...IYZ, fetch: mockFetch(() => ({ status: "failure", errorMessage: "x" })).fetch });
    const err = await failing.initializeCheckoutForm(checkout).catch((e: Error) => e);
    expect(String((err as Error).message)).not.toContain(IYZ.secretKey);
    expect(String((err as Error).message)).not.toContain(IYZ.apiKey);
  });
});

describe("PayTR", () => {
  const order: PaytrTokenRequest = {
    merchantOid: "YA20261115001",
    email: "deniz@ornek.com.tr",
    amount: "349.90",
    userIp: "203.0.113.7",
    basket: [
      { name: "Seramik atölyesi", price: "300", quantity: 1 },
      { name: "Malzeme paketi", price: "49.9", quantity: 1 },
    ],
    userName: "Deniz Kaya",
    userAddress: "Rasimpaşa Mah. Rıhtım Cad. No: 14, Kadıköy/İstanbul",
    userPhone: "+902160000000",
    okUrl: "https://ornek.com.tr/odeme/tamam",
    failUrl: "https://ornek.com.tr/odeme/hata",
  };

  it("computes paytr_token with the documented field order, in test mode by default", async () => {
    const f = await paytrTokenFields(PAYTR, order);
    expect(f.test_mode).toBe("1");
    expect(f.payment_amount).toBe("34990");
    expect(JSON.parse(Buffer.from(f.user_basket!, "base64").toString("utf8"))).toEqual([
      ["Seramik atölyesi", "300.00", 1],
      ["Malzeme paketi", "49.90", 1],
    ]);
    const hashStr = "100000" + "203.0.113.7" + "YA20261115001" + "deniz@ornek.com.tr" + "34990" + f.user_basket + "0" + "0" + "TL" + "1";
    expect(f.paytr_token).toBe(hmacB64(PAYTR.merchantKey, hashStr + PAYTR.merchantSalt));
    expect((await paytrTokenFields({ ...PAYTR, testMode: false }, order)).test_mode).toBe("0");
  });

  it("rejects what PayTR rejects", async () => {
    await expect(paytrTokenFields(PAYTR, { ...order, merchantOid: "YA-1" })).rejects.toThrow("merchantOid");
    await expect(paytrTokenFields(PAYTR, { ...order, email: "çağrı@ornek.com.tr" })).rejects.toThrow("Turkish");
    await expect(paytrTokenFields(PAYTR, { ...order, maxInstallment: 1 })).rejects.toThrow("maxInstallment");
    await expect(paytrTokenFields({ ...PAYTR, merchantSalt: "" }, order)).rejects.toThrow(/merchantSalt is missing/);
  });

  it("requests a token and returns the iframe URL", async () => {
    const { fetch, calls } = mockFetch(() => ({ status: "success", token: "28cc613c3d7633cf" }));
    const t = await createPaytrIframeToken({ ...PAYTR, fetch }, order);
    expect(t).toEqual({ token: "28cc613c3d7633cf", iframeUrl: PAYTR_IFRAME_URL + "28cc613c3d7633cf" });
    const sent = new URLSearchParams(String(calls[0]!.init.body));
    expect(sent.get("merchant_oid")).toBe("YA20261115001");
    expect(sent.get("merchant_key")).toBeNull();
    expect(String(calls[0]!.init.body)).not.toContain(PAYTR.merchantSalt);
    await expect(createPaytrIframeToken({ ...PAYTR, fetch: mockFetch(() => ({ status: "failed", reason: "Zorunlu alan degeri gecersiz: merchant_id" })).fetch }, order)).rejects.toThrow("merchant_id");
  });

  it("verifies the notification hash", async () => {
    const form = new URLSearchParams({
      merchant_oid: "YA20261115001",
      status: "success",
      total_amount: "36390",
      payment_amount: "34990",
      currency: "TL",
      payment_type: "card",
      test_mode: "1",
      hash: hmacB64(PAYTR.merchantKey, "YA20261115001" + PAYTR.merchantSalt + "success" + "36390"),
    });
    expect(await verifyPaytrCallback(PAYTR, form)).toMatchObject({ verified: true, paid: true, totalAmount: "363.90", paymentAmount: "349.90", testMode: true });
    const fd = new FormData();
    form.forEach((v, k) => fd.set(k, v));
    expect((await verifyPaytrCallback(PAYTR, fd)).paid).toBe(true);
    form.set("total_amount", "100");
    expect(await verifyPaytrCallback(PAYTR, form)).toMatchObject({ verified: false, paid: false });
    expect(await verifyPaytrCallback(PAYTR, { merchant_oid: "YA1", status: "failed", total_amount: "0", hash: hmacB64(PAYTR.merchantKey, "YA1" + PAYTR.merchantSalt + "failed0"), failed_reason_code: "6" })).toMatchObject({
      verified: true,
      paid: false,
      failedReasonCode: "6",
    });
  });
});

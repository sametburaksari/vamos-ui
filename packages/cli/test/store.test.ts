import { createHmac } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { storeFiles } from "../src/project/store";

const COMMERCE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../ui/src/commerce/index.ts");

describe("storeFiles", () => {
  it("next: two route handlers and the shared store files with correct imports", () => {
    const r = storeFiles({ runtime: "next", lang: "en", siteName: "Kilnhouse", appDir: "src/app", storeDir: "src/store" });
    expect(Object.keys(r.files).sort()).toEqual(["src/app/api/checkout/callback/route.ts", "src/app/api/checkout/route.ts", "src/store/catalog.ts", "src/store/checkout.ts"]);
    expect(r.files["src/app/api/checkout/route.ts"]).toContain('from "../../../store/checkout"');
    expect(r.files["src/app/api/checkout/callback/route.ts"]).toContain('from "../../../../store/checkout"');
    expect(r.files["src/store/checkout.ts"]).toContain('siteName: "Kilnhouse"');
    expect(Object.keys(r.env)).toEqual(["IYZICO_API_KEY", "IYZICO_SECRET_KEY", "IYZICO_MODE", "ORDER_SECRET", "RESEND_API_KEY", "ORDER_FROM", "ORDER_TO"]);
  });

  it("edge: Cloudflare and Spacefast handlers; Turkish catalog labels", () => {
    const r = storeFiles({ runtime: "edge", lang: "tr", currency: "TRY" });
    expect(r.files["functions/api/checkout/index.ts"]).toContain("export async function onRequestPost");
    expect(r.files["functions/api/checkout/index.ts"]).toContain('from "../../../store/checkout"');
    expect(r.files["functions/api/checkout/callback.ts"]).toContain(".callback(");
    expect(r.files["store/catalog.ts"]).toContain('label: "Kargo"');
    expect(r.notes.join("\n")).toContain("Mesafeli satış");
  });

  it("the generated edge checkout runs end to end against a fake iyzico", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "vb-store-"));
    const r = storeFiles({ runtime: "edge", lang: "en", siteName: "Kilnhouse" });
    for (const [rel, content] of Object.entries(r.files)) {
      mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      writeFileSync(path.join(dir, rel), content.replaceAll('"@vamos-ui/react/commerce"', JSON.stringify(pathToFileURL(COMMERCE).href)));
    }
    const { iyzicoSignature } = await import(pathToFileURL(path.resolve(COMMERCE, "../../payments/iyzico.ts")).href);
    const secretKey = "sandbox-fixtureSecretKey000000000000";
    const sent: { url: string; body: Record<string, unknown> }[] = [];
    let conv = "";
    let price = "";
    const original = globalThis.fetch;
    globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      sent.push({ url, body });
      if (url.endsWith("/checkoutform/initialize/auth/ecom")) {
        conv = String(body.conversationId);
        price = String(body.price);
        return Response.json({ status: "success", token: "tok", conversationId: conv, paymentPageUrl: "https://sandbox-cpp.iyzipay.com?token=tok", signature: await iyzicoSignature(secretKey, [conv, "tok"]) });
      }
      if (url.endsWith("/checkoutform/auth/ecom/detail")) {
        const res = { status: "success", paymentStatus: "SUCCESS", paymentId: "p1", currency: "TRY", basketId: conv, conversationId: conv, paidPrice: price, price, token: "tok" };
        return Response.json({ ...res, signature: await iyzicoSignature(secretKey, [res.paymentStatus, res.paymentId, res.currency, res.basketId, res.conversationId, price, price, res.token]) });
      }
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    try {
      const env = { IYZICO_API_KEY: "sandbox-fixtureApiKey0000000000000000", IYZICO_SECRET_KEY: secretKey, ORDER_SECRET: "x".repeat(40), RESEND_API_KEY: "re_test", ORDER_FROM: "Shop <orders@kiln.test>", ORDER_TO: "owner@kiln.test" };
      const start = (await import(pathToFileURL(path.join(dir, "functions/api/checkout/index.ts")).href)) as { onRequestPost: (c: { request: Request; env: Record<string, string> }) => Promise<Response> };
      const back = (await import(pathToFileURL(path.join(dir, "functions/api/checkout/callback.ts")).href)) as { POST: (r: Request, c?: { env?: Record<string, string> }) => Promise<Response> };
      const buyer = { name: "Deniz", surname: "Kaya", email: "deniz@example.com", phone: "+90 532 000 00 00", address: "Rıhtım Caddesi 14", city: "İstanbul" };
      const res = await start.onRequestPost({ env, request: new Request("https://kiln.test/api/checkout", { method: "POST", headers: { "content-type": "application/json", origin: "https://kiln.test" }, body: JSON.stringify({ lines: [{ productId: "example-mug", variantId: "ink", qty: 1 }], buyer }) }) });
      expect(res.status).toBe(200);
      expect(price).toBe("469.8"); // 379.90 + 89.90 shipping
      const cookie = res.headers.get("set-cookie")!.split(";")[0]!;
      const done = await back.POST(new Request("https://kiln.test/api/checkout/callback", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", cookie }, body: "token=tok" }), { env });
      expect(done.headers.get("location")).toMatch(/^https:\/\/kiln\.test\/order\/confirmation\?order=VB-/);
      const mails = sent.filter((s) => s.url === "https://api.resend.com/emails").map((s) => s.body.to);
      expect(mails).toEqual([["owner@kiln.test"], "deniz@example.com"]);
    } finally {
      globalThis.fetch = original;
    }
  });
});

describe("vamos-ui site store", () => {
  const opts = (cwd: string) => ({ cwd, interactive: false, env: { ...process.env, CI: "1", NO_COLOR: "1" } });
  const project = (next: { static?: boolean; hosting?: string }) => {
    const dir = mkdtempSync(path.join(tmpdir(), "vb-sitestore-"));
    writeFileSync(path.join(dir, "package.json"), JSON.stringify({ dependencies: { next: "16.4.6", react: "19.2.0" } }));
    if (next.static) writeFileSync(path.join(dir, "next.config.ts"), 'export default { output: "export" };');
    if (next.hosting) writeFileSync(path.join(dir, "vamos.project.json"), JSON.stringify({ plan: { hosting: { value: next.hosting } } }));
    return dir;
  };

  it("server → next route handlers; static on Cloudflare → edge; static on cPanel → php; files kept", async () => {
    const { run } = await import("../src/cli");
    const server = project({});
    expect(await run(["site", "store", "--json"], opts(server))).toBe(0);
    expect(existsSync(path.join(server, "app/api/checkout/route.ts"))).toBe(true);
    expect(existsSync(path.join(server, "store/catalog.ts"))).toBe(true);
    writeFileSync(path.join(server, "store/catalog.ts"), "// edited");
    expect(await run(["site", "store", "--json"], opts(server))).toBe(0);
    expect(readFileSync(path.join(server, "store/catalog.ts"), "utf8")).toBe("// edited");

    const edge = project({ static: true, hosting: "cloudflare" });
    expect(await run(["site", "store", "--json"], opts(edge))).toBe(0);
    expect(existsSync(path.join(edge, "functions/api/checkout/index.ts"))).toBe(true);

    const cpanel = project({ static: true, hosting: "cpanel" });
    expect(await run(["site", "store", "--json"], opts(cpanel))).toBe(0);
    expect(existsSync(path.join(cpanel, "public/api/checkout.php"))).toBe(true);
    expect(existsSync(path.join(cpanel, "public/api/_store/catalog.json"))).toBe(true);
    expect(readFileSync(path.join(cpanel, "store/catalog.ts"), "utf8")).toContain('from "../public/api/_store/catalog.json"');
    expect(existsSync(path.join(cpanel, "functions"))).toBe(false);

    const plain = project({ static: true });
    expect(await run(["site", "store", "--json"], opts(plain))).not.toBe(0);
    expect(await run(["site", "store", "--runtime", "php", "--json"], opts(plain))).toBe(0);
    expect(existsSync(path.join(plain, "public/api/checkout-callback.php"))).toBe(true);
    expect(await run(["site", "store", "--runtime", "php", "--json"], opts(project({})))).not.toBe(0);
    expect(await run(["site", "store", "--runtime", "next", "--json"], opts(project({ static: true })))).not.toBe(0);
  });
});

describe("storeFiles --provider paytr", () => {
  const hmacB64 = (key: string, msg: string) => createHmac("sha256", key).update(msg, "utf8").digest("base64");

  it("next: start + paytr-notify route handlers, Upstash env; edge: KV binding ORDERS", () => {
    const next = storeFiles({ runtime: "next", provider: "paytr", lang: "en", appDir: "src/app", storeDir: "src/store" });
    expect(Object.keys(next.files).sort()).toEqual(["src/app/api/checkout/paytr-notify/route.ts", "src/app/api/checkout/route.ts", "src/store/catalog.ts", "src/store/checkout.ts"]);
    expect(next.files["src/app/api/checkout/paytr-notify/route.ts"]).toContain('from "../../../../store/checkout"');
    expect(next.files["src/app/api/checkout/paytr-notify/route.ts"]).toContain(".notify(request)");
    expect(next.files["src/store/checkout.ts"]).toContain("createPaytrCheckout");
    expect(next.files["src/store/checkout.ts"]).not.toContain("IYZICO");
    expect(Object.keys(next.env)).toEqual(["PAYTR_MERCHANT_ID", "PAYTR_MERCHANT_KEY", "PAYTR_MERCHANT_SALT", "PAYTR_TEST_MODE", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "RESEND_API_KEY", "ORDER_FROM", "ORDER_TO"]);
    expect(next.notes.join("\n")).toContain("/api/checkout/paytr-notify");

    const edge = storeFiles({ runtime: "edge", provider: "paytr", lang: "tr" });
    expect(Object.keys(edge.files).sort()).toEqual(["functions/api/checkout/index.ts", "functions/api/checkout/paytr-notify.ts", "store/catalog.ts", "store/checkout.ts"]);
    expect(edge.env.ORDERS).toContain("wrangler kv namespace create ORDERS");
    expect(Object.keys(edge.optionalEnv)).toContain("UPSTASH_REDIS_REST_URL");
    expect(edge.notes.join("\n")).toContain("Bildirim URL");
  });

  it("the generated edge PayTR checkout runs end to end with a fake PayTR and a KV binding", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "vb-store-paytr-"));
    const r = storeFiles({ runtime: "edge", provider: "paytr", lang: "en", siteName: "Kilnhouse" });
    for (const [rel, content] of Object.entries(r.files)) {
      mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      writeFileSync(path.join(dir, rel), content.replaceAll('"@vamos-ui/react/commerce"', JSON.stringify(pathToFileURL(COMMERCE).href)));
    }
    const kvData = new Map<string, string>();
    const ORDERS = { get: async (k: string) => kvData.get(k) ?? null, put: async (k: string, v: string) => void kvData.set(k, v), delete: async (k: string) => void kvData.delete(k) };
    const sent: { url: string; body: string }[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      sent.push({ url, body: String(init?.body ?? "") });
      if (url === "https://www.paytr.com/odeme/api/get-token") return Response.json({ status: "success", token: "fixturetoken" });
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    try {
      const env = { PAYTR_MERCHANT_ID: "100000", PAYTR_MERCHANT_KEY: "fixtureMerchantKey", PAYTR_MERCHANT_SALT: "fixtureMerchantSalt", ORDERS, RESEND_API_KEY: "re_test", ORDER_FROM: "Shop <orders@kiln.test>", ORDER_TO: "owner@kiln.test" };
      type Handler = { onRequestPost: (c: { request: Request; env: Record<string, unknown> }) => Promise<Response> };
      const start = (await import(pathToFileURL(path.join(dir, "functions/api/checkout/index.ts")).href)) as Handler;
      const back = (await import(pathToFileURL(path.join(dir, "functions/api/checkout/paytr-notify.ts")).href)) as Handler;
      const buyer = { name: "Deniz", surname: "Kaya", email: "deniz@example.com", phone: "+90 532 000 00 00", address: "Rıhtım Caddesi 14", city: "İstanbul" };
      const res = await start.onRequestPost({ env, request: new Request("https://kiln.test/api/checkout", { method: "POST", headers: { "content-type": "application/json", origin: "https://kiln.test" }, body: JSON.stringify({ lines: [{ productId: "example-mug", variantId: "ink", qty: 1 }], buyer }) }) });
      expect(res.status).toBe(200);
      const { order, paymentPageUrl } = (await res.json()) as { order: string; paymentPageUrl: string };
      expect(paymentPageUrl).toBe("https://www.paytr.com/odeme/guvenli/fixturetoken");
      const tokenForm = new URLSearchParams(sent[0]!.body);
      expect([tokenForm.get("payment_amount"), tokenForm.get("test_mode")]).toEqual(["46980", "1"]); // 379.90 + 89.90 shipping
      const notification = (total: string) =>
        new Request("https://kiln.test/api/checkout/paytr-notify", {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ merchant_oid: order, status: "success", total_amount: total, hash: hmacB64("fixtureMerchantKey", order + "fixtureMerchantSalt" + "success" + total) }).toString(),
        });
      for (let i = 0; i < 2; i++) expect(await (await back.onRequestPost({ env, request: notification("46980") })).text()).toBe("OK");
      const mails = sent.filter((s) => s.url === "https://api.resend.com/emails").map((s) => JSON.parse(s.body).to);
      expect(mails).toEqual([["owner@kiln.test"], "deniz@example.com"]); // once, despite the retry
    } finally {
      globalThis.fetch = original;
    }
  });

  it("vamos-ui site store --provider paytr writes the PayTR endpoints; unknown providers are refused", async () => {
    const { run } = await import("../src/cli");
    const opts = (cwd: string) => ({ cwd, interactive: false, env: { ...process.env, CI: "1", NO_COLOR: "1" } });
    const dir = mkdtempSync(path.join(tmpdir(), "vb-sitestore-paytr-"));
    writeFileSync(path.join(dir, "package.json"), JSON.stringify({ dependencies: { next: "16.4.6", react: "19.2.0" } }));
    expect(await run(["site", "store", "--provider", "paytr", "--json"], opts(dir))).toBe(0);
    expect(existsSync(path.join(dir, "app/api/checkout/paytr-notify/route.ts"))).toBe(true);
    expect(existsSync(path.join(dir, "app/api/checkout/callback/route.ts"))).toBe(false);
    expect(readFileSync(path.join(dir, "store/checkout.ts"), "utf8")).toContain("upstashOrderStore");
    expect(await run(["site", "store", "--provider", "stripe", "--json"], opts(dir))).not.toBe(0);
  });
});

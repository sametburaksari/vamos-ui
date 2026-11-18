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

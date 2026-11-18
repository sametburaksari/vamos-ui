/**
 * The PHP runtime of `site store`, run for real: the generated files are served by `php -S` (with
 * the generated dev router standing in for the .htaccess rules) against a fake iyzico on localhost,
 * with mail() captured through sendmail_path. Every price, issue list, buyer and signed cookie the
 * PHP produces is compared with the TypeScript core (@vamos-ui/react/commerce) for the same input.
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createHmac } from "node:crypto";
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type Server } from "node:http";
import { createServer as createNetServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readBuyer } from "../../ui/src/commerce/checkout";
import { verifyOrder } from "../../ui/src/commerce/order";
import { priceCart, toDecimal, type Catalog, type CartLine } from "../../ui/src/commerce/pricing";
import { iyzicoSignature, iyzicoTrimPrice } from "../../ui/src/payments/iyzico";
import { PHP_CATALOG } from "../src/project/store-php";
import { storeFiles } from "../src/project/store";

const HAS_PHP = spawnSync("php", ["-r", "exit(PHP_VERSION_ID >= 80100 ? 0 : 1);"]).status === 0;

function writeProject(files: Record<string, string>): string {
  const dir = mkdtempSync(path.join(tmpdir(), "vb-store-php-"));
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

describe("storeFiles php", () => {
  it("writes the PHP endpoints, the routes, the denied store folder and one catalog", () => {
    const r = storeFiles({ runtime: "php", lang: "en", siteName: "Kilnhouse", storeDir: "src/store" });
    expect(Object.keys(r.files).sort()).toEqual([
      "public/api/.htaccess",
      "public/api/_store/.htaccess",
      "public/api/_store/catalog.json",
      "public/api/_store/store.php",
      "public/api/checkout-callback.php",
      "public/api/checkout.php",
      "src/store/catalog.ts",
      "store/php-config.example.php",
      "store/php-dev-router.php",
    ]);
    expect(r.files["src/store/catalog.ts"]).toContain('import data from "../../public/api/_store/catalog.json"');
    const api = r.files["public/api/.htaccess"]!;
    expect(api).toContain("RewriteRule ^checkout/?$ checkout.php [L]");
    expect(api).toContain("RewriteRule ^checkout/callback/?$ checkout-callback.php [L]");
    expect(api).toContain("RewriteRule ^_store(/|$) - [F,L]");
    expect(api).toContain("[R=308,L]");
    expect(r.files["public/api/_store/.htaccess"]).toContain("Require all denied");
    expect(r.files["public/api/_store/store.php"]).toContain("const VB_SITE_NAME = 'Kilnhouse';");
    expect(r.files["public/api/_store/store.php"]).not.toContain("__SITE_NAME__");
    // Secrets are never under public/: only the example config outside it names them.
    for (const [file, content] of Object.entries(r.files)) if (file.startsWith("public/")) expect(content).not.toMatch(/'IYZICO_SECRET_KEY' =>/);
    expect(r.files["store/php-config.example.php"]).toContain("'IYZICO_SECRET_KEY' => ''");
    expect(Object.keys(r.env)).toEqual(["IYZICO_API_KEY", "IYZICO_SECRET_KEY", "IYZICO_MODE", "ORDER_SECRET", "ORDER_FROM", "ORDER_TO"]);
    expect(r.notes.join("\n")).toContain("coupon-unsupported");
  });

  it("the example catalog.json is the same catalog the next and edge runtimes write", async () => {
    const php = storeFiles({ runtime: "php", lang: "tr" });
    const next = storeFiles({ runtime: "next", lang: "tr" });
    const dir = writeProject({ "catalog.ts": next.files["store/catalog.ts"]!.replace(/^import type .*$/m, "") });
    const { catalog } = (await import(path.join(dir, "catalog.ts"))) as { catalog: Catalog };
    expect(JSON.parse(php.files[PHP_CATALOG]!)).toEqual(catalog);
  });

  it.skipIf(!HAS_PHP)("every generated PHP file parses (php -l)", () => {
    const dir = writeProject(storeFiles({ runtime: "php", lang: "tr", siteName: "O'Kiln \\ Atölye" }).files);
    for (const rel of ["public/api/_store/store.php", "public/api/checkout.php", "public/api/checkout-callback.php", "store/php-config.example.php", "store/php-dev-router.php"]) {
      const res = spawnSync("php", ["-l", path.join(dir, rel)], { encoding: "utf8" });
      expect(res.status, `${rel}: ${res.stdout}${res.stderr}`).toBe(0);
    }
    // A direct request (VB_STORE not defined) ends without running anything.
    const direct = spawnSync("php", [path.join(dir, "public/api/_store/store.php")], { encoding: "utf8" });
    expect(direct.stdout).toBe("");
  });
});

// ------------------------------------------------------------------------------------------ e2e

const CATALOG: Catalog = {
  currency: "TRY",
  vatRate: 20,
  shipping: { flat: 89_90, freeOver: 1500_00, label: "Kargo", vatRate: 20 },
  products: [
    { id: "mug", name: "Kupa", price: 349_90, category: "Mutfak", variants: [{ id: "sand", name: "Kum" }, { id: "ink", name: "Mürekkep", price: 379_90 }, { id: "moss", name: "Yosun", available: false }] },
    { id: "tea", name: "Çay", price: 123_45, vatRate: 1, maxQty: 3 },
    { id: "book", name: "Kitap", price: 99_99, vatRate: 10 },
    { id: "guide", name: "Rehber (PDF)", price: 120_00, itemType: "VIRTUAL" },
    { id: "gone", name: "Eski", price: 50_00, available: false },
    { id: "free", name: "Bedava", price: 0 },
    { id: "zero", name: "Sıfır KDV", price: 7_77, vatRate: 0 },
  ],
};

const API_KEY = "sandbox-fixtureApiKey0000000000000000";
const SECRET_KEY = "sandbox-fixtureSecretKey000000000000";
const ORDER_SECRET = "s".repeat(24) + "-order-secret-0123456789";
const HOOK_SECRET = "whsec-fixture";

const BUYER = { name: "  Deniz ", surname: "Kaya", email: " Deniz@Example.COM ", phone: "0532 000 00 00", address: "Rıhtım Caddesi 14", city: "İstanbul", district: "Kadıköy", zipCode: "34710", company: { name: "Kiln Atölye", taxOffice: "Kadıköy" } };

/** What createCheckout.start does with the posted lines before pricing. */
const toLines = (lines: unknown[]): CartLine[] =>
  (lines as Record<string, unknown>[]).map((l) => ({ productId: String(l?.productId ?? ""), variantId: l?.variantId ? String(l.variantId) : undefined, qty: Number(l?.qty) }));

async function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const s = createNetServer();
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address() as { port: number };
      s.close(() => resolve(port));
    });
  });
}

const readBody = (req: IncomingMessage) => new Promise<string>((resolve) => {
  let data = "";
  req.setEncoding("utf8");
  req.on("data", (c) => (data += c));
  req.on("end", () => resolve(data));
});

interface Fake {
  initMode: "ok" | "bad-signature" | "failure";
  retrieve: (res: Record<string, unknown>) => Record<string, unknown>;
  signRetrieve: boolean;
  inits: Record<string, any>[];
  authFailures: number;
  hooks: { signature: string | undefined; body: string }[];
}

describe.skipIf(!HAS_PHP)("PHP checkout end to end (php -S + fake iyzico)", () => {
  let dir = "";
  let php = "";
  let server: Server;
  let proc: ChildProcess;
  let mailDir = "";
  let stderr = "";
  const tokens = new Map<string, { conv: string; price: string }>();
  const fake: Fake = { initMode: "ok", retrieve: (r) => r, signRetrieve: true, inits: [], authFailures: 0, hooks: [] };

  beforeAll(async () => {
    const r = storeFiles({ runtime: "php", lang: "en", siteName: "Kilnhouse" });
    dir = writeProject({ ...r.files, [PHP_CATALOG]: JSON.stringify(CATALOG, null, 2) });
    mailDir = path.join(dir, "mail");
    mkdirSync(mailDir);
    const capture = path.join(dir, "capture-mail.sh");
    writeFileSync(capture, `#!/bin/sh\ncat > "${mailDir}/$(date +%s)-$$.eml"\n`);
    chmodSync(capture, 0o755);

    const iyzicoPort = await freePort();
    let n = 0;
    server = createServer(async (req, res) => {
      const raw = await readBody(req);
      const send = (body: unknown) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(body));
      };
      if (req.url === "/hook") {
        fake.hooks.push({ signature: req.headers["x-vamos-signature"] as string | undefined, body: raw });
        return send({ ok: true });
      }
      // IYZWSv2: base64("apiKey:…&randomKey:…&signature:<hex HMAC(secret, randomKey + path + body)>")
      const decoded = Buffer.from(String(req.headers.authorization ?? "").replace(/^IYZWSv2 /, ""), "base64").toString("utf8");
      const m = /^apiKey:(.+)&randomKey:(.+)&signature:([0-9a-f]{64})$/.exec(decoded);
      const expected = m ? createHmac("sha256", SECRET_KEY).update(m[2]! + req.url + raw).digest("hex") : "";
      if (!m || m[1] !== API_KEY || m[2] !== req.headers["x-iyzi-rnd"] || m[3] !== expected) {
        fake.authFailures++;
        return send({ status: "failure", errorCode: "1000", errorMessage: "auth" });
      }
      const body = JSON.parse(raw) as Record<string, any>;
      if (req.url === "/payment/iyzipos/checkoutform/initialize/auth/ecom") {
        fake.inits.push(body);
        if (fake.initMode === "failure") return send({ status: "failure", errorCode: "5", errorMessage: "refused" });
        const token = `tok-${++n}`;
        tokens.set(token, { conv: body.conversationId, price: iyzicoTrimPrice(body.price) });
        const signature = fake.initMode === "bad-signature" ? "0".repeat(64) : await iyzicoSignature(SECRET_KEY, [body.conversationId, token]);
        return send({ status: "success", token, conversationId: body.conversationId, paymentPageUrl: `https://sandbox-cpp.iyzipay.test/?token=${token}`, signature });
      }
      if (req.url === "/payment/iyzipos/checkoutform/auth/ecom/detail") {
        const t = tokens.get(body.token);
        if (!t) return send({ status: "failure", errorCode: "404", errorMessage: "unknown token" });
        // iyzico answers prices as JSON numbers.
        const out = fake.retrieve({ status: "success", paymentStatus: "SUCCESS", paymentId: `p-${body.token}`, currency: "TRY", basketId: t.conv, conversationId: t.conv, paidPrice: Number(t.price), price: Number(t.price), token: body.token, installment: 1 });
        const p = (v: unknown) => (v === undefined || v === null || v === "" ? "" : iyzicoTrimPrice(v as string));
        const signature = fake.signRetrieve
          ? await iyzicoSignature(SECRET_KEY, [out.paymentStatus as string, out.paymentId as string, out.currency as string, out.basketId as string, out.conversationId as string, p(out.paidPrice), p(out.price), out.token as string])
          : "f".repeat(64);
        return send({ ...out, signature });
      }
      res.writeHead(404).end();
    });
    await new Promise<void>((resolve) => server.listen(iyzicoPort, "127.0.0.1", resolve));

    const home = path.join(dir, "home");
    mkdirSync(home);
    const config = path.join(home, "vamos-store-config.php");
    const settings = {
      IYZICO_API_KEY: API_KEY,
      IYZICO_SECRET_KEY: SECRET_KEY,
      IYZICO_BASE_URL: `http://127.0.0.1:${iyzicoPort}`,
      ORDER_SECRET,
      ORDER_FROM: "Kilnhouse Shop <orders@kiln.test>",
      ORDER_TO: "owner@kiln.test, second@kiln.test",
      ORDER_WEBHOOK_URL: `http://127.0.0.1:${iyzicoPort}/hook`,
      ORDER_WEBHOOK_SECRET: HOOK_SECRET,
      STATE_DIR: path.join(dir, "state"),
    };
    writeFileSync(config, `<?php\nreturn ${JSON.stringify(settings).replace(/^\{/, "[").replace(/\}$/, "]").replace(/":/g, '"=>')};\n`);

    const port = await freePort();
    php = `http://127.0.0.1:${port}`;
    proc = spawn("php", ["-d", `sendmail_path=${capture}`, "-d", "display_errors=0", "-d", "log_errors=1", "-S", `127.0.0.1:${port}`, "-t", path.join(dir, "public"), path.join(dir, "store/php-dev-router.php")], {
      env: { ...process.env, VAMOS_STORE_CONFIG: config },
      stdio: ["ignore", "ignore", "pipe"],
    });
    proc.stderr!.on("data", (d) => (stderr += String(d)));
    for (let i = 0; i < 100; i++) {
      try {
        await fetch(`${php}/api/_store/`);
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 50));
      }
    }
  }, 20_000);

  afterAll(async () => {
    proc?.kill();
    await new Promise<void>((resolve) => (server ? server.close(() => resolve()) : resolve()));
  });

  const start = (body: unknown, headers: Record<string, string> = {}) =>
    fetch(`${php}/api/checkout`, { method: "POST", headers: { "Content-Type": "application/json", Origin: php, ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

  const callback = (token: string | null, cookie: string) =>
    fetch(`${php}/api/checkout/callback`, { method: "POST", redirect: "manual", headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookie }, body: token === null ? "" : `token=${encodeURIComponent(token)}` });

  const cookieOf = (res: Response, name: string) => res.headers.getSetCookie().find((c) => c.startsWith(`${name}=`));
  const valueOf = (setCookie: string | undefined) => decodeURIComponent(setCookie!.split(";")[0]!.split("=").slice(1).join("="));
  const mails = () => readdirSync(mailDir).map((f) => readFileSync(path.join(mailDir, f), "utf8"));
  const header = (mail: string, name: string) => new RegExp(`^${name}: (.*)$`, "mi").exec(mail)?.[1]?.trim() ?? "";
  const decodeWord = (v: string) => v.replace(/=\?UTF-8\?B\?([^?]+)\?=/g, (_, b) => Buffer.from(b, "base64").toString("utf8"));

  /** A started checkout: its token (from the fake iyzico) and the order cookie. */
  async function begin(lines: unknown[] = [{ productId: "mug", variantId: "ink", qty: 1 }], locale = "en") {
    const res = await start({ lines, buyer: BUYER, locale });
    expect(res.status, stderr).toBe(200);
    const { order } = (await res.json()) as { order: string };
    const token = [...tokens.entries()].find(([, t]) => t.conv === order)![0];
    return { order, token, cookie: `vb_order=${valueOf(cookieOf(res, "vb_order"))}` };
  }

  it("prices every cart exactly like priceCart, and signs an order the TypeScript verifyOrder accepts", async () => {
    const carts: unknown[][] = [
      [{ productId: "mug", variantId: "ink", qty: 1 }],
      [{ productId: "mug", variantId: "sand", qty: 2 }, { productId: "tea", qty: 3 }, { productId: "book", qty: 1 }],
      [{ productId: "guide", qty: 1 }],
      [{ productId: "mug", variantId: "ink", qty: 4 }],
      [{ productId: "tea", qty: 1 }, { productId: "zero", qty: 2 }, { productId: "guide", qty: 1 }],
      [{ productId: "book", qty: "2" }, { productId: "tea", qty: 2.0 }],
      [],
      [{ productId: "nope", qty: 1 }],
      [{ productId: "mug", qty: 1 }],
      [{ productId: "mug", variantId: "nope", qty: 1 }],
      [{ productId: "mug", variantId: "moss", qty: 1 }],
      [{ productId: "gone", qty: 1 }],
      [{ productId: "tea", qty: 4 }],
      [{ productId: "book", qty: 0 }],
      [{ productId: "book", qty: 1.5 }],
      [{ productId: "book" }],
      [{ productId: "mug", variantId: "ink", qty: 1 }, { productId: "mug", variantId: "ink", qty: 2 }],
      [{ productId: "free", qty: 1 }],
      Array.from({ length: 31 }, () => ({ productId: "book", qty: 1 })),
      [{ productId: "gone", qty: 1 }, { productId: "book", qty: 1 }, { productId: "tea", qty: 9 }, { productId: "x" }],
    ];
    let priced = 0;
    for (const lines of carts) {
      const ts = priceCart(CATALOG, toLines(lines));
      const res = await start({ lines, buyer: BUYER, locale: "tr" });
      const json = (await res.json()) as Record<string, any>;
      if (!ts.ok) {
        expect(res.status, JSON.stringify(lines)).toBe(422);
        expect(json, JSON.stringify(lines)).toEqual({ error: "invalid-cart", issues: JSON.parse(JSON.stringify(ts.issues)) });
        continue;
      }
      priced++;
      expect(res.status, `${JSON.stringify(lines)} ${stderr}`).toBe(200);
      expect(json.paymentPageUrl).toMatch(/^https:\/\/sandbox-cpp\.iyzipay\.test\/\?token=tok-/);
      const set = cookieOf(res, "vb_order")!;
      expect(set).toMatch(/; Path=\/; Max-Age=3600; HttpOnly; Secure; SameSite=None$/);
      const order = await verifyOrder(valueOf(set), ORDER_SECRET);
      expect(order, "the PHP cookie verifies with the TypeScript verifyOrder").not.toBeNull();
      expect(order!.id).toBe(json.order);
      expect(order!.id).toMatch(/^VB-\d{6}-[2-9A-HJ-NP-Z]{8}$/);
      expect(order!.quote).toEqual(ts.quote);
      expect(order!.buyer).toEqual(JSON.parse(JSON.stringify(readBuyer(BUYER, ts.quote.physical).buyer)));
      const init = fake.inits.at(-1)!;
      expect(init.price).toBe(iyzicoTrimPrice(toDecimal(ts.quote.total)).replace(/^(\d+)$/, "$1.0"));
      expect(init.basketId).toBe(order!.id);
      expect(init.callbackUrl).toBe(`${php}/api/checkout/callback`);
      expect(Boolean(init.shippingAddress)).toBe(ts.quote.physical);
      expect(init.billingAddress.contactName).toBe("Kiln Atölye");
      expect(init.buyer.gsmNumber).toBe("+905320000000");
      const sum = (init.basketItems as { price: string }[]).reduce((s, i) => s + Math.round(Number(i.price) * 100), 0);
      expect(sum).toBe(ts.quote.total);
    }
    expect(priced).toBe(6);
    expect(fake.authFailures).toBe(0);
  });

  it("refuses like createCheckout.start: buyer, origin, coupon, size, method, JSON, provider", async () => {
    const bad = { name: "", surname: "K", email: "nope", phone: "123", address: "x", city: "", identityNumber: "0123" };
    const res = await start({ lines: [{ productId: "book", qty: 1 }], buyer: bad });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: "invalid-buyer", fields: readBuyer(bad, true).invalid });

    expect((await start({ lines: [{ productId: "book", qty: 1 }], buyer: BUYER }, { Origin: "https://evil.test" })).status).toBe(403);
    expect(await (await start({ lines: [{ productId: "book", qty: 1 }], buyer: BUYER }, { Origin: "https://evil.test" })).json()).toEqual({ error: "forbidden-origin" });

    const coupon = await start({ lines: [{ productId: "book", qty: 1 }], buyer: BUYER, coupon: "SPRING10" });
    expect(coupon.status).toBe(422);
    expect(await coupon.json()).toEqual({ error: "invalid-cart", issues: [{ index: -1, code: "coupon-unsupported" }] });

    const big = await start({ lines: [{ productId: "book", qty: 1 }], buyer: BUYER, note: "x".repeat(70_000) });
    expect([big.status, await big.json()]).toEqual([413, { error: "too-large" }]);
    expect(await (await start("{not json")).json()).toEqual({ error: "bad-request" });
    const get = await fetch(`${php}/api/checkout`);
    expect([get.status, get.headers.get("allow")]).toEqual([405, "POST"]);

    const before = fake.inits.length;
    for (const mode of ["bad-signature", "failure"] as const) {
      fake.initMode = mode;
      const r = await start({ lines: [{ productId: "book", qty: 1 }], buyer: BUYER });
      expect([r.status, await r.json(), cookieOf(r, "vb_order")]).toEqual([502, { error: "payment-unavailable" }, undefined]);
    }
    fake.initMode = "ok";
    expect(fake.inits.length).toBe(before + 2);
  });

  it("the catalog and the code behind the checkout are not served", async () => {
    for (const p of ["/api/_store/catalog.json", "/api/_store/store.php", "/api/_store/"]) expect((await fetch(`${php}${p}`)).status, p).toBe(403);
  });

  it("a paid order: confirmation redirect, cookies, two emails and one signed webhook — once", async () => {
    const mailsBefore = mails().length;
    const { order, token, cookie } = await begin([{ productId: "mug", variantId: "ink", qty: 1 }, { productId: "guide", qty: 1 }]);
    const done = await callback(token, cookie);
    expect(done.status, stderr).toBe(303);
    expect(done.headers.get("location")).toBe(`${php}/order/confirmation?order=${order}`);
    expect(cookieOf(done, "vb_order")).toBe("vb_order=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None");
    expect(cookieOf(done, "vb_order_done")).toBe(`vb_order_done=${order}; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=None`);

    const sent = mails().slice(mailsBefore);
    expect(sent).toHaveLength(2);
    const business = sent.find((m) => header(m, "To") === "owner@kiln.test, second@kiln.test")!;
    const receipt = sent.find((m) => header(m, "To") === "deniz@example.com")!;
    expect(decodeWord(header(business, "Subject"))).toBe(`Kilnhouse · New order ${order}`);
    expect(decodeWord(header(receipt, "Subject"))).toBe(`Kilnhouse · We have your order · ${order}`);
    expect(decodeWord(header(business, "From"))).toBe("Kilnhouse Shop <orders@kiln.test>");
    expect(header(business, "Reply-To")).toBe("deniz@example.com");
    expect(header(receipt, "Reply-To")).toBe("owner@kiln.test");
    expect(business).toContain(`iyzico paymentId: p-${token}`);
    expect(business).toContain("1 × Kupa · Mürekkep");
    expect(receipt).not.toContain("paymentId");
    expect(receipt).toContain("Hello Deniz,");

    expect(fake.hooks).toHaveLength(1);
    const hook = fake.hooks[0]!;
    expect(hook.signature).toBe(`sha256=${createHmac("sha256", HOOK_SECRET).update(hook.body).digest("hex")}`);
    const payload = JSON.parse(hook.body) as { event: string; order: Record<string, any> };
    expect(payload.event).toBe("order.paid");
    const ts = priceCart(CATALOG, toLines([{ productId: "mug", variantId: "ink", qty: 1 }, { productId: "guide", qty: 1 }]));
    expect(payload.order).toMatchObject({ v: 1, id: order, locale: "en", provider: "iyzico", paymentId: `p-${token}`, paidPrice: iyzicoTrimPrice(toDecimal(ts.ok ? ts.quote.total : 0)), installment: 1 });
    expect(payload.order.quote).toEqual(ts.ok && ts.quote);

    // The same post again (old cookie and token: a replay or a double submit) and a refresh that
    // only carries the done cookie both land on the confirmation page without telling anyone again.
    const again = await callback(token, cookie);
    expect([again.status, again.headers.get("location")]).toEqual([303, `${php}/order/confirmation?order=${order}`]);
    const refresh = await callback(token, `vb_order_done=${order}`);
    expect([refresh.status, refresh.headers.get("location")]).toEqual([303, `${php}/order/confirmation?order=${order}`]);
    expect(mails().length - mailsBefore).toBe(2);
    expect(fake.hooks).toHaveLength(1);
  });

  it("declined, unsigned, mismatched and cookie-less payments are not accepted as orders", async () => {
    const mailsBefore = mails().length;
    const hooksBefore = fake.hooks.length;
    const failedTo = (reason: string) => `${php}/checkout?payment=failed&reason=${reason}`;
    const run = async (setup: () => void, cookieFor?: (c: string) => string) => {
      const { token, cookie } = await begin([{ productId: "book", qty: 1 }]);
      setup();
      try {
        const res = await callback(token, cookieFor ? cookieFor(cookie) : cookie);
        return [res.status, res.headers.get("location"), cookieOf(res, "vb_order_done")] as const;
      } finally {
        fake.retrieve = (r) => r;
        fake.signRetrieve = true;
      }
    };

    expect(await run(() => (fake.retrieve = (r) => ({ ...r, paymentStatus: "FAILURE" })))).toEqual([303, failedTo("declined"), undefined]);
    expect(await run(() => (fake.signRetrieve = false))).toEqual([303, failedTo("declined"), undefined]);
    expect(await run(() => (fake.retrieve = (r) => ({ ...r, status: "failure" })))).toEqual([303, failedTo("declined"), undefined]);
    expect(await run(() => (fake.retrieve = (r) => ({ ...r, price: Number(r.price) - 0.01, paidPrice: Number(r.paidPrice) - 0.01 })))).toEqual([303, failedTo("mismatch"), undefined]);
    expect(await run(() => (fake.retrieve = (r) => ({ ...r, basketId: "VB-000000-OTHER000" })))).toEqual([303, failedTo("mismatch"), undefined]);

    // A tampered order cookie is not an order: paid at iyzico, logged, nothing sent.
    const { token, cookie } = await begin([{ productId: "book", qty: 1 }]);
    const orphan = await callback(token, cookie.replace(/.$/, (c) => (c === "0" ? "1" : "0")));
    expect(orphan.status).toBe(303);
    expect(orphan.headers.get("location")).toMatch(new RegExp(`^${php}/order/confirmation\\?order=VB-`));
    expect(stderr).toContain("payment succeeded without a matching order cookie");

    expect((await callback(null, cookie)).headers.get("location")).toBe(failedTo("token"));
    const get = await fetch(`${php}/api/checkout/callback`, { redirect: "manual" });
    expect(get.headers.get("location")).toBe(failedTo("method"));

    expect(mails().length).toBe(mailsBefore);
    expect(fake.hooks.length).toBe(hooksBefore);
    expect(fake.authFailures).toBe(0);
    expect(stderr).not.toContain(SECRET_KEY);
    expect(stderr).not.toContain(ORDER_SECRET);
  });
});

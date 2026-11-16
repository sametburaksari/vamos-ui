import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formSender } from "../src/project/forms";

type Handler = {
  POST: (request: Request, context?: { env?: Record<string, string> }) => Promise<Response>;
  onRequestPost: (context: { request: Request; env: Record<string, string> }) => Promise<Response>;
};

/** Writes the generated functions/api/contact.ts to a fresh file and imports it (fresh rate-limit memory). */
async function load(opts: Partial<Parameters<typeof formSender>[0]> = {}): Promise<Handler> {
  const dir = mkdtempSync(path.join(tmpdir(), "vb-edge-"));
  const file = path.join(dir, "contact.ts");
  writeFileSync(file, formSender({ kind: "edge", lang: "en", siteName: "Ledger & Line Accounting", ...opts }).files["functions/api/contact.ts"]!);
  return (await import(pathToFileURL(file).href)) as Handler;
}

const ENV = { RESEND_API_KEY: "re_test_secret_value", CONTACT_TO: "office@ledgerline.example", CONTACT_FROM: "form@ledgerline.example" };
const VALID = { name: "Deniz Arslan", email: "deniz@example.com", message: "We need help with our annual accounts.", privacy: "true", _form: "contact", _ts: "1" };

function post(body: Record<string, string>, init: { ip?: string; json?: boolean; headers?: Record<string, string> } = {}): Request {
  const json = init.json ?? true;
  return new Request("https://ledgerline.example/api/contact", {
    method: "POST",
    headers: {
      "content-type": json ? "application/json" : "application/x-www-form-urlencoded",
      accept: json ? "application/json" : "text/html",
      "cf-connecting-ip": init.ip ?? "203.0.113.7",
      origin: "https://ledgerline.example",
      referer: "https://ledgerline.example/contact",
      ...init.headers,
    },
    body: json ? JSON.stringify(body) : new URLSearchParams(body).toString(),
  });
}

function mockFetch(handlers: { turnstile?: boolean; resend?: number } = {}) {
  const fn = vi.fn(async (url: string | URL | Request) => {
    const u = String(url instanceof Request ? url.url : url);
    if (u.startsWith("https://challenges.cloudflare.com/")) return Response.json({ success: handlers.turnstile ?? true });
    if (u === "https://api.resend.com/emails") return new Response(JSON.stringify({ id: "msg_1" }), { status: handlers.resend ?? 200 });
    throw new Error(`unexpected fetch ${u}`);
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("edge contact handler (functions/api/contact.ts)", () => {
  it("exports both the Cloudflare Pages and the Spacefast entry points", async () => {
    const h = await load();
    expect(typeof h.onRequestPost).toBe("function");
    expect(typeof h.POST).toBe("function");
    const source = formSender({ kind: "edge" }).files["functions/api/contact.ts"]!;
    expect(source).not.toMatch(/from "node:|require\(|process\.env|Buffer/);
  });

  it("sends through Resend on success (JSON and form-encoded), without echoing secrets", async () => {
    const fetchMock = mockFetch();
    const h = await load();
    const res = await h.POST(post(VALID), { env: ENV });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, status: "success" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]! as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test_secret_value");
    const mail = JSON.parse(String(init.body));
    expect(mail).toMatchObject({ from: ENV.CONTACT_FROM, to: [ENV.CONTACT_TO], subject: "Ledger & Line Accounting: New message from the website", reply_to: "deniz@example.com" });
    expect(mail.text).toContain("Message: We need help with our annual accounts.");
    expect(mail.text).toContain("Read the privacy notice: yes");

    const viaPages = await h.onRequestPost({ request: post(VALID, { json: false, ip: "203.0.113.8" }), env: ENV });
    expect(viaPages.status).toBe(303);
    expect(viaPages.headers.get("location")).toBe("https://ledgerline.example/contact?vb_sent=contact");
  });

  it("honeypot and time trap: a fake success, nothing sent", async () => {
    const fetchMock = mockFetch();
    const h = await load();
    const trap = await h.POST(post({ ...VALID, website: "https://spam.example" }), { env: ENV });
    expect(trap.status).toBe(200);
    expect(await trap.json()).toEqual({ ok: true, status: "success" });
    const fast = await h.POST(post({ ...VALID, _ts: String(Date.now()) }), { env: ENV });
    expect((await fast.json()).ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a submit without consent, with bad fields, cross-site or with the wrong body", async () => {
    const fetchMock = mockFetch();
    const h = await load();
    const noConsent = await h.POST(post({ ...VALID, privacy: "" }), { env: ENV });
    expect(noConsent.status).toBe(422);
    const body = await noConsent.json();
    expect(body.ok).toBe(false);
    expect(body.status).toBe("invalid");
    expect(body.errors.privacy).toMatch(/privacy notice/);

    const bad = await (await h.POST(post({ ...VALID, email: "nope", message: "x".repeat(2001) }), { env: ENV })).json();
    expect(Object.keys(bad.errors).sort()).toEqual(["email", "message"]);

    expect((await h.POST(post(VALID, { headers: { origin: "https://evil.example" } }), { env: ENV })).status).toBe(403);
    expect((await h.POST(new Request("https://ledgerline.example/api/contact", { method: "POST" }), { env: ENV })).status).toBe(415);
    expect((await h.POST(new Request("https://ledgerline.example/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }), { env: ENV })).status).toBe(400);
    expect((await h.POST(new Request("https://ledgerline.example/api/contact", { method: "GET" }), { env: ENV })).status).toBe(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("verifies Turnstile when TURNSTILE_SECRET is set and refuses a failed or missing token", async () => {
    const fetchMock = mockFetch({ turnstile: false });
    const h = await load();
    const env = { ...ENV, TURNSTILE_SECRET: "0x_turnstile_secret" };
    const failed = await h.POST(post({ ...VALID, "cf-turnstile-response": "token-1" }), { env });
    expect(failed.status).toBe(403);
    const body = await failed.json();
    expect(body).toMatchObject({ ok: false, status: "error" });
    expect(JSON.stringify(body)).not.toContain("0x_turnstile_secret");
    const verify = fetchMock.mock.calls[0]! as unknown as [string, RequestInit];
    expect(verify[0]).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(String(verify[1].body)).toContain("response=token-1");
    expect(fetchMock.mock.calls.some((c) => String(c[0]).includes("resend"))).toBe(false);

    const missing = await h.POST(post(VALID, { ip: "203.0.113.20" }), { env });
    expect(missing.status).toBe(403);

    const okFetch = mockFetch({ turnstile: true });
    const passed = await h.POST(post({ ...VALID, "cf-turnstile-response": "token-2" }, { ip: "203.0.113.21" }), { env });
    expect(passed.status).toBe(200);
    expect(okFetch).toHaveBeenCalledTimes(2);
  });

  it("rate-limits per IP (5 in 10 minutes) and answers 429 with Retry-After", async () => {
    mockFetch();
    const h = await load();
    for (let i = 0; i < 5; i++) expect((await h.POST(post(VALID, { ip: "198.51.100.1" }), { env: ENV })).status).toBe(200);
    const sixth = await h.POST(post(VALID, { ip: "198.51.100.1" }), { env: ENV });
    expect(sixth.status).toBe(429);
    expect(sixth.headers.get("retry-after")).toBe("600");
    expect((await h.POST(post(VALID, { ip: "198.51.100.2" }), { env: ENV })).status).toBe(200);
  });

  it("missing configuration or a Resend failure is a server error that names no secret", async () => {
    mockFetch({ resend: 401 });
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const h = await load();
    const unset = await h.POST(post(VALID), { env: {} });
    expect(unset.status).toBe(500);
    expect(errors.mock.calls.flat().join(" ")).toContain("RESEND_API_KEY");
    const failed = await h.POST(post(VALID, { ip: "203.0.113.9" }), { env: ENV });
    expect(failed.status).toBe(502);
    const text = await failed.text();
    expect(text).not.toContain("re_test_secret_value");
    expect(errors.mock.calls.flat().join(" ")).not.toContain("re_test_secret_value");
  });

  it("accepts multipart FormData, the way the hydrated ContactForm posts", async () => {
    const fetchMock = mockFetch();
    const h = await load({ lang: "tr" });
    const data = new FormData();
    for (const [k, v] of Object.entries({ ...VALID, privacy: "on" })) data.set(k, v);
    const res = await h.POST(new Request("https://ledgerline.example/api/contact", { method: "POST", body: data, headers: { accept: "application/json", "cf-connecting-ip": "192.0.2.4" } }), { env: ENV });
    expect(res.status).toBe(200);
    expect(JSON.parse(String((fetchMock.mock.calls[0]! as unknown as [string, RequestInit])[1].body)).text).toContain("Aydınlatma metnini okudu: evet");
  });
});

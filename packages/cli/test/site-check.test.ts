import http from "node:http";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { alternateHost, runDeployChecks, siteCheckVerdict, siteCheckWorkflow, type FetchLike } from "../src/audit";
import { run } from "../src/cli";

// A local HTTP server plays every host. The fetch wrapper sends each request to it with the
// public origin in a header, so redirects, hosts and headers behave like the real thing and no
// request leaves the machine. Hosts the server does not know fail like a DNS miss.

type Handler = (path: string) => { status: number; headers?: Record<string, string>; body?: string };
type Sites = Record<string, Handler>;

let server: http.Server;
let port = 0;
let sites: Sites = {};
const realFetch = globalThis.fetch;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    const origin = String(req.headers["x-test-origin"] ?? "");
    const handler = sites[origin];
    if (!handler) {
      res.writeHead(502).end();
      return;
    }
    const r = handler(req.url ?? "/");
    res.writeHead(r.status, { "content-type": "text/html; charset=utf-8", ...r.headers });
    res.end(req.method === "HEAD" ? undefined : (r.body ?? ""));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  port = (server.address() as { port: number }).port;
});
afterAll(() => {
  server.close();
});

const viaLocal: FetchLike = async (url, init) => {
  const u = new URL(url);
  if (!sites[u.origin]) throw new TypeError("fetch failed", { cause: { code: "ENOTFOUND" } });
  return realFetch(`http://127.0.0.1:${port}${u.pathname}${u.search}`, { ...init, headers: { ...(init.headers as Record<string, string>), "x-test-origin": u.origin } });
};

const SECURE = {
  "strict-transport-security": "max-age=31536000",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "SAMEORIGIN",
  "permissions-policy": "camera=()",
  "content-security-policy": "default-src 'self'",
};

const redirect = (to: string, status = 301): Handler => (p) => ({ status, headers: { location: `${to}${p}` } });

/** A finished site (fictional bakery) on `host`, served over https with the www twin redirected. */
function goodSite(host: string): Sites {
  const o = `https://${host}`;
  const head = (title: string, p: string) => `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><meta name="description" content="Kadıköy Moda'da ekşi maya ekmek, kruvasan ve mevsim tatlıları. Her sabah 07:00'de taze çıkıyor, sipariş için arayın.">
<link rel="canonical" href="${o}${p}"><meta property="og:title" content="Fırın Lavanta"><meta property="og:description" content="Ekşi maya fırını">
<meta property="og:image" content="${o}/og.jpg"><meta property="og:url" content="${o}${p}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/icon.svg">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Bakery","name":"Fırın Lavanta"}</script></head>`;
  const words = "Ekşi maya ekmeklerimiz yirmi dört saat mayalanır ve taş fırında pişer. Her sabah kruvasan, poğaça ve mevsim meyveli tartlar hazırlıyoruz. Pazar günleri brunch tabağı ve filtre kahve de var.";
  const page = (title: string, p: string) =>
    `${head(title, p)}<body><main><h1>${title}</h1><p>${words}</p><a href="/hakkimizda">Hakkımızda</a></main><footer><a href="/gizlilik">Gizlilik</a> <a href="/kvkk">KVKK Aydınlatma Metni</a> <a href="/cerez-politikasi">Çerez politikası</a> <a href="tel:+902163334455">0216 333 44 55</a> <a href="mailto:merhaba@${host}">merhaba@${host}</a></footer></body></html>`;
  const pages: Record<string, string> = { "/": "Fırın Lavanta — Kadıköy ekşi maya fırını", "/hakkimizda": "Hakkımızda — Fırın Lavanta", "/gizlilik": "Gizlilik — Fırın Lavanta", "/kvkk": "KVKK — Fırın Lavanta", "/cerez-politikasi": "Çerez politikası — Fırın Lavanta" };
  return {
    [`http://${host}`]: redirect(o),
    [`http://www.${host}`]: redirect(o),
    [`https://www.${host}`]: redirect(o),
    [o]: (p) => {
      if (pages[p]) return { status: 200, headers: SECURE, body: page(pages[p]!, p) };
      if (p === "/robots.txt") return { status: 200, headers: { "content-type": "text/plain" }, body: `User-agent: *\nAllow: /\n\nSitemap: ${o}/sitemap.xml\n` };
      if (p === "/sitemap.xml") return { status: 200, headers: { "content-type": "application/xml" }, body: `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(pages).map((k) => `<url><loc>${o}${k}</loc></url>`).join("")}</urlset>` };
      if (p === "/llms.txt") return { status: 200, headers: { "content-type": "text/plain" }, body: "# Fırın Lavanta\n" };
      if (p === "/icon.svg") return { status: 200, headers: { "content-type": "image/svg+xml" }, body: "<svg/>" };
      return { status: 404, headers: SECURE, body: `${head("Sayfa bulunamadı", p)}<body><h1>Sayfa bulunamadı</h1></body></html>` };
    },
  };
}

/** The same site before the host config went live: no redirects, no headers, every path is the home page. */
function rawSite(host: string): Sites {
  const home = `<!doctype html><html><head><title>Fırın Lavanta</title></head><body><h1>Fırın Lavanta</h1></body></html>`;
  const serve: Handler = (p) => (p === "/robots.txt" ? { status: 200, headers: { "content-type": "text/plain" }, body: "User-agent: *\nAllow: /\n" } : { status: 200, body: home });
  return { [`http://${host}`]: serve, [`https://${host}`]: serve, [`https://www.${host}`]: serve };
}

const byId = (checks: { id: string; status: string }[]) => Object.fromEntries(checks.map((c) => [c.id, c.status]));

describe("alternateHost", () => {
  it("pairs www and the bare domain, including second-level suffixes", () => {
    expect(alternateHost("ornek.com.tr")).toBe("www.ornek.com.tr");
    expect(alternateHost("www.ornek.com.tr")).toBe("ornek.com.tr");
    expect(alternateHost("example.com")).toBe("www.example.com");
    expect(alternateHost("www.example.com")).toBe("example.com");
  });
  it("has nothing to pair for subdomains, IPs and localhost", () => {
    expect(alternateHost("shop.ornek.com.tr")).toBeNull();
    expect(alternateHost("shop.example.com")).toBeNull();
    expect(alternateHost("127.0.0.1")).toBeNull();
    expect(alternateHost("localhost")).toBeNull();
  });
});

describe("runDeployChecks", () => {
  it("passes a site whose host config is live", async () => {
    sites = goodSite("ornek.com.tr");
    const res = await runDeployChecks("https://ornek.com.tr", { fetch: viaLocal });
    expect(res.finalUrl).toBe("https://ornek.com.tr/");
    expect(byId(res.checks)).toEqual({ "https-redirect": "pass", "one-host": "pass", "security-headers": "pass", "not-found": "pass", robots: "pass", sitemap: "pass" });
    expect(res.checks.find((c) => c.id === "sitemap")!.message.en).toContain("5 URLs");
  });

  it("starts from the www twin and follows it to the one host", async () => {
    sites = goodSite("ornek.com.tr");
    const res = await runDeployChecks("https://www.ornek.com.tr/", { fetch: viaLocal });
    expect(res.finalUrl).toBe("https://ornek.com.tr/");
    expect(byId(res.checks)["one-host"]).toBe("pass");
  });

  it("fails each check when the config did not go live", async () => {
    sites = rawSite("ornek.com.tr");
    const res = await runDeployChecks("https://ornek.com.tr", { fetch: viaLocal, notFoundPath: "/yok-boyle-bir-sayfa" });
    expect(byId(res.checks)).toEqual({ "https-redirect": "fail", "one-host": "fail", "security-headers": "fail", "not-found": "fail", robots: "warn", sitemap: "fail" });
    const notFound = res.checks.find((c) => c.id === "not-found")!;
    expect(notFound.message.en).toContain("soft 404");
    expect(notFound.message.tr).toContain("soft 404");
    expect(notFound.url).toBe("https://ornek.com.tr/yok-boyle-bir-sayfa");
    expect(res.checks.find((c) => c.id === "security-headers")!.message.en).toContain("strict-transport-security");
  });

  it("warns on temporary redirects, a missing www and recommended headers", async () => {
    const good = goodSite("example.com");
    const origin = "https://example.com";
    sites = {
      "http://example.com": redirect(origin, 302),
      [origin]: (p) => {
        const r = good[origin]!(p);
        const { "x-frame-options": _x, "content-security-policy": _c, ...rest } = r.headers ?? {};
        return { ...r, headers: p === "/" ? rest : r.headers };
      },
    };
    const res = await runDeployChecks("https://example.com", { fetch: viaLocal });
    const s = byId(res.checks);
    expect(s["https-redirect"]).toBe("warn");
    expect(s["one-host"]).toBe("warn");
    expect(res.checks.find((c) => c.id === "one-host")!.message.en).toContain("ENOTFOUND");
    expect(s["security-headers"]).toBe("warn");
    expect(s["not-found"]).toBe("pass");
  });

  it("flags a site that is not on https at all", async () => {
    sites = { "http://example.com": (p) => (p === "/" ? { status: 200, body: "<!doctype html><title>x</title>" } : { status: 404 }) };
    const res = await runDeployChecks("http://example.com", { fetch: viaLocal });
    expect(byId(res.checks)["https-redirect"]).toBe("fail");
  });

  it("fails everything when the site does not answer", async () => {
    sites = {};
    const res = await runDeployChecks("https://example.com", { fetch: viaLocal });
    expect(res.checks.every((c) => c.status === "fail")).toBe(true);
    expect(res.checks).toHaveLength(6);
  });
});

describe("siteCheckVerdict", () => {
  const ok = [{ id: "robots", status: "pass" }] as never;
  it("passes at or above the score with no errors", () => {
    expect(siteCheckVerdict({ score: 90, summary: { errors: 0, warnings: 2, info: 1 } }, ok, 90)).toMatchObject({ passed: true, reasons: [] });
  });
  it("fails below the score, on audit errors or on a failed check", () => {
    expect(siteCheckVerdict({ score: 89, summary: { errors: 0, warnings: 0, info: 0 } }, ok, 90).passed).toBe(false);
    expect(siteCheckVerdict({ score: 95, summary: { errors: 1, warnings: 0, info: 0 } }, ok, 90).passed).toBe(false);
    const v = siteCheckVerdict({ score: 100, summary: { errors: 0, warnings: 0, info: 0 } }, [{ id: "not-found", status: "fail" }] as never, 90);
    expect(v).toMatchObject({ passed: false, failedChecks: ["not-found"] });
    expect(v.reasons[0]!.tr).toContain("not-found");
  });
});

describe("siteCheckWorkflow", () => {
  it("runs the check after a production deploy, with the URL and score", () => {
    const yml = siteCheckWorkflow("https://ornek.com.tr", 85);
    expect(yml).toContain("deployment_status:");
    expect(yml).toContain("workflow_dispatch:");
    expect(yml).toContain("npx -y vamos-ui@latest site check https://ornek.com.tr --min-score 85");
    expect(yml).not.toMatch(/secrets\./);
  });
});

// --- the CLI ----------------------------------------------------------------------------

async function cli(cwd: string, ...argv: string[]): Promise<{ code: number; out: string }> {
  let out = "";
  const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array) => {
    out += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  });
  vi.stubGlobal("fetch", viaLocal);
  try {
    const code = await run(argv, { cwd, interactive: false, env: { ...process.env, CI: "1", NO_COLOR: "1" } });
    return { code, out };
  } finally {
    vi.unstubAllGlobals();
    spy.mockRestore();
  }
}

function project(files: Record<string, unknown>): string {
  const dir = mkdtempSync(path.join(tmpdir(), "vb-sitecheck-"));
  writeFileSync(path.join(dir, "package.json"), "{}");
  for (const [name, value] of Object.entries(files)) writeFileSync(path.join(dir, name), JSON.stringify(value));
  return dir;
}

// .test is reserved for testing: unlike ornek.com.tr it is not flagged by the audit as a placeholder address.
const HOST = "lavanta.test";

describe("vamos-ui site check", () => {
  it("passes a finished site, takes the URL from vamos.site.json and suggests closing the deploy task", async () => {
    sites = goodSite(HOST);
    const dir = project({ "vamos.site.json": { url: `https://${HOST}`, locale: "tr-TR" }, "vamos.project.json": { plan: { domain: { name: HOST }, tasks: [{ id: "deploy", status: "todo" }] } } });
    const { code, out } = await cli(dir, "site", "check", "--json");
    const res = JSON.parse(out);
    expect(res.audit.summary.errors).toBe(0);
    expect(code).toBe(0);
    expect(res).toMatchObject({ url: `https://${HOST}/`, passed: true, minScore: 90, failedChecks: [], next: "npx vamos-ui task done deploy" });
    expect(res.score).toBeGreaterThanOrEqual(90);
    expect(res.checks.map((c: { status: string }) => c.status)).toEqual(["pass", "pass", "pass", "pass", "pass", "pass"]);
  });

  it("prints the checks in Turkish and the task hint", async () => {
    sites = goodSite(HOST);
    const dir = project({ "vamos.project.json": { plan: { domain: { name: HOST }, tasks: [{ id: "deploy", status: "todo" }] } } });
    const { code, out } = await cli(dir, "site", "check");
    expect(code).toBe(0);
    expect(out).toContain("Yayın kontrolleri");
    expect(out).toContain("Olmayan sayfa 404 döndürüyor");
    expect(out).toContain("npx vamos-ui task done deploy");
  });

  it("does not suggest the task when it is done or there is no plan", async () => {
    sites = goodSite(HOST);
    const done = project({ "vamos.project.json": { plan: { domain: { name: HOST }, tasks: [{ id: "deploy", status: "done" }] } } });
    expect(JSON.parse((await cli(done, "site", "check", "--json")).out).next).toBeNull();
    const bare = project({});
    const { code, out } = await cli(bare, "site", "check", `https://${HOST}`, "--lang", "en");
    expect(code).toBe(0);
    expect(out).toContain("Deploy checks");
    expect(out).not.toContain("task done deploy");
  });

  it("exits 1 when a deploy check fails or the score is below --min-score", async () => {
    sites = rawSite(HOST);
    const dir = project({});
    const failed = await cli(dir, "site", "check", `https://${HOST}`, "--json", "--min-score", "0");
    expect(failed.code).toBe(1);
    const res = JSON.parse(failed.out);
    expect(res.passed).toBe(false);
    expect(res.failedChecks).toEqual(expect.arrayContaining(["https-redirect", "security-headers", "not-found", "sitemap"]));
    expect(res.next).toBeNull();

    // The finished site with one audit warning (no <h1> on the start page): 95 points.
    sites = goodSite(HOST);
    const serve = sites[`https://${HOST}`]!;
    sites[`https://${HOST}`] = (p) => {
      const r = serve(p);
      return p === "/" ? { ...r, body: r.body!.replace(/<\/?h1>/g, "") } : r;
    };
    const below = await cli(dir, "site", "check", `https://${HOST}`, "--json", "--min-score", "96");
    const b = JSON.parse(below.out);
    expect(b).toMatchObject({ score: 95, failedChecks: [], auditErrors: 0, passed: false });
    expect(b.reasons).toEqual(["Denetim puanı 95; geçmek için en az 96 gerekli."]);
    expect(below.code).toBe(1);
    expect((await cli(dir, "site", "check", `https://${HOST}`, "--json", "--min-score", "95")).code).toBe(0);
  });

  it("asks for a URL when none is known", async () => {
    const { code, out } = await cli(project({}), "site", "check", "--json");
    expect(code).toBe(1);
    expect(JSON.parse(out).error).toContain("Which site");
  });

  it("--ci prints a GitHub Actions workflow without requesting anything", async () => {
    sites = {};
    const dir = project({ "vamos.site.json": { url: "https://ornek.com.tr/" } });
    const { code, out } = await cli(dir, "site", "check", "--ci", "--min-score", "80");
    expect(code).toBe(0);
    expect(out).toContain("name: Site check");
    expect(out).toContain("site check https://ornek.com.tr --min-score 80");
    const json = JSON.parse((await cli(project({}), "site", "check", "--ci", "--json")).out);
    expect(json.path).toBe(".github/workflows/site-check.yml");
    expect(json.workflow).toContain("https://example.com");
  });

  it("has its own help, and site deploy ends with the check command", async () => {
    const help = await cli(project({}), "site", "check", "--help");
    expect(help.code).toBe(0);
    expect(help.out).toContain("--min-score");
    const dir = project({});
    const deploy = await cli(dir, "site", "deploy", "--host", "vercel", "--domain", "ornek.com.tr", "--dry-run", "--json");
    expect(deploy.code).toBe(0);
    expect(JSON.parse(deploy.out).next).toBe("npx vamos-ui site check https://ornek.com.tr");
    const www = await cli(dir, "site", "deploy", "--host", "cpanel", "--domain", "ornek.com.tr", "--www", "--dry-run", "--json");
    expect(JSON.parse(www.out).next).toBe("npx vamos-ui site check https://www.ornek.com.tr");
  });
});

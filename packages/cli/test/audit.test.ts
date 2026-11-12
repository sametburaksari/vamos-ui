import { describe, expect, it } from "vitest";
import {
  AuditRefusedError,
  aiCrawlerPolicy,
  analyzePage,
  formatAuditText,
  isAllowed,
  isPlaceholderPhone,
  pageIssues,
  parseRobots,
  parseSitemap,
  runAudit,
  tokenize,
  type FetchLike,
} from "../src/audit";
import { run } from "../src/cli";

// --- fixtures (fictional bakery "Fırın Lavanta") ----------------------------------------

const GOOD_HEAD = `<!doctype html><html lang="tr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fırın Lavanta — Kadıköy ekşi maya fırını</title>
<meta name="description" content="Kadıköy Moda'da ekşi maya ekmek, kruvasan ve mevsim tatlıları. Her sabah 07:00'de taze çıkıyor, sipariş için arayın.">
<link rel="canonical" href="https://lavanta.test/">
<meta property="og:title" content="Fırın Lavanta"><meta property="og:description" content="Ekşi maya fırını">
<meta property="og:image" content="https://lavanta.test/og.jpg"><meta property="og:url" content="https://lavanta.test/">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/icon.svg">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Bakery","name":"Fırın Lavanta"},{"@type":"WebSite"}]}</script>
</head>`;

const footer = `<footer><a href="/gizlilik">Gizlilik</a> <a href="/kvkk">KVKK Aydınlatma Metni</a> <a href="/cerez-politikasi">Çerez politikası</a>
<a href="tel:+902163334455">0216 333 44 55</a> <a href="mailto:merhaba@lavanta.test">merhaba@lavanta.test</a></footer>`;

const body = (inner: string) => `<body><header><a href="/"><img src="/logo.png" alt="Fırın Lavanta"></a></header><main>${inner}</main>${footer}</body></html>`;
const words = "Ekşi maya ekmeklerimiz yirmi dört saat mayalanır ve taş fırında pişer. Her sabah kruvasan, poğaça ve mevsim meyveli tartlar hazırlıyoruz. Pazar günleri brunch tabağı ve filtre kahve de var.";

const HOME = GOOD_HEAD + body(`<h1>Ekşi maya fırını</h1><p>${words}</p><a href="/menu">Menü</a> <a href="/hakkimizda">Hakkımızda</a> <a href="/eski-sayfa">Eski kampanya</a> <a href="/admin/panel">Panel</a> <img src="/hero.jpg" alt="Fırın vitrini">`);

const page = (title: string, extra = "") =>
  `<!doctype html><html lang="tr"><head><title>${title}</title><meta name="description" content="Fırın Lavanta sayfası: ekşi maya ekmek, kruvasan ve mevsim tatlıları hakkında bilgiler burada yer alıyor."><link rel="canonical" href="https://lavanta.test/x"></head>${body(`<h1>${title}</h1><p>${words}</p>${extra}`)}`;

type Route = { status?: number; body?: string; headers?: Record<string, string> };

function fakeSite(routes: Record<string, Route>, log: string[] = []): FetchLike {
  return async (url, init) => {
    log.push(`${init.method ?? "GET"} ${url}`);
    const r = routes[url];
    if (!r) return new Response("Not found", { status: 404, headers: { "content-type": "text/html" } });
    const status = r.status ?? 200;
    const headers = { "content-type": "text/html; charset=utf-8", ...r.headers };
    if (status >= 300 && status < 400) return new Response(null, { status, headers });
    return new Response(init.method === "HEAD" ? null : (r.body ?? ""), { status, headers });
  };
}

const SITE: Record<string, Route> = {
  "http://lavanta.test/": { status: 301, headers: { location: "https://lavanta.test/" } },
  "https://www.lavanta.test/": { status: 301, headers: { location: "https://lavanta.test/" } },
  "https://lavanta.test/": { body: HOME, headers: { "content-encoding": "br", "strict-transport-security": "max-age=63072000", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin", "content-security-policy": "default-src 'self'" } },
  "https://lavanta.test/robots.txt": { body: "User-agent: *\nDisallow: /admin/\n\nUser-agent: GPTBot\nDisallow: /\n\nSitemap: https://lavanta.test/sitemap.xml\n", headers: { "content-type": "text/plain" } },
  "https://lavanta.test/sitemap.xml": { body: `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://lavanta.test/</loc></url><url><loc>https://lavanta.test/menu</loc></url><url><loc>https://lavanta.test/silinen</loc></url></urlset>`, headers: { "content-type": "application/xml" } },
  "https://lavanta.test/llms.txt": { body: "# Fırın Lavanta\n", headers: { "content-type": "text/plain" } },
  "https://lavanta.test/menu": { body: page("Menü — Fırın Lavanta", `<img src="/big.jpg" alt="Kruvasan">`) },
  "https://lavanta.test/hakkimizda": { body: page("Hakkımızda — Fırın Lavanta") },
  "https://lavanta.test/gizlilik": { body: page("Gizlilik — Fırın Lavanta") },
  "https://lavanta.test/cerez-politikasi": { body: page("Çerez politikası — Fırın Lavanta") },
  "https://lavanta.test/logo.png": { headers: { "content-type": "image/png", "content-length": "12000" } },
  "https://lavanta.test/hero.jpg": { headers: { "content-type": "image/jpeg", "content-length": "90000" } },
  "https://lavanta.test/big.jpg": { headers: { "content-type": "image/jpeg", "content-length": String(900 * 1024) } },
};

// --- HTML scanner ---------------------------------------------------------------------------

describe("tokenize", () => {
  it("reads tags, quoted/unquoted attributes, comments and raw text", () => {
    const t = tokenize(`<!-- <a href="/hidden"> --><A HREF=/x data-x='1 > 2'>Hi &amp; bye</A><script>if (a < b) "</div>"</script><br/>`);
    expect(t.map((x) => x.type)).toEqual(["open", "text", "close", "raw", "open"]);
    expect(t[0]).toMatchObject({ name: "a", attrs: { href: "/x", "data-x": "1 > 2" } });
    expect(t[1]).toMatchObject({ text: "Hi & bye" });
    expect(t[4]).toMatchObject({ name: "br", selfClosing: true });
  });
});

describe("analyzePage", () => {
  it("reads head metadata, JSON-LD types, headings, names and links", () => {
    const f = analyzePage(HOME, "https://lavanta.test/");
    expect(f.lang).toBe("tr");
    expect(f.title).toBe("Fırın Lavanta — Kadıköy ekşi maya fırını");
    expect(f.canonical).toBe("https://lavanta.test/");
    expect(f.og).toMatchObject({ title: "Fırın Lavanta", image: "https://lavanta.test/og.jpg" });
    expect(f.jsonLd).toEqual([{ ok: true, types: ["Bakery", "WebSite"] }]);
    expect(f.h1).toEqual(["Ekşi maya fırını"]);
    expect(f.links.find((l) => l.href === "/")?.unnamed).toBe(false); // named by the logo alt
    expect(f.links.map((l) => l.url)).toContain("https://lavanta.test/menu");
    expect(pageIssues(f, true)).toEqual([]);
  });

  it("flags missing head basics, unnamed controls, dead links and bad JSON-LD", () => {
    const html = `<html><head><title>${"Çok uzun bir başlık ".repeat(5)}</title><meta name="description" content="Kısa."><script type="application/ld+json">{"@type": "Bakery",}</script></head>
<body><h1>Bir</h1><h1>İki</h1><img src="/a.jpg"><img src="/b.jpg" alt=""><a href="/sepet"><svg aria-hidden="true"></svg></a><button><svg></svg></button><button aria-label="Kapat"><svg></svg></button><a href="#">Detay</a><a href="#" role="button">Aç</a></body></html>`;
    const rules = pageIssues(analyzePage(html, "https://lavanta.test/"), true);
    const by = (r: string) => rules.filter((i) => i.rule === r);
    expect(by("html-lang")).toHaveLength(1);
    expect(by("viewport")).toHaveLength(1);
    expect(by("meta-length").map((i) => i.message).join(" ")).toMatch(/Title is \d+ characters.*Meta description is 5 characters/);
    expect(by("canonical")[0]!.message).toMatch(/No <link rel="canonical">/);
    expect(by("open-graph")[0]!.message).toBe("Missing og:title, og:description, og:image, og:url.");
    expect(by("json-ld-invalid")).toHaveLength(1);
    expect(by("h1")[0]!.message).toMatch(/2 <h1> elements/);
    expect(by("image-alt")[0]!.message).toMatch(/^1 image without alt: "\/a.jpg"/);
    expect(by("accessible-name")[0]!.message).toBe('1 link ("/sepet") and 1 button with no text or aria-label.');
    expect(by("dead-link")[0]!.message).toMatch(/^1 link with href="#"/);
  });

  it("detects placeholder contact details, lorem ipsum, fill-in fields and map links", () => {
    const html = `<html lang="en"><body><h1>Contact</h1>
<a href="tel:+905000000000">Call</a> <a href="https://wa.me/905000000000">WhatsApp</a> <a href="mailto:hello@example.com">Mail</a>
<p>Phone: 0212 555 55 55 · Fax 000 00 00 · info@ornek.com</p><p>Lorem ipsum dolor sit amet.</p><p>Address: [Street address], [City]</p>
<a href="https://maps.app.goo.gl/firin-lavanta">Map</a> <a href="https://maps.app.goo.gl/Xr7kQ2mPz9">Directions</a> <a href="https://g.page/r/CQd7x">Reviews</a></body></html>`;
    const issues = pageIssues(analyzePage(html, "https://lavanta.test/iletisim"), false);
    const ph = issues.find((i) => i.rule === "placeholder-content")!;
    expect(ph.severity).toBe("error");
    for (const part of ["phone link tel:+905000000000", "WhatsApp link https://wa.me/905000000000", "email hello@example.com"]) expect(ph.message).toContain(part);
    expect(ph.message).toContain('"Lorem ipsum" text');
    expect(ph.message).toContain("2 [fill-in] fields such as [Street address]");
    // Numbers and emails found only in text are a warning: they may be quoted on purpose.
    const soft = issues.find((i) => i.rule === "placeholder-content" && i.severity === "warning")!;
    for (const part of ['number "0212 555 55 55"', 'number "000 00 00"', "email info@ornek.com"]) expect(soft.message).toContain(part);
    expect(ph.message).toContain("invented map link https://maps.app.goo.gl/firin-lavanta");
    const map = issues.find((i) => i.rule === "map-link")!;
    expect(map.severity).toBe("info");
    expect(map.message).toContain("https://maps.app.goo.gl/Xr7kQ2mPz9");
    expect(map.message).toContain("https://g.page/r/CQd7x");
  });

  it("keeps real numbers and addresses", () => {
    const html = `<html lang="tr"><body><h1>İletişim</h1><a href="tel:+902163334455">0216 333 44 55</a><a href="mailto:merhaba@lavanta.test">Yaz</a><p>Sipariş: 0532 418 27 90. 2026 yılında 12.500 ekmek.</p></body></html>`;
    expect(pageIssues(analyzePage(html, "https://lavanta.test/iletisim"), false).filter((i) => i.rule === "placeholder-content")).toEqual([]);
  });

  it("isPlaceholderPhone", () => {
    for (const d of ["0000000", "02125555555", "905000000000", "5551234567"]) expect(isPlaceholderPhone(d), d).toBe(true);
    for (const d of ["02163334455", "05324182790"]) expect(isPlaceholderPhone(d), d).toBe(false);
  });

  it("warns when the HTML carries almost no text (client-rendered app)", () => {
    const html = `<html lang="en"><head><title>App</title></head><body><div id="root"></div><script src="/app.js"></script></body></html>`;
    expect(pageIssues(analyzePage(html, "https://lavanta.test/"), true).some((i) => i.rule === "client-rendered")).toBe(true);
  });
});

// --- robots / sitemap ---------------------------------------------------------------------------

describe("robots.txt", () => {
  const robots = parseRobots("User-agent: *\nDisallow: /admin/\nAllow: /admin/public\nDisallow: /*.pdf$\n\nUser-agent: GPTBot\nUser-agent: CCBot\nDisallow: /\n\nUser-agent: ClaudeBot\nDisallow: /private\n\nSitemap: https://lavanta.test/sitemap.xml");
  it("applies longest-match Allow/Disallow with wildcards", () => {
    expect(robots.sitemaps).toEqual(["https://lavanta.test/sitemap.xml"]);
    expect(isAllowed(robots, "vamos-ui-audit", "/menu")).toBe(true);
    expect(isAllowed(robots, "vamos-ui-audit", "/admin/x")).toBe(false);
    expect(isAllowed(robots, "vamos-ui-audit", "/admin/public/a")).toBe(true);
    expect(isAllowed(robots, "vamos-ui-audit", "/files/menu.pdf")).toBe(false);
    expect(isAllowed(robots, "GPTBot", "/menu")).toBe(false);
  });
  it("summarises the AI crawler policy", () => {
    const policy = Object.fromEntries(aiCrawlerPolicy(robots).map((c) => [c.agent, c.access]));
    expect(policy).toMatchObject({ GPTBot: "blocked", CCBot: "blocked", ClaudeBot: "partial", PerplexityBot: "allowed", "Google-Extended": "allowed" });
  });
  it("empty Disallow allows everything", () => {
    expect(isAllowed(parseRobots("User-agent: *\nDisallow:"), "Googlebot", "/")).toBe(true);
  });
});

describe("sitemap.xml", () => {
  it("counts URLs and rejects HTML or broken XML", () => {
    expect(parseSitemap(`<urlset><url><loc>https://lavanta.test/a?x=1&amp;y=2</loc></url></urlset>`)).toEqual({ valid: true, kind: "urlset", urls: ["https://lavanta.test/a?x=1&y=2"] });
    expect(parseSitemap(`<sitemapindex><sitemap><loc>https://lavanta.test/s1.xml</loc></sitemap></sitemapindex>`).kind).toBe("sitemapindex");
    expect(parseSitemap("<!doctype html><html></html>")).toMatchObject({ valid: false, error: "it is an HTML page, not XML" });
    expect(parseSitemap("<urlset><url><loc>https://lavanta.test/</loc></url>")).toMatchObject({ valid: false });
  });
});

// --- whole audit with a fake fetch ---------------------------------------------------------------

describe("runAudit", () => {
  it("crawls a site, follows redirects and reports broken links, heavy images and the robots policy", async () => {
    const log: string[] = [];
    const report = await runAudit("lavanta.test", { fetch: fakeSite(SITE, log), concurrency: 3 });
    expect(report.finalUrl).toBe("https://lavanta.test/");
    expect(report.fetch).toMatchObject({ status: 200, compression: "br", https: true, httpRedirectsToHttps: true });
    expect(report.fetch.hostVariant?.result).toBe("redirects to https://lavanta.test/");
    expect(report.head?.jsonLdTypes).toEqual(["Bakery", "WebSite"]);
    expect(report.files.robots).toMatchObject({ found: true, blocksAll: false });
    expect(report.files.sitemap).toMatchObject({ found: true, valid: true, urls: 3 });
    expect(report.files.llmsTxt).toBe(true);
    expect(report.files.aiCrawlers.find((c) => c.agent === "GPTBot")!.access).toBe("blocked");
    // robots.txt Disallow: /admin/ is respected.
    expect(log.some((l) => l.includes("/admin/"))).toBe(false);
    expect(report.crawl.skippedByRobots).toBe(1);

    const rules = (r: string) => report.issues.filter((i) => i.rule === r);
    const broken = rules("broken-link")[0]!;
    expect(broken.severity).toBe("error");
    expect(broken.message).toContain("https://lavanta.test/eski-sayfa → 404 (on https://lavanta.test/)");
    expect(rules("legal-broken")[0]!.message).toContain("https://lavanta.test/kvkk returns 404");
    expect(rules("sitemap-broken")[0]!.message).toContain("https://lavanta.test/silinen → 404");
    expect(rules("image-weight")[0]!.message).toContain("https://lavanta.test/big.jpg (900 KB)");
    expect(rules("ai-crawlers")[0]!.message).toMatch(/blocks GPTBot/);
    expect(rules("duplicate-title")).toEqual([]);
    expect(rules("security-headers")).toEqual([]);
    expect(report.legal.map((l) => l.kind).sort()).toEqual(["cookies", "kvkk", "privacy"]);
    expect(report.crawl.pages.map((p) => p.url)).toContain("https://lavanta.test/menu");
    expect(report.score).toBeLessThan(100);
    expect(report.summary.errors).toBeGreaterThan(0);

    const text = formatAuditText(report);
    expect(text).toMatch(/^Audit of https:\/\/lavanta\.test\/ \(from https:\/\/lavanta\.test\/\)|^Audit of https:\/\/lavanta\.test\//);
    expect(text).toContain("Errors (");
    expect(text).toContain("[broken-link]");
  });

  it("respects maxPages", async () => {
    const report = await runAudit("https://lavanta.test/", { fetch: fakeSite(SITE), maxPages: 2, hostVariants: false });
    expect(report.crawl.pages.filter((p) => p.status === 200 && p.title).length).toBeLessThanOrEqual(2);
  });

  it("flags a site that blocks crawlers, has no sitemap and duplicates www", async () => {
    const routes: Record<string, Route> = {
      "https://kapali.test/": { body: page("Kapalı") },
      "https://www.kapali.test/": { body: page("Kapalı") },
      "http://kapali.test/": { body: page("Kapalı") },
      "https://kapali.test/robots.txt": { body: "User-agent: *\nDisallow: /\n", headers: { "content-type": "text/plain" } },
    };
    const report = await runAudit("https://kapali.test", { fetch: fakeSite(routes) });
    const ids = new Set(report.issues.map((i) => i.rule));
    for (const r of ["robots-blocks-all", "sitemap", "llms-txt", "host-duplicate", "http-not-redirected", "security-headers"]) expect(ids, r).toContain(r);
    expect(report.files.robots?.blocksAll).toBe(true);
  });

  it("reports a page that cannot be loaded", async () => {
    const report = await runAudit("https://yok.test", { fetch: async () => { throw Object.assign(new TypeError("fetch failed"), { cause: { code: "ENOTFOUND" } }); } });
    expect(report.issues).toEqual([expect.objectContaining({ rule: "fetch-failed", severity: "error", message: expect.stringContaining("ENOTFOUND") })]);
    expect(report.score).toBe(88);
  });

  it("asks the guard before every hop and stops at a refused redirect", async () => {
    const seen: string[] = [];
    const routes: Record<string, Route> = { "https://kacak.test/": { status: 302, headers: { location: "http://169.254.169.254/latest/meta-data/" } } };
    const report = await runAudit("https://kacak.test/", {
      fetch: fakeSite(routes),
      guard: (u) => {
        seen.push(u.href);
        if (u.hostname === "169.254.169.254") throw new AuditRefusedError(`${u.hostname} is a private address`);
      },
    });
    expect(seen).toEqual(["https://kacak.test/", "http://169.254.169.254/latest/meta-data/"]);
    expect(report.issues[0]).toMatchObject({ rule: "refused-address", severity: "error" });
  });

  it("stops at the deadline and says so", async () => {
    const slow: FetchLike = (url, init) => new Promise((resolve, reject) => {
      const t = setTimeout(() => resolve(new Response(page("Yavaş", `<a href="/a">a</a><a href="/b">b</a>`), { headers: { "content-type": "text/html" } })), 30);
      init.signal?.addEventListener("abort", () => { clearTimeout(t); reject(new Error("aborted")); });
    });
    const report = await runAudit("https://yavas.test/", { fetch: slow, deadlineMs: 50, hostVariants: false });
    expect(report.durationMs).toBeLessThan(2000);
    expect(report.issues.some((i) => i.rule === "truncated")).toBe(true);
  });
});

describe("vamos-ui audit command", () => {
  it("prints help without a URL and rejects a bad one", async () => {
    expect(await run(["audit", "--help"], { interactive: false })).toBe(0);
    expect(await run(["audit", "ftp://lavanta.test", "--json"], { interactive: false })).toBe(1);
  });
});

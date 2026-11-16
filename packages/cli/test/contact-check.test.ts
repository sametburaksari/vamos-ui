import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runDeployChecks, type FetchLike } from "../src/audit";
import { formEndpoint, headersFromFile } from "../src/commands/site-check";
import { headersFile } from "../src/project";

const ORIGIN = "https://sayfakitap.example";
const HEADERS = {
  "strict-transport-security": "max-age=31536000",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "SAMEORIGIN",
  "permissions-policy": "camera=()",
};

/** A tiny fake host: every GET answers a page with the given headers, POST /api/contact answers `contact`. */
function host(contact: number | null, headers: Record<string, string> = HEADERS): { fetch: FetchLike; posts: string[] } {
  const posts: string[] = [];
  const fetch: FetchLike = async (url, init) => {
    const u = new URL(url);
    if (init.method === "POST") {
      posts.push(u.pathname);
      expect(init.body ?? null).toBeNull();
      return new Response(null, { status: u.pathname === "/api/contact" && contact ? contact : 404 });
    }
    if (u.protocol === "http:") return new Response(null, { status: 301, headers: { location: `${ORIGIN}${u.pathname}` } });
    if (u.hostname.startsWith("www.")) return new Response(null, { status: 301, headers: { location: `${ORIGIN}/` } });
    if (u.pathname.startsWith("/vamos-ui-check-")) return new Response("missing", { status: 404 });
    if (u.pathname === "/robots.txt") return new Response(`User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml`, { status: 200, headers: { "content-type": "text/plain" } });
    if (u.pathname === "/sitemap.xml") return new Response(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${ORIGIN}/</loc></url></urlset>`, { status: 200 });
    return new Response("<!doctype html><title>Sayfa</title>", { status: 200, headers: { "content-type": "text/html", ...headers } });
  };
  return { fetch, posts };
}

const byId = (checks: { id: string; status: string }[], id: string) => checks.find((c) => c.id === id);

describe("site check: contact endpoint and _headers", () => {
  it("an empty POST answered 405/415/422 passes; 404 fails; no endpoint, no check", async () => {
    for (const status of [400, 405, 415, 422]) {
      const h = host(status);
      const r = await runDeployChecks(ORIGIN, { fetch: h.fetch, formEndpoint: "/api/contact" });
      expect(byId(r.checks, "contact-endpoint")?.status).toBe("pass");
      expect(h.posts).toEqual(["/api/contact"]);
    }
    const missing = await runDeployChecks(ORIGIN, { fetch: host(null).fetch, formEndpoint: "/api/contact" });
    expect(byId(missing.checks, "contact-endpoint")?.status).toBe("fail");
    const open = await runDeployChecks(ORIGIN, { fetch: host(200).fetch, formEndpoint: "/api/contact" });
    expect(byId(open.checks, "contact-endpoint")?.status).toBe("warn");
    const none = host(405);
    const r = await runDeployChecks(ORIGIN, { fetch: none.fetch });
    expect(byId(r.checks, "contact-endpoint")).toBeUndefined();
    expect(none.posts).toEqual([]);
  });

  it("headers from public/_headers must be served", async () => {
    const names = headersFromFile(headersFile() + "/*\n  Cross-Origin-Opener-Policy: same-origin\n");
    expect(names).toEqual(expect.arrayContaining(["strict-transport-security", "x-frame-options", "cross-origin-opener-policy"]));
    expect(names).not.toContain("cache-control");
    const r = await runDeployChecks(ORIGIN, { fetch: host(405).fetch, expectedHeaders: names });
    const c = r.checks.find((x) => x.id === "security-headers")!;
    expect(c.status).toBe("warn");
    expect(c.message.en).toContain("cross-origin-opener-policy");
    const ok = await runDeployChecks(ORIGIN, { fetch: host(405, { ...HEADERS, "cross-origin-opener-policy": "same-origin" }).fetch, expectedHeaders: names });
    expect(ok.checks.find((x) => x.id === "security-headers")!.status).toBe("pass");
  });

  it("finds the endpoint from the project files, the plan or the flag", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "vb-endpoint-"));
    expect(formEndpoint(dir, undefined, undefined)).toBeNull();
    expect(formEndpoint(dir, "edge", undefined)).toBe("/api/contact");
    expect(formEndpoint(dir, "php-mail", undefined)).toBe("/contact.php");
    expect(formEndpoint(dir, undefined, "/form")).toBe("/form");
    mkdirSync(path.join(dir, "functions/api"), { recursive: true });
    writeFileSync(path.join(dir, "functions/api/contact.ts"), "");
    expect(formEndpoint(dir, "php-mail", undefined)).toBe("/api/contact");
  });
});

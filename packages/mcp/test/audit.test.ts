import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import { auditSite, isBlockedAddress, loadAudit, publicOnlyGuard, type Lookup } from "../src/audit-tool.js";
import { createServer } from "../src/server.js";
import { FIXTURE_DIR } from "./helpers.js";

const hasAudit = !!(await loadAudit());

describe("isBlockedAddress", () => {
  it.each([
    "127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "100.64.0.1", "100.127.255.254", "169.254.169.254",
    "0.0.0.0", "224.0.0.1", "255.255.255.255", "198.18.0.1",
    "::1", "::", "fe80::1", "fd00:ec2::254", "fc00::1", "::ffff:127.0.0.1", "::ffff:169.254.169.254", "64:ff9b::a9fe:a9fe", "2002:7f00:1::1", "ff02::1", "not-an-ip",
  ])("blocks %s", (ip) => expect(isBlockedAddress(ip)).toBe(true));
  it.each(["93.184.216.34", "1.1.1.1", "172.32.0.1", "100.128.0.1", "2606:4700:4700::1111", "::ffff:1.1.1.1"])("allows %s", (ip) => expect(isBlockedAddress(ip)).toBe(false));
});

describe("publicOnlyGuard", () => {
  const lookup: Lookup = async (host) => {
    if (host === "lavanta.test") return [{ address: "93.184.216.34", family: 4 }];
    if (host === "rebind.test") return [{ address: "93.184.216.34", family: 4 }, { address: "10.0.0.5", family: 4 }];
    throw Object.assign(new Error("not found"), { code: "ENOTFOUND" });
  };
  const guard = publicOnlyGuard(lookup);
  const refused = (u: string) => guard(new URL(u)).then(() => null, (e: Error) => e.message);
  it("allows public hosts and refuses private, internal and odd ones", async () => {
    expect(await refused("https://lavanta.test/menu")).toBeNull();
    expect(await refused("https://rebind.test/")).toMatch(/resolves to 10\.0\.0\.5/);
    expect(await refused("http://127.0.0.1/")).toMatch(/Refused 127\.0\.0\.1/);
    expect(await refused("http://2130706433/")).toMatch(/Refused 127\.0\.0\.1/); // decimal form, normalised by URL
    expect(await refused("http://[::ffff:a9fe:a9fe]/latest/meta-data/")).toMatch(/Refused/);
    expect(await refused("http://metadata.google.internal/")).toMatch(/internal host names/);
    expect(await refused("http://printer.local/")).toMatch(/internal host names/);
    expect(await refused("http://localhost:3000/")).toMatch(/port 3000/);
    expect(await refused("https://lavanta.test:22/")).toMatch(/port 22/);
    expect(await refused("https://user:pw@lavanta.test/")).toMatch(/credentials/);
    expect(await refused("https://nowhere.test/")).toMatch(/Could not resolve nowhere\.test \(ENOTFOUND\)/);
  });
});

describe.skipIf(!hasAudit)("audit_site", () => {
  const html = `<!doctype html><html lang="en"><head><title>Lavanta Bakery</title></head><body><h1>Bakery</h1><a href="/menu">Menu</a></body></html>`;
  const fetch = async (url: string, init: RequestInit) => {
    if (url === "https://lavanta.test/") return new Response(html, { headers: { "content-type": "text/html" } });
    if (url === "https://lavanta.test/menu") return new Response(null, { status: 302, headers: { location: "http://10.0.0.5/" } });
    void init;
    return new Response("nope", { status: 404 });
  };
  const lookup: Lookup = async () => [{ address: "93.184.216.34", family: 4 }];

  it("runs the audit with the guard on every hop in hosted mode", async () => {
    const result = await auditSite({ url: "lavanta.test", maxPages: 99 }, { remote: true, version: "0.0.0", fetch, lookup });
    expect(result.text).toMatch(/^Audit of https:\/\/lavanta\.test\//);
    expect(result.text).toMatch(/Score \d+\/100/);
    const data = result.data as { crawl: { pages: { url: string; status: number }[] }; issues: { rule: string; message: string }[] };
    // The redirect to 10.0.0.5 was refused, never fetched.
    expect(data.issues.some((i) => i.rule === "link-unreachable" && /10\.0\.0\.5|menu/.test(i.message))).toBe(true);
  });

  it("refuses a private start URL on the hosted server", async () => {
    await expect(auditSite({ url: "http://192.168.1.1/" }, { remote: true, version: "0.0.0", fetch, lookup })).rejects.toThrow(/Refused 192\.168\.1\.1.*npx vamos-ui audit/);
  });

  it("is registered as a read-only, open-world tool", async () => {
    const { server } = createServer({ source: FIXTURE_DIR, remote: true });
    const [a, b] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "t", version: "1.0.0" });
    await Promise.all([server.connect(b), client.connect(a)]);
    const tool = (await client.listTools()).tools.find((t) => t.name === "audit_site")!;
    expect(tool.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false, openWorldHint: true });
    const bad = (await client.callTool({ name: "audit_site", arguments: { url: "ftp://lavanta.test" } })) as { isError?: boolean; content: { text: string }[] };
    expect(bad.isError).toBe(true);
    await client.close();
  });
});

describe("pinnedFetch (hosted)", () => {
  it("refuses a host whose connect-time lookup returns a private address (DNS rebinding)", async () => {
    const { pinnedFetch } = await import("../src/audit-tool");
    let calls = 0;
    // The guard's lookup would have seen a public address; the connection's lookup sees loopback.
    const lookup = async () => (calls++ === 0 ? [{ address: "127.0.0.1", family: 4 }] : [{ address: "127.0.0.1", family: 4 }]);
    await expect(pinnedFetch(lookup)("http://rebind.test/", { method: "GET" })).rejects.toThrow(/private or reserved/);
    expect(calls).toBeGreaterThan(0);
  });
});

/**
 * audit_site: runs the CLI's live-site audit ("vamos-ui/audit") from the MCP server.
 *
 * The hosted server fetches URLs that a model chose, so every request (start URL, each
 * redirect hop, every crawled page, link and image) passes a guard that resolves the host and
 * refuses loopback, private, link-local, CGNAT, multicast, reserved and cloud-metadata
 * addresses and non-standard ports. Pages, time and response size are capped.
 */

import { lookup as dnsLookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { Readable } from "node:stream";
import zlib from "node:zlib";
import { isIP } from "node:net";
import type { AuditReport, FetchLike } from "vamos-ui/audit";
import type { ToolAnswer } from "./design-tools.js";
import { ToolError } from "./tools.js";

type AuditModule = typeof import("vamos-ui/audit");

let loaded: Promise<AuditModule | null> | undefined;
let loadError: string | undefined;

/** Loads the audit library lazily; null (with a reason) when the CLI is not built. */
export function loadAudit(): Promise<AuditModule | null> {
  loaded ??= import("vamos-ui/audit").then(
    (mod) => {
      if (typeof (mod as Partial<AuditModule>).runAudit !== "function") {
        loadError = '"vamos-ui/audit" does not export runAudit().';
        return null;
      }
      return mod as AuditModule;
    },
    (error: unknown) => {
      loadError = (error as Error)?.message ?? String(error);
      return null;
    },
  );
  return loaded;
}

/** Test hook. */
export function setAuditModule(mod: AuditModule | null | undefined): void {
  loaded = mod === undefined ? undefined : Promise.resolve(mod);
  loadError = mod === null ? "audit disabled" : undefined;
}

// --- address checks ----------------------------------------------------------------------

const V4_BLOCKED: [string, number][] = [
  ["0.0.0.0", 8], // "this" network
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // CGNAT (also Tailscale)
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local, cloud metadata 169.254.169.254
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.0.2.0", 24], // documentation
  ["192.88.99.0", 24], // 6to4 relay
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // documentation
  ["203.0.113.0", 24], // documentation
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved + broadcast
];

const v4ToInt = (ip: string) => ip.split(".").reduce((n, p) => (n << 8) + Number(p), 0) >>> 0;

function blockedV4(ip: string): boolean {
  const n = v4ToInt(ip);
  return V4_BLOCKED.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (n & mask) === (v4ToInt(base) & mask);
  });
}

/** Expands an IPv6 address into 8 16-bit groups (handles :: and an embedded IPv4 tail). */
function v6Groups(ip: string): number[] | null {
  let s = ip.toLowerCase().replace(/%.*$/, "");
  const v4 = /(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (v4) {
    const n = v4ToInt(v4[1]!);
    s = s.slice(0, -v4[1]!.length) + `${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`;
  }
  const [head, tail] = s.split("::");
  const h = head ? head.split(":") : [];
  const t = tail !== undefined ? (tail ? tail.split(":") : []) : null;
  const groups = t === null ? h : [...h, ...Array(8 - h.length - t.length).fill("0"), ...t];
  if (groups.length !== 8) return null;
  const nums = groups.map((g) => parseInt(g, 16));
  return nums.some((x) => !Number.isFinite(x) || x < 0 || x > 0xffff) ? null : nums;
}

function blockedV6(ip: string): boolean {
  const g = v6Groups(ip);
  if (!g) return true;
  const embedded = () => `${g[6]! >> 8}.${g[6]! & 0xff}.${g[7]! >> 8}.${g[7]! & 0xff}`;
  if (g.every((x) => x === 0)) return true; // ::
  if (g.slice(0, 7).every((x) => x === 0) && g[7] === 1) return true; // ::1
  if (g.slice(0, 5).every((x) => x === 0) && (g[5] === 0xffff || g[5] === 0)) return blockedV4(embedded()); // ::ffff:a.b.c.d, ::a.b.c.d
  if (g[0] === 0x64 && g[1] === 0xff9b) return blockedV4(embedded()); // NAT64
  if (g[0] === 0x2002) return blockedV4(`${g[1]! >> 8}.${g[1]! & 0xff}.${g[2]! >> 8}.${g[2]! & 0xff}`); // 6to4
  const first = g[0]!;
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local (incl. fd00:ec2::254 metadata)
  if ((first & 0xffc0) === 0xfe80) return true; // link-local
  if ((first & 0xffc0) === 0xfec0) return true; // site-local (deprecated)
  if ((first & 0xff00) === 0xff00) return true; // multicast
  if (first === 0x2001 && g[1] === 0x0db8) return true; // documentation
  if (first === 0x0100 && g.slice(1, 4).every((x) => x === 0)) return true; // discard
  return false;
}

/** True for addresses an audit from the hosted server must never reach. */
export function isBlockedAddress(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return blockedV4(ip);
  if (kind === 6) return blockedV6(ip);
  return true;
}

const BLOCKED_HOST = /(?:^|\.)(?:localhost|local|internal|intranet|lan|home\.arpa|localdomain)$|^metadata(?:\.google\.internal)?$/i;
const ALLOWED_PORTS = new Set(["", "80", "443", "8080", "8443"]);

export type Lookup = (host: string) => Promise<{ address: string; family: number }[]>;
const defaultLookup: Lookup = (host) => dnsLookup(host, { all: true, verbatim: true });

export class RefusedUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RefusedUrlError";
  }
}

/**
 * Builds the guard the audit calls before each request. Resolves the hostname and refuses it
 * when any of its addresses is private. The hosted fetch (pinnedFetch) checks the address again
 * at connect time, so DNS rebinding between the two lookups is refused as well.
 */
export function publicOnlyGuard(lookup: Lookup = defaultLookup): (url: URL) => Promise<void> {
  const cache = new Map<string, Promise<void>>();
  return (url: URL) => {
    if (url.protocol !== "http:" && url.protocol !== "https:") return Promise.reject(new RefusedUrlError(`Refused ${url.protocol} URL: only http and https.`));
    if (url.username || url.password) return Promise.reject(new RefusedUrlError("Refused a URL with credentials in it."));
    if (!ALLOWED_PORTS.has(url.port)) return Promise.reject(new RefusedUrlError(`Refused port ${url.port}: the hosted audit only uses ports 80, 443, 8080 and 8443.`));
    const host = url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
    let check = cache.get(host);
    if (!check) {
      check = (async () => {
        if (BLOCKED_HOST.test(host)) throw new RefusedUrlError(`Refused ${host}: local and internal host names cannot be reached from the hosted server.`);
        if (isIP(host)) {
          if (isBlockedAddress(host)) throw new RefusedUrlError(`Refused ${host}: private, loopback, link-local or reserved addresses cannot be reached from the hosted server.`);
          return;
        }
        let addresses: { address: string }[];
        try {
          addresses = await lookup(host);
        } catch (error) {
          throw new RefusedUrlError(`Could not resolve ${host} (${(error as { code?: string }).code ?? (error as Error).message}).`);
        }
        if (!addresses.length) throw new RefusedUrlError(`${host} has no address.`);
        const bad = addresses.find((a) => isBlockedAddress(a.address));
        if (bad) throw new RefusedUrlError(`Refused ${host}: it resolves to ${bad.address}, a private or reserved address.`);
      })();
      cache.set(host, check);
    }
    return check;
  };
}

/** Decodes a gzip, deflate or br response stream; other encodings pass through unchanged. */
export function decodeBody(stream: Readable, encoding: string | string[] | undefined): Readable {
  const enc = String(encoding ?? "").trim().toLowerCase();
  const decoder = enc === "gzip" || enc === "x-gzip" ? zlib.createGunzip() : enc === "deflate" ? zlib.createInflate() : enc === "br" ? zlib.createBrotliDecompress() : null;
  if (!decoder) return stream;
  stream.on("error", (err) => decoder.destroy(err));
  return stream.pipe(decoder);
}

/**
 * fetch for the hosted server that checks the address it actually connects to: Node's
 * `lookup` hook runs at connect time, so a host that answers the guard's lookup with a public
 * address and the connection's lookup with a private one (DNS rebinding) is refused too.
 * Never follows redirects (the audit follows them itself, through the guard).
 */
export function pinnedFetch(lookup: Lookup = defaultLookup): FetchLike {
  const connectLookup = (hostname: string, opts: { all?: boolean }, cb: (err: Error | null, address: string | { address: string; family: number }[], family?: number) => void) => {
    lookup(hostname)
      .then((addresses) => {
        const bad = addresses.find((a) => isBlockedAddress(a.address));
        if (!addresses.length) throw new RefusedUrlError(`${hostname} has no address.`);
        if (bad) throw new RefusedUrlError(`Refused ${hostname}: it resolves to ${bad.address}, a private or reserved address.`);
        if (opts?.all) cb(null, addresses);
        else cb(null, addresses[0]!.address, addresses[0]!.family);
      })
      .catch((err: Error) => cb(err, ""));
  };
  return (input, init = {}) =>
    new Promise<Response>((resolve, reject) => {
      const url = new URL(input);
      const mod = url.protocol === "https:" ? https : http;
      const headers: Record<string, string> = {};
      new Headers(init.headers as HeadersInit | undefined).forEach((v, k) => (headers[k] = v));
      const host = url.hostname.replace(/^\[|\]$/g, "");
      if (isIP(host) && isBlockedAddress(host)) return reject(new RefusedUrlError(`Refused ${host}: a private or reserved address.`));
      const req = mod.request(url, { method: init.method ?? "GET", headers, lookup: connectLookup as never, signal: init.signal ?? undefined }, (res) => {
        const status = res.statusCode ?? 0;
        const out = new Headers();
        for (const [k, v] of Object.entries(res.headers)) if (v !== undefined) out.set(k, Array.isArray(v) ? v.join(", ") : String(v));
        const noBody = init.method === "HEAD" || status === 204 || status === 304 || status < 200;
        if (noBody) res.resume();
        // node:http does not decode bodies the way fetch does; decode here so the audit reads HTML.
        // The audit's byte cap applies to the decoded stream, which also bounds compression bombs.
        resolve(new Response(noBody ? null : (Readable.toWeb(decodeBody(res, res.headers["content-encoding"])) as ReadableStream<Uint8Array>), { status, statusText: res.statusMessage, headers: out }));
      });
      req.on("error", reject);
      req.end();
    });
}

// --- the tool -------------------------------------------------------------------------------

export const AUDIT_LIMITS = {
  remote: { defaultPages: 10, maxPages: 30, deadlineMs: 45_000, timeoutMs: 8_000, maxBytes: 2 * 1024 * 1024, maxLinks: 60, maxImages: 20, concurrency: 4 },
  local: { defaultPages: 10, maxPages: 30, deadlineMs: 90_000, timeoutMs: 10_000, maxBytes: 5 * 1024 * 1024, maxLinks: 150, maxImages: 40, concurrency: 6 },
} as const;
/** Audits running at once in this process (the hosted server is shared). */
const MAX_PARALLEL = 3;
let running = 0;

export interface AuditToolOptions {
  remote: boolean;
  version: string;
  /** Test hooks. */
  fetch?: FetchLike;
  lookup?: Lookup;
}

export async function auditSite(args: { url: string; maxPages?: number }, options: AuditToolOptions): Promise<ToolAnswer> {
  const mod = await loadAudit();
  if (!mod) throw new ToolError(`The site audit is not available: ${loadError ?? "vamos-ui/audit could not be loaded"}. Run npx vamos-ui audit <url> instead.`);
  let url: string;
  try {
    url = mod.normalizeAuditUrl(args.url);
  } catch (error) {
    throw new ToolError(`"${args.url}" is not an http(s) URL: ${(error as Error).message}`);
  }
  if (running >= MAX_PARALLEL) throw new ToolError("The server is already running several audits. Try again in a minute, or run npx vamos-ui audit <url> locally.");
  const limits = options.remote ? AUDIT_LIMITS.remote : AUDIT_LIMITS.local;
  const maxPages = Math.max(1, Math.min(Math.floor(args.maxPages ?? limits.defaultPages), limits.maxPages));
  running++;
  let report: AuditReport;
  try {
    report = await mod.runAudit(url, {
      fetch: options.fetch ?? (options.remote ? pinnedFetch(options.lookup) : undefined),
      maxPages,
      concurrency: limits.concurrency,
      timeoutMs: limits.timeoutMs,
      deadlineMs: limits.deadlineMs,
      maxBytes: limits.maxBytes,
      maxLinks: limits.maxLinks,
      maxImages: limits.maxImages,
      // The local server may audit a dev server on localhost; the hosted one never.
      guard: options.remote ? publicOnlyGuard(options.lookup) : undefined,
      userAgent: `vamos-ui-audit/${options.version} (+https://ui.vamos.ist/docs/mcp)`,
    });
  } finally {
    running--;
  }
  const refused = report.issues.find((i) => i.rule === "refused-address");
  if (refused && !report.crawl.pages.length) throw new ToolError(`${refused.message} This hosted server audits public websites only; for a local or private site run npx vamos-ui audit <url> on your machine.`);
  const text = `${mod.formatAuditText(report)}\n\nThe full report (every page, link and image) is in the structured result. For more pages, external links or CI use: npx vamos-ui audit ${report.finalUrl} --max-pages 100 --json`;
  return { text, data: report as unknown as Record<string, unknown> };
}

/** HTTP helpers for the audit: manual redirects (each hop checked by the guard), timeouts, size caps. Pure (global fetch only). */

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/** Thrown by a guard to refuse a URL (e.g. a private address on a hosted server). */
export class AuditRefusedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditRefusedError";
  }
}

export interface HttpOptions {
  fetch: FetchLike;
  userAgent: string;
  timeoutMs: number;
  maxBytes: number;
  maxRedirects: number;
  /** Called before every request, including each redirect hop. Throw AuditRefusedError to refuse. */
  guard?: (url: URL) => void | Promise<void>;
  /** Milliseconds left in the whole audit; requests stop early when it runs out. */
  remaining: () => number;
}

export interface Fetched {
  url: string;
  finalUrl: string;
  status: number;
  chain: { url: string; status: number }[];
  headers: Headers | null;
  body: string | null;
  bytes: number;
  truncated: boolean;
  ms: number;
  error?: string;
  refused?: boolean;
}

function decoder(contentType: string | null): TextDecoder {
  const charset = /charset=["']?([\w-]+)/i.exec(contentType ?? "")?.[1];
  try {
    return new TextDecoder(charset || "utf-8");
  } catch {
    return new TextDecoder("utf-8");
  }
}

async function readBody(res: Response, max: number): Promise<{ text: string; bytes: number; truncated: boolean }> {
  const dec = decoder(res.headers.get("content-type"));
  if (!res.body) {
    const buf = new Uint8Array(await res.arrayBuffer());
    return { text: dec.decode(buf.subarray(0, max)), bytes: buf.byteLength, truncated: buf.byteLength > max };
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  let truncated = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > max) {
      chunks.push(value.subarray(0, value.byteLength - (bytes - max)));
      truncated = true;
      await reader.cancel().catch(() => {});
      break;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(Math.min(bytes, max));
  let at = 0;
  for (const c of chunks) {
    all.set(c, at);
    at += c.byteLength;
  }
  return { text: dec.decode(all), bytes, truncated };
}

const discard = (res: Response) => res.body?.cancel().catch(() => {});

/**
 * Requests a URL, following redirects by hand so every hop is recorded and passes the guard.
 * Never throws: network errors, timeouts and refusals come back in `error`.
 */
export async function request(rawUrl: string, method: "GET" | "HEAD", opts: HttpOptions, read = method === "GET"): Promise<Fetched> {
  const started = Date.now();
  const chain: { url: string; status: number }[] = [];
  let url = rawUrl;
  const result = (extra: Partial<Fetched>): Fetched => ({ url: rawUrl, finalUrl: url, status: 0, chain, headers: null, body: null, bytes: 0, truncated: false, ms: Date.now() - started, ...extra });
  for (let hop = 0; hop <= opts.maxRedirects; hop++) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return result({ error: `invalid URL "${url}"` });
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return result({ error: `unsupported protocol ${parsed.protocol}`, refused: true });
    try {
      await opts.guard?.(parsed);
    } catch (error) {
      return result({ error: (error as Error).message, refused: true });
    }
    const left = opts.remaining();
    if (left <= 0) return result({ error: "audit time limit reached" });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), Math.min(opts.timeoutMs, left));
    try {
      const res = await opts.fetch(url, {
        method,
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "user-agent": opts.userAgent, accept: method === "GET" ? "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" : "*/*", "accept-encoding": "gzip, deflate, br" },
      });
      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        chain.push({ url, status: res.status });
        await discard(res);
        url = new URL(location, url).href;
        continue;
      }
      if (!read) {
        await discard(res);
        return result({ status: res.status, headers: res.headers });
      }
      const body = await readBody(res, opts.maxBytes);
      return result({ status: res.status, headers: res.headers, body: body.text, bytes: body.bytes, truncated: body.truncated });
    } catch (error) {
      const e = error as Error & { cause?: { code?: string; message?: string } };
      const msg = ctrl.signal.aborted ? `timed out after ${Math.round(Math.min(opts.timeoutMs, left) / 1000)} s` : e.cause?.code ?? e.cause?.message ?? e.message;
      return result({ error: msg });
    } finally {
      clearTimeout(timer);
    }
  }
  return result({ error: `more than ${opts.maxRedirects} redirects` });
}

/** HEAD, falling back to GET (body discarded) for servers that do not answer HEAD properly. */
export async function probe(url: string, opts: HttpOptions): Promise<Fetched> {
  const head = await request(url, "HEAD", opts);
  if (head.refused || (head.status && ![403, 404, 405, 406, 429, 500, 501, 503].includes(head.status) && !head.error)) return head;
  const get = await request(url, "GET", opts, false);
  return get.status || !head.status ? get : head;
}

/** Runs tasks with a fixed number in flight. */
export async function pool<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, async () => {
    while (next < items.length) await fn(items[next++]!);
  });
  await Promise.all(workers);
}

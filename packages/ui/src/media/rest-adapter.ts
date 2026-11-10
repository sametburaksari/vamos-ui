// REST adapter for the default vamos-ui media endpoints (plan 05 · D2), plus a presigned-upload
// helper for S3 / R2. Upload progress uses XHR: fetch upload progress is still unreliable.
import type { MediaAdapter, MediaAsset, MediaCapabilities, MediaEvent, MediaFolder, MediaPage, MediaQuery, UploadOptions, ImageLoader } from "./types";

type HeadersSource = HeadersInit | (() => HeadersInit | Promise<HeadersInit>);

export interface XhrUploadOptions {
  method?: "POST" | "PUT";
  headers?: Record<string, string>;
  /** Sent as-is (a `File`/`Blob` for a presigned PUT, `FormData` for multipart). */
  body: XMLHttpRequestBodyInit;
  signal?: AbortSignal;
  onProgress?: (p: { loaded: number; total: number }) => void;
  withCredentials?: boolean;
}

/** XHR request with upload progress and abort. Resolves with the parsed JSON body (or `null`). */
export function xhrUpload<T = unknown>(url: string, { method = "POST", headers = {}, body, signal, onProgress, withCredentials }: XhrUploadOptions): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (withCredentials) xhr.withCredentials = true;
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.({ loaded: e.loaded, total: e.total });
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve((xhr.responseText ? JSON.parse(xhr.responseText) : null) as T);
        } catch {
          resolve(null as T);
        }
      } else reject(new Error(errorMessage(xhr.responseText, xhr.status)));
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(body);
  });
}

function errorMessage(text: string, status: number): string {
  try {
    const j = JSON.parse(text) as { message?: string; error?: string };
    if (j.message || j.error) return String(j.message ?? j.error);
  } catch {
    /* not JSON */
  }
  return `Request failed (${status})`;
}

/** What `sign` returns for one presigned upload. */
export interface PresignedTarget {
  /** Upload id the server uses to complete the upload. */
  id: string;
  /** Where to `PUT` (or `POST` with `fields`) the file. */
  url: string;
  method?: "PUT" | "POST";
  headers?: Record<string, string>;
  /** S3 POST policy fields; when set the file is sent as multipart with these fields first. */
  fields?: Record<string, string>;
}

export interface PresignedUploadOptions {
  sign: (file: File, o: { folderId?: string | null; alt?: string }) => Promise<PresignedTarget>;
  complete: (target: PresignedTarget, file: File) => Promise<MediaAsset>;
}

/**
 * S3 / R2 upload: sign → XHR `PUT` with real progress → complete. Use it as `createRestAdapter({ upload })`
 * or inside your own adapter's `upload`.
 *
 * ```ts
 * const upload = createPresignedUpload({
 *   sign: (file) => api.post("/uploads", { name: file.name, type: file.type, size: file.size }),
 *   complete: (t) => api.post(`/uploads/${t.id}/complete`),
 * });
 * ```
 */
export function createPresignedUpload({ sign, complete }: PresignedUploadOptions): (file: File, opts: UploadOptions) => Promise<MediaAsset> {
  return async (file, opts) => {
    const target = await sign(file, { folderId: opts.folderId, alt: opts.alt });
    if (opts.signal.aborted) throw new DOMException("Aborted", "AbortError");
    let body: XMLHttpRequestBodyInit = file;
    if (target.fields) {
      const form = new FormData();
      for (const [k, v] of Object.entries(target.fields)) form.append(k, v);
      form.append("file", file);
      body = form;
    }
    await xhrUpload(target.url, {
      method: target.method ?? (target.fields ? "POST" : "PUT"),
      headers: target.fields ? target.headers : { "Content-Type": file.type || "application/octet-stream", ...target.headers },
      body,
      signal: opts.signal,
      onProgress: opts.onProgress,
    });
    return complete(target, file);
  };
}

export interface RestAdapterOptions {
  /** API root, e.g. `"https://cms.example.com/api"`. Endpoints live under `{baseUrl}/media`. */
  baseUrl: string;
  /** Static headers or a function (fresh auth token per request). */
  headers?: HeadersSource;
  /** Send cookies (`credentials: "include"`). */
  credentials?: RequestCredentials;
  /** Custom fetch (tests, SSR). */
  fetch?: typeof fetch;
  /**
   * `"presigned"` (default): `POST /media/uploads` → PUT to the returned URL → `POST /media/uploads/:id/complete`.
   * `"multipart"`: one `POST /media` with `FormData`. A function replaces both (e.g. `createPresignedUpload`).
   */
  upload?: "presigned" | "multipart" | ((file: File, opts: UploadOptions) => Promise<MediaAsset>);
  capabilities?: Partial<MediaCapabilities>;
  loader?: ImageLoader;
  /** Server offers `POST /media/:id/suggest-alt`. */
  suggestAlt?: boolean;
  /** Live updates: `"sse"` opens `GET /media/events` (EventSource). Default off. */
  events?: "sse" | false;
}

/**
 * Adapter for the default vamos-ui media API:
 *
 * | Method | Endpoint |
 * |---|---|
 * | list | `GET /media?search&kind&accept&folderId&month&uploadedBy&unattached&sort&cursor&limit` → `MediaPage` |
 * | get / getMany | `GET /media/:id` · `GET /media?ids=a,b` |
 * | upload | `POST /media/uploads` → `PUT` → `POST /media/uploads/:id/complete` (or multipart `POST /media`) |
 * | update | `PATCH /media/:id` |
 * | remove | `DELETE /media?ids=a,b&permanent=1` |
 * | replace | `POST /media/:id/replace` (multipart) |
 * | sideload | `POST /media/sideload` `{ url, folderId, alt }` |
 * | folders | `GET · POST /media/folders`, `PATCH · DELETE /media/folders/:id` |
 * | events | `GET /media/events` (SSE, `data: MediaEvent`) |
 *
 * ```ts
 * const media = createRestAdapter({ baseUrl: "/api", headers: () => ({ Authorization: `Bearer ${token()}` }) });
 * ```
 */
export function createRestAdapter(options: RestAdapterOptions): MediaAdapter {
  const base = options.baseUrl.replace(/\/+$/, "") + "/media";
  const doFetch = options.fetch ?? ((...a: Parameters<typeof fetch>) => fetch(...a));
  const resolveHeaders = async (): Promise<Record<string, string>> => {
    const h = typeof options.headers === "function" ? await options.headers() : options.headers;
    return Object.fromEntries(new Headers(h ?? {}).entries());
  };

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = await resolveHeaders();
    if (init.body && typeof init.body === "string") headers["content-type"] ??= "application/json";
    const res = await doFetch(base + path, { credentials: options.credentials, ...init, headers: { accept: "application/json", ...headers, ...(init.headers as Record<string, string> | undefined) } });
    const text = await res.text();
    if (!res.ok) throw new Error(errorMessage(text, res.status));
    return (text ? JSON.parse(text) : undefined) as T;
  }
  const json = (body: unknown) => JSON.stringify(body);

  async function multipart(path: string, file: File, opts: UploadOptions): Promise<MediaAsset> {
    const form = new FormData();
    form.append("file", file);
    if (opts.folderId !== undefined) form.append("folderId", opts.folderId ?? "");
    if (opts.alt !== undefined) form.append("alt", opts.alt);
    return xhrUpload<MediaAsset>(base + path, {
      method: "POST",
      headers: await resolveHeaders(),
      body: form,
      signal: opts.signal,
      onProgress: opts.onProgress,
      withCredentials: options.credentials === "include",
    });
  }

  const presigned = createPresignedUpload({
    sign: (file, o) => request<PresignedTarget>("/uploads", { method: "POST", body: json({ filename: file.name, mime: file.type, size: file.size, folderId: o.folderId ?? null, alt: o.alt }) }),
    complete: (t) => request<MediaAsset>(`/uploads/${encodeURIComponent(t.id)}/complete`, { method: "POST" }),
  });
  const upload = typeof options.upload === "function" ? options.upload : options.upload === "multipart" ? (f: File, o: UploadOptions) => multipart("", f, o) : presigned;

  const adapter: MediaAdapter = {
    capabilities: { folders: true, replace: true, edit: true, trash: false, bulk: true, ...options.capabilities },
    loader: options.loader,
    list(q: MediaQuery, o) {
      return request<MediaPage>(`?${toSearchParams(q)}`, { signal: o?.signal });
    },
    get(id) {
      return request<MediaAsset>(`/${encodeURIComponent(id)}`);
    },
    async getMany(ids) {
      if (!ids.length) return [];
      const page = await request<MediaPage | MediaAsset[]>(`?ids=${ids.map(encodeURIComponent).join(",")}`);
      const list = Array.isArray(page) ? page : page.items;
      return ids.map((id) => list.find((a) => a.id === id)).filter((a): a is MediaAsset => Boolean(a));
    },
    upload,
    update(id, patch) {
      return request<MediaAsset>(`/${encodeURIComponent(id)}`, { method: "PATCH", body: json(patch) });
    },
    async remove(ids, o) {
      await request<void>(`?ids=${ids.map(encodeURIComponent).join(",")}${o?.permanent ? "&permanent=1" : ""}`, { method: "DELETE" });
    },
    replace(id, file, o) {
      return multipart(`/${encodeURIComponent(id)}/replace`, file, o);
    },
    async sideload(url, o) {
      o.onProgress({ loaded: 0, total: 1 });
      const asset = await request<MediaAsset>("/sideload", { method: "POST", body: json({ url, folderId: o.folderId ?? null, alt: o.alt }), signal: o.signal });
      o.onProgress({ loaded: 1, total: 1 });
      return asset;
    },
    folders: {
      list: () => request<MediaFolder[]>("/folders"),
      create: (name, parentId = null) => request<MediaFolder>("/folders", { method: "POST", body: json({ name, parentId }) }),
      rename: (id, name) => request<MediaFolder>(`/folders/${encodeURIComponent(id)}`, { method: "PATCH", body: json({ name }) }),
      remove: (id) => request<void>(`/folders/${encodeURIComponent(id)}`, { method: "DELETE" }),
    },
  };
  if (options.suggestAlt) adapter.suggestAlt = async (id) => (await request<{ alt: string }>(`/${encodeURIComponent(id)}/suggest-alt`, { method: "POST" })).alt;
  if (options.events === "sse") {
    adapter.subscribe = (cb: (e: MediaEvent) => void) => {
      if (typeof EventSource === "undefined") return () => {};
      const es = new EventSource(`${base}/events`, { withCredentials: options.credentials === "include" });
      es.onmessage = (m) => {
        try {
          cb(JSON.parse(m.data) as MediaEvent);
        } catch {
          /* ignore malformed events */
        }
      };
      return () => es.close();
    };
  }
  return adapter;
}

/** `MediaQuery` → URL search params (arrays joined with commas, `undefined` dropped). */
export function toSearchParams(q: MediaQuery): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === "" || v === false) continue;
    if (v === null) p.set(k, "null");
    else p.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  return p.toString();
}

import { foldText } from "../lib/text";
import type { MediaAdapter, MediaAsset, MediaEvent, MediaFolder, MediaKind, MediaQuery, UploadOptions } from "./types";

export interface MemoryAdapterOptions {
  /** Initial assets. */
  seed?: MediaAsset[];
  folders?: MediaFolder[];
  /** Simulated latency in ms. Default 120 (0 in tests is fine). */
  latency?: number;
  /** Simulated upload duration in ms. Default 900. */
  uploadDuration?: number;
  /** Locale for search folding (Turkish İ/ı). Default "en-US". */
  locale?: string;
  capabilities?: Partial<MediaAdapter["capabilities"]>;
}

const kindOf = (mime: string): MediaKind =>
  mime.startsWith("image/") ? "image" : mime.startsWith("video/") ? "video" : mime.startsWith("audio/") ? "audio" : /pdf|word|sheet|presentation|text/.test(mime) ? "document" : /zip|tar|rar|7z/.test(mime) ? "archive" : "other";

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

function acceptMatches(accept: string | undefined, a: MediaAsset): boolean {
  if (!accept) return true;
  return accept.split(",").some((raw) => {
    const rule = raw.trim().toLowerCase();
    if (!rule) return false;
    if (rule.startsWith(".")) return a.filename.toLowerCase().endsWith(rule);
    if (rule.endsWith("/*")) return a.mime.startsWith(rule.slice(0, -1));
    return a.mime === rule;
  });
}

/**
 * An in-memory adapter for docs, demos, prototypes and tests: object URLs for uploads,
 * simulated progress, locale-aware search. Nothing persists.
 *
 * ```ts
 * const adapter = createMemoryAdapter({ seed: assets, locale: "tr-TR" });
 * ```
 */
export function createMemoryAdapter(options: MemoryAdapterOptions = {}): MediaAdapter {
  const { latency = 120, uploadDuration = 900, locale = "en-US" } = options;
  let assets: MediaAsset[] = [...(options.seed ?? [])];
  let folders: MediaFolder[] = [...(options.folders ?? [])];
  const listeners = new Set<(e: MediaEvent) => void>();
  const emit = (e: MediaEvent) => listeners.forEach((l) => l(e));
  let seq = 0;
  const nextId = (p: string) => `${p}_${Date.now().toString(36)}${(seq++).toString(36)}`;

  const find = (id: string) => {
    const a = assets.find((x) => x.id === id);
    if (!a) throw new Error(`Media ${id} not found`);
    return a;
  };

  async function fromFile(file: File, opts: UploadOptions, id?: string): Promise<MediaAsset> {
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      await wait(uploadDuration / steps, opts.signal);
      opts.onProgress({ loaded: Math.round((file.size * i) / steps), total: file.size });
    }
    const url = typeof URL !== "undefined" && URL.createObjectURL ? URL.createObjectURL(file) : "";
    const dims = file.type.startsWith("image/") ? await imageSize(url) : {};
    const now = new Date().toISOString();
    return {
      id: id ?? nextId("m"),
      kind: kindOf(file.type),
      mime: file.type || "application/octet-stream",
      filename: file.name,
      size: file.size,
      url,
      ...dims,
      alt: opts.alt ?? "",
      folderId: opts.folderId ?? null,
      createdAt: now,
      updatedAt: now,
      status: "ready",
    };
  }

  return {
    capabilities: { folders: true, replace: true, edit: true, trash: false, bulk: true, ...options.capabilities },
    async list(q: MediaQuery, o) {
      await wait(latency, o?.signal);
      const kinds = q.kind ? (Array.isArray(q.kind) ? q.kind : [q.kind]) : null;
      const needle = q.search ? foldText(q.search, locale) : "";
      let items = assets.filter(
        (a) =>
          (!kinds || kinds.includes(a.kind)) &&
          acceptMatches(q.accept, a) &&
          (q.folderId === undefined || (a.folderId ?? null) === q.folderId) &&
          (!q.month || a.createdAt.startsWith(q.month)) &&
          (!q.uploadedBy || a.uploadedBy?.id === q.uploadedBy) &&
          (!q.unattached || !a.usage?.count) &&
          (!needle || foldText(`${a.filename} ${a.alt} ${a.title ?? ""} ${a.caption ?? ""} ${(a.tags ?? []).join(" ")}`, locale).includes(needle)),
      );
      const sort = q.sort ?? "newest";
      items = [...items].sort((a, b) =>
        sort === "name" ? a.filename.localeCompare(b.filename, locale) : sort === "size" ? b.size - a.size : sort === "oldest" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt),
      );
      const start = q.cursor ? Number(q.cursor) : 0;
      const limit = q.limit ?? 60;
      const page = items.slice(start, start + limit);
      return { items: page, total: items.length, nextCursor: start + limit < items.length ? String(start + limit) : undefined };
    },
    async get(id) {
      await wait(latency);
      return find(id);
    },
    async getMany(ids) {
      await wait(latency);
      return ids.map(find);
    },
    async upload(file, opts) {
      const asset = await fromFile(file, opts);
      assets = [asset, ...assets];
      emit({ type: "ready", asset });
      return asset;
    },
    async replace(id, file, opts) {
      const prev = find(id);
      const next = { ...(await fromFile(file, opts, id)), alt: prev.alt, title: prev.title, caption: prev.caption, folderId: prev.folderId, createdAt: prev.createdAt };
      assets = assets.map((a) => (a.id === id ? next : a));
      emit({ type: "updated", asset: next });
      return next;
    },
    async update(id, patch) {
      await wait(latency);
      const next = { ...find(id), ...patch, updatedAt: new Date().toISOString() };
      assets = assets.map((a) => (a.id === id ? next : a));
      emit({ type: "updated", asset: next });
      return next;
    },
    async remove(ids) {
      await wait(latency);
      assets = assets.filter((a) => !ids.includes(a.id));
      ids.forEach((id) => emit({ type: "removed", id }));
    },
    folders: {
      async list() {
        await wait(latency);
        return folders.map((f) => ({ ...f, count: assets.filter((a) => a.folderId === f.id).length }));
      },
      async create(name, parentId = null) {
        await wait(latency);
        const f = { id: nextId("f"), name, parentId };
        folders = [...folders, f];
        return f;
      },
      async rename(id, name) {
        await wait(latency);
        folders = folders.map((f) => (f.id === id ? { ...f, name } : f));
        return folders.find((f) => f.id === id)!;
      },
      async remove(id) {
        await wait(latency);
        folders = folders.filter((f) => f.id !== id);
        assets = assets.map((a) => (a.folderId === id ? { ...a, folderId: null } : a));
      },
    },
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}

function imageSize(url: string): Promise<{ width?: number; height?: number }> {
  if (typeof window === "undefined" || !url) return Promise.resolve({});
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({});
    img.src = url;
  });
}

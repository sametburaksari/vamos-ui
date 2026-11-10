// Small, dependency-free helpers shared by Media library, Media picker, Image field and the adapters.
import type { MediaAsset, MediaKind } from "./types";

/** MIME → the kit's media kind. */
export function mediaKindOf(mime: string, filename = ""): MediaKind {
  const m = mime.toLowerCase();
  if (m.startsWith("image/")) return "image";
  if (m.startsWith("video/")) return "video";
  if (m.startsWith("audio/")) return "audio";
  if (/pdf|word|sheet|excel|presentation|powerpoint|text|csv|rtf|opendocument/.test(m)) return "document";
  if (/zip|tar|rar|7z|gzip|compressed/.test(m)) return "archive";
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "avif", "svg", "heic"].includes(ext)) return "image";
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"].includes(ext)) return "document";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  return "other";
}

/**
 * `true` when a file or asset matches an `accept` string (`"image/*,.pdf,application/zip"`).
 * An empty accept matches everything.
 */
export function acceptsMedia(accept: string | undefined, item: { mime?: string; type?: string; filename?: string; name?: string }): boolean {
  if (!accept || !accept.trim()) return true;
  const mime = (item.mime ?? item.type ?? "").toLowerCase();
  const name = (item.filename ?? item.name ?? "").toLowerCase();
  return accept.split(",").some((raw) => {
    const rule = raw.trim().toLowerCase();
    if (!rule) return false;
    if (rule === "*" || rule === "*/*") return true;
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return mime.startsWith(rule.slice(0, -1));
    return mime === rule;
  });
}

/** Kinds an accept string allows (`"image/*"` → `["image"]`), or `undefined` when it is mixed/any. */
export function kindsFromAccept(accept: string | undefined): MediaKind[] | undefined {
  if (!accept) return undefined;
  const kinds = new Set<MediaKind>();
  for (const raw of accept.split(",")) {
    const rule = raw.trim().toLowerCase();
    if (!rule) continue;
    if (rule.startsWith("image/")) kinds.add("image");
    else if (rule.startsWith("video/")) kinds.add("video");
    else if (rule.startsWith("audio/")) kinds.add("audio");
    else return undefined;
  }
  return kinds.size ? [...kinds] : undefined;
}

/** `"2026-11-04T09:12:00Z"` → `"2026-11"`. */
export const monthKey = (iso: string) => iso.slice(0, 7);

/** A `YYYY-MM` key as a Date in the middle of the month (no time-zone edge). */
export const monthDate = (key: string) => new Date(`${key}-15T12:00:00Z`);

/** Short file extension label for tiles without a preview ("PDF", "DOCX"). */
export function extensionOf(filename: string): string {
  const ext = filename.includes(".") ? filename.split(".").pop() ?? "" : "";
  return ext.slice(0, 5).toUpperCase();
}

/** Best small preview URL of an asset (thumb variant → medium → original), images only. */
export function thumbUrl(asset: MediaAsset): string | undefined {
  if (asset.kind !== "image" && !asset.variants?.thumb && !asset.variants?.poster) return undefined;
  return asset.variants?.thumb?.url ?? asset.variants?.medium?.url ?? asset.variants?.poster?.url ?? (asset.kind === "image" ? asset.url : undefined);
}

/** Tag that marks an image as intentionally decorative (`alt=""` on purpose). */
export const DECORATIVE_TAG = "decorative";

export const isDecorative = (asset: MediaAsset) => Boolean(asset.tags?.includes(DECORATIVE_TAG));

/** Missing alt text matters for images only; `""` marked decorative (tag) is fine. */
export function isAltMissing(asset: MediaAsset, alt = asset.alt): boolean {
  return asset.kind === "image" && !alt.trim() && !isDecorative(asset);
}

/** Stable id for client-side records. */
let seq = 0;
export const clientId = (prefix = "u") => `${prefix}_${Date.now().toString(36)}${(seq++).toString(36)}`;

/** Reads an image file's pixel size (client only). */
export function readImageSize(file: Blob): Promise<{ width: number; height: number } | null> {
  if (typeof window === "undefined" || typeof URL === "undefined" || !URL.createObjectURL) return Promise.resolve(null);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve(img.naturalWidth ? { width: img.naturalWidth, height: img.naturalHeight } : null);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

/**
 * Downscales a raster image so its longer side is at most `maxDimension` (canvas, zero deps).
 * Returns the original file for SVG/GIF, non-images, small images, or when canvas is unavailable.
 */
export async function downscaleImage(file: File, maxDimension: number, quality = 0.9): Promise<File> {
  if (!file.type.startsWith("image/") || /svg|gif/.test(file.type) || typeof document === "undefined") return file;
  const size = await readImageSize(file);
  if (!size || Math.max(size.width, size.height) <= maxDimension) return file;
  const scale = maxDimension / Math.max(size.width, size.height);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode"));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(size.width * scale);
    canvas.height = Math.round(size.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const type = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
    return blob ? new File([blob], file.name, { type, lastModified: file.lastModified }) : file;
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

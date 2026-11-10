// The storage-agnostic media contract (plan 05 · D2). Type-only: importing it costs nothing at runtime.
// Media library, Media picker, Image field, Gallery and the block editor all consume `MediaAdapter`.

export type MediaKind = "image" | "video" | "audio" | "document" | "archive" | "other";

/** A non-destructive crop, in source pixels. Applied by the loader, never baked into the file. */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Degrees, clockwise. */
  rotation?: number;
  flip?: { h: boolean; v: boolean };
}

export interface MediaVariant {
  url: string;
  width: number;
  height: number;
  format?: string;
  size?: number;
}

export interface MediaAsset {
  id: string;
  kind: MediaKind;
  mime: string;
  filename: string;
  /** Bytes. */
  size: number;
  /** The original file. */
  url: string;
  /** Required for image/video so layouts never shift. */
  width?: number;
  height?: number;
  /** Seconds. */
  duration?: number;
  /** `""` = intentionally decorative. */
  alt: string;
  title?: string;
  caption?: string;
  description?: string;
  /** 0..1 in image space; default `{ x: 0.5, y: 0.5 }`. Not mirrored in RTL. */
  focalPoint?: { x: number; y: number };
  /** LQIP data URL (server-generated; the kit never decodes hashes). */
  placeholder?: string;
  dominantColor?: string;
  /** "thumb" | "medium" | "large" | "og" | custom. */
  variants?: Record<string, MediaVariant>;
  /** Named non-destructive crops ("og", "square"). */
  crops?: Record<string, CropRect>;
  folderId?: string | null;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  uploadedBy?: { id: string; name: string; avatarUrl?: string };
  usage?: { count: number; items?: { type: string; id: string; title: string; href?: string }[] };
  status?: "ready" | "processing" | "failed";
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string | null;
  count?: number;
}

export interface MediaQuery {
  search?: string;
  kind?: MediaKind | MediaKind[];
  /** `"image/*,.pdf"` */
  accept?: string;
  folderId?: string | null;
  /** `"2026-11"` */
  month?: string;
  uploadedBy?: string;
  unattached?: boolean;
  sort?: "newest" | "oldest" | "name" | "size";
  cursor?: string;
  limit?: number;
}

export interface MediaPage {
  items: MediaAsset[];
  nextCursor?: string;
  total?: number;
}

export interface UploadOptions {
  folderId?: string | null;
  alt?: string;
  signal: AbortSignal;
  onProgress: (p: { loaded: number; total: number }) => void;
}

/**
 * Builds an image URL. The signature matches the Next.js image loader, so one function works
 * with `<Image>` from the kit and with `next/image`.
 */
export type ImageLoader = (p: {
  src: string;
  width: number;
  quality?: number;
  focal?: { x: number; y: number };
  crop?: CropRect;
  format?: "auto" | "webp" | "avif";
}) => string;

export type MediaPatch = Partial<Pick<MediaAsset, "alt" | "title" | "caption" | "description" | "focalPoint" | "crops" | "folderId" | "tags">>;

export type MediaEvent = { type: "updated" | "removed" | "ready"; asset?: MediaAsset; id?: string };

export interface MediaCapabilities {
  maxFileSize?: number;
  accept?: string;
  folders: boolean;
  replace: boolean;
  edit: boolean;
  trash: boolean;
  bulk: boolean;
}

export interface MediaAdapter {
  list(q: MediaQuery, opts?: { signal?: AbortSignal }): Promise<MediaPage>;
  get(id: string): Promise<MediaAsset>;
  getMany?(ids: string[]): Promise<MediaAsset[]>;
  /** Single-step or presigned internally. */
  upload(file: File, opts: UploadOptions): Promise<MediaAsset>;
  update(id: string, patch: MediaPatch): Promise<MediaAsset>;
  remove(ids: string[], opts?: { permanent?: boolean }): Promise<void>;
  /** Same id, new file. */
  replace?(id: string, file: File, opts: UploadOptions): Promise<MediaAsset>;
  /** "From URL" tab. */
  sideload?(url: string, opts: UploadOptions): Promise<MediaAsset>;
  folders?: {
    list(): Promise<MediaFolder[]>;
    create(name: string, parentId?: string | null): Promise<MediaFolder>;
    rename?(id: string, name: string): Promise<MediaFolder>;
    remove?(id: string): Promise<void>;
  };
  /** Dynamic CDNs (imgproxy, Cloudinary, Cloudflare Images). */
  loader?: ImageLoader;
  /** Optional AI alt-text suggestion. */
  suggestAlt?(id: string): Promise<string>;
  subscribe?(cb: (e: MediaEvent) => void): () => void;
  capabilities: MediaCapabilities;
}

/** Anything the viewers accept: a full asset or a plain source. */
export interface MediaSource {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  kind?: "image" | "video";
  placeholder?: string;
  focalPoint?: { x: number; y: number };
  /** Poster for video items. */
  poster?: string;
  id?: string;
}

export type MediaItem = MediaAsset | MediaSource;

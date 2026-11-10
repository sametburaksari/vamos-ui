"use client";

import * as React from "react";
import { useLatest } from "../lib/use-controllable-state";
import { acceptsMedia, clientId, downscaleImage } from "./media-utils";
import type { MediaAdapter, MediaAsset } from "./types";

export type UploadStatus = "queued" | "uploading" | "processing" | "done" | "error" | "canceled";

export interface UploadQueueItem {
  id: string;
  file: File;
  status: UploadStatus;
  /** 0..1 */
  progress: number;
  asset?: MediaAsset;
  /** Human-readable reason (validation or server error). */
  error?: string;
  /** Rejected by a client-side check (type, size, validate): can't be retried. */
  rejected?: boolean;
  folderId?: string | null;
}

export interface UseUploadQueueOptions {
  /** Parallel uploads. Default 3. */
  concurrency?: number;
  /** Client-side downscale: the longer side is at most this many pixels (canvas, JPEG/PNG/WebP only). */
  maxDimension?: number;
  /** `"image/*,.pdf"`: files that don't match are rejected before upload. */
  accept?: string;
  /** Bytes. Default: `adapter.capabilities.maxFileSize`. */
  maxFileSize?: number;
  /** Return an error message to reject a file, or `null`. */
  validate?: (file: File) => string | null;
  /** Called once per finished upload. */
  onUploaded?: (asset: MediaAsset, item: UploadQueueItem) => void;
  /** Guard page unload while uploads run. Default `true`. */
  guardUnload?: boolean;
  /** Rejection messages (Media library passes its labels). */
  messages?: { type?: string; size?: string; failed?: string };
}

export interface UploadQueue {
  add(files: File[] | FileList, options?: { folderId?: string | null }): void;
  items: UploadQueueItem[];
  cancel(id: string): void;
  retry(id: string): void;
  /** Removes finished, failed and canceled rows. */
  clearDone(): void;
  /** Uploads still queued or running. */
  active: number;
  /** Finished uploads in this batch. */
  done: number;
  /** Rows that count towards the batch (everything except canceled). */
  total: number;
}

/**
 * Upload queue for any `MediaAdapter`: concurrency, progress, cancel, retry, client-side checks
 * (type, size, custom) and optional downscale. Media library, the editor's paste handler and
 * Image field all use it.
 *
 * ```tsx
 * const queue = useUploadQueue(adapter, { accept: "image/*", maxDimension: 2560 });
 * <input type="file" multiple onChange={(e) => e.target.files && queue.add(e.target.files)} />
 * ```
 */
export function useUploadQueue(adapter: MediaAdapter | undefined, options: UseUploadQueueOptions = {}): UploadQueue {
  const { concurrency = 3, guardUnload = true } = options;
  const [items, setItems] = React.useState<UploadQueueItem[]>([]);
  const itemsRef = React.useRef(items);
  itemsRef.current = items;
  const controllers = React.useRef(new Map<string, AbortController>());
  const running = React.useRef(new Set<string>());
  const opts = useLatest(options);
  const adapterRef = useLatest(adapter);

  const patch = React.useCallback((id: string, next: Partial<UploadQueueItem>) => {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, ...next } : it)));
  }, []);

  const start = React.useCallback(
    async (item: UploadQueueItem) => {
      const a = adapterRef.current;
      if (!a) return;
      const ctrl = new AbortController();
      controllers.current.set(item.id, ctrl);
      running.current.add(item.id);
      patch(item.id, { status: "uploading", progress: 0, error: undefined });
      try {
        const max = opts.current.maxDimension;
        const file = max ? await downscaleImage(item.file, max) : item.file;
        const asset = await a.upload(file, {
          folderId: item.folderId,
          signal: ctrl.signal,
          onProgress: ({ loaded, total }) => {
            const p = total > 0 ? Math.min(1, loaded / total) : 0;
            patch(item.id, p >= 1 ? { progress: 1, status: "processing" } : { progress: p });
          },
        });
        patch(item.id, { status: "done", progress: 1, asset });
        opts.current.onUploaded?.(asset, { ...item, status: "done", asset });
      } catch (err) {
        if (ctrl.signal.aborted || (err as Error)?.name === "AbortError") patch(item.id, { status: "canceled" });
        else patch(item.id, { status: "error", error: (err as Error)?.message || opts.current.messages?.failed || "Upload failed" });
      } finally {
        controllers.current.delete(item.id);
        running.current.delete(item.id);
      }
    },
    [adapterRef, opts, patch],
  );

  // Pump: start queued items while there is room.
  React.useEffect(() => {
    const free = concurrency - running.current.size;
    if (free <= 0) return;
    items
      .filter((it) => it.status === "queued" && !running.current.has(it.id))
      .slice(0, free)
      .forEach((it) => void start(it));
  }, [items, concurrency, start]);

  const active = items.filter((it) => it.status === "queued" || it.status === "uploading" || it.status === "processing").length;

  React.useEffect(() => {
    if (!guardUnload || !active || typeof window === "undefined") return;
    const onBefore = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBefore);
    return () => window.removeEventListener("beforeunload", onBefore);
  }, [active, guardUnload]);

  React.useEffect(() => {
    const map = controllers.current;
    return () => map.forEach((c) => c.abort());
  }, []);

  const add = React.useCallback(
    (files: File[] | FileList, o?: { folderId?: string | null }) => {
      const { accept, validate, messages } = opts.current;
      const maxSize = opts.current.maxFileSize ?? adapterRef.current?.capabilities.maxFileSize;
      const next: UploadQueueItem[] = Array.from(files).map((file) => {
        let error: string | null = null;
        if (!acceptsMedia(accept, file)) error = messages?.type ?? "This file type isn't allowed here";
        else if (maxSize && file.size > maxSize) error = messages?.size ?? "File is too large";
        else error = validate?.(file) ?? null;
        return { id: clientId("up"), file, folderId: o?.folderId, status: error ? "error" : "queued", progress: 0, error: error ?? undefined, rejected: Boolean(error) || undefined };
      });
      setItems((list) => [...list, ...next]);
    },
    [adapterRef, opts],
  );

  const cancel = React.useCallback((id: string) => {
    const c = controllers.current.get(id);
    if (c) c.abort();
    else setItems((list) => list.map((it) => (it.id === id && it.status === "queued" ? { ...it, status: "canceled" } : it)));
  }, []);

  const retry = React.useCallback((id: string) => {
    setItems((list) => list.map((it) => (it.id === id && !it.rejected && (it.status === "error" || it.status === "canceled") ? { ...it, status: "queued", progress: 0, error: undefined } : it)));
  }, []);

  const clearDone = React.useCallback(() => {
    setItems((list) => list.filter((it) => it.status === "queued" || it.status === "uploading" || it.status === "processing"));
  }, []);

  const counted = items.filter((it) => it.status !== "canceled");
  return { add, items, cancel, retry, clearDone, active, done: counted.filter((it) => it.status === "done").length, total: counted.length };
}

"use client";

import * as React from "react";
import { useMediaAdapter } from "../lib/provider";
import type { MediaAdapter, MediaAsset, MediaItem, MediaSource } from "./types";

const MediaContext = /*#__PURE__*/ React.createContext<MediaAdapter | undefined>(undefined);

/**
 * Provides the media adapter to Media library, Media picker, Image field, Gallery and the editor.
 * `VamosProvider media={adapter}` works too; this provider wins when both are set.
 *
 * ```tsx
 * <MediaProvider adapter={createMemoryAdapter({ seed })}>…</MediaProvider>
 * ```
 */
export function MediaProvider({ adapter, children }: { adapter: MediaAdapter; children: React.ReactNode }) {
  return <MediaContext.Provider value={adapter}>{children}</MediaContext.Provider>;
}

/** The adapter from `MediaProvider`, else from `VamosProvider media`. */
export function useMedia(): MediaAdapter | undefined {
  const own = React.useContext(MediaContext);
  const app = useMediaAdapter<MediaAdapter>();
  return own ?? app;
}

/** `true` for a full `MediaAsset` (has `id` + `url`). */
export function isMediaAsset(item: unknown): item is MediaAsset {
  return typeof item === "object" && item !== null && "url" in item && "id" in item && "mime" in item;
}

/** Normalises an asset or a plain source to the fields viewers need. */
export function toMediaSource(item: MediaItem, index = 0): MediaSource & { id: string; kind: "image" | "video" } {
  if (isMediaAsset(item)) {
    return {
      id: item.id,
      src: item.url,
      alt: item.alt,
      width: item.width,
      height: item.height,
      caption: item.caption,
      kind: item.kind === "video" ? "video" : "image",
      placeholder: item.placeholder,
      focalPoint: item.focalPoint,
      poster: item.variants?.poster?.url ?? item.variants?.thumb?.url,
    };
  }
  return { ...item, id: item.id ?? `${index}:${item.src}`, kind: item.kind ?? "image" };
}

"use client";

import * as React from "react";
import { Lightbox } from "../../../media/lightbox";
import type { MediaSource } from "../../../media/types";

export interface GalleryLightboxProps {
  items: MediaSource[];
  /** Grid with `LightboxTrigger`s (server-rendered). */
  children: React.ReactNode;
}

/**
 * Lightbox island for the Gallery section: native dialog semantics via the Media group's
 * Lightbox (focus trap, Esc, ←/→, "Image 3 of 12"). The grid itself stays server-rendered.
 */
export function GalleryLightbox({ items, children }: GalleryLightboxProps) {
  return (
    <Lightbox items={items} zoom backdrop="solid">
      {children}
    </Lightbox>
  );
}

"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { SrName } from "../../lib/sr-name";

export interface EmbedFacadeProps {
  /** `iframe`: YouTube/Vimeo/Calendly URL loaded on click. `video`: an MP4 played inline. */
  kind: "iframe" | "video";
  src: string;
  /** Accessible title of the iframe / video. */
  title: string;
  /** The static preview (server-rendered poster image + play affordance). */
  children: React.ReactNode;
  /** Accessible name of the button ("Play video: Our kitchen"). */
  buttonLabel: string;
  /** `allow` attribute for the iframe. */
  allow?: string;
  className?: string;
}

/**
 * Facade: a static preview that becomes the real embed only after a click (no third-party
 * cookies or scripts before the visitor asks, ~0.5 KB). Focus moves into the embed.
 */
export function EmbedFacade({ kind, src, title, children, buttonLabel, allow = "autoplay; fullscreen; picture-in-picture; encrypted-media", className }: EmbedFacadeProps) {
  const [active, setActive] = React.useState(false);
  const target = React.useRef<HTMLIFrameElement & HTMLVideoElement>(null);
  React.useEffect(() => {
    if (active) target.current?.focus();
  }, [active]);

  if (active) {
    return kind === "video" ? (
      <video ref={target} src={src} title={title} controls autoPlay playsInline className={cn("size-full bg-scene object-cover", className)} />
    ) : (
      <iframe ref={target} src={src} title={title} allow={allow} allowFullScreen loading="lazy" className={cn("size-full border-0 bg-scene", className)} />
    );
  }
  return (
    <button type="button" onClick={() => setActive(true)} className={cn("vb-facade group/facade relative block size-full text-start focus-ring", className)}>
      {/* The preview's text differs from the button's name: a hidden name, not an aria-label (label-in-name). */}
      <SrName name={buttonLabel}>{children}</SrName>
    </button>
  );
}

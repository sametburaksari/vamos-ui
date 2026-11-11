"use client";

import * as React from "react";
import { cn2 as cn } from "./kit-2";
import { getConsent, onConsent, readConsent, writeConsent, type ConsentCategory } from "./consent";

export interface ConsentGateProps {
  /** The iframe URL loaded after consent or a click (maps, YouTube, Vimeo, Calendly). */
  src: string;
  /** Iframe `title` (required for screen readers): "Map of Meyhane Rasimpaşa". */
  title: string;
  /** Consent category that loads the embed automatically. Default `"functional"`. */
  category?: ConsentCategory;
  /** Button text: "Load map". */
  loadLabel: string;
  /** One line under the button: "The map loads from Google Maps, which may set cookies." */
  notice?: React.ReactNode;
  /** Offer "Always load maps" — grants `category` for the whole site. */
  rememberLabel?: string;
  /** CSS aspect-ratio of the frame. Default `"4 / 3"`. */
  aspect?: string;
  /** Iframe `allow` (video: "autoplay; encrypted-media; picture-in-picture"). */
  allow?: string;
  /** Load immediately (the user already clicked something that means "show it"). */
  defaultLoaded?: boolean;
  /** Banner version; an older stored answer doesn't count. */
  version?: number;
  /** The static preview (an image). Painted under the button, decorative. */
  children?: React.ReactNode;
  className?: string;
  /** Classes for the facade button. */
  buttonClassName?: string;
}

/**
 * Facade for third-party embeds: a static preview with one button. The iframe loads only after
 * a click or when the visitor has already granted `category` — never before (privacy law and
 * performance). ~0.5 KB.
 *
 * ```tsx
 * <ConsentGate src="https://www.google.com/maps?q=…&output=embed" title="Map of Meyhane Rasimpaşa" loadLabel="Load map">
 *   <BlockImage src="/map-static.png" decorative aspect="4:3" />
 * </ConsentGate>
 * ```
 */
export function ConsentGate({
  src,
  title,
  category = "functional",
  loadLabel,
  notice,
  rememberLabel,
  aspect = "4 / 3",
  allow,
  defaultLoaded = false,
  version,
  children,
  className,
  buttonClassName,
}: ConsentGateProps) {
  const [loaded, setLoaded] = React.useState(defaultLoaded);
  const [remember, setRemember] = React.useState(false);
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const focusOnLoad = React.useRef(false);

  React.useEffect(() => {
    if (loaded) return;
    if (getConsent(category, version)) {
      setLoaded(true);
      return;
    }
    return onConsent(category, () => setLoaded(true));
  }, [category, version, loaded]);

  React.useEffect(() => {
    if (loaded && focusOnLoad.current) frameRef.current?.focus();
  }, [loaded]);

  return (
    <div data-consent-gate="" data-loaded={loaded ? "" : undefined} className={cn("vb-gate relative overflow-hidden rounded-ui bg-surface-2", className)} style={{ aspectRatio: aspect }}>
      {loaded ? (
        <iframe
          ref={frameRef}
          src={src}
          title={title}
          allow={allow}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <>
          {children ? (
            <div aria-hidden className="vb-gate-preview absolute inset-0 [&_.vb-image]:size-full">
              {children}
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-4 @2xl:p-5">
            <button
              type="button"
              onClick={() => {
                if (remember) {
                  const prev = readConsent();
                  writeConsent({ functional: prev?.c.functional === 1, analytics: prev?.c.analytics === 1, marketing: prev?.c.marketing === 1, [category]: true }, version ?? prev?.v ?? 1);
                }
                focusOnLoad.current = true;
                setLoaded(true);
              }}
              className={cn(
                "surface-popover inline-flex h-11 items-center gap-2 rounded-ui px-4 text-sm font-medium text-fg transition-colors hover:bg-hover focus-ring",
                buttonClassName,
              )}
            >
              {loadLabel}
            </button>
            {notice || rememberLabel ? (
              <div className="vb-gate-note flex max-w-[44ch] flex-col gap-1.5 rounded-ui-sm px-2 py-1 text-xs text-fg-muted">
                {notice ? <p>{notice}</p> : null}
                {/* The input sits inside its label (implicit association): no generated id, so nothing
                    can drift between the server HTML and hydration. */}
                {rememberLabel ? (
                  <label className="inline-flex cursor-pointer items-center gap-2 text-fg">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="vb-check size-3.5" />
                    {rememberLabel}
                  </label>
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

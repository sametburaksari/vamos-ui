"use client";

import * as React from "react";
import { cn2 as cn } from "./shared/kit-2";
import { getConsent, onConsent, type ConsentCategory } from "./shared/consent";
import { newsText, type NewsBlockLabels } from "./shared/labels-news";
import { AD_SIZES, type AdSize } from "./shared/news";

export interface AdSlotProps {
  /** Reserved box (IAB name or pixels). It scales down with the column, keeping its ratio. */
  size?: AdSize;
  /** Box below a 40rem container (a leaderboard becomes a mobile banner). */
  mobileSize?: AdSize;
  /** The ad markup (an ad server's div, an `<a><img></a>` house ad). Rendered only with consent. */
  children?: React.ReactNode;
  /**
   * Consent category that must be granted before `children` render and `onReady` runs.
   * Default `"marketing"`. `false` for house ads that track nothing.
   */
  consent?: ConsentCategory | false;
  /** Banner version; an older stored answer doesn't count. */
  consentVersion?: number;
  /**
   * The hook point for an ad server: called once the slot is visible-ready and consent is
   * granted, with the inner element (call `googletag.display(el.id)` here). Return a cleanup.
   */
  onReady?: (el: HTMLDivElement) => void | (() => void);
  /** Id of the inner element (ad servers target it). */
  slotId?: string;
  /** Shown in the reserved box while there's no ad (no consent, nothing sold). Default: the size. */
  placeholder?: React.ReactNode;
  /** The small label above the box. Default "Advertisement" (dictionary). `false` hides it (not recommended). */
  label?: React.ReactNode | false;
  /** Centre the box in its column. Default true. */
  center?: boolean;
  locale?: string;
  labels?: NewsBlockLabels;
  className?: string;
}

const dims = (s: AdSize) => (typeof s === "string" ? { width: AD_SIZES[s][0], height: AD_SIZES[s][1] } : s);

/**
 * A labelled advertising slot. The box is reserved at its final ratio before anything loads, so
 * the page never jumps (CLS). Ad markup renders and `onReady` fires only after the visitor grants
 * the consent category; until then the box shows a quiet placeholder. `aside` landmark, named by
 * its label ("Advertisement" / "Reklam").
 *
 * ```tsx
 * <AdSlot size="leaderboard" mobileSize="mobile-banner" slotId="div-gpt-home-top" onReady={(el) => googletag.cmd.push(() => googletag.display(el.id))} />
 * ```
 */
export function AdSlot({ size = "rectangle", mobileSize, children, consent = "marketing", consentVersion, onReady, slotId, placeholder, label, center = true, locale = "en-US", labels, className }: AdSlotProps) {
  const t = newsText(labels, locale);
  const d = dims(size);
  const m = mobileSize ? dims(mobileSize) : undefined;
  const [allowed, setAllowed] = React.useState(consent === false);
  const inner = React.useRef<HTMLDivElement>(null);
  const readyRef = React.useRef(onReady);
  readyRef.current = onReady;

  React.useEffect(() => {
    if (consent === false) return;
    setAllowed(getConsent(consent, consentVersion));
    return onConsent(consent, () => setAllowed(getConsent(consent, consentVersion)));
  }, [consent, consentVersion]);

  React.useEffect(() => {
    if (!allowed || !inner.current || !readyRef.current) return;
    const cleanup = readyRef.current(inner.current);
    return typeof cleanup === "function" ? cleanup : undefined;
  }, [allowed]);

  const name = label === false ? t("advertisement") : typeof label === "string" ? label : t("advertisement");
  const filled = allowed && (!!children || !!onReady);
  return (
    <aside aria-label={name} className={cn("vb-ad @container flex flex-col gap-1.5", center && "items-center", className)}>
      {label === false ? null : <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-fg-subtle">{label ?? t("advertisement")}</p>}
      <div
        className="vb-ad-box relative overflow-hidden rounded-[2px]"
        data-filled={filled ? "" : undefined}
        data-mobile={m ? "" : undefined}
        style={
          {
            "--ad-w": `${d.width}px`,
            "--ad-w-n": d.width,
            "--ad-h-n": d.height,
            ...(m ? { "--ad-mw": `${m.width}px`, "--ad-mw-n": m.width, "--ad-mh-n": m.height } : {}),
          } as React.CSSProperties
        }
      >
        <div ref={inner} id={slotId} className="absolute inset-0 flex items-center justify-center">
          {allowed && children ? (
            children
          ) : filled ? null : (
            <span className="px-3 text-center font-mono text-[0.6875rem] tabular text-fg-subtle">
              {placeholder ?? (consent !== false && !allowed && children ? t("adConsent") : t("adSize", { width: d.width, height: d.height }))}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

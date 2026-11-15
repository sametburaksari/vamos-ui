"use client";

import * as React from "react";
import { Play, Smartphone } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { QrCode } from "./qr-code";

export const storeBadgesLabels = {
  /** Name of the badge list. */
  label: "Get the app",
  appStoreLead: "Download on the",
  appStoreName: "App Store",
  googlePlayLead: "Get it on",
  googlePlayName: "Google Play",
  /** Accessible name of the QR code. */
  qr: "QR code to open the app download page on your phone",
  /** Caption next to the QR code. */
  qrCaption: "Scan with your phone camera",
};
export type StoreBadgesLabels = typeof storeBadgesLabels;

export interface StoreBadge {
  /** Store link. */
  href: string;
  /** Small first line ("Get it on"). */
  lead: string;
  /** Store name, the big second line. */
  name: string;
  /** Leading icon. Default: a generic phone. */
  icon?: React.ReactNode;
}

export interface StoreBadgesProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** App Store link. */
  appStore?: string;
  /** Google Play link. */
  googlePlay?: string;
  /** More stores (or your own wording), after the two above. */
  stores?: StoreBadge[];
  /**
   * Show a QR code beside the badges on wide screens (a phone does not need to scan itself).
   * A string is the URL to encode (a link that redirects to the right store is ideal); `true`
   * encodes the first store link.
   */
  qr?: boolean | string;
  /** `"solid"` (default): inverted pills · `"outline"`: bordered on the surface. */
  variant?: "solid" | "outline";
  size?: "md" | "lg";
  labels?: Partial<StoreBadgesLabels>;
}

/**
 * App download badges for App Store and Google Play: plain, accessible links drawn from tokens
 * with a generic icon (no store artwork — use the official badge files, under their rules, if
 * your brand needs them). An optional QR code on desktop lets a visitor jump to their phone.
 *
 * ```tsx
 * <StoreBadges appStore="https://apps.apple.com/app/id000000" googlePlay="https://play.google.com/store/apps/details?id=com.example" qr="https://example.com/get" />
 * ```
 */
export const StoreBadges = /*#__PURE__*/ React.forwardRef<HTMLDivElement, StoreBadgesProps>(function StoreBadges(
  { appStore, googlePlay, stores = [], qr, variant = "solid", size = "md", labels, className, ...props },
  ref,
) {
  const t = useLabels("storeBadges", storeBadgesLabels, labels);
  const items: (StoreBadge & { id: string })[] = [
    ...(appStore ? [{ id: "app-store", href: appStore, lead: t("appStoreLead"), name: t("appStoreName"), icon: <Smartphone /> }] : []),
    ...(googlePlay ? [{ id: "google-play", href: googlePlay, lead: t("googlePlayLead"), name: t("googlePlayName"), icon: <Play /> }] : []),
    ...stores.map((s, i) => ({ id: `store-${i}`, ...s })),
  ];
  const qrValue = typeof qr === "string" ? qr : qr ? items[0]?.href : undefined;
  return (
    <div ref={ref} data-slot="store-badges" className={cn("flex flex-wrap items-center gap-x-6 gap-y-4", className)} {...props}>
      <ul aria-label={t("label")} className="m-0 flex list-none flex-wrap gap-3 p-0">
        {items.map((s) => (
          <li key={s.id}>
            <a
              href={s.href}
              data-store={s.id}
              className={cn(
                "inline-flex items-center gap-3 rounded-ui border transition-[background-color,border-color,translate] focus-ring hover:-translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                variant === "solid" ? "border-transparent bg-fg text-scene" : "border-line bg-surface text-fg hover:border-fg-muted",
                size === "lg" ? "h-16 px-6 [&_svg]:size-6" : "h-13 px-4 [&_svg]:size-5",
              )}
            >
              <span aria-hidden="true" className="flex shrink-0 [&_svg]:stroke-[1.75]">
                {s.icon ?? <Smartphone />}
              </span>
              <span className="flex flex-col items-start leading-none">
                <span className="text-[11px] font-medium opacity-75">{s.lead}</span>{" "}
                <span className={cn("mt-1 font-semibold tracking-[-0.01em]", size === "lg" ? "text-lg" : "text-[15px]")}>{s.name}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      {qrValue ? (
        <div data-slot="store-badges-qr" className="hidden items-center gap-3 lg:flex">
          <QrCode value={qrValue} aria-label={t("qr")} size={size === "lg" ? 96 : 80} className="shrink-0" />
          <span aria-hidden="true" className="max-w-[12ch] text-xs text-fg-muted">
            {t("qrCaption")}
          </span>
        </div>
      ) : null}
    </div>
  );
});

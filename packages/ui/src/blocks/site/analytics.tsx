"use client";

import * as React from "react";
import { startAnalytics, type AnalyticsConfig } from "./shared/analytics";

export type AnalyticsProps = AnalyticsConfig;

/**
 * Loads GA4, Google Ads, Google Tag Manager and the Meta pixel only after the visitor allows them
 * in `ConsentBanner` (analytics → GA4 / GTM, marketing → Ads / Meta), and measures what a small
 * business site needs: phone, WhatsApp, email, directions and booking clicks, and contact form
 * leads (`generate_lead` + the Google Ads conversion + Meta `Lead`). Renders nothing.
 *
 * Put it once in the root layout, after `ConsentDefaults` in `<head>`. The ids are the site
 * owner's own (vamos.site.json → analytics); without ids it only pushes events to `dataLayer`.
 *
 * ```tsx
 * import site from "../vamos.site.json";
 * <head><ConsentDefaults /></head>
 * <body>
 *   {children}
 *   <ConsentBanner policyLink={{ href: "/cerez-politikasi" }} />
 *   <Analytics {...site.analytics} conversions={{ lead: "AW-123456789/AbCdEf" }} />
 * </body>
 * ```
 */
export function Analytics({ ga4, googleAds, gtm, metaPixel, conversions, mode, version, debug }: AnalyticsProps) {
  const key = JSON.stringify([ga4, googleAds, gtm, metaPixel, conversions, mode, version, debug]);
  React.useEffect(
    () => startAnalytics({ ga4, googleAds, gtm, metaPixel, conversions, mode, version, debug }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return null;
}

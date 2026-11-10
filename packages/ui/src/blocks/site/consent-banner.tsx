import * as React from "react";
import { RichText } from "../rich-text";
import type { BlockBaseProps } from "../types";
import type { RichDoc } from "../schema/rich-doc";
import { labelTemplates, site2Text, type Site2BlockLabels } from "./shared/labels-2";
import { consentLabelKeys } from "./shared/island-keys";
import { ConsentBannerIsland } from "./shared/consent-island";
import { CONSENT_CATEGORIES, consentDefaultsScript, type ConsentCategory } from "./shared/consent";

export type ConsentVariant = "bar" | "box";

export interface ConsentBannerProps extends Omit<BlockBaseProps, "variant" | "labels" | "headingLevel"> {
  /** bar: a thin full-width strip at the bottom. box: a 360px panel in the bottom-start corner. */
  variant?: ConsentVariant;
  /** The notice. Rich text may contain links. Default: a neutral template — review with counsel. */
  text?: React.ReactNode | RichDoc;
  /** Cookie policy. */
  policyLink?: { href: string; label?: string };
  /** Categories offered. `necessary` is always on. Default all four. */
  categories?: ConsentCategory[];
  /** Bump when the text or categories change — visitors are asked again. Default 1. */
  version?: number;
  /** Default `"bottom"` (bar) / `"bottom-start"` (box). */
  position?: "bottom" | "bottom-start";
  /** `opt-in` (GDPR, KVKK — default): nothing non-essential before a choice. `notice` where the law allows. */
  regionMode?: "opt-in" | "notice";
  /** Render inside its parent instead of fixed to the viewport (docs, builder canvas). */
  contained?: boolean;
  /** Show even when a choice is stored (previews). */
  forceShow?: boolean;
  /** Open the preferences dialog at once (previews). */
  defaultPreferencesOpen?: boolean;
  labels?: Site2BlockLabels;
}

const isRichDoc = (v: unknown): v is RichDoc => !!v && typeof v === "object" && (v as RichDoc).type === "doc";

/**
 * Cookie consent for GDPR / ePrivacy and Turkey's KVKK, with Google Consent Mode v2. Not a modal:
 * a labelled region with "Reject all" and "Accept all" at equal weight, preferences per category,
 * a first-party `vb_consent` cookie (6 months) and `getConsent` / `onConsent` helpers. Server
 * wrapper around a ~3 KB island. Pair it with `consentDefaultsScript()` in `<head>`.
 *
 * ```tsx
 * <head><script dangerouslySetInnerHTML={{ __html: consentDefaultsScript() }} /></head>
 * …
 * <ConsentBanner policyLink={{ href: "/cookies" }} version={2} />
 * ```
 */
export function ConsentBanner({
  variant = "bar",
  text,
  policyLink,
  categories = [...CONSENT_CATEGORIES],
  version = 1,
  position,
  regionMode = "opt-in",
  contained,
  forceShow,
  defaultPreferencesOpen,
  className,
  labels,
  locale = "en-US",
  components,
}: ConsentBannerProps) {
  const t = site2Text(labels, locale);
  const cats: ConsentCategory[] = ["necessary", ...categories.filter((c) => c !== "necessary")];
  const body = text === undefined ? t("cookieText") : isRichDoc(text) ? <RichText doc={text} size="sm" components={components} labels={labels} locale={locale} className="[&>p]:m-0" /> : text;
  return (
    <ConsentBannerIsland
      variant={variant}
      text={body}
      policyLink={policyLink ? { href: policyLink.href, label: policyLink.label ?? t("cookiePolicy") } : undefined}
      categories={cats}
      version={version}
      position={position ?? (variant === "box" ? "bottom-start" : "bottom")}
      regionMode={regionMode}
      labels={labelTemplates(labels, consentLabelKeys)}
      contained={contained}
      forceShow={forceShow}
      defaultPreferencesOpen={defaultPreferencesOpen}
      className={className}
    />
  );
}

/**
 * The Consent Mode v2 defaults as a `<script>` for `<head>` (server component). Renders before any
 * Google tag so ads and analytics wait for the visitor's choice.
 */
export function ConsentDefaults(props: Parameters<typeof consentDefaultsScript>[0] & { nonce?: string }) {
  const { nonce, ...opts } = props;
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: consentDefaultsScript(opts) }} />;
}

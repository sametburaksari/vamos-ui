"use client";

// Link previews imitate third-party UIs (search results, social cards). This file and the
// `--preview-*` variables in styles/media.css are the kit's one deliberate token exception:
// the previews follow each platform's look, the frame and meters around them use kit tokens.

import * as React from "react";
import { ImageIcon, TriangleAlert, EyeOff } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { isMediaAsset } from "./media-provider";
import { countGraphemes, measureSerp, SERP_LIMITS, type SerpDevice, type SerpField } from "./serp";
import type { MediaAsset } from "./types";

const previewLabels = {
  search: "Search result preview",
  social: "{platform} link preview",
  untitled: "Untitled page",
  noDescription: "No description: search engines will pick text from the page.",
  noImage: "No social image. The link will show as a plain card.",
  wrongRatio: "Image is {ratio}:1. {platform} shows {target}:1 and will crop it.",
  smallImage: "Image is {width}×{height}. {platform} recommends at least {minWidth}×{minHeight}.",
  noindex: "Hidden from search engines (noindex)",
  tabs: "Preview",
  searchTab: "Search",
  desktop: "Desktop",
  mobile: "Mobile",
  meterGood: "good",
  meterShort: "too short",
  meterLong: "too long",
  meterEmpty: "missing",
  meterChars: "{count} of {max} characters",
  meterPx: "{px} of {maxPx} px",
  xFrom: "From {host}",
};
export type LinkPreviewLabels = typeof previewLabels;

export interface LinkPreviewData {
  url: string;
  title: string;
  description?: string;
  siteName?: string;
  favicon?: string;
  image?: MediaAsset | string | null;
  /** Date shown before the description (articles). `YYYY-MM-DD` or a Date. */
  publishedAt?: Date | string;
  /** Replaces the URL path in the search breadcrumb. */
  breadcrumbs?: string[];
  twitterCard?: "summary" | "summary_large_image";
  /** Shows the "Hidden from search engines" banner. */
  noindex?: boolean;
}

export type SocialPlatform = "facebook" | "linkedin" | "x" | "whatsapp" | "slack";
const PLATFORM_NAME: Record<SocialPlatform, string> = { facebook: "Facebook", linkedin: "LinkedIn", x: "X", whatsapp: "WhatsApp", slack: "Slack" };

function parseUrl(url: string): { host: string; path: string[] } {
  try {
    const u = new URL(url);
    return { host: u.hostname.replace(/^www\./, ""), path: u.pathname.split("/").filter(Boolean).map(decodeURIComponent) };
  } catch {
    return { host: url.replace(/^https?:\/\//, "").split("/")[0] ?? url, path: [] };
  }
}

function imageOf(image: LinkPreviewData["image"]): { src: string; width?: number; height?: number; alt: string } | null {
  if (!image) return null;
  if (typeof image === "string") return { src: image, alt: "" };
  if (isMediaAsset(image)) return { src: image.variants?.og?.url ?? image.url, width: image.variants?.og?.width ?? image.width, height: image.variants?.og?.height ?? image.height, alt: image.alt };
  return null;
}

function toDate(d: Date | string): Date {
  if (d instanceof Date) return d;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(d);
}

/** `false` on the server and the first client render, then `true`: canvas measuring runs after hydration. */
function usePrecise(): boolean {
  const [precise, setPrecise] = React.useState(false);
  React.useEffect(() => setPrecise(true), []);
  return precise;
}

/** Bolds case-insensitive matches of `term` (locale-aware). */
function highlight(text: string, term: string | undefined, locale: string): React.ReactNode {
  if (!term?.trim()) return text;
  const hay = text.toLocaleLowerCase(locale);
  const needle = term.trim().toLocaleLowerCase(locale);
  const out: React.ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (needle && (k = hay.indexOf(needle, i)) !== -1) {
    if (k > i) out.push(text.slice(i, k));
    out.push(<b key={k}>{text.slice(k, k + needle.length)}</b>);
    i = k + needle.length;
  }
  out.push(text.slice(i));
  return out;
}

export interface PreviewFrameProps {
  /** `auto` follows the surrounding theme; `light` / `dark` force the platform's own theme. */
  appearance?: "light" | "dark" | "auto";
  /** `sm` for sidebars (SEO panel), `md` default. */
  size?: "sm" | "md";
}

/* ------------------------------------------------------------------ */
/* Search                                                               */
/* ------------------------------------------------------------------ */

export interface SearchPreviewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, PreviewFrameProps {
  data: LinkPreviewData;
  device?: SerpDevice;
  /** Focus keyword to bold in the description (as search engines do). */
  highlight?: string;
  labels?: Partial<LinkPreviewLabels>;
}

/**
 * How a page appears in a search result on desktop or mobile, with pixel-accurate truncation
 * (`measureSerp`) and keyword bolding.
 */
export const SearchPreview = React.forwardRef<HTMLDivElement, SearchPreviewProps>(function SearchPreview(
  { data, device = "desktop", highlight: term, appearance = "auto", size = "md", labels, className, ...props },
  ref,
) {
  const t = useLabels("linkPreview", previewLabels, labels);
  const { locale } = useLocale();
  const { host, path } = parseUrl(data.url);
  const crumbs = data.breadcrumbs ?? path.slice(0, 3);
  const estimate = !usePrecise();
  const title = measureSerp(data.title || t("untitled"), "title", device, locale, { estimate });
  const desc = data.description ? measureSerp(data.description, "description", device, locale, { estimate }) : null;
  const date = data.publishedAt ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(toDate(data.publishedAt)) : null;
  const site = data.siteName ?? host;
  return (
    <div ref={ref} data-slot="search-preview" className={cn("vui-lp-frame", className)} {...props}>
      {data.noindex ? (
        <p className="mb-2 flex items-center gap-1.5 text-[12.5px] font-medium text-warning">
          <EyeOff aria-hidden className="size-3.5" />
          {t("noindex")}
        </p>
      ) : null}
      <div
        role="figure"
        aria-label={t("search")}
        data-appearance={appearance}
        data-device={device}
        data-size={size}
        dir="auto"
        className={cn("vui-lp vui-lp-serp", data.noindex && "opacity-55")}
      >
        <div className="vui-lp-serp-site">
          <span className="vui-lp-favicon" aria-hidden>
            {data.favicon ? <img src={data.favicon} alt="" /> : <span>{site.charAt(0).toUpperCase()}</span>}
          </span>
          <span className="min-w-0">
            <span className="vui-lp-serp-sitename">{site}</span>
            <span className="vui-lp-serp-url">
              {data.url.startsWith("http") ? `https://${host}` : host}
              {crumbs.map((c, i) => (
                <React.Fragment key={i}>
                  <span aria-hidden> › </span>
                  {c}
                </React.Fragment>
              ))}
            </span>
          </span>
        </div>
        <p className="vui-lp-serp-title" data-missing={data.title ? undefined : ""} data-truncated={title.truncated ? "" : undefined}>
          {title.display}
        </p>
        <p className="vui-lp-serp-desc" data-missing={desc ? undefined : ""}>
          {date ? <span className="vui-lp-serp-date">{date} — </span> : null}
          {desc ? highlight(desc.display, term, locale) : t("noDescription")}
        </p>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Social card                                                          */
/* ------------------------------------------------------------------ */

const TARGET_RATIO: Record<SocialPlatform, number> = { facebook: 1.91, linkedin: 1.91, x: 1.91, whatsapp: 1.91, slack: 1.91 };
const MIN_SIZE = { width: 1200, height: 630 };

export interface SocialCardPreviewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, PreviewFrameProps {
  data: LinkPreviewData;
  platform: SocialPlatform;
  /** Hide the warnings under the card. */
  hideWarnings?: boolean;
  labels?: Partial<LinkPreviewLabels>;
}

/** How a shared link unfurls on Facebook, LinkedIn, X, WhatsApp or Slack, with image warnings. */
export const SocialCardPreview = React.forwardRef<HTMLDivElement, SocialCardPreviewProps>(function SocialCardPreview(
  { data, platform, appearance = "auto", size = "md", hideWarnings, labels, className, ...props },
  ref,
) {
  const t = useLabels("linkPreview", previewLabels, labels);
  const { locale } = useLocale();
  const { host } = parseUrl(data.url);
  const img = imageOf(data.image);
  const name = PLATFORM_NAME[platform];
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const large = platform !== "x" || data.twitterCard !== "summary";
  const title = data.title || t("untitled");
  const warnings: string[] = [];
  if (!img) warnings.push(t("noImage"));
  else if (img.width && img.height) {
    const r = img.width / img.height;
    if (large && Math.abs(r - TARGET_RATIO[platform]) > 0.12) warnings.push(t("wrongRatio", { ratio: nf.format(Math.round(r * 100) / 100), platform: name, target: nf.format(TARGET_RATIO[platform]) }));
    if (large && (img.width < MIN_SIZE.width || img.height < MIN_SIZE.height))
      warnings.push(t("smallImage", { width: String(img.width), height: String(img.height), platform: name, minWidth: String(MIN_SIZE.width), minHeight: String(MIN_SIZE.height) }));
  }

  const media = (cls?: string) =>
    img ? (
      <span className={cn("vui-lp-media", cls)}>
        <img src={img.src} alt="" loading="lazy" decoding="async" />
      </span>
    ) : (
      <span className={cn("vui-lp-media vui-lp-media-empty", cls)} aria-hidden>
        <ImageIcon strokeWidth={1.4} />
      </span>
    );
  const titleEl = (
    <span className="vui-lp-title" data-missing={data.title ? undefined : ""}>
      {title}
    </span>
  );
  const descEl = data.description ? <span className="vui-lp-desc">{data.description}</span> : null;

  let card: React.ReactNode;
  switch (platform) {
    case "facebook":
      card = (
        <>
          {media()}
          <span className="vui-lp-body">
            <span className="vui-lp-domain">{host.toUpperCase()}</span>
            {titleEl}
            {descEl}
          </span>
        </>
      );
      break;
    case "linkedin":
      card = (
        <>
          {media()}
          <span className="vui-lp-body">
            {titleEl}
            <span className="vui-lp-domain">{host}</span>
          </span>
        </>
      );
      break;
    case "x":
      card = large ? (
        <>
          <span className="relative block">
            {media()}
            <span className="vui-lp-x-badge">{host}</span>
          </span>
          <span className="vui-lp-x-below">{t("xFrom", { host })}</span>
        </>
      ) : (
        <span className="vui-lp-x-summary">
          {media("vui-lp-x-thumb")}
          <span className="vui-lp-body">
            <span className="vui-lp-domain">{host}</span>
            {titleEl}
            {descEl}
          </span>
        </span>
      );
      break;
    case "whatsapp":
      card = (
        <span className="vui-lp-wa-bubble">
          <span className="vui-lp-wa-card">
            {media()}
            <span className="vui-lp-body">
              {titleEl}
              {descEl}
              <span className="vui-lp-domain">{host}</span>
            </span>
          </span>
          <span className="vui-lp-wa-link">{data.url}</span>
        </span>
      );
      break;
    case "slack":
      card = (
        <span className="vui-lp-slack">
          <span className="vui-lp-slack-site">
            {data.favicon ? <img src={data.favicon} alt="" className="vui-lp-slack-icon" /> : null}
            {data.siteName ?? host}
          </span>
          {titleEl}
          {descEl}
          {media("vui-lp-slack-media")}
        </span>
      );
      break;
  }

  return (
    <div ref={ref} data-slot="social-card-preview" className={cn("vui-lp-frame", className)} {...props}>
      <div role="figure" aria-label={t("social", { platform: name })} data-appearance={appearance} data-platform={platform} data-size={size} dir="auto" className="vui-lp vui-lp-social">
        {card}
      </div>
      {!hideWarnings && warnings.length ? (
        <ul className="mt-2.5 flex flex-col gap-1">
          {warnings.map((w) => (
            <li key={w} className="flex items-start gap-1.5 text-[12.5px] leading-snug text-warning">
              <TriangleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
              {w}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Length meter                                                         */
/* ------------------------------------------------------------------ */

export interface LengthMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Character limit. Default: the SERP ideal maximum for `field`, else 160. */
  max?: number;
  /** Below this the meter says "too short". */
  min?: number;
  /** Also measure pixel width as a search result `title` / `description`. */
  field?: SerpField;
  device?: SerpDevice;
  /** Field name for the announcement ("SEO title"). */
  label?: string;
  labels?: Partial<LinkPreviewLabels>;
}

/**
 * Characters (graphemes) and, for SEO fields, rendered pixels against the limit, said in words
 * too ("58 of 60 characters, 540 of 600 px: good"), never by colour alone.
 */
export const LengthMeter = React.forwardRef<HTMLDivElement, LengthMeterProps>(function LengthMeter(
  { value, max: maxProp, min: minProp, field, device = "desktop", label, labels, className, ...props },
  ref,
) {
  const t = useLabels("linkPreview", previewLabels, labels);
  const { locale } = useLocale();
  const nf = new Intl.NumberFormat(locale);
  const spec = field ? SERP_LIMITS[device][field] : null;
  const max = maxProp ?? spec?.idealChars[1] ?? 160;
  const min = minProp ?? spec?.idealChars[0] ?? 0;
  const count = countGraphemes(value, locale);
  const estimate = !usePrecise();
  const m = field ? measureSerp(value, field, device, locale, { estimate }) : null;
  const over = count > max || Boolean(m?.truncated);
  const status: "empty" | "short" | "long" | "good" = count === 0 ? "empty" : over ? "long" : count < min ? "short" : "good";
  const tone = status === "good" ? "success" : status === "long" || status === "empty" ? "danger" : "warning";
  const ratio = m ? m.px / m.maxPx : count / max;
  const statusText = t(status === "good" ? "meterGood" : status === "short" ? "meterShort" : status === "long" ? "meterLong" : "meterEmpty");
  const chars = t("meterChars", { count: nf.format(count), max: nf.format(max) });
  const px = m ? t("meterPx", { px: nf.format(Math.round(m.px)), maxPx: nf.format(m.maxPx) }) : null;
  const text = `${chars}${px ? `, ${px}` : ""}: ${statusText}`;
  return (
    <div ref={ref} data-slot="length-meter" data-status={status} className={cn("flex items-center gap-2.5", className)} {...props}>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={m ? m.maxPx : max}
        aria-valuenow={m ? Math.round(m.px) : count}
        aria-valuetext={text}
        className="relative h-1 min-w-12 flex-1 overflow-hidden rounded-full bg-track"
      >
        <span className={cn("absolute inset-y-0 start-0 rounded-full transition-[width] duration-200", `tone-${tone}`)} style={{ width: `${Math.min(100, ratio * 100)}%`, background: "var(--tone)" }} />
      </div>
      <span aria-hidden className="tabular shrink-0 text-[12px] text-fg-muted">
        <span className={cn(`tone-${tone}`, "text-(--tone)")}>{nf.format(count)}</span>
        <span className="text-fg-subtle"> / {nf.format(max)}</span>
        {px ? <span className="ms-2 text-fg-subtle">{nf.format(Math.round(m!.px))} px</span> : null}
      </span>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Tabs convenience                                                     */
/* ------------------------------------------------------------------ */

export interface LinkPreviewTabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "defaultValue" | "onChange">, PreviewFrameProps {
  data: LinkPreviewData;
  /** Which previews to offer. Default search, Facebook, X, WhatsApp. */
  platforms?: ("search" | SocialPlatform)[];
  defaultValue?: "search" | SocialPlatform;
  highlight?: string;
  labels?: Partial<LinkPreviewLabels>;
}

/** Search | Facebook | X | WhatsApp previews of one link in tabs; search has a desktop / mobile switch. */
export function LinkPreviewTabs({ data, platforms = ["search", "facebook", "x", "whatsapp"], defaultValue, highlight: term, appearance, size, labels, className, ...props }: LinkPreviewTabsProps) {
  const t = useLabels("linkPreview", previewLabels, labels);
  const [device, setDevice] = React.useState<SerpDevice>("desktop");
  return (
    <div data-slot="link-preview-tabs" className={className} {...props}>
      <Tabs defaultValue={defaultValue ?? platforms[0]}>
        <TabsList aria-label={t("tabs")}>
          {platforms.map((p) => (
            <TabsTrigger key={p} value={p}>
              {p === "search" ? t("searchTab") : PLATFORM_NAME[p]}
            </TabsTrigger>
          ))}
        </TabsList>
        {platforms.map((p) => (
          <TabsContent key={p} value={p}>
            {p === "search" ? (
              <div className="flex flex-col gap-3">
                <div role="group" aria-label={t("search")} className="inline-flex self-start rounded-ui-sm bg-surface-2 p-0.5 text-[12.5px]">
                  {(["desktop", "mobile"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={device === d}
                      onClick={() => setDevice(d)}
                      className={cn("focus-ring rounded-[calc(var(--radius)-6px)] px-2.5 py-1 font-medium text-fg-muted transition-colors", device === d && "bg-surface text-fg shadow-sm")}
                    >
                      {t(d)}
                    </button>
                  ))}
                </div>
                <SearchPreview data={data} device={device} highlight={term} appearance={appearance} size={size} labels={labels} />
              </div>
            ) : (
              <SocialCardPreview data={data} platform={p} appearance={appearance} size={size} labels={labels} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

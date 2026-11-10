// Frozen data formats (BLOCK-FORMAT.md). Plain TypeScript, no runtime code: components (layer 1)
// import these with `import type`, so zod never reaches a client bundle.

import type { Localized, LocaleCode } from "./localized";
import type { RichInline } from "./rich-doc";
import type { LinkKind } from "./safety";

export type BuiltInAccent = "lime" | "ocean" | "ember" | "rose" | "graphite";

/** Per-section token axes. Every key is optional; missing = inherit from the page. */
export interface BlockTheme {
  /** `light`/`dark` re-theme the subtree; `inherit` (default) keeps the page theme. */
  mode?: "inherit" | "light" | "dark";
  /** Section background. `media` paints `background` under a scrim and forces dark text-on-photo. */
  surface?: "scene" | "surface" | "surface-2" | "accent" | "media";
  /** A built-in accent or a custom `oklch(…)` colour. */
  accent?: BuiltInAccent | (string & {});
  material?: "inherit" | "glass" | "solid";
  density?: "inherit" | "comfortable" | "compact";
  /** Vertical padding: tight ×0.55, normal, loose ×1.35. */
  rhythm?: "tight" | "normal" | "loose";
  /** Background image for `surface: "media"`. */
  background?: ImageRef;
}

/** An image as stored in content. `alt` is required unless `decorative`. */
export interface ImageRef {
  src: string;
  alt?: Localized<string>;
  width: number;
  height: number;
  /** Tiny LQIP data URL shown while loading. */
  blurDataURL?: string;
  /** 0..1 in image space; drives object-position when cropped. Default centre. */
  focal?: { x: number; y: number };
  /** Purely decorative: rendered with `alt=""`. */
  decorative?: boolean;
  /** CMS asset id (Media library). Components ignore it; the renderer may resolve it. */
  assetId?: string;
}

/** A link as stored in content. `href` is localized so each locale can point at its own page. */
export interface LinkRef {
  href: Localized<string>;
  label: Localized<string>;
  kind?: LinkKind;
  newTab?: boolean;
}

export type CtaStyle = "primary" | "secondary" | "link";
export interface CtaRef {
  link: LinkRef;
  style: CtaStyle;
}

/** Money is a decimal string (X11), never a float. */
export interface MoneyValue {
  amount: string;
  /** ISO 4217, e.g. "TRY", "EUR". */
  currency: string;
}

export interface AddressValue {
  line: string;
  district?: string;
  city: string;
  region?: string;
  postalCode?: string;
  /** ISO 3166-1 alpha-2. */
  country: string;
  geo?: { lat: number; lng: number };
}

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
/** `"09:00"`–`"22:00"`; `close` < `open` means the range runs past midnight. */
export interface TimeRange {
  open: string;
  close: string;
}
export interface OpeningHours {
  /** IANA zone of the business, e.g. "Europe/Istanbul". */
  timeZone: string;
  /** Missing or empty day = closed. */
  weekly: Partial<Record<Weekday, TimeRange[]>>;
  /** Date-only `YYYY-MM-DD` exceptions (holidays, events). */
  special?: { date: string; closed?: boolean; ranges?: TimeRange[]; note?: Localized<string> }[];
}

export interface QueryValue {
  kind: "latest" | "category" | "manual";
  limit?: number;
  category?: string;
  ids?: string[];
}

export interface EmbedValue {
  provider: "youtube" | "vimeo" | "google-maps" | "openstreetmap" | "calendly";
  url: string;
}

export type SocialNetwork = "instagram" | "facebook" | "linkedin" | "x" | "youtube" | "tiktok" | "whatsapp" | "telegram" | "google-maps" | "apple-maps" | "yandex-maps";
export interface SocialLink {
  network: SocialNetwork;
  href: string;
}

export interface BlockSchedule {
  /** ISO datetime with zone (`2026-12-01T00:00:00Z`). */
  from?: string;
  until?: string;
}

/**
 * One block in a document. Component blocks (hero, faq…) carry `props` + `v`; text blocks
 * (paragraph, heading…) carry inline `content`; layout blocks carry child blocks in `slots`.
 */
export interface BlockNode<P = Record<string, unknown>> {
  /** Stable, unique within the doc: editor selection, comments, diffs, analytics, React key. */
  id: string;
  /** Registry key, kebab-case, never renamed. */
  type: string;
  /** Schema version of `props` (component blocks). Missing = 1. */
  v?: number;
  /** One of the block's declared variants. */
  variant?: string;
  props?: P;
  /** Inline runs for text blocks (`paragraph`, `heading`, `code`, `list-item`). */
  content?: RichInline[];
  /** Named child lists for layout blocks (`columns.items`, `quote.items`). */
  slots?: Record<string, BlockNode[]>;
  theme?: BlockTheme;
  /** Section anchor (`#menu`). */
  anchor?: string;
  hidden?: boolean;
  schedule?: BlockSchedule;
}

export interface SeoMeta {
  title?: Localized<string>;
  description?: Localized<string>;
  image?: ImageRef;
  canonical?: string;
  noindex?: boolean;
}

export interface DocMeta {
  wordCount?: number;
  readingTime?: number;
  toc?: { id: string; level: number; text: string }[];
}

/**
 * The storage format of every page and post (VamosDoc v1 = PageDoc). Editor-independent;
 * the site renders it without loading the editor.
 */
export interface VamosDoc {
  $schema?: string;
  version: 1;
  /** Document-level locale (one doc per locale, linked by `translationKey`). */
  lang?: LocaleCode;
  /** Field-level locales stored in this doc (`["tr", "en"]`). First = default. */
  locales?: LocaleCode[];
  translationKey?: string;
  seo?: SeoMeta;
  blocks: BlockNode[];
  /** Shared site regions. */
  layout?: { header?: BlockNode[]; footer?: BlockNode[]; overlay?: BlockNode[] };
  /** Derived by the editor, never the source of truth. */
  meta?: DocMeta;
}

/** Alias kept for plan 06 vocabulary. */
export type PageDoc = VamosDoc;

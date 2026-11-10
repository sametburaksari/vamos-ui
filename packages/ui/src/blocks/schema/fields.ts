// Field builders (`f.*`): each returns a zod schema that carries editor metadata via `.meta()`.
// The stored type decides validation; the metadata decides the editor widget, localization
// and lint rules. Server/admin only — components import types, never this file.

import { z } from "zod";
import { LOCALE_KEY_RE } from "./localized";
import { countEmphasis } from "./emphasis";
import { EMOJI_RE, sanitizeHref } from "./safety";
import { RichDocSchema, richDocAllows } from "./rich-doc-schema";
import { BLOCK_ICONS } from "./icons";
import type { RichMarkType, RichNodeType } from "./rich-doc";

export type FieldKind =
  | "heading" | "text" | "rich" | "image" | "link" | "cta" | "list" | "select" | "toggle" | "number"
  | "icon" | "money" | "phone" | "address" | "hours" | "query" | "embed" | "social" | "date" | "group";

/** Metadata attached to every `f.*` schema under `.meta().vamos`. Editors and `localize` read it. */
export interface FieldMeta {
  field: FieldKind;
  /** Human-readable values are localized by default; `localize()` picks one locale. */
  localized?: boolean;
  label?: string;
  help?: string;
  placeholder?: string;
  /** Only meaningful for these variants (editors hide it otherwise). */
  variants?: readonly string[];
  /** Editor widget override ("textarea", "inline-text", "radio-cards"…). */
  widget?: string;
  max?: number;
  min?: number;
  multiline?: boolean;
  /** Image aspect hint: "4:5", "3:2", "21:9"… */
  aspect?: string;
  /** f.list: label template for items ("Question {n}"). */
  itemLabel?: string;
  /** f.query: resolver name and the prop the resolved data lands in. */
  query?: { resource: string; into: string };
  /** f.rich: allowed nodes and marks. */
  nodes?: readonly RichNodeType[];
  marks?: readonly RichMarkType[];
  /** f.embed: allowed providers. */
  allow?: readonly string[];
}

export interface FieldOptions {
  label?: string;
  help?: string;
  placeholder?: string;
  variants?: readonly string[];
  widget?: string;
}

const META = "vamos";

function withMeta<S extends z.ZodType>(schema: S, meta: FieldMeta): S {
  const out: Record<string, unknown> = { [META]: stripUndefined(meta) };
  if (meta.label) out.title = meta.label;
  if (meta.help) out.description = meta.help;
  return schema.meta(out) as S;
}
function stripUndefined<T extends object>(o: T): T {
  const r: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) r[k] = v;
  return r as T;
}

const WRAPPERS = new Set(["optional", "nullable", "default", "prefault", "readonly", "catch", "nonoptional"]);

/** Removes optional/default/nullable/readonly wrappers. */
export function unwrapSchema(schema: z.ZodType): z.ZodType {
  let s = schema;
  for (let i = 0; i < 10; i++) {
    const def = (s as unknown as { _zod: { def: { type: string; innerType?: z.ZodType } } })._zod.def;
    if (WRAPPERS.has(def.type) && def.innerType) s = def.innerType;
    else break;
  }
  return s;
}

/** Reads `f.*` metadata from a schema (looks through optional/default wrappers). */
export function getFieldMeta(schema: z.ZodType): FieldMeta | undefined {
  let s: z.ZodType | undefined = schema;
  for (let i = 0; i < 10 && s; i++) {
    const m = z.globalRegistry.get(s) as Record<string, unknown> | undefined;
    if (m?.[META]) return m[META] as FieldMeta;
    const def: { type: string; innerType?: z.ZodType } = (s as unknown as { _zod: { def: { type: string; innerType?: z.ZodType } } })._zod.def;
    s = WRAPPERS.has(def.type) ? def.innerType : undefined;
  }
  return undefined;
}

/** The zod type name ("object", "array", "string", "union"…) after unwrapping. */
export const schemaKind = (schema: z.ZodType): string => (unwrapSchema(schema) as unknown as { _zod: { def: { type: string } } })._zod.def.type;

const LOCALIZED_RECORDS = new WeakSet<object>();

/** `T` or `{ [locale]: T }`. `localize()` recognises it anywhere in a schema, with or without `f.*`. */
export function localizedSchema<S extends z.ZodType>(inner: S) {
  const map = z.record(z.string().regex(LOCALE_KEY_RE), inner);
  LOCALIZED_RECORDS.add(map);
  return z.union([inner, map]);
}

/** True for a schema built by `localizedSchema` (also after `.meta()` / `.optional()`). */
export function isLocalizedSchema(schema: z.ZodType): boolean {
  const def: { type: string; options?: object[] } = (unwrapSchema(schema) as unknown as { _zod: { def: { type: string; options?: object[] } } })._zod.def;
  return def.type === "union" && !!def.options?.some((o) => LOCALIZED_RECORDS.has(o));
}

const noEmoji = (s: string) => !EMOJI_RE.test(s);
const plainString = (opts: { max?: number; min?: number }) => {
  let s = z.string();
  if (opts.min !== undefined) s = s.min(opts.min);
  if (opts.max !== undefined) s = s.max(opts.max);
  return s.refine(noEmoji, { message: "Emoji are not allowed in block copy." });
};

const safeHref = z.string().min(1).refine((h) => sanitizeHref(h) !== null, { message: "Unsafe or unsupported link (javascript:, data: and unknown schemes are rejected)." });

// ---------------------------------------------------------------- shared value schemas

export const ImageRefSchema = z
  .object({
    src: z.string().min(1).refine((h) => sanitizeHref(h) !== null, { message: "Unsupported image URL." }),
    alt: localizedSchema(z.string()).optional(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    blurDataURL: z.string().startsWith("data:image/").optional(),
    focal: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional(),
    decorative: z.boolean().optional(),
    assetId: z.string().optional(),
  })
  .refine((v) => v.decorative === true || hasText(v.alt), { message: "Describe the image (alt) or mark it decorative.", path: ["alt"] });

function hasText(v: unknown): boolean {
  if (typeof v === "string") return v.trim().length > 0;
  if (v && typeof v === "object") return Object.values(v).some((x) => typeof x === "string" && x.trim().length > 0);
  return false;
}

export const LinkRefSchema = z.object({
  href: localizedSchema(safeHref),
  label: localizedSchema(plainString({ max: 80 })),
  kind: z.enum(["url", "anchor", "tel", "mailto", "whatsapp", "file"]).optional(),
  newTab: z.boolean().optional(),
});

export const TimeRangeSchema = z.object({
  open: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  close: z.string().regex(/^([01]\d|2[0-4]):[0-5]\d$/),
});
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Use a date-only YYYY-MM-DD value." });
export const OpeningHoursSchema = z.object({
  timeZone: z.string().min(1),
  weekly: z.object({
    mon: z.array(TimeRangeSchema).optional(),
    tue: z.array(TimeRangeSchema).optional(),
    wed: z.array(TimeRangeSchema).optional(),
    thu: z.array(TimeRangeSchema).optional(),
    fri: z.array(TimeRangeSchema).optional(),
    sat: z.array(TimeRangeSchema).optional(),
    sun: z.array(TimeRangeSchema).optional(),
  }),
  special: z
    .array(z.object({ date: dateOnly, closed: z.boolean().optional(), ranges: z.array(TimeRangeSchema).optional(), note: localizedSchema(z.string()).optional() }))
    .optional(),
});

export const EMBED_PROVIDERS = ["youtube", "vimeo", "google-maps", "openstreetmap", "calendly"] as const;
const EMBED_HOSTS: Record<(typeof EMBED_PROVIDERS)[number], RegExp> = {
  youtube: /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i,
  vimeo: /^https:\/\/(player\.)?vimeo\.com\//i,
  "google-maps": /^https:\/\/(www\.)?google\.[a-z.]+\/maps|^https:\/\/maps\.app\.goo\.gl\//i,
  openstreetmap: /^https:\/\/(www\.)?openstreetmap\.org\//i,
  calendly: /^https:\/\/calendly\.com\//i,
};
export const SOCIAL_NETWORKS = ["instagram", "facebook", "linkedin", "x", "youtube", "tiktok", "whatsapp", "telegram", "google-maps", "apple-maps", "yandex-maps"] as const;

// ---------------------------------------------------------------- builders

type Loc<L extends boolean> = { localized?: L };
/** `inner` when `localized: false`, else `Localized<inner>`. */
type MaybeLocalized<S extends z.ZodType, L extends boolean> = false extends L ? (true extends L ? ReturnType<typeof localizedSchema<S>> : S) : ReturnType<typeof localizedSchema<S>>;
type Str = ReturnType<typeof plainString>;

function heading<L extends boolean = true>(opts: FieldOptions & Loc<L> & { max?: number } = {}): MaybeLocalized<Str, L> {
  const max = opts.max ?? 140;
  const inner = plainString({ max }).refine((s) => countEmphasis(s) <= 1, { message: "Use at most one *emphasis* per heading." });
  const localized = opts.localized ?? true;
  return withMeta(localized ? localizedSchema(inner) : inner, { field: "heading", localized, max, ...opts }) as never;
}

function text<L extends boolean = true>(opts: FieldOptions & Loc<L> & { max?: number; min?: number; multiline?: boolean } = {}): MaybeLocalized<Str, L> {
  const inner = plainString(opts);
  const localized = opts.localized ?? true;
  return withMeta(localized ? localizedSchema(inner) : inner, { field: "text", localized, ...opts }) as never;
}

function rich<L extends boolean = true>(opts: FieldOptions & Loc<L> & { nodes?: readonly RichNodeType[]; marks?: readonly RichMarkType[] } = {}): MaybeLocalized<typeof RichDocSchema, L> {
  const inner = RichDocSchema.superRefine((doc, ctx) => {
    for (const problem of richDocAllows(doc, opts.nodes, opts.marks)) ctx.addIssue({ code: "custom", message: problem });
  });
  const localized = opts.localized ?? true;
  return withMeta(localized ? localizedSchema(inner) : inner, { field: "rich", localized, ...opts }) as never;
}

function image(opts: FieldOptions & { aspect?: string } = {}) {
  return withMeta(ImageRefSchema, { field: "image", ...opts });
}

function link(opts: FieldOptions = {}) {
  return withMeta(LinkRefSchema, { field: "link", ...opts });
}

function cta(opts: FieldOptions = {}) {
  return withMeta(z.object({ link: LinkRefSchema, style: z.enum(["primary", "secondary", "link"]) }), { field: "cta", ...opts });
}

function list<S extends z.ZodType>(item: S, opts: FieldOptions & { min?: number; max?: number; itemLabel?: string } = {}) {
  let s = z.array(item);
  if (opts.min !== undefined) s = s.min(opts.min);
  if (opts.max !== undefined) s = s.max(opts.max);
  return withMeta(s, { field: "list", ...opts });
}

/** A nested object of fields (an FAQ item, a pricing plan). */
function group<T extends z.ZodRawShape>(shape: T, opts: FieldOptions = {}) {
  return withMeta(z.object(shape), { field: "group", ...opts });
}

function select<const V extends readonly [string, ...string[]]>(options: V, opts: FieldOptions = {}) {
  return withMeta(z.enum(options), { field: "select", ...opts });
}

function toggle(opts: FieldOptions = {}) {
  return withMeta(z.boolean(), { field: "toggle", ...opts });
}

function number(opts: FieldOptions & { min?: number; max?: number; int?: boolean } = {}) {
  let s = opts.int ? z.number().int() : z.number();
  if (opts.min !== undefined) s = s.min(opts.min);
  if (opts.max !== undefined) s = s.max(opts.max);
  return withMeta(s, { field: "number", ...opts });
}

function icon(opts: FieldOptions = {}) {
  return withMeta(z.enum(BLOCK_ICONS), { field: "icon", ...opts });
}

function money(opts: FieldOptions = {}) {
  return withMeta(
    z.object({
      amount: z.string().regex(/^-?\d+(\.\d+)?$/, { message: "Money is a decimal string, e.g. \"1250.00\"." }),
      currency: z.string().regex(/^[A-Z]{3}$/, { message: "Use an ISO 4217 code, e.g. \"TRY\"." }),
    }),
    { field: "money", ...opts },
  );
}

function phone(opts: FieldOptions = {}) {
  return withMeta(z.string().regex(/^\+[1-9]\d{6,14}$/, { message: "Use E.164, e.g. +902160000000." }), { field: "phone", ...opts });
}

function address(opts: FieldOptions = {}) {
  return withMeta(
    z.object({
      line: z.string().min(1),
      district: z.string().optional(),
      city: z.string().min(1),
      region: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().regex(/^[A-Z]{2}$/),
      geo: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
    }),
    { field: "address", ...opts },
  );
}

function hours(opts: FieldOptions = {}) {
  return withMeta(OpeningHoursSchema, { field: "hours", ...opts });
}

/** A data query resolved by the renderer (`resolvers[resource]`) into the plain prop `into`. */
function query(resource: string, opts: FieldOptions & { into?: string; kinds?: readonly ("latest" | "category" | "manual")[] } = {}) {
  const kinds = (opts.kinds ?? ["latest", "category", "manual"]) as unknown as readonly [string, ...string[]];
  return withMeta(
    z.object({ kind: z.enum(kinds), limit: z.number().int().min(1).max(48).optional(), category: z.string().optional(), ids: z.array(z.string()).optional() }),
    { field: "query", query: { resource, into: opts.into ?? resource }, ...opts },
  );
}

function embed(opts: FieldOptions & { allow?: readonly (typeof EMBED_PROVIDERS)[number][] } = {}) {
  const allow = opts.allow ?? EMBED_PROVIDERS;
  return withMeta(
    z
      .object({ provider: z.enum(EMBED_PROVIDERS), url: z.url() })
      .refine((v) => allow.includes(v.provider), { message: "This embed provider is not allowed here.", path: ["provider"] })
      .refine((v) => EMBED_HOSTS[v.provider].test(v.url), { message: "The URL does not belong to the selected provider.", path: ["url"] }),
    { field: "embed", allow, ...opts },
  );
}

function social(opts: FieldOptions & { max?: number } = {}) {
  return withMeta(z.array(z.object({ network: z.enum(SOCIAL_NETWORKS), href: safeHref })).max(opts.max ?? 12), { field: "social", ...opts });
}

function date(opts: FieldOptions = {}) {
  return withMeta(dateOnly, { field: "date", ...opts });
}

/**
 * Field builders. Each returns a zod schema; metadata drives editors, `localize()` and `lintPage()`.
 *
 * ```ts
 * const schema = z.object({
 *   title: f.heading({ max: 80 }),
 *   lead: f.text({ multiline: true }).optional(),
 *   image: f.image({ aspect: "4:5" }),
 *   actions: f.list(f.cta(), { max: 2 }),
 * });
 * ```
 */
export const f = { heading, text, rich, image, link, cta, list, group, select, toggle, number, icon, money, phone, address, hours, query, embed, social, date };

// zod schemas for the frozen node/document formats (types.ts, BLOCK-FORMAT.md §1–2).

import { z } from "zod";
import { ImageRefSchema, localizedSchema } from "./fields";
import { RichInlineSchema } from "./rich-doc-schema";
import { LOCALE_KEY_RE } from "./localized";
import type { BlockNode, VamosDoc } from "./types";

export const ACCENTS = ["lime", "ocean", "ember", "rose", "graphite"] as const;

export const BlockThemeSchema = z
  .object({
    mode: z.enum(["inherit", "light", "dark"]),
    surface: z.enum(["scene", "surface", "surface-2", "accent", "media"]),
    accent: z.union([z.enum(ACCENTS), z.string().regex(/^oklch\(\s*[\d.]+%?\s+[\d.]+\s+[\d.]+(deg)?\s*(\/\s*[\d.]+%?\s*)?\)$/, { message: "Custom accents must be oklch(L C H)." })]),
    material: z.enum(["inherit", "glass", "solid"]),
    density: z.enum(["inherit", "comfortable", "compact"]),
    rhythm: z.enum(["tight", "normal", "loose"]),
    background: ImageRefSchema,
  })
  .partial()
  .refine((t) => t.surface !== "media" || !!t.background, { message: "A media surface needs a background image.", path: ["background"] });

/** Ids: 4–64 chars of `[A-Za-z0-9_-]` (`b_7Hq2`, nanoid, uuid all fit). */
export const BlockIdSchema = z.string().regex(/^[A-Za-z0-9_-]{4,64}$/, { message: "Block ids are 4–64 characters of A–Z, a–z, 0–9, _ and -." });
export const BlockTypeSchema = z.string().regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, { message: "Block types are kebab-case." });
export const AnchorSchema = z.string().regex(/^[a-z0-9-]+$/, { message: "Anchors are lowercase letters, digits and hyphens." });
export const ScheduleSchema = z.object({ from: z.iso.datetime({ offset: true }), until: z.iso.datetime({ offset: true }) }).partial();

/** Common node fields; `props` stays `unknown` here — `registry.nodeSchema()` narrows it per type. */
export const blockNodeBase = {
  id: BlockIdSchema,
  type: BlockTypeSchema,
  v: z.number().int().positive().optional(),
  variant: z.string().optional(),
  content: z.array(RichInlineSchema).optional(),
  theme: BlockThemeSchema.optional(),
  anchor: AnchorSchema.optional(),
  hidden: z.boolean().optional(),
  schedule: ScheduleSchema.optional(),
};

/** Storage-level node schema (any type, props unchecked). */
export const BlockNodeSchema: z.ZodType<BlockNode> = z.lazy(() =>
  z.object({
    ...blockNodeBase,
    props: z.record(z.string(), z.unknown()).optional(),
    slots: z.record(z.string(), z.array(BlockNodeSchema)).optional(),
  }),
);

export const SeoMetaSchema = z.object({
  title: localizedSchema(z.string().max(120)).optional(),
  description: localizedSchema(z.string().max(320)).optional(),
  image: ImageRefSchema.optional(),
  canonical: z.string().optional(),
  noindex: z.boolean().optional(),
});

const LocaleCodeSchema = z.string().regex(LOCALE_KEY_RE);

/** Builds a VamosDoc schema around a node schema (storage-level or registry-strict). */
export function docSchemaOf(node: z.ZodType<BlockNode>) {
  return z.object({
    $schema: z.string().optional(),
    version: z.literal(1),
    lang: LocaleCodeSchema.optional(),
    locales: z.array(LocaleCodeSchema).min(1).optional(),
    translationKey: z.string().optional(),
    seo: SeoMetaSchema.optional(),
    blocks: z.array(node),
    layout: z.object({ header: z.array(node), footer: z.array(node), overlay: z.array(node) }).partial().optional(),
    meta: z
      .object({
        wordCount: z.number().optional(),
        readingTime: z.number().optional(),
        toc: z.array(z.object({ id: z.string(), level: z.number(), text: z.string() })).optional(),
      })
      .optional(),
  });
}

export const VamosDocSchema: z.ZodType<VamosDoc> = docSchemaOf(BlockNodeSchema);
export const PageDocSchema = VamosDocSchema;

export const VAMOS_DOC_SCHEMA_URL = "https://ui.vamos.ist/schema/doc-1.json";

/**
 * Text node types every renderer understands without a registry entry (post bodies, articles).
 * A registry may override any of them with its own definition.
 */
export const CORE_TEXT_TYPES = ["paragraph", "heading", "list", "list-item", "quote", "code", "divider"] as const;
export type CoreTextType = (typeof CORE_TEXT_TYPES)[number];
export const isCoreTextType = (t: string): t is CoreTextType => (CORE_TEXT_TYPES as readonly string[]).includes(t);

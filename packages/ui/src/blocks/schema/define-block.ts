// defineBlock + registry: ONE definition per block, shared by the site renderer, the block
// editor (inspector, inserter, slots) and AI/JSON tooling (X6). React appears only as a type.

import { z } from "zod";
import type * as React from "react";
import { blockNodeBase, docSchemaOf, BlockNodeSchema, isCoreTextType, VAMOS_DOC_SCHEMA_URL } from "./nodes";
import type { BlockNode } from "./types";
import type { BlockComponentProps } from "../types";
import type { LintIssueInput } from "./lint-types";

export type BlockCategory = "intro" | "content" | "media" | "proof" | "conversion" | "local" | "blog" | "site" | "layout" | "text" | "form" | "embed";
export type BlockRegion = "header" | "body" | "footer" | "overlay";

/** Removes the `{ [locale]: T }` branch of every Localized<T> — what a component receives after `localize()`. */
export type Delocalized<T> = T extends string | number | boolean | null | undefined | bigint
  ? T
  : T extends readonly (infer U)[]
    ? Delocalized<U>[]
    : T extends object
      ? { [K in keyof T]: Delocalized<DropLocaleMap<T[K]>> }
      : T;
type DropLocaleMap<T> = T extends unknown ? (T extends readonly unknown[] ? T : string extends keyof T ? never : T) : never;

/** Props a registered block's component gets for schema `S`. */
export type BlockPropsOf<S extends z.ZodType> = Delocalized<z.output<S>>;

/** Inspector hints per prop (the editor's SchemaForm reads them; `f.*` metadata is the default). */
export type FieldHints<P> = { [K in keyof P]?: { widget?: string; label?: string; help?: string; placeholder?: string; group?: string; hidden?: boolean } };

export interface SlotSpec {
  label?: string;
  /** Allowed child block types. Default: any body block. */
  allow?: readonly string[];
  min?: number;
  max?: number;
}

export interface BlockSupports {
  /** Editors may set `node.anchor`. Default true. */
  anchor?: boolean;
  /** Editors may set `node.theme`. Default true. */
  theme?: boolean;
  /** Width options a layout may offer. */
  align?: readonly ("wide" | "full")[];
  /** Editors may set `theme.rhythm`. Default true. */
  spacing?: boolean;
  /** This block's title is the page title: the first one on a page gets `h1` (hero, page intro). */
  pageTitle?: boolean;
}

export interface JsonLdContext {
  locale: string;
  node: BlockNode;
}

export interface BlockDefinitionInput<S extends z.ZodObject = z.ZodObject, V extends string = string> {
  /** Unique, kebab-case, never renamed. */
  type: string;
  /** Schema version of `props`. Bump on any breaking change and add a `migrate` step. */
  version: number;
  /** Inserter title ("Map & opening hours"). */
  title: string;
  description?: string;
  category: BlockCategory;
  /** Page region the block belongs to. Default "body". */
  region?: BlockRegion;
  /** Inserter search aliases ("banner", "intro"). */
  keywords?: readonly string[];
  /** Lucide icon name for the inserter (kebab-case). */
  icon?: string;
  variants?: readonly [V, ...V[]];
  defaultVariant?: V;
  variantMeta?: Partial<Record<V, { label: string; description?: string; thumb?: string }>>;
  /** Props schema (built with `f.*`). Defaults via `.default()`. */
  schema: S;
  fields?: FieldHints<z.input<S>>;
  slots?: Record<string, SlotSpec>;
  /** `migrate[n]` upgrades props from version n to n + 1. */
  migrate?: Record<number, (props: any, node: BlockNode) => unknown>;
  supports?: BlockSupports;
  /** Inserter preview and the fallback for invalid fields. Realistic copy, never lorem ipsum. */
  preview?: { props?: z.input<S>; variant?: V; image?: string };
  /** Sample content per variant/locale (AI drafts, docs, empty blocks). */
  examples?: (variant: V, locale: string) => z.input<S>;
  /** JSON-LD for this block; the renderer merges every block into one @graph. */
  jsonLd?: (props: BlockPropsOf<S>, ctx: JsonLdContext) => Record<string, unknown> | Record<string, unknown>[] | null;
  /** Block-specific lint rules (D6). */
  lint?: (props: BlockPropsOf<S>, node: BlockNode) => LintIssueInput[];
  /** The SAME component on the site and in the editor canvas. Omit for schema-only (server) registries. */
  component?: React.ComponentType<BlockComponentProps<BlockPropsOf<S>>>;
}

export interface BlockDefinition<S extends z.ZodObject = z.ZodObject, V extends string = string> extends BlockDefinitionInput<S, V> {
  readonly region: BlockRegion;
  readonly supports: BlockSupports;
  /** Strict node schema for this type. */
  readonly nodeSchema: z.ZodType<BlockNode>;
  /** Example props for a variant (preview → examples → schema defaults). */
  sample(variant?: V, locale?: string): z.input<S>;
}

/** A block definition with any props schema (registries, renderers). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyBlockDefinition = BlockDefinition<any, any>;

export class BlockDefinitionError extends Error {
  constructor(type: string, message: string) {
    super(`defineBlock("${type}"): ${message}`);
    this.name = "BlockDefinitionError";
  }
}

/**
 * Defines a block once for the site, the editor and JSON tooling.
 *
 * ```ts
 * export const faqBlock = defineBlock({
 *   type: "faq", version: 1, title: "FAQ", category: "content",
 *   schema: z.object({ title: f.heading(), items: f.list(f.group({ q: f.text(), a: f.rich() }), { min: 1 }) }),
 *   preview: { props: { title: "Before you *book*", items: [...] } },
 *   component: Faq,
 * });
 * ```
 */
export function defineBlock<S extends z.ZodObject, const V extends string = string>(def: BlockDefinitionInput<S, V>): BlockDefinition<S, V> {
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(def.type)) throw new BlockDefinitionError(def.type, "type must be kebab-case.");
  if (!Number.isInteger(def.version) || def.version < 1) throw new BlockDefinitionError(def.type, "version must be a positive integer.");
  for (const k of Object.keys(def.migrate ?? {})) {
    const n = Number(k);
    if (!Number.isInteger(n) || n < 1 || n >= def.version) throw new BlockDefinitionError(def.type, `migrate[${k}] must upgrade a version below ${def.version}.`);
  }
  for (let n = 1; n < def.version; n++) {
    if (!def.migrate?.[n]) throw new BlockDefinitionError(def.type, `missing migrate[${n}] (v${n} → v${n + 1}); stored content would be lost.`);
  }
  if (def.defaultVariant && def.variants && !def.variants.includes(def.defaultVariant)) throw new BlockDefinitionError(def.type, `defaultVariant "${def.defaultVariant}" is not in variants.`);

  const variantSchema = def.variants ? z.enum(def.variants as unknown as [string, ...string[]]).optional() : z.string().optional();
  const nodeSchema = z.object({
    ...blockNodeBase,
    type: z.literal(def.type),
    variant: variantSchema,
    props: def.schema,
    slots: z.record(z.string(), z.array(BlockNodeSchema)).optional(),
  }) as unknown as z.ZodType<BlockNode>;

  const out: BlockDefinition<S, V> = {
    ...def,
    region: def.region ?? "body",
    supports: { anchor: true, theme: true, spacing: true, ...def.supports },
    nodeSchema,
    sample(variant, locale = "en") {
      if (variant && def.examples) return def.examples(variant, locale);
      if (def.preview?.props) return def.preview.props;
      const v = (variant ?? def.defaultVariant ?? def.variants?.[0]) as V;
      if (def.examples) return def.examples(v, locale);
      const parsed = def.schema.safeParse({});
      return (parsed.success ? parsed.data : {}) as z.input<S>;
    },
  };
  return Object.freeze(out);
}

export interface BlockRegistry {
  readonly definitions: readonly AnyBlockDefinition[];
  readonly types: readonly string[];
  get(type: string): AnyBlockDefinition | undefined;
  has(type: string): boolean;
  /** True for registered types and the core text types (paragraph, heading…). */
  knows(type: string): boolean;
  list(filter?: { region?: BlockRegion; category?: BlockCategory }): AnyBlockDefinition[];
  /** A new registry with more blocks (later definitions win only when `override` is set). */
  extend(defs: readonly AnyBlockDefinition[], opts?: { override?: boolean }): BlockRegistry;
  /** Strict node schema: a discriminated union of every registered type (core text types pass loosely). */
  nodeSchema(): z.ZodType<BlockNode>;
  /** Strict VamosDoc schema for this registry. */
  docSchema(): z.ZodType;
  /** JSON Schema of the doc format with every block's props (LLM tool definitions, external builders). */
  toJSONSchema(opts?: { target?: "doc" | "node" }): Record<string, unknown>;
}

/**
 * Collects block definitions. Tree-shakeable: import only the blocks a site uses.
 *
 * ```ts
 * export const siteBlocks = createRegistry([heroBlock, faqBlock, ctaBlock]);
 * ```
 */
export function createRegistry(defs: readonly AnyBlockDefinition[] = []): BlockRegistry {
  const map = new Map<string, AnyBlockDefinition>();
  for (const d of defs) {
    if (map.has(d.type)) throw new BlockDefinitionError(d.type, "registered twice.");
    map.set(d.type, d);
  }
  let node: z.ZodType<BlockNode> | undefined;
  const reg: BlockRegistry = {
    definitions: [...map.values()],
    types: [...map.keys()],
    get: (t) => map.get(t),
    has: (t) => map.has(t),
    knows: (t) => map.has(t) || isCoreTextType(t),
    list: (filter) => [...map.values()].filter((d) => (!filter?.region || d.region === filter.region) && (!filter?.category || d.category === filter.category)),
    extend(more, opts) {
      const next = new Map(map);
      for (const d of more) {
        if (next.has(d.type) && !opts?.override) throw new BlockDefinitionError(d.type, "already registered (pass { override: true } to replace it).");
        next.set(d.type, d);
      }
      return createRegistry([...next.values()]);
    },
    nodeSchema() {
      if (node) return node;
      const strict = [...map.values()].map((d) => d.nodeSchema);
      const loose = BlockNodeSchema.refine((n) => isCoreTextType(n.type), { message: "Unknown block type." });
      node = strict.length ? (z.union([...strict, loose] as unknown as [z.ZodType, z.ZodType, ...z.ZodType[]]) as unknown as z.ZodType<BlockNode>) : loose;
      return node;
    },
    docSchema() {
      return docSchemaOf(reg.nodeSchema());
    },
    toJSONSchema(opts) {
      const target = opts?.target ?? "doc";
      const strict = [...map.values()].map((d) => d.nodeSchema);
      const nodeUnion = strict.length > 1 ? z.union(strict as unknown as [z.ZodType, z.ZodType, ...z.ZodType[]]) : (strict[0] ?? BlockNodeSchema);
      const schema = target === "node" ? nodeUnion : docSchemaOf(nodeUnion as z.ZodType<BlockNode>);
      const json = z.toJSONSchema(schema, { unrepresentable: "any", io: "input" }) as Record<string, unknown>;
      if (target === "doc") json.$id = VAMOS_DOC_SCHEMA_URL;
      return json;
    },
  };
  return reg;
}

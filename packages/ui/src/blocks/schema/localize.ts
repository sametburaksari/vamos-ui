// localize(): turns Localized<T> props into plain values for one locale (D2a). Components never
// see locale maps. Deterministic fallback chain: locale → base language → fallbacks → first.

import type { z } from "zod";
import { pickLocale, type LocaleCode } from "./localized";
import { mapFields } from "./walk";
import { BlockThemeSchema } from "./nodes";
import type { BlockNode } from "./types";
import type { BlockRegistry } from "./define-block";

export interface LocalizeOptions {
  locale: LocaleCode;
  /** Tried after `locale`. Default `["en"]`. */
  fallback?: readonly LocaleCode[];
}

/** Localizes a props object with its schema. */
export function localizeProps<T = unknown>(schema: z.ZodType, props: unknown, opts: LocalizeOptions): T {
  return mapFields(schema, props, (v) => (v.localized ? { replace: pickLocale(v.value, opts.locale, { fallback: opts.fallback }) } : undefined)) as T;
}

/**
 * Localizes one node (props, theme background alt, child slots). Unknown types are returned
 * unchanged. `schema` may be the block's props schema or a registry.
 *
 * ```ts
 * localize(node, siteBlocks, { locale: "tr", fallback: ["en"] });
 * ```
 */
export function localize(node: BlockNode, source: BlockRegistry | z.ZodType | undefined, opts: LocalizeOptions): BlockNode {
  const schema = !source ? undefined : "definitions" in (source as object) ? (source as BlockRegistry).get(node.type)?.schema : (source as z.ZodType);
  const out: BlockNode = { ...node };
  if (schema && node.props !== undefined) out.props = localizeProps(schema, node.props, opts);
  if (node.theme) out.theme = localizeProps(BlockThemeSchema, node.theme, opts);
  if (node.slots && source && "definitions" in (source as object)) {
    out.slots = Object.fromEntries(Object.entries(node.slots).map(([k, list]) => [k, list.map((c) => localize(c, source, opts))]));
  }
  return out;
}

// Schema-driven traversal of block props. Powers localize(), lintPage() and resolver lookup.

import type { z } from "zod";
import { getFieldMeta, isLocalizedSchema, unwrapSchema, type FieldMeta } from "./fields";

export interface FieldVisit {
  schema: z.ZodType;
  meta?: FieldMeta;
  value: unknown;
  /** Dot path from the props root ("items.2.title"). */
  path: string;
  /** The value is a Localized<T> (plain or locale map). */
  localized: boolean;
}

/** Return `{ replace }` to substitute the value (and stop descending), `"skip"` to stop descending. */
export type FieldVisitor = (visit: FieldVisit) => { replace: unknown } | "skip" | void;

type Def = { type: string; shape?: Record<string, z.ZodType>; element?: z.ZodType; options?: z.ZodType[]; getter?: () => z.ZodType; in?: z.ZodType };
const defOf = (s: z.ZodType) => (s as unknown as { _zod: { def: Def } })._zod.def;
const join = (a: string, b: string | number) => (a ? `${a}.${b}` : String(b));

/**
 * Walks `value` alongside `schema`, calling `visit` for every node. Returns the (possibly
 * transformed) value; the input is never mutated.
 */
export function mapFields(schema: z.ZodType, value: unknown, visit: FieldVisitor, path = ""): unknown {
  if (value === undefined) return value;
  const localized = isLocalizedSchema(schema);
  const result = visit({ schema, meta: getFieldMeta(schema), value, path, localized });
  if (result && typeof result === "object" && "replace" in result) return result.replace;
  if (result === "skip" || localized) return value;

  let s = unwrapSchema(schema);
  for (let i = 0; i < 5; i++) {
    const d = defOf(s);
    if (d.type === "lazy" && d.getter) s = unwrapSchema(d.getter());
    else if (d.type === "pipe" && d.in) s = unwrapSchema(d.in);
    else break;
  }
  const def = defOf(s);
  if (def.type === "object" && def.shape && value && typeof value === "object" && !Array.isArray(value)) {
    const src = value as Record<string, unknown>;
    let out: Record<string, unknown> | undefined;
    for (const key of Object.keys(def.shape)) {
      if (!(key in src)) continue;
      const next = mapFields(def.shape[key]!, src[key], visit, join(path, key));
      if (next !== src[key]) (out ??= { ...src })[key] = next;
    }
    return out ?? value;
  }
  if (def.type === "array" && def.element && Array.isArray(value)) {
    let out: unknown[] | undefined;
    value.forEach((item, i) => {
      const next = mapFields(def.element!, item, visit, join(path, i));
      if (next !== item) (out ??= [...value])[i] = next;
    });
    return out ?? value;
  }
  if (def.type === "union" && def.options) {
    const match = def.options.find((o) => o.safeParse(value).success);
    if (match) return mapFields(match, value, visit, path);
  }
  return value;
}

/** Read-only walk. */
export function walkFields(schema: z.ZodType, value: unknown, visit: (v: FieldVisit) => "skip" | void): void {
  mapFields(schema, value, (v) => visit(v) ?? undefined);
}

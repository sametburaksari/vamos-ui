// Render-time validation with salvage: keep every valid field, replace only the broken ones.

import type { z } from "zod";
import type { AnyBlockDefinition } from "./define-block";
import type { BlockNode } from "./types";

export interface ValidationResult<P = Record<string, unknown>> {
  ok: boolean;
  /** Parsed props (defaults applied). Present when `ok`. */
  data?: P;
  /** Top-level fields replaced by sample/default values. */
  replaced: string[];
  issues: z.core.$ZodIssue[];
}

/**
 * Validates a node's props against its definition. When invalid, every top-level field that fails
 * is replaced by the block's sample value (or dropped to its default), so one bad field never
 * blanks the whole block. `ok: false` only when even that cannot produce valid props.
 */
export function validateNode(node: BlockNode, def: AnyBlockDefinition): ValidationResult {
  const props = node.props ?? {};
  const first = def.schema.safeParse(props);
  if (first.success) return { ok: true, data: first.data as Record<string, unknown>, replaced: [], issues: [] };

  const shape = def.schema.shape as Record<string, z.ZodType>;
  const sample = (def.sample(node.variant) ?? {}) as Record<string, unknown>;
  const fixed: Record<string, unknown> = {};
  const replaced: string[] = [];
  for (const key of Object.keys(shape)) {
    const field = shape[key]!;
    const value = (props as Record<string, unknown>)[key];
    if (field.safeParse(value).success) {
      if (value !== undefined) fixed[key] = value;
      continue;
    }
    replaced.push(key);
    if (sample[key] !== undefined && field.safeParse(sample[key]).success) fixed[key] = sample[key];
  }
  const second = def.schema.safeParse(fixed);
  return second.success
    ? { ok: true, data: second.data as Record<string, unknown>, replaced, issues: first.error.issues }
    : { ok: false, replaced, issues: first.error.issues };
}

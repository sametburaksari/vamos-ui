// Schema evolution: block props migrate on read (v1 → v2 → …), docs migrate by `version`.

import type { BlockNode, VamosDoc } from "./types";
import type { AnyBlockDefinition, BlockRegistry } from "./define-block";

export interface MigrationResult {
  node: BlockNode;
  from: number;
  to: number;
  migrated: boolean;
  /** Stored with a newer schema than this definition knows: rendered as-is, never downgraded. */
  newer?: boolean;
  error?: Error;
}

/**
 * Runs `def.migrate[n]` for every step from the node's `v` (default 1) to `def.version`.
 * A failing step leaves the node untouched and reports the error — content is never dropped.
 */
export function migrateNode(node: BlockNode, def: AnyBlockDefinition): MigrationResult {
  const from = node.v ?? 1;
  const to = def.version;
  if (from === to) return { node, from, to, migrated: false };
  if (from > to) return { node, from, to, migrated: false, newer: true };
  let props: unknown = node.props ?? {};
  try {
    for (let n = from; n < to; n++) {
      const step = def.migrate?.[n];
      if (!step) throw new Error(`No migration for "${def.type}" v${n} → v${n + 1}.`);
      props = step(props, node);
    }
  } catch (error) {
    return { node, from, to, migrated: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
  return { node: { ...node, v: to, props: props as Record<string, unknown> }, from, to, migrated: true };
}

/** Document-format migrations: `docMigrations[n]` upgrades a doc from version n to n + 1. */
export const docMigrations: Record<number, (doc: Record<string, unknown>) => Record<string, unknown>> = {};
export const CURRENT_DOC_VERSION = 1;

function migrateList(list: BlockNode[] | undefined, registry: BlockRegistry | undefined, onResult?: (r: MigrationResult) => void): BlockNode[] | undefined {
  if (!list) return list;
  return list.map((node) => {
    let next = node;
    const def = registry?.get(node.type);
    if (def) {
      const r = migrateNode(node, def);
      onResult?.(r);
      next = r.node;
    }
    if (next.slots) next = { ...next, slots: Object.fromEntries(Object.entries(next.slots).map(([k, v]) => [k, migrateList(v, registry, onResult)!])) };
    return next;
  });
}

/**
 * Brings any stored doc to the current format and every block to its current version.
 * Accepts the plan-06 shape `{ v: 1 }` as an alias of `{ version: 1 }`.
 */
export function migrateDoc(input: unknown, registry?: BlockRegistry, onResult?: (r: MigrationResult) => void): VamosDoc {
  if (!input || typeof input !== "object") throw new TypeError("migrateDoc: expected a document object.");
  let doc = { ...(input as Record<string, unknown>) };
  if (doc.version === undefined && typeof doc.v === "number") {
    doc.version = doc.v;
    delete doc.v;
  }
  let version = typeof doc.version === "number" ? doc.version : 1;
  while (version < CURRENT_DOC_VERSION) {
    const step = docMigrations[version];
    if (!step) throw new Error(`No document migration from version ${version}.`);
    doc = step(doc);
    version++;
  }
  doc.version = CURRENT_DOC_VERSION;
  const d = doc as unknown as VamosDoc;
  return {
    ...d,
    blocks: migrateList(d.blocks ?? [], registry, onResult)!,
    ...(d.layout
      ? { layout: { header: migrateList(d.layout.header, registry, onResult), footer: migrateList(d.layout.footer, registry, onResult), overlay: migrateList(d.layout.overlay, registry, onResult) } }
      : null),
  };
}

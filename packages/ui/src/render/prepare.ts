// The render pipeline as pure data: filter hidden/scheduled → migrate → validate (salvage) →
// localize → heading levels → collect queries. No React; unit-testable and reusable by builders.

import { migrateDoc, migrateNode } from "../blocks/schema/migrate";
import { validateNode } from "../blocks/schema/validate";
import { localize, localizeProps } from "../blocks/schema/localize";
import { walkFields } from "../blocks/schema/walk";
import { isCoreTextType } from "../blocks/schema/nodes";
import type { AnyBlockDefinition, BlockRegistry, BlockRegion } from "../blocks/schema/define-block";
import type { BlockNode, VamosDoc } from "../blocks/schema/types";
import type { LintIssue } from "../blocks/schema/lint-types";

export type PreparedStatus = "ok" | "core" | "unknown" | "invalid" | "newer" | "unrenderable";

export interface PreparedQuery {
  /** Resolver name (`f.query("posts")` → "posts"). */
  resource: string;
  /** Prop the resolved data lands in. */
  into: string;
  /** The stored query value ({ kind, limit, … }). */
  query: unknown;
}

export interface PreparedNode {
  /** Migrated + localized node. */
  node: BlockNode;
  def?: AnyBlockDefinition;
  status: PreparedStatus;
  /** Validated, localized props (defaults applied). */
  props: Record<string, unknown>;
  /** Top-level fields replaced by sample values during salvage. */
  replaced: string[];
  headingLevel: 1 | 2;
  region: BlockRegion;
  slots: Record<string, PreparedNode[]>;
  queries: PreparedQuery[];
}

export interface PrepareOptions {
  registry: BlockRegistry;
  /** Active locale. Default: `doc.lang ?? doc.locales[0] ?? "en"`. */
  locale?: string;
  fallbackLocales?: readonly string[];
  /** Builder canvas: keep hidden/scheduled blocks (marked) and show placeholders. */
  editMode?: boolean;
  /** Clock for `schedule`. Default `new Date()`. */
  now?: Date;
  /** Called for every problem found (logging, builder badges). */
  onIssue?: (issue: LintIssue) => void;
}

export interface PreparedDoc {
  doc: VamosDoc;
  locale: string;
  header: PreparedNode[];
  body: PreparedNode[];
  footer: PreparedNode[];
  overlay: PreparedNode[];
  issues: LintIssue[];
}

/** Whether a node is outside its schedule window at `now`. */
export function isOutsideSchedule(node: BlockNode, now: Date): boolean {
  const s = node.schedule;
  if (!s) return false;
  const t = now.getTime();
  if (s.from && Number.isFinite(Date.parse(s.from)) && t < Date.parse(s.from)) return true;
  if (s.until && Number.isFinite(Date.parse(s.until)) && t >= Date.parse(s.until)) return true;
  return false;
}

/**
 * Turns a stored doc into render-ready nodes for one locale. Never throws on bad content:
 * problems become statuses + issues, and content is never dropped from the source doc.
 */
export function prepareDoc(input: VamosDoc | unknown, opts: PrepareOptions): PreparedDoc {
  const issues: LintIssue[] = [];
  const report = (i: LintIssue) => {
    issues.push(i);
    opts.onIssue?.(i);
  };
  const doc = migrateDoc(input);
  const locale = opts.locale ?? doc.lang ?? doc.locales?.[0] ?? "en";
  const fallback = opts.fallbackLocales ?? [...(doc.locales ?? []).filter((l) => l !== locale), "en"];
  const now = opts.now ?? new Date();
  const { registry, editMode } = opts;

  const prepareNode = (raw: BlockNode, region: BlockRegion): PreparedNode | null => {
    if (!editMode && (raw.hidden || isOutsideSchedule(raw, now))) return null;
    const def = registry.get(raw.type);
    const base = { replaced: [] as string[], headingLevel: 2 as const, region, queries: [] as PreparedQuery[] };
    const prepareSlots = (n: BlockNode) =>
      Object.fromEntries(Object.entries(n.slots ?? {}).map(([k, list]) => [k, list.map((c) => prepareNode(c, region)).filter((c): c is PreparedNode => !!c)]));

    if (!def) {
      if (isCoreTextType(raw.type)) {
        const node = localize(raw, undefined, { locale, fallback });
        return { ...base, node, status: "core", props: (raw.props ?? {}) as Record<string, unknown>, slots: prepareSlots(raw) };
      }
      report({ severity: "warning", code: "unknown-block", message: `Unknown block type "${raw.type}".`, blockId: raw.id, blockType: raw.type });
      return { ...base, node: raw, status: "unknown", props: {}, slots: {} };
    }

    const migrated = migrateNode(raw, def);
    if (migrated.error) report({ severity: "error", code: "missing-migration", message: migrated.error.message, blockId: raw.id, blockType: raw.type });
    if (migrated.newer) report({ severity: "warning", code: "newer-version", message: `"${raw.type}" v${raw.v} is newer than v${def.version}.`, blockId: raw.id, blockType: raw.type });
    const node = migrated.node;

    const result = validateNode(node, def);
    if (!result.ok || result.replaced.length) {
      for (const iss of result.issues)
        report({ severity: "error", code: "invalid-props", message: iss.message, path: ["props", ...iss.path.map(String)].join("."), blockId: node.id, blockType: node.type });
    }
    const status: PreparedStatus = !result.ok ? "unrenderable" : migrated.newer ? "newer" : result.replaced.length ? "invalid" : "ok";
    const props = result.ok ? localizeProps<Record<string, unknown>>(def.schema, result.data, { locale, fallback }) : {};

    const queries: PreparedQuery[] = [];
    if (result.ok)
      walkFields(def.schema, result.data, (f) => {
        if (f.meta?.query && f.value !== undefined) {
          queries.push({ resource: f.meta.query.resource, into: f.meta.query.into, query: f.value });
          return "skip";
        }
      });

    const localizedNode = localize({ ...node, props: undefined }, undefined, { locale, fallback });
    return { ...base, node: { ...localizedNode, props }, def, status, props, replaced: result.replaced, slots: prepareSlots(node), queries };
  };

  const prepareList = (list: readonly BlockNode[] | undefined, region: BlockRegion) => (list ?? []).map((n) => prepareNode(n, region)).filter((n): n is PreparedNode => !!n);

  const body = prepareList(doc.blocks, "body");
  // Automatic heading levels: the first page-title block (hero, page intro) owns the page's h1.
  const first = body.find((n) => n.def?.supports.pageTitle && n.status !== "unknown");
  if (first) first.headingLevel = 1;

  return {
    doc,
    locale,
    header: prepareList(doc.layout?.header, "header"),
    body,
    footer: prepareList(doc.layout?.footer, "footer"),
    overlay: prepareList(doc.layout?.overlay, "overlay"),
    issues,
  };
}

/** Resolver map: `resolvers.posts(query, ctx)` returns the data for `f.query("posts")`. */
export type Resolvers = Record<string, (query: unknown, ctx: { locale: string; node: BlockNode }) => unknown | Promise<unknown>>;

/** Runs every block's queries in parallel and writes the results into its props. Failures leave the prop unset (block's empty state). */
export async function resolveDoc(prepared: PreparedDoc, resolvers: Resolvers = {}, onIssue?: (i: LintIssue) => void): Promise<PreparedDoc> {
  const tasks: Promise<void>[] = [];
  const visit = (n: PreparedNode) => {
    for (const q of n.queries) {
      const fn = resolvers[q.resource];
      if (!fn) {
        const issue: LintIssue = { severity: "warning", code: "missing-resolver", message: `No resolver for "${q.resource}".`, blockId: n.node.id, blockType: n.node.type };
        prepared.issues.push(issue);
        onIssue?.(issue);
        continue;
      }
      tasks.push(
        Promise.resolve()
          .then(() => fn(q.query, { locale: prepared.locale, node: n.node }))
          .then((data) => {
            n.props = { ...n.props, [q.into]: data };
            n.node = { ...n.node, props: n.props };
          })
          .catch((error: unknown) => {
            const issue: LintIssue = { severity: "error", code: "resolver-failed", message: `Resolver "${q.resource}" failed: ${error instanceof Error ? error.message : String(error)}`, blockId: n.node.id, blockType: n.node.type };
            prepared.issues.push(issue);
            onIssue?.(issue);
          }),
      );
    }
    for (const list of Object.values(n.slots)) list.forEach(visit);
  };
  [prepared.header, prepared.body, prepared.footer, prepared.overlay].forEach((list) => list.forEach(visit));
  await Promise.all(tasks);
  return prepared;
}

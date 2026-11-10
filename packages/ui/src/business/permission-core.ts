/**
 * Permission matrix maths — React-free. A value is `resource → action → Scope | boolean`;
 * missing entries mean "not granted here" (and fall back to `inherited` when given).
 */

export type PermissionScope = "none" | "own" | "team" | "all";
export type PermissionLevel = PermissionScope | boolean;
export type PermissionValue = Record<string, Record<string, PermissionLevel | undefined>>;

export interface PermissionDependency {
  /** "edit" … */
  action: string;
  /** … requires "view". */
  requires: string;
}

export interface PermissionChange {
  resource: string;
  action: string;
  from: PermissionLevel | undefined;
  to: PermissionLevel | undefined;
}

export const SCOPE_ORDER: PermissionScope[] = ["none", "own", "team", "all"];

/** 0 none · 1 own · 2 team · 3 all; booleans map to 0 / 3. */
export function scopeRank(v: PermissionLevel | undefined): number {
  if (v === undefined || v === false || v === "none") return 0;
  if (v === true) return 3;
  return SCOPE_ORDER.indexOf(v);
}

export function isGranted(v: PermissionLevel | undefined): boolean {
  return scopeRank(v) > 0;
}

/** The value in effect: own entry, else the inherited one. */
export function effectiveLevel(value: PermissionValue, inherited: PermissionValue | undefined, resource: string, action: string): PermissionLevel | undefined {
  const own = value[resource]?.[action];
  return own !== undefined ? own : inherited?.[resource]?.[action];
}

/** Every changed cell between two values, in resource / action order of `b`, then `a`. */
export function diffPermissions(a: PermissionValue, b: PermissionValue): PermissionChange[] {
  const out: PermissionChange[] = [];
  const resources = [...new Set([...Object.keys(b), ...Object.keys(a)])];
  for (const r of resources) {
    const actions = [...new Set([...Object.keys(b[r] ?? {}), ...Object.keys(a[r] ?? {})])];
    for (const act of actions) {
      const from = a[r]?.[act];
      const to = b[r]?.[act];
      const norm = (v: PermissionLevel | undefined) => (v === undefined || v === false || v === "none" ? undefined : v);
      if (norm(from) !== norm(to)) out.push({ resource: r, action: act, from, to });
    }
  }
  return out;
}

function setLevel(v: PermissionValue, resource: string, action: string, level: PermissionLevel | undefined): PermissionValue {
  const row = { ...(v[resource] ?? {}) };
  if (level === undefined) delete row[action];
  else row[action] = level;
  return { ...v, [resource]: row };
}

/** Same kind of level (boolean or scope) at a given rank. */
function atRank(sample: PermissionLevel | undefined, rank: number, scoped: boolean): PermissionLevel {
  if (!scoped && (typeof sample === "boolean" || sample === undefined)) return rank > 0;
  return SCOPE_ORDER[rank]!;
}

/**
 * Makes a value consistent with dependencies: a granted action raises what it requires to at
 * least its scope ("edit: team" → "view: team"); a revoked requirement lowers its dependents.
 * `changed` (the cell the user just set) decides the direction. Returns the new value and the
 * cells that were adjusted.
 */
export function applyDependencies(
  value: PermissionValue,
  deps: PermissionDependency[],
  options: { changed?: { resource: string; action: string }; scoped?: (action: string) => boolean; resources?: string[] } = {},
): { value: PermissionValue; adjusted: { resource: string; action: string; reason: PermissionDependency; level: PermissionLevel }[] } {
  let v = value;
  const adjusted: { resource: string; action: string; reason: PermissionDependency; level: PermissionLevel }[] = [];
  const scoped = options.scoped ?? (() => false);
  const resources = options.resources ?? Object.keys(value);
  for (let pass = 0; pass < 4; pass++) {
    let touched = false;
    for (const r of resources) {
      for (const d of deps) {
        const dep = v[r]?.[d.action];
        const req = v[r]?.[d.requires];
        const depRank = scopeRank(dep);
        const reqRank = scopeRank(req);
        if (depRank <= reqRank) continue;
        const loweringRequirement = options.changed?.resource === r && options.changed.action === d.requires;
        if (loweringRequirement) {
          const level = atRank(dep, reqRank, scoped(d.action));
          v = setLevel(v, r, d.action, reqRank === 0 ? undefined : level);
          adjusted.push({ resource: r, action: d.action, reason: d, level });
        } else {
          const level = atRank(req, depRank, scoped(d.requires));
          v = setLevel(v, r, d.requires, level);
          adjusted.push({ resource: r, action: d.requires, reason: d, level });
        }
        touched = true;
      }
    }
    if (!touched) break;
  }
  return { value: v, adjusted };
}

/** Grants (or revokes) one action on many resources, or many actions on one resource. */
export function setMany(
  value: PermissionValue,
  cells: { resource: string; action: string }[],
  level: (cell: { resource: string; action: string }) => PermissionLevel | undefined,
): PermissionValue {
  let v = value;
  for (const c of cells) v = setLevel(v, c.resource, c.action, level(c));
  return v;
}

export { setLevel as setPermission };

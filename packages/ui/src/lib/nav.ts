import type * as React from "react";

/**
 * The navigation model shared by Sidebar, App shell, Breadcrumb ("auto"), Page header and the
 * Command palette's "Go to" commands. Pure data + pure helpers (no React), so it works on the
 * server and is unit-tested on its own.
 */

/** A count, a short label, or a styled badge. Live values go through `SidebarNav badges`, not the config. */
export type BadgeSpec =
  | number
  | string
  | {
      count?: number;
      /** Default `"accent"`. */
      tone?: "accent" | "danger" | "warning" | "neutral";
      /** Only a dot (e.g. "something new"). */
      dot?: boolean;
      /** Accessible text, e.g. "4 pending". Default from the dictionary (`sidebar.badge`). */
      label?: string;
    };

export type NavIcon = React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean | "true" | "false" }>;

export interface NavItem {
  /** Stable key for badges, commands, analytics and the active trail. */
  id: string;
  label: string;
  /** Omitted → a section parent that only opens its children. */
  href?: string;
  icon?: NavIcon;
  /** Up to 3 levels. */
  children?: NavItem[];
  /** Extra active patterns (`"/posts/*"` = any child path) or a predicate. */
  match?: string[] | ((path: string) => boolean);
  /** Hidden unless `can(permission)` (all of them for an array). UI only — enforce on the server. */
  permission?: string | string[];
  /** Hidden unless `features[feature]` is true (module toggle / feature flag). */
  feature?: string;
  /** Opens in a new tab with an ↗ icon. Default: detected from an absolute `href`. */
  external?: boolean;
  /** Extra search terms for ⌘K "Go to". */
  keywords?: string[];
  /** Static badge. */
  badge?: BadgeSpec;
  /** `true`, or a reason shown as a badge ("Coming soon"). */
  disabled?: boolean | string;
}

export interface NavGroup {
  type: "group";
  id: string;
  /** Section heading. */
  label?: string;
  items: NavItem[];
}

export interface NavSeparator {
  type: "separator";
  id?: string;
}

/** One entry of a nav config: an item, a labelled group (section) or a separator. */
export type NavNode = NavItem | NavGroup | NavSeparator;
/** Alias of `NavNode`. */
export type NavEntry = NavNode;

export const isNavGroup = (n: NavNode): n is NavGroup => (n as NavGroup).type === "group";
export const isNavSeparator = (n: NavNode): n is NavSeparator => (n as NavSeparator).type === "separator";
export const isNavItem = (n: NavNode): n is NavItem => !("type" in n) || (n as { type?: string }).type === undefined;

export interface FilterNavOptions {
  can?: (permission: string) => boolean;
  features?: Record<string, boolean | undefined>;
}

function allowed(item: NavItem, { can, features }: FilterNavOptions): boolean {
  if (item.permission && can) {
    const list = Array.isArray(item.permission) ? item.permission : [item.permission];
    if (!list.every((p) => can(p))) return false;
  }
  if (item.feature && features && !features[item.feature]) return false;
  return true;
}

function filterItems(items: NavItem[], o: FilterNavOptions): NavItem[] {
  const out: NavItem[] = [];
  for (const it of items) {
    if (!allowed(it, o)) continue;
    if (it.children) {
      const children = filterItems(it.children, o);
      // A parent with no href and no visible child has nothing to open.
      if (!it.href && children.length === 0) continue;
      out.push({ ...it, children: children.length ? children : undefined });
    } else out.push(it);
  }
  return out;
}

/**
 * Drops items the user can't see (`permission` via `can`, `feature` via `features`), then empty
 * groups and leading / trailing / doubled separators. **UI only** — permissions must be enforced
 * on the server.
 */
export function filterNav(nodes: NavNode[], options: FilterNavOptions = {}): NavNode[] {
  const out: NavNode[] = [];
  for (const n of nodes) {
    if (isNavSeparator(n)) {
      if (out.length && !isNavSeparator(out[out.length - 1]!)) out.push(n);
      continue;
    }
    if (isNavGroup(n)) {
      const items = filterItems(n.items, options);
      if (items.length) out.push({ ...n, items });
      continue;
    }
    const [it] = filterItems([n], options);
    if (it) out.push(it);
  }
  while (out.length && isNavSeparator(out[out.length - 1]!)) out.pop();
  return out;
}

/** Top-level items of a config, with groups unwrapped. */
export function navItems(nodes: NavNode[]): NavItem[] {
  return nodes.flatMap((n) => (isNavGroup(n) ? n.items : isNavItem(n) ? [n] : []));
}

const clean = (p: string) => {
  const path = p.split(/[?#]/)[0] || "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
};

/** `true` for `http(s)://`, protocol-relative and `mailto:`-style hrefs. */
export const isAbsoluteHref = (href: string) => /^([a-z][a-z\d+.-]*:|\/\/)/i.test(href);

/**
 * Length of the match of `pattern` against `path`, or -1. `/` matches only exactly; `"/posts"`
 * matches `/posts` and `/posts/12`; `"/posts/*"` matches only children.
 */
export function matchPath(pattern: string, path: string): number {
  if (isAbsoluteHref(pattern)) return -1;
  const p = clean(path);
  if (pattern.endsWith("/*")) {
    const base = clean(pattern.slice(0, -2));
    return p.startsWith(base === "/" ? "/" : `${base}/`) && p !== base ? base.length + 1 : -1;
  }
  const t = clean(pattern);
  if (t === "/") return p === "/" ? 1 : -1;
  return p === t || p.startsWith(`${t}/`) ? t.length : -1;
}

export interface ActiveNav {
  /** Ids from the top-level item down to the active leaf, e.g. `["posts", "posts.categories"]`. */
  trail: string[];
  leafId?: string;
}

/**
 * The active item by **longest-prefix match** over every `href` and `match` pattern, so the
 * dashboard (`/site`) isn't active on `/site/posts`. The trail feeds Sidebar, Breadcrumb and Page header.
 */
export function resolveActive(nodes: NavNode[], path: string | undefined): ActiveNav {
  if (!path) return { trail: [] };
  let best: { score: number; trail: string[] } = { score: -1, trail: [] };
  const visit = (items: NavItem[], parents: string[]) => {
    for (const it of items) {
      const trail = [...parents, it.id];
      let score = it.href ? matchPath(it.href, path) : -1;
      if (Array.isArray(it.match)) for (const m of it.match) score = Math.max(score, matchPath(m, path));
      else if (typeof it.match === "function" && it.match(path)) score = Math.max(score, 0.5 + (it.href ? clean(it.href).length : 0));
      // Ties go to the deeper item ("All posts" over its parent "Posts", both /site/posts).
      if (score >= 0 && (score > best.score || (score === best.score && trail.length > best.trail.length))) best = { score, trail };
      if (it.children) visit(it.children, trail);
    }
  };
  visit(navItems(nodes), []);
  return best.score < 0 ? { trail: [] } : { trail: best.trail, leafId: best.trail[best.trail.length - 1] };
}

export interface FlatNavItem {
  id: string;
  label: string;
  href: string;
  /** Labels from the top level down, e.g. `["Settings", "Reading"]`. */
  trail: string[];
  /** Ids from the top level down. */
  ids: string[];
  /** Heading of the group the item sits in. */
  group?: string;
  icon?: NavIcon;
  keywords?: string[];
  external?: boolean;
}

/**
 * Every navigable item (has an `href`, not disabled) as a flat list — for ⌘K "Go to" and Breadcrumb.
 * A child whose `href` equals its parent's (an "All posts" index) is folded into the parent.
 */
export function flattenNav(nodes: NavNode[]): FlatNavItem[] {
  const out: FlatNavItem[] = [];
  const seen = new Set<string>();
  const visit = (items: NavItem[], labels: string[], ids: string[], group: string | undefined, icon: NavIcon | undefined) => {
    for (const it of items) {
      const trail = [...labels, it.label];
      const idTrail = [...ids, it.id];
      const ic = it.icon ?? icon;
      if (it.href && !it.disabled && !seen.has(it.href)) {
        seen.add(it.href);
        out.push({ id: it.id, label: it.label, href: it.href, trail, ids: idTrail, group, icon: ic, keywords: it.keywords, external: it.external ?? isAbsoluteHref(it.href) });
      }
      if (it.children) visit(it.children, trail, idTrail, group, ic);
    }
  };
  for (const n of nodes) {
    if (isNavGroup(n)) visit(n.items, [], [], n.label, undefined);
    else if (isNavItem(n)) visit([n], [], [], undefined, undefined);
  }
  return out;
}

/** Finds an item by id anywhere in the tree. */
export function findNavItem(nodes: NavNode[], id: string): NavItem | undefined {
  const visit = (items: NavItem[]): NavItem | undefined => {
    for (const it of items) {
      if (it.id === id) return it;
      const hit = it.children && visit(it.children);
      if (hit) return hit;
    }
    return undefined;
  };
  return visit(navItems(nodes));
}

/** Breadcrumb items for an active trail (`resolveActive(...).trail`). */
export function navTrailItems(nodes: NavNode[], trail: string[]): Array<{ id: string; label: string; href?: string }> {
  return trail.map((id) => findNavItem(nodes, id)).filter((x): x is NavItem => Boolean(x)).map((it) => ({ id: it.id, label: it.label, href: it.href }));
}

export interface NormalisedBadge {
  count?: number;
  text?: string;
  tone: "accent" | "danger" | "warning" | "neutral";
  dot: boolean;
  label?: string;
}

/** Normalises a `BadgeSpec`; `undefined` / `0` / empty → `undefined` (nothing to show). */
export function normaliseBadge(b: BadgeSpec | undefined | null): NormalisedBadge | undefined {
  if (b == null || b === "" || b === 0) return undefined;
  if (typeof b === "number") return { count: b, tone: "accent", dot: false };
  if (typeof b === "string") return { text: b, tone: "accent", dot: false };
  if (!b.dot && !b.count && !b.label) return undefined;
  return { count: b.count, tone: b.tone ?? "accent", dot: Boolean(b.dot), label: b.label };
}

/** Cookie the App shell stores the collapsed state in (`"1"` = rail). Read it on the server to avoid a flash. */
export const SIDEBAR_COOKIE = "ui-sidebar";

/** `true` / `false` from a `ui-sidebar` cookie value (or a whole `Cookie` header); `undefined` when unset. */
export function parseSidebarCookie(value: string | null | undefined): boolean | undefined {
  if (!value) return undefined;
  const m = value.includes("=") ? new RegExp(`(?:^|;\\s*)${SIDEBAR_COOKIE}=([^;]*)`).exec(value)?.[1] : value;
  return m === "1" ? true : m === "0" ? false : undefined;
}

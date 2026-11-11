// Two hierarchies an admin reorders by hand: the store's catalogue categories (product counts)
// and the company's departments (headcount, open roles, head of department). Counts roll up.
import type { L } from "../../_shared/l10n";

export interface OrgNode {
  id: string;
  name: L;
  slug: string;
  /** Products directly in this category / people directly in this department. */
  own: number;
  /** Hidden from the storefront (categories) or archived (departments). */
  hidden?: boolean;
  /** Department head (people.ts id). */
  headId?: string;
  /** Open roles (departments). */
  openRoles?: number;
  /** Locked nodes can't be dragged. */
  locked?: boolean;
  children?: OrgNode[];
}

export type TreeKind = "catalogue" | "departments";

const n = (id: string, en: string, tr: string, own: number, children?: OrgNode[], extra: Partial<OrgNode> = {}): OrgNode => ({
  id,
  name: { en, tr },
  slug: en
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  own,
  children,
  ...extra,
});

export const catalogue: OrgNode[] = [
  n("cat-ceramics", "Ceramics", "Seramik", 4, [
    n("cat-tableware", "Tableware", "Sofra", 2, [
      n("cat-mugs", "Mugs & cups", "Kupa ve fincan", 18),
      n("cat-plates", "Plates", "Tabaklar", 24),
      n("cat-bowls", "Bowls", "Kaseler", 15),
    ]),
    n("cat-vases", "Vases & planters", "Vazo ve saksı", 11),
  ]),
  n("cat-textiles", "Textiles", "Tekstil", 0, [
    n("cat-bedding", "Bedding", "Yatak tekstili", 21),
    n("cat-bath", "Bath", "Banyo", 16),
    n("cat-throws", "Throws & blankets", "Şal ve battaniye", 9),
  ]),
  n("cat-lighting", "Lighting", "Aydınlatma", 0, [n("cat-pendants", "Pendants", "Sarkıtlar", 8), n("cat-lamps", "Table lamps", "Masa lambaları", 6)]),
  n("cat-kitchen", "Kitchen", "Mutfak", 3, [
    n("cat-cookware", "Cookware", "Pişirme", 12),
    n("cat-boards", "Boards & utensils", "Tahta ve gereçler", 19),
    n("cat-coffee", "Coffee & tea", "Kahve ve çay", 14),
  ]),
  n("cat-decor", "Decor", "Dekorasyon", 2, [n("cat-mirrors", "Mirrors", "Aynalar", 5), n("cat-candles", "Candles", "Mumlar", 13), n("cat-cushions", "Floor cushions", "Yer minderleri", 0)]),
  n("cat-seasonal", "Winter gifting", "Kış hediyeleri", 26, undefined, { hidden: true }),
];

export const departments: OrgNode[] = [
  n(
    "dp-lead",
    "Leadership",
    "Yönetim",
    1,
    [
      n("dp-ops", "Operations", "Operasyon", 0, [n("dp-field", "Field service", "Saha servisi", 3, undefined, { headId: "p-malik" }), n("dp-wh", "Warehouse", "Depo", 1, undefined, { headId: "p-ruth", openRoles: 2 })], { headId: "p-defne" }),
      n("dp-sales", "Sales", "Satış", 1, [n("dp-sales-tr", "Sales · Türkiye", "Satış · Türkiye", 1, undefined, { headId: "p-aylin" }), n("dp-sales-eu", "Sales · Europe", "Satış · Avrupa", 2, undefined, { headId: "p-noah", openRoles: 1 })], { headId: "p-noah" }),
      n("dp-support", "Customer support", "Müşteri destek", 4, undefined, { headId: "p-kerem", openRoles: 1 }),
      n("dp-finance", "Finance", "Finans", 2, undefined, { headId: "p-felix" }),
      n("dp-people", "People", "İnsan kaynakları", 2, undefined, { headId: "p-ece" }),
      n("dp-product", "Product & engineering", "Ürün ve yazılım", 0, [n("dp-eng", "Engineering", "Yazılım", 3, undefined, { headId: "p-viktor", openRoles: 2 }), n("dp-design", "Design", "Tasarım", 2, undefined, { headId: "p-nadia" })], { headId: "p-viktor" }),
      n("dp-marketing", "Marketing", "Pazarlama", 2, undefined, { headId: "p-camille" }),
    ],
    { headId: "p-defne", locked: true },
  ),
  n("dp-interns", "Interns 2025", "Stajyerler 2025", 0, undefined, { hidden: true }),
];

/** Own count plus every descendant's. */
export function rollup(node: OrgNode): number {
  return node.own + (node.children ?? []).reduce((s, c) => s + rollup(c), 0);
}

export function rollupOpen(node: OrgNode): number {
  return (node.openRoles ?? 0) + (node.children ?? []).reduce((s, c) => s + rollupOpen(c), 0);
}

export function walk(nodes: OrgNode[], fn: (node: OrgNode, path: OrgNode[]) => void, path: OrgNode[] = []) {
  for (const node of nodes) {
    fn(node, path);
    if (node.children) walk(node.children, fn, [...path, node]);
  }
}

export function findPath(nodes: OrgNode[], id: string): OrgNode[] | null {
  let out: OrgNode[] | null = null;
  walk(nodes, (node, path) => {
    if (node.id === id) out = [...path, node];
  });
  return out;
}

/** Immutable update of one node. */
export function updateNode(nodes: OrgNode[], id: string, patch: (node: OrgNode) => OrgNode): OrgNode[] {
  return nodes.map((node) => (node.id === id ? patch(node) : node.children ? { ...node, children: updateNode(node.children, id, patch) } : node));
}

/** Removes a node; its own count and children move up to the parent (or the top level). */
export function removeNode(nodes: OrgNode[], id: string): OrgNode[] {
  const path = findPath(nodes, id);
  if (!path) return nodes;
  const target = path[path.length - 1]!;
  const parent = path[path.length - 2];
  if (!parent) {
    const i = nodes.findIndex((x) => x.id === id);
    const next = [...nodes];
    next.splice(i, 1, ...(target.children ?? []));
    return next;
  }
  return updateNode(nodes, parent.id, (p) => {
    const kids = [...(p.children ?? [])];
    const i = kids.findIndex((x) => x.id === id);
    kids.splice(i, 1, ...(target.children ?? []));
    return { ...p, own: p.own + target.own, children: kids.length ? kids : undefined };
  });
}

export function addChild(nodes: OrgNode[], parentId: string | null, child: OrgNode): OrgNode[] {
  if (!parentId) return [...nodes, child];
  return updateNode(nodes, parentId, (p) => ({ ...p, children: [...(p.children ?? []), child] }));
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

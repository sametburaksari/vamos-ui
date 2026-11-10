import { inventory as raw, recipes, type InvGroup, type InvItem } from "./inventory";
import { entries } from "@/docs/entries";

/**
 * The inventory with live status: an item is "ready" (and linked) as soon as a
 * docs entry lists its exact name in `covers`. Nobody edits inventory.ts to
 * mark progress — writing the docs entry is what ships a component.
 */
const coveredBy = new Map<string, string>();
for (const e of entries) for (const name of e.covers) if (!coveredBy.has(name)) coveredBy.set(name, e.slug);

export const inventory: InvGroup[] = raw.map((g) => ({
  group: g.group,
  items: g.items.map((i): InvItem => {
    const slug = coveredBy.get(i.name);
    return slug ? { ...i, status: "ready", slug } : { ...i, status: i.status === "ready" ? "next" : i.status, slug: undefined };
  }),
}));

/** Names claimed by docs entries that don't exist in the inventory (typos show up in the verify step). */
export const unknownCovers = [...coveredBy.keys()].filter((n) => !raw.some((g) => g.items.some((i) => i.name === n)));

export { recipes };
export type { InvGroup, InvItem };

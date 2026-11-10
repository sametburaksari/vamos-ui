import { entries } from "./entries";
export type { DocEntry, Example, Prop } from "./types";

/** Every documented component, discovered from ./entries (see scripts/gen.mjs). */
export const docs = entries;
export const docsBySlug = Object.fromEntries(docs.map((d) => [d.slug, d]));

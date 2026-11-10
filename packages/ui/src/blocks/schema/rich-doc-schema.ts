// zod schema for RichDoc (see rich-doc.ts for the types and BLOCK-FORMAT.md §3).

import { z } from "zod";
import { sanitizeHref } from "./safety";
import { isBreak, type RichBlock, type RichDoc, type RichInline, type RichMarkType, type RichNodeType } from "./rich-doc";

export const RichMarkSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({ type: z.literal("underline") }),
  z.object({ type: z.literal("strike") }),
  z.object({ type: z.literal("code") }),
  z.object({ type: z.literal("highlight") }),
  z.object({ type: z.literal("sub") }),
  z.object({ type: z.literal("sup") }),
  z.object({
    type: z.literal("link"),
    href: z.string().refine((h) => sanitizeHref(h) !== null, { message: "Unsafe link in rich text." }),
    newTab: z.boolean().optional(),
    title: z.string().optional(),
  }),
]);

export const RichInlineSchema: z.ZodType<RichInline> = z.union([
  z.object({ type: z.literal("br") }),
  z.object({ text: z.string(), marks: z.array(RichMarkSchema).optional() }),
]);

const inline = z.array(RichInlineSchema).optional();

export const RichBlockSchema: z.ZodType<RichBlock> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.object({ type: z.literal("paragraph"), content: inline }),
    z.object({ type: z.literal("heading"), level: z.union([z.literal(2), z.literal(3), z.literal(4)]), content: inline, anchor: z.string().regex(/^[a-z0-9-]+$/).optional() }),
    z.object({
      type: z.literal("list"),
      ordered: z.boolean().optional(),
      start: z.number().int().optional(),
      items: z.array(z.object({ content: z.array(RichBlockSchema) })),
    }),
    z.object({ type: z.literal("blockquote"), content: z.array(RichBlockSchema), cite: z.string().optional() }),
    z.object({ type: z.literal("code"), text: z.string(), language: z.string().optional() }),
    z.object({ type: z.literal("hr") }),
  ]),
);

export const RichDocSchema = z.object({ type: z.literal("doc"), content: z.array(RichBlockSchema) });

/** Problems when a doc uses nodes or marks outside an allow-list (`f.rich({ nodes, marks })`). */
export function richDocAllows(doc: RichDoc, nodes?: readonly RichNodeType[], marks?: readonly RichMarkType[]): string[] {
  const problems = new Set<string>();
  const checkInline = (c?: RichInline[]) => {
    if (!marks || !c) return;
    for (const n of c) if (!isBreak(n)) for (const m of n.marks ?? []) if (!marks.includes(m.type)) problems.add(`The "${m.type}" mark is not allowed here.`);
  };
  const walk = (blocks: readonly RichBlock[]) => {
    for (const b of blocks) {
      if (nodes && !nodes.includes(b.type)) problems.add(`The "${b.type}" block is not allowed here.`);
      if (b.type === "paragraph" || b.type === "heading") checkInline(b.content);
      else if (b.type === "blockquote") walk(b.content);
      else if (b.type === "list") b.items.forEach((it) => walk(it.content));
    }
  };
  walk(doc.content);
  return [...problems];
}

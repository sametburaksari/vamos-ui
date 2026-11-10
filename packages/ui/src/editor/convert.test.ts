import { describe, expect, it } from "vitest";
import type { VamosDoc } from "../blocks/schema/types";
import type { RichDoc } from "../blocks/schema/rich-doc";
import { VamosDocSchema } from "../blocks/schema/nodes";
import { testRegistry } from "../render/_fixtures";
import { changedBlockIds, computeDocMeta, countWords, createBlockId, fromProseMirror, isRichDocEmpty, proseMirrorToRichDoc, richDocToProseMirror, toProseMirror } from "./convert";
import { cleanPastedHtml, looksLikeMarkdown, markdownToBlocks, parseInlineMarkdown } from "./markdown";

const article: VamosDoc = {
  version: 1,
  lang: "en",
  seo: { title: "Opening a second location" },
  blocks: [
    { id: "b_h1aaaa", type: "heading", props: { level: 2 }, anchor: "why-cevizli", content: [{ text: "Why " }, { text: "Cevizli", marks: [{ type: "italic" }] }] },
    {
      id: "b_p1aaaa",
      type: "paragraph",
      content: [
        { text: "Read the " },
        { text: "lease terms", marks: [{ type: "link", href: "/docs/lease", newTab: true }, { type: "bold" }] },
        { type: "br" },
        { text: "H" },
        { text: "2", marks: [{ type: "sub" }] },
        { text: "O and " },
        { text: "x", marks: [{ type: "highlight" }] },
      ],
    },
    {
      id: "b_l1aaaa",
      type: "list",
      props: { ordered: true, start: 3 },
      slots: {
        items: [
          { id: "b_li1aaa", type: "list-item", content: [{ text: "Sign the lease" }] },
          {
            id: "b_li2aaa",
            type: "list-item",
            content: [{ text: "Hire a head chef" }],
            slots: { items: [{ id: "b_l2aaaa", type: "list", slots: { items: [{ id: "b_li3aaa", type: "list-item", content: [{ text: "Post the role" }] }] } }] },
          },
        ],
      },
    },
    { id: "b_q1aaaa", type: "quote", props: { cite: "Ayşe K., head chef" }, content: [{ text: "Seasonal or nothing." }] },
    { id: "b_c1aaaa", type: "code", props: { language: "bash" }, content: [{ text: "pnpm dev" }, { type: "br" }, { text: "pnpm test" }] },
    { id: "b_d1aaaa", type: "divider" },
    { id: "b_i1aaaa", type: "image", props: { src: "https://images.example.com/terrace.jpg", alt: "The terrace at dusk", width: 1600, height: 1067, caption: "Our terrace in May", assetId: "m_91" } },
    {
      id: "b_t1aaaa",
      type: "table",
      slots: {
        items: [
          { id: "b_r1aaaa", type: "table-row", slots: { items: [{ id: "b_tc1aaa", type: "table-cell", props: { header: true }, content: [{ text: "Day" }] }, { id: "b_tc2aaa", type: "table-cell", props: { header: true }, content: [{ text: "Covers" }] }] } },
          { id: "b_r2aaaa", type: "table-row", slots: { items: [{ id: "b_tc3aaa", type: "table-cell", content: [{ text: "Friday" }] }, { id: "b_tc4aaa", type: "table-cell", content: [{ text: "184" }] }] } },
        ],
      },
    },
    { id: "b_f1aaaa", type: "faq", v: 1, anchor: "faq", theme: { surface: "surface-2" }, hidden: true, props: { title: "Before you *book*", items: [{ q: "Walk-ins?", a: { type: "doc", content: [] } }] } },
    { id: "b_u1aaaa", type: "map-hours", v: 3, props: { city: "Istanbul" } },
  ],
};

describe("toProseMirror / fromProseMirror", () => {
  it("round-trips every block kind without loss", () => {
    const pm = toProseMirror(article);
    const back = fromProseMirror(pm, { base: article });
    expect(back.blocks).toEqual(article.blocks);
    expect(back.seo).toEqual(article.seo);
    expect(back.lang).toBe("en");
  });

  it("produces a doc that passes the storage schema", () => {
    const back = fromProseMirror(toProseMirror(article), { base: article });
    expect(VamosDocSchema.safeParse(back).success).toBe(true);
  });

  it("maps marks and nodes to ProseMirror names", () => {
    const pm = toProseMirror(article);
    const para = pm.content![1]!;
    expect(para.content!.map((n) => n.type)).toEqual(["text", "text", "hardBreak", "text", "text", "text", "text"]);
    expect(para.content![0]!.marks).toBeUndefined();
    expect(para.content![1]!.marks?.map((m) => m.type)).toEqual(["link", "bold"]);
    expect(para.content![1]!.marks?.[0]!.attrs).toMatchObject({ href: "/docs/lease", target: "_blank" });
    expect(para.content![4]!.marks?.[0]!.type).toBe("subscript");
    expect(pm.content!.map((n) => n.type)).toEqual(["heading", "paragraph", "orderedList", "blockquote", "codeBlock", "horizontalRule", "image", "table", "vamosBlock", "vamosBlock"]);
    expect(pm.content![4]!.content![0]!.text).toBe("pnpm dev\npnpm test");
  });

  it("keeps unknown block types as component blocks (data never dropped)", () => {
    const pm = toProseMirror(article);
    expect(pm.content![9]!.attrs).toMatchObject({ blockType: "map-hours", v: 3, props: { city: "Istanbul" } });
  });

  it("replaces missing and duplicate ids", () => {
    const back = fromProseMirror({
      type: "doc",
      content: [
        { type: "paragraph", attrs: { id: "b_same01" }, content: [{ type: "text", text: "One" }] },
        { type: "paragraph", attrs: { id: "b_same01" }, content: [{ type: "text", text: "Two" }] },
        { type: "paragraph", content: [{ type: "text", text: "Three" }] },
      ],
    });
    const ids = back.blocks.map((b) => b.id);
    expect(ids[0]).toBe("b_same01");
    expect(new Set(ids).size).toBe(3);
    ids.forEach((id) => expect(id).toMatch(/^[A-Za-z0-9_-]{4,64}$/));
  });

  it("migrates component blocks to the registry's current version", () => {
    const old: VamosDoc = { version: 1, blocks: [{ id: "b_intro9", type: "intro", v: 1, props: { heading: "Dinner, slowly." } }] };
    const pm = toProseMirror(old, testRegistry);
    expect(pm.content![0]!.attrs).toMatchObject({ v: 2, props: { title: "Dinner, slowly." } });
  });

  it("merges adjacent runs with the same marks", () => {
    const back = fromProseMirror({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Hello ", marks: [{ type: "bold" }] }, { type: "text", text: "world", marks: [{ type: "bold" }] }] }],
    });
    expect(back.blocks[0]!.content).toEqual([{ text: "Hello world", marks: [{ type: "bold" }] }]);
  });

  it("treats a single empty paragraph as an empty doc", () => {
    expect(fromProseMirror({ type: "doc", content: [{ type: "paragraph" }] }).blocks).toEqual([]);
    expect(toProseMirror({ version: 1, blocks: [] }).content).toHaveLength(1);
  });
});

describe("doc meta", () => {
  it("counts words, reading time and the toc", () => {
    const meta = computeDocMeta(article, "en");
    expect(meta.toc).toEqual([{ id: "b_h1aaaa", level: 2, text: "Why Cevizli" }]);
    expect(meta.wordCount).toBeGreaterThan(10);
    expect(meta.readingTime).toBe(1);
  });
  it("counts Turkish words", () => {
    expect(countWords("İstanbul'da ışık çok güzel.", "tr")).toBe(4);
  });
  it("lists changed block ids", () => {
    const next: VamosDoc = { ...article, blocks: [{ ...article.blocks[0]!, content: [{ text: "Why Maltepe" }] }, ...article.blocks.slice(1, -1)] };
    expect(changedBlockIds(article, next)).toEqual(["b_h1aaaa", "b_u1aaaa"]);
  });
  it("creates valid ids", () => {
    expect(createBlockId()).toMatch(/^b_[A-Za-z0-9]{8}$/);
  });
});

describe("RichDoc converters", () => {
  const rich: RichDoc = {
    type: "doc",
    content: [
      { type: "heading", level: 3, content: [{ text: "Parking" }] },
      { type: "paragraph", content: [{ text: "Free for guests after " }, { text: "7 pm", marks: [{ type: "bold" }] }] },
      { type: "list", items: [{ content: [{ type: "paragraph", content: [{ text: "Valet at the door" }] }] }, { content: [{ type: "paragraph", content: [{ text: "Garage on level −2" }] }] }] },
      { type: "blockquote", cite: "A regular", content: [{ type: "paragraph", content: [{ text: "Easiest parking in Kadıköy." }] }] },
      { type: "code", text: "B2-114", language: "text" },
      { type: "hr" },
    ],
  };
  it("round-trips", () => {
    expect(proseMirrorToRichDoc(richDocToProseMirror(rich))).toEqual(rich);
  });
  it("clamps h1 to h2 and detects empty docs", () => {
    const d = proseMirrorToRichDoc({ type: "doc", content: [{ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Title" }] }] });
    expect(d.content[0]).toMatchObject({ type: "heading", level: 2 });
    expect(isRichDocEmpty({ type: "doc", content: [{ type: "paragraph", content: [] }] })).toBe(true);
    expect(isRichDocEmpty(rich)).toBe(false);
  });
});

describe("paste conversion", () => {
  it("detects markdown", () => {
    expect(looksLikeMarkdown("# Spring menu\n\nNew dishes")).toBe(true);
    expect(looksLikeMarkdown("Just a sentence.")).toBe(false);
  });
  it("parses inline markdown", () => {
    expect(parseInlineMarkdown("Book **now** at [our site](https://example.com) or `call`")).toEqual([
      { text: "Book " },
      { text: "now", marks: [{ type: "bold" }] },
      { text: " at " },
      { text: "our site", marks: [{ type: "link", href: "https://example.com" }] },
      { text: " or " },
      { text: "call", marks: [{ type: "code" }] },
    ]);
  });
  it("drops unsafe links", () => {
    expect(parseInlineMarkdown("[x](javascript:alert)")).toEqual([{ text: "x" }]);
  });
  it("converts block markdown", () => {
    const blocks = markdownToBlocks("## Menu\n\n- Starters\n  - Meze\n- Mains\n\n1. Book\n2. Arrive\n\n> Best in town\n\n```js\nlet a = 1\n```\n\n---\n\n| Day | Open |\n| --- | --- |\n| Mon | No |");
    expect(blocks.map((b) => b.type)).toEqual(["heading", "list", "list", "quote", "code", "divider", "table"]);
    expect(blocks[1]!.slots!.items![0]!.slots!.items![0]!.type).toBe("list");
    expect(blocks[2]!.props).toEqual({ ordered: true });
    expect(blocks[6]!.slots!.items).toHaveLength(2);
    expect(VamosDocSchema.safeParse({ version: 1, blocks }).success).toBe(true);
  });
  it("cleans Word HTML", () => {
    const html = `<!--[if gte mso 9]><xml></xml><![endif]--><p class="MsoNormal" style="margin:0"><span style="font-weight:bold;mso-bidi-font-weight:normal">Bold</span><o:p></o:p></p>`;
    expect(cleanPastedHtml(html)).toBe("<p><strong>Bold</strong></p>");
  });
});

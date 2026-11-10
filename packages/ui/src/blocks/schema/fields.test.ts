import { describe, expect, it } from "vitest";
import { z } from "zod";
import { f, getFieldMeta, isLocalizedSchema } from "./fields";
import { parseEmphasis, stripEmphasis, countEmphasis } from "./emphasis";
import { sanitizeHref, hasEmoji, linkKindOf } from "./safety";
import { richFromText, richToText, countWords } from "./rich-doc";

describe("f.* field builders", () => {
  it("heading: localized by default, one *emphasis*, no emoji, max length", () => {
    const s = f.heading({ max: 40 });
    expect(s.safeParse("Dinner, *slowly*.").success).toBe(true);
    expect(s.safeParse({ en: "Dinner", tr: "Akşam yemeği" }).success).toBe(true);
    expect(s.safeParse("*Two* *stars*").success).toBe(false);
    expect(s.safeParse("Fresh fish 🐟").success).toBe(false);
    expect(s.safeParse("x".repeat(41)).success).toBe(false);
    expect(getFieldMeta(s)).toMatchObject({ field: "heading", localized: true, max: 40 });
    expect(isLocalizedSchema(s)).toBe(true);
  });

  it("text: localized: false stores a plain string; © and ™ are not emoji", () => {
    const s = f.text({ localized: false });
    expect(s.safeParse("© 2026 Kıyı Meyhane™").success).toBe(true);
    expect(s.safeParse({ en: "x" }).success).toBe(false);
    expect(isLocalizedSchema(s)).toBe(false);
    expect(getFieldMeta(s.optional())?.field).toBe("text");
  });

  it("image: alt required unless decorative; data: src rejected", () => {
    const s = f.image();
    expect(s.safeParse({ src: "/a.jpg", width: 10, height: 10 }).success).toBe(false);
    expect(s.safeParse({ src: "/a.jpg", width: 10, height: 10, decorative: true }).success).toBe(true);
    expect(s.safeParse({ src: "/a.jpg", width: 10, height: 10, alt: { tr: "Teras" } }).success).toBe(true);
    expect(s.safeParse({ src: "javascript:alert(1)", width: 10, height: 10, decorative: true }).success).toBe(false);
  });

  it("link / cta: unsafe hrefs rejected", () => {
    expect(f.link().safeParse({ href: "/menu", label: "Menu" }).success).toBe(true);
    expect(f.link().safeParse({ href: " javascript:alert(1)", label: "x" }).success).toBe(false);
    expect(f.cta().safeParse({ link: { href: "tel:+902168072907", label: "Call" }, style: "primary" }).success).toBe(true);
  });

  it("rich: restricts nodes and marks", () => {
    const s = f.rich({ nodes: ["paragraph"], marks: ["bold"] });
    const ok = { type: "doc", content: [{ type: "paragraph", content: [{ text: "Hi", marks: [{ type: "bold" }] }] }] };
    const badMark = { type: "doc", content: [{ type: "paragraph", content: [{ text: "Hi", marks: [{ type: "italic" }] }] }] };
    const badNode = { type: "doc", content: [{ type: "hr" }] };
    expect(s.safeParse(ok).success).toBe(true);
    expect(s.safeParse(badMark).success).toBe(false);
    expect(s.safeParse(badNode).success).toBe(false);
    expect(s.safeParse({ en: ok, tr: ok }).success).toBe(true);
  });

  it("money is a decimal string; phone is E.164; date is YYYY-MM-DD", () => {
    expect(f.money().safeParse({ amount: "1250.00", currency: "TRY" }).success).toBe(true);
    expect(f.money().safeParse({ amount: 1250, currency: "TRY" }).success).toBe(false);
    expect(f.phone().safeParse("+902168072907").success).toBe(true);
    expect(f.phone().safeParse("0216 807 29 07").success).toBe(false);
    expect(f.date().safeParse("2026-11-14").success).toBe(true);
    expect(f.date().safeParse("2026-11-14T00:00:00Z").success).toBe(false);
  });

  it("embed: provider allow-list and host check", () => {
    const s = f.embed({ allow: ["youtube"] });
    expect(s.safeParse({ provider: "youtube", url: "https://www.youtube.com/watch?v=abc" }).success).toBe(true);
    expect(s.safeParse({ provider: "youtube", url: "https://evil.example/watch" }).success).toBe(false);
    expect(s.safeParse({ provider: "vimeo", url: "https://vimeo.com/1" }).success).toBe(false);
  });

  it("icon, select, list, query, hours", () => {
    expect(f.icon().safeParse("map-pin").success).toBe(true);
    expect(f.icon().safeParse("not-an-icon").success).toBe(false);
    expect(f.select(["a", "b"] as const).safeParse("b").success).toBe(true);
    expect(f.list(f.text(), { max: 1 }).safeParse(["a", "b"]).success).toBe(false);
    expect(getFieldMeta(f.query("posts", { into: "posts" }))?.query).toEqual({ resource: "posts", into: "posts" });
    expect(
      f.hours().safeParse({ timeZone: "Europe/Istanbul", weekly: { mon: [{ open: "09:00", close: "22:00" }], sat: [{ open: "18:00", close: "02:00" }] } }).success,
    ).toBe(true);
  });

  it("schemas export to JSON Schema with editor metadata", () => {
    const json = z.toJSONSchema(z.object({ title: f.heading({ label: "Title" }) }), { unrepresentable: "any" }) as unknown as { properties: { title: { title?: string; vamos?: unknown } } };
    expect(json.properties.title.title).toBe("Title");
    expect(json.properties.title.vamos).toMatchObject({ field: "heading" });
  });
});

describe("emphasis", () => {
  it("parses one span, escapes and unmatched stars", () => {
    expect(parseEmphasis("Dinner, *slowly*.")).toEqual([
      { text: "Dinner, ", em: false },
      { text: "slowly", em: true },
      { text: ".", em: false },
    ]);
    expect(parseEmphasis("5 \\* rating")).toEqual([{ text: "5 * rating", em: false }]);
    expect(parseEmphasis("a * b")).toEqual([{ text: "a * b", em: false }]);
    expect(countEmphasis("*a* and *b*")).toBe(2);
    expect(stripEmphasis("Before you *book*")).toBe("Before you book");
  });
});

describe("safety", () => {
  it("sanitizes hrefs", () => {
    for (const ok of ["/menu", "#faq", "?q=1", "https://vamos.ist", "//cdn.example/x", "mailto:hello@vamos.ist", "tel:+902168072907", "menu/today"]) expect(sanitizeHref(ok)).toBe(ok);
    for (const bad of ["javascript:alert(1)", " JaVaScRiPt:alert(1)", "java\tscript:alert(1)", "data:text/html,<b>", "vbscript:x", "ftp://x", "", null, 42]) expect(sanitizeHref(bad)).toBeNull();
  });
  it("detects kinds and emoji", () => {
    expect(linkKindOf("https://wa.me/902168072907")).toBe("whatsapp");
    expect(linkKindOf("/files/menu.pdf")).toBe("file");
    expect(hasEmoji("Fresh 🌿")).toBe(true);
    expect(hasEmoji("© 2026")).toBe(false);
  });
});

describe("RichDoc helpers", () => {
  it("round-trips plain text", () => {
    const doc = richFromText("Open daily.\nKitchen until 23:00.\n\nClosed on Mondays.");
    expect(doc.content).toHaveLength(2);
    expect(richToText(doc)).toBe("Open daily.\nKitchen until 23:00.\n\nClosed on Mondays.");
    expect(countWords("Şişli’de iki şube, 14 masa")).toBe(5);
  });
});

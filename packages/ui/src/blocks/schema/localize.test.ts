import { describe, expect, it } from "vitest";
import { z } from "zod";
import { f } from "./fields";
import { localize, localizeProps } from "./localize";
import { pickLocale, localeChain, isLocaleMap } from "./localized";
import { introBlock, testRegistry } from "../../render/_fixtures";

describe("pickLocale", () => {
  it("follows locale → base → fallback → first", () => {
    const v = { en: "Book a table", tr: "Masa ayırtın" };
    expect(pickLocale(v, "tr")).toBe("Masa ayırtın");
    expect(pickLocale(v, "tr-TR")).toBe("Masa ayırtın");
    expect(pickLocale(v, "de")).toBe("Book a table");
    expect(pickLocale({ tr: "Masa", de: "" }, "de", { fallback: [] })).toBe("Masa");
    expect(pickLocale("Plain", "tr")).toBe("Plain");
    expect(localeChain("pt-BR", ["en"])).toEqual(["pt-BR", "pt", "en"]);
  });
  it("tells locale maps from values", () => {
    expect(isLocaleMap({ en: "a" })).toBe(true);
    expect(isLocaleMap({ type: "doc", content: [] })).toBe(false);
    expect(isLocaleMap(["en"])).toBe(false);
  });
});

describe("localize", () => {
  it("walks nested lists, groups, images and links", () => {
    const schema = z.object({
      title: f.heading(),
      sku: f.text({ localized: false }),
      image: f.image(),
      items: f.list(f.group({ q: f.text(), link: f.link() })),
    });
    const out = localizeProps<Record<string, any>>(
      schema,
      {
        title: { en: "Menu", tr: "Menü" },
        sku: "M-01",
        image: { src: "/a.jpg", width: 4, height: 3, alt: { en: "Terrace", tr: "Teras" } },
        items: [{ q: { en: "Hours?", tr: "Saatler?" }, link: { href: { en: "/en/hours", tr: "/saatler" }, label: { en: "Hours", tr: "Saatler" } } }],
      },
      { locale: "tr" },
    );
    expect(out).toEqual({
      title: "Menü",
      sku: "M-01",
      image: { src: "/a.jpg", width: 4, height: 3, alt: "Teras" },
      items: [{ q: "Saatler?", link: { href: "/saatler", label: "Saatler" } }],
    });
  });

  it("localizes a node via the registry, falling back to en", () => {
    const node = localize(
      { id: "b_intro1", type: "intro", v: 2, props: { title: { en: "Dinner, *slowly*." }, lead: { en: "Seasonal plates.", tr: "Mevsim tabakları." } } },
      testRegistry,
      { locale: "tr", fallback: ["en"] },
    );
    expect(node.props).toEqual({ title: "Dinner, *slowly*.", lead: "Mevsim tabakları." });
    expect(introBlock.type).toBe("intro");
  });
});

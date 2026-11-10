import fc from "fast-check";
import { cmdkFilter, compareText, foldText, highlightParts, highlightText, initials, lowerText, matchText, registerTextRules, slugify, upperText } from "./text";

describe("foldText", () => {
  it("folds Turkish dotted and dotless i under tr", () => {
    for (const s of ["İSTANBUL", "istanbul", "Istanbul", "İstanbul"]) expect(foldText(s, "tr")).toBe("istanbul");
    for (const s of ["IŞIK", "ışık", "isik", "Işık"]) expect(foldText(s, "tr-TR")).toBe("isik");
  });
  it("folds Turkish diacritics", () => {
    expect(foldText("Çağrı Öztürk Şahin Ünal", "tr")).toBe("cagri ozturk sahin unal");
  });
  it("still folds İ to i without a Turkish locale (no length change)", () => {
    expect(foldText("İSTANBUL")).toBe("istanbul");
    expect(foldText("İSTANBUL").length).toBe("İSTANBUL".length);
  });
  it("folds generic diacritics and special letters", () => {
    expect(foldText("Crème Brûlée")).toBe("creme brulee");
    expect(foldText("Øresund Łódź")).toBe("oresund lodz");
  });
  it("preserves length for any input (property)", () => {
    fc.assert(fc.property(fc.string({ unit: "grapheme" }), fc.constantFrom("en", "tr", "de"), (s, l) => foldText(s, l).length === s.length));
  });
});

describe("matchText", () => {
  it("matches Turkish names typed without diacritics", () => {
    expect(matchText("Çağrı Yılmaz", "cagri", "tr")).toBe(true);
    expect(matchText("Çağrı Yılmaz", "yilmaz cag", "tr")).toBe(true);
    expect(matchText("Çağrı Yılmaz", "ahmet", "tr")).toBe(false);
  });
  it("treats an empty query as a match", () => {
    expect(matchText("anything", "   ")).toBe(true);
  });
});

describe("highlightText", () => {
  it("returns ranges valid on the original string", () => {
    const text = "İstanbul Şube";
    const [r] = highlightText(text, "sube", "tr");
    expect(text.slice(r![0], r![1])).toBe("Şube");
  });
  it("does not drift after emoji", () => {
    const text = "🎉 Kampanya İndirim";
    const ranges = highlightText(text, "indirim", "tr");
    expect(ranges).toHaveLength(1);
    expect(text.slice(ranges[0]![0], ranges[0]![1])).toBe("İndirim");
  });
  it("merges overlapping ranges and finds repeats", () => {
    expect(highlightText("banana", "ana")).toEqual([[1, 4]]);
    expect(highlightText("anna banana", "an na")).toEqual([[0, 4], [6, 11]]);
  });
  it("splits into renderable parts", () => {
    expect(highlightParts("Ayşe Kaya", "kay", "tr")).toEqual([
      { text: "Ayşe ", match: false },
      { text: "Kay", match: true },
      { text: "a", match: false },
    ]);
  });
});

describe("cmdkFilter", () => {
  const score = cmdkFilter("tr");
  it("ranks exact > prefix > word start > contains", () => {
    const exact = score("Ayarlar", "ayarlar");
    const prefix = score("Ayarlar sayfası", "ayar");
    const wordStart = score("Genel ayarlar", "ayar");
    const contains = score("Kullanıcı tanımları", "anim");
    expect(exact).toBe(1);
    expect(prefix).toBeGreaterThan(wordStart);
    expect(wordStart).toBeGreaterThan(contains);
    expect(contains).toBeGreaterThan(0);
  });
  it("uses keywords and folding", () => {
    expect(score("Yeni yazı", "post", ["post", "article"])).toBeGreaterThan(0);
    expect(score("İzin talepleri", "izin")).toBe(0.9);
    expect(score("Faturalar", "zzz")).toBe(0);
  });
});

describe("compareText / case", () => {
  it("sorts with the Turkish collator", () => {
    const list = ["Zeynep", "Çiğdem", "Cem", "Ömer", "Osman"];
    expect([...list].sort(compareText("tr"))).toEqual(["Cem", "Çiğdem", "Osman", "Ömer", "Zeynep"]);
  });
  it("sorts numbers naturally", () => {
    expect(["Invoice 10", "Invoice 9", "Invoice 100"].sort(compareText("en"))).toEqual(["Invoice 9", "Invoice 10", "Invoice 100"]);
  });
  it("upper/lowercases with Turkish rules", () => {
    expect(upperText("istanbul", "tr-TR")).toBe("İSTANBUL");
    expect(lowerText("IŞIK", "tr")).toBe("ışık");
    expect(upperText("istanbul", "en")).toBe("ISTANBUL");
  });
});

describe("initials", () => {
  it("uses locale casing", () => {
    expect(initials("ilker şahin", "tr")).toBe("İŞ");
    expect(initials("ilker şahin", "en")).toBe("IŞ");
  });
  it("takes first and last word", () => {
    expect(initials("Ada King Lovelace")).toBe("AL");
    expect(initials("Madonna")).toBe("M");
    expect(initials("ada lovelace", "en", 1)).toBe("A");
    expect(initials("  ")).toBe("");
    expect(initials("hello.world@vamos.ist")).toBe("HW");
  });
});

describe("slugify", () => {
  it("transliterates Turkish", () => {
    expect(slugify("Çağrı Merkezi & Destek", { locale: "tr" })).toBe("cagri-merkezi-ve-destek");
    expect(slugify("İSTANBUL'DA KIŞ", { locale: "tr" })).toBe("istanbulda-kis");
    expect(slugify("Işıklı Ürünler", { locale: "tr-TR" })).toBe("isikli-urunler");
  });
  it("transliterates German", () => {
    expect(slugify("Größe über alles", { locale: "de" })).toBe("groesse-ueber-alles");
  });
  it("handles English and separators", () => {
    expect(slugify("  Hello, World! 2026 ")).toBe("hello-world-2026");
    expect(slugify("Rock & Roll", { separator: "_" })).toBe("rock_and_roll");
    expect(slugify("Crème brûlée")).toBe("creme-brulee");
  });
  it("cuts at a word boundary", () => {
    expect(slugify("The quick brown fox jumps over the lazy dog", { maxLength: 20 })).toBe("the-quick-brown-fox");
  });
  it("only ever emits [a-z0-9-] (property)", () => {
    fc.assert(fc.property(fc.string(), (s) => /^[a-z0-9-]*$/.test(slugify(s, { locale: "tr" }))));
  });
  it("accepts registered locale rules", () => {
    registerTextRules("fr", { and: "et" });
    expect(slugify("Pain & Chocolat", { locale: "fr-FR" })).toBe("pain-et-chocolat");
  });
});

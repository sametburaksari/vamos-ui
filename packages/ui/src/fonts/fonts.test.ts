import { describe, expect, it, beforeEach } from "vitest";
import { fontGroups, getFont, googleFonts, fontStack } from "./catalog";
import { familySpec, googleFontsUrl, loadGoogleFonts, loadFontPreviews } from "./loader";
import { applyFontPairing, clearFontPairing, createFontPairing, fontBootScript, fontPairings, pairingUrl, parseFontPairing, serializeFontPairing } from "./pairings";

describe("catalog", () => {
  it("has 55–60 unique families, all with latin-ext", () => {
    expect(googleFonts.length).toBeGreaterThanOrEqual(55);
    expect(googleFonts.length).toBeLessThanOrEqual(60);
    expect(new Set(googleFonts.map((f) => f.family)).size).toBe(googleFonts.length);
    for (const f of googleFonts) expect(f.subsets, f.family).toContain("latin-ext");
  });

  it("puts every family in a group, max 4 handwriting", () => {
    for (const g of fontGroups) expect(googleFonts.some((f) => f.category === g.category && (g.style == null || f.style === g.style)), g.id).toBe(true);
    expect(googleFonts.filter((f) => f.category === "handwriting").length).toBeLessThanOrEqual(4);
  });

  it("looks up by name or id and builds stacks", () => {
    expect(getFont("instrument serif")?.id).toBe("instrument-serif");
    expect(getFont("dm-mono")?.family).toBe("DM Mono");
    expect(fontStack("Fraunces")).toMatch(/^"Fraunces", ui-serif/);
    expect(fontStack("system-ui, sans-serif")).toBe("system-ui, sans-serif");
  });
});

describe("googleFontsUrl", () => {
  it("encodes variable, italic and optical-size axes", () => {
    expect(familySpec("Onest")).toBe("Onest:wght@100..900");
    expect(familySpec("Figtree")).toBe("Figtree:ital,wght@0,300..900;1,300..900");
    expect(familySpec("Fraunces")).toBe("Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900");
    expect(familySpec("Instrument Serif")).toBe("Instrument+Serif:ital@0;1");
    expect(familySpec("Space Mono")).toBe("Space+Mono:ital,wght@0,400;0,700;1,400;1,700");
    expect(familySpec({ family: "Dela Gothic One" })).toBe("Dela+Gothic+One");
  });

  it("dedupes and appends display and text", () => {
    const url = googleFontsUrl(["Onest", "Onest", { family: "Syne", weights: [700] }], { display: "optional", text: "Ağaç" });
    expect(url).toBe("https://fonts.googleapis.com/css2?family=Onest:wght@100..900&family=Syne:wght@700&display=optional&text=" + encodeURIComponent("Aaçğ"));
  });
});

describe("loadGoogleFonts", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  it("injects one stylesheet + preconnect and skips families already loaded", () => {
    void loadGoogleFonts(["Onest", "Fraunces"]);
    void loadGoogleFonts(["Onest"]);
    void loadGoogleFonts(["Onest", "Geist"]);
    const sheets = document.head.querySelectorAll("link[rel=stylesheet]");
    expect(sheets).toHaveLength(2);
    expect(sheets[1]!.getAttribute("href")).toContain("family=Geist");
    expect(sheets[1]!.getAttribute("href")).not.toContain("Onest");
    expect(document.head.querySelectorAll("link[rel=preconnect]")).toHaveLength(2);
    expect(document.head.querySelector('link[href="https://fonts.gstatic.com"]')).toHaveAttribute("crossorigin", "anonymous");
  });

  it("keeps preview subsets separate from full loads", () => {
    void loadFontPreviews(["Onest", "Unknown Family"]);
    void loadGoogleFonts(["Onest"]);
    const hrefs = [...document.head.querySelectorAll("link[rel=stylesheet]")].map((l) => l.getAttribute("href")!);
    expect(hrefs).toHaveLength(2);
    expect(hrefs[0]).toContain("&text=");
    expect(hrefs[1]).not.toContain("&text=");
  });
});

describe("pairings", () => {
  it("ships 14–16 presets including the four CSS presets", () => {
    expect(fontPairings.length).toBeGreaterThanOrEqual(14);
    expect(fontPairings.length).toBeLessThanOrEqual(16);
    expect(fontPairings.filter((p) => p.css).map((p) => p.id)).toEqual(["editorial", "grotesk", "corporate", "system"]);
    for (const p of fontPairings) {
      if (p.id === "system") continue;
      for (const fam of [p.heading, p.body, p.mono]) expect(getFont(fam), `${p.id}: ${fam}`).toBeDefined();
    }
    expect(pairingUrl(fontPairings.find((p) => p.id === "system")!)).toBeNull();
  });

  it("applies and clears the tokens on an element", () => {
    document.head.innerHTML = "";
    const el = document.createElement("div");
    void applyFontPairing(el, fontPairings.find((p) => p.id === "boutique")!);
    expect(el.dataset.font).toBe("boutique");
    expect(el.style.getPropertyValue("--font-heading")).toMatch(/^"Fraunces"/);
    expect(el.style.getPropertyValue("--display-em")).toBe("italic");
    expect(document.head.querySelector("link[rel=stylesheet]")!.getAttribute("href")).toContain("family=Figtree");
    clearFontPairing(el);
    expect(el.style.getPropertyValue("--font-heading")).toBe("");
  });

  it("derives display tokens for custom pairings and round-trips storage", () => {
    const custom = createFontPairing({ heading: "Barlow Condensed", body: "Manrope", mono: "Fira Code" });
    expect(custom.display.scale).toBeGreaterThan(1);
    const stored = JSON.parse(JSON.stringify(serializeFontPairing(custom)));
    expect(stored.href).toContain("Barlow+Condensed");
    expect(parseFontPairing(stored)).toMatchObject({ id: "custom", heading: "Barlow Condensed", body: "Manrope", mono: "Fira Code" });
    expect(parseFontPairing(serializeFontPairing(fontPairings[4]!))).toBe(fontPairings[4]);
    expect(parseFontPairing("nope")).toBeUndefined();
  });

  it("boot script applies a stored pairing before paint", () => {
    document.head.innerHTML = "";
    const h = document.documentElement;
    localStorage.setItem("vamos-theme", JSON.stringify({ fontPairing: serializeFontPairing(fontPairings.find((p) => p.id === "studio")!) }));
    new Function(fontBootScript())();
    expect(h.dataset.font).toBe("studio");
    expect(h.style.getPropertyValue("--font-heading")).toMatch(/^"Syne"/);
    const link = document.head.querySelector("link[rel=stylesheet]")!;
    expect(link).toHaveAttribute("blocking", "render");
    // The loader recognises what the boot script already requested.
    void loadGoogleFonts(["Syne", "Instrument Sans", "Space Mono"]);
    expect(document.head.querySelectorAll("link[rel=stylesheet]")).toHaveLength(1);
    clearFontPairing(h);
    localStorage.clear();
  });
});

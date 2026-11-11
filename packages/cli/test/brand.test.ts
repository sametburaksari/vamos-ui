import { readFileSync } from "node:fs";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  brandCss,
  checkBrand,
  contrastRatio,
  extractBrandFromHtml,
  generateAccent,
  googleFontsFamilies,
  linkedStylesheets,
  parseColor,
  parseCss,
  readBrandCssVars,
  serializeBrand,
  SURFACES,
  type Brand,
} from "../src/brand";
import { decodePng, dominantColour } from "../src/brand/node/png";
import { pdfText } from "../src/brand/node/sources";

const fixture = (name: string) => readFileSync(path.join(__dirname, "fixtures/brand", name), "utf8");

describe("parseColor", () => {
  it.each([
    ["#fff", 1, 0],
    ["#000000", 0, 0],
    ["rgb(255 0 0)", 0.628, 0.258],
    ["rgba(255, 0, 0, 0.5)", 0.628, 0.258],
    ["hsl(0 100% 50%)", 0.628, 0.258],
    ["oklch(0.64 0.17 245)", 0.64, 0.17],
    ["oklch(64% 0.17 245deg / 50%)", 0.64, 0.17],
    ["rebeccapurple", 0.44, 0.16],
  ])("%s", (input, l, c) => {
    const p = parseColor(input)!;
    expect(p.l).toBeCloseTo(l, 2);
    expect(p.c).toBeCloseTo(c, 2);
  });

  it("rejects things that are not colours", () => {
    for (const s of ["var(--x)", "currentColor", "#ggg", "rgb(1 2)", "lab(50 20 30)", ""]) expect(parseColor(s)).toBeNull();
  });

  it("computes WCAG contrast", () => {
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#767676", "#fff")).toBeCloseTo(4.54, 2);
  });
});

describe("generateAccent", () => {
  const all = [
    "#ffd400", "#ffeb3b", "#fff200", "#0b1f4d", "#000080", "#001233", "#fafaf5", "#ffffff", "#f5f5f5", "#0a0a0a", "#000000", "#111111",
    "#4f46e5", "#e11d48", "#ff0000", "#22c55e", "#00ff00", "#0ea5e9", "#7c3aed", "#f97316", "#14b8a6", "#ec4899", "#808080", "#5b6b2f",
    "oklch(0.64 0.17 245)", "oklch(0.89 0.21 122)", "oklch(0.7 0.19 45)", "oklch(0.66 0.21 10)", "hsl(48 100% 50%)", "rgb(0 128 128)",
  ];

  it.each(all)("%s reaches 4.5:1 for every text use", (colour) => {
    const p = generateAccent(colour);
    expect(contrastRatio(p.fg, p.base)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.inkLight, SURFACES.light.hardest)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.inkLight, SURFACES.light.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.inkDark, SURFACES.dark.hardest)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.inkDark, SURFACES.dark.surface)).toBeGreaterThanOrEqual(4.5);
    if (p.dark) expect(contrastRatio(p.dark.fg, p.dark.base)).toBeGreaterThanOrEqual(4.5);
    // Reported numbers are true (rounded down) and every value parses back.
    expect(p.contrast.fgOnBase).toBeLessThanOrEqual(contrastRatio(p.fg, p.base));
    for (const v of [p.base, p.fg, p.inkLight, p.inkDark]) expect(parseColor(v)).not.toBeNull();
  });

  it("yellow: keeps the fill and puts dark text on it", () => {
    const p = generateAccent("#ffd400");
    expect(p.warnings).toEqual([]);
    expect(p.fg).not.toBe("#fff");
    expect(parseColor(p.fg)!.l).toBeLessThan(0.3);
    expect(parseColor(p.inkLight)!.l).toBeLessThan(parseColor(p.base)!.l - 0.2);
    expect(parseColor(p.inkLight)!.h).toBeCloseTo(parseColor(p.base)!.h, 0);
  });

  it("navy: white text, unchanged ink-light, lighter dark-mode fill", () => {
    const p = generateAccent("#0b1f4d");
    expect(p.fg).toBe("#fff");
    expect(p.inkLight).toBe(p.base);
    expect(p.dark).toBeDefined();
    expect(parseColor(p.dark!.base)!.l).toBeGreaterThan(parseColor(p.base)!.l + 0.15);
    expect(contrastRatio(p.dark!.base, SURFACES.dark.surface)).toBeGreaterThanOrEqual(3);
    expect(p.warnings.join(" ")).toMatch(/Very dark colour/);
  });

  it("white-ish: darkens the fill so buttons stay visible and warns", () => {
    const p = generateAccent("#fafaf5");
    expect(p.warnings.some((w) => /Near-white/.test(w))).toBe(true);
    expect(p.warnings.some((w) => /low chroma/i.test(w))).toBe(true);
    expect(contrastRatio(p.base, SURFACES.light.surface)).toBeGreaterThanOrEqual(1.35);
  });

  it("black-ish: inverts the fill in dark mode like graphite", () => {
    const p = generateAccent("#0a0a0a");
    expect(p.dark).toBeDefined();
    expect(parseColor(p.dark!.base)!.l).toBeGreaterThanOrEqual(0.88);
    expect(p.dark!.fg).not.toBe("#fff");
  });

  it("mid-tones: adjusts the fill lightness and reports the change", () => {
    // seagreen: neither white nor dark ink reaches 4.5:1 on it.
    const p = generateAccent("#2e8b57");
    const note = p.warnings.find((w) => /^Fill lightness/.test(w));
    expect(note).toMatch(/reaches 4\.5:1 \(best was [\d.]+:1\)/);
    expect(p.contrast.fgOnBase).toBeGreaterThanOrEqual(4.5);
  });

  it("uses an explicit dark-mode fill", () => {
    const p = generateAccent("#4f46e5", { dark: "#818cf8" });
    expect(p.dark!.base).toBe(generateAccent("#818cf8").base);
    expect(p.contrast.darkFgOnBase).toBeGreaterThanOrEqual(4.5);
  });

  it("throws on invalid input", () => {
    expect(() => generateAccent("not-a-colour")).toThrow(TypeError);
    expect(() => generateAccent("#4f46e5", { dark: "nope" })).toThrow(/accentDark/);
  });
});

const sample: Brand = {
  $schema: "https://ui.vamos.ist/r/brand-schema.json",
  name: "Lumen",
  colors: { accent: "#4f46e5", neutralTint: "#4f46e5" },
  fonts: { display: "Sora", body: "plus jakarta sans", mono: "JetBrains Mono" },
  theme: { radius: "round", density: "compact" },
  voice: { tone: "Plain and confident", rules: ["Lead with the answer."] },
  assets: [{ path: "brand/logo.svg", use: "Logo" }],
};

describe("brandCss", () => {
  it("matches the snapshot", () => {
    expect(brandCss(sample)).toMatchSnapshot();
  });

  it("emits a dark-mode fill for very dark accents and restores it in light sections", () => {
    const css = brandCss({ ...sample, colors: { accent: "#0b1f4d" }, fonts: {}, theme: {} });
    expect(css).toContain('.dark[data-accent="brand"],');
    expect(css).toContain('.dark .light[data-accent="brand"],');
    expect(css).not.toContain('[data-font="brand"]');
    const vars = readBrandCssVars(css);
    expect(Object.keys(vars.light)).toEqual(["--accent-base", "--accent-fg", "--accent-ink-light", "--accent-ink-dark"]);
    expect(Object.keys(vars.dark)).toEqual(["--accent-base", "--accent-fg"]);
  });

  it("is deterministic", () => {
    expect(brandCss(sample)).toBe(brandCss(JSON.parse(serializeBrand(sample))));
  });
});

describe("checkBrand", () => {
  it("passes a complete brand", () => {
    expect(checkBrand(sample).filter((i) => i.severity !== "info")).toEqual([]);
  });

  it("reports structural errors", () => {
    const issues = checkBrand({ colors: { accent: "blurple" }, theme: { material: "paper" }, fonts: { mono: 3 }, extra: 1 });
    const errors = issues.filter((i) => i.severity === "error").map((i) => i.path);
    expect(errors).toEqual(expect.arrayContaining(["name", "colors.accent", "theme.material", "fonts.mono"]));
    expect(issues.find((i) => i.path === "extra")?.severity).toBe("warning");
  });

  it("flags fonts that do not fit their role and colour adjustments", () => {
    const issues = checkBrand({ name: "X", colors: { accent: "#fafaf5" }, fonts: { body: "Caveat", mono: "Onest", display: "Not A Real Font" } });
    const msg = issues.map((i) => `${i.severity}:${i.path}`);
    expect(msg).toEqual(expect.arrayContaining(["warning:fonts.body", "warning:fonts.mono", "warning:fonts.display", "warning:colors.accent"]));
  });

  it("warns when the accent looks like the danger colour", () => {
    expect(checkBrand({ name: "X", colors: { accent: "#d3303c" } }).some((i) => /danger colour/.test(i.message))).toBe(true);
  });
});

describe("CSS helpers", () => {
  it("parses nested rules, media contexts and imports", () => {
    const { rules, imports } = parseCss(`@import url("https://fonts.googleapis.com/css2?family=Lato");
      .card { color: red; &:hover { color: blue } .title { font-family: "Sora" } }
      @media (prefers-color-scheme: dark) { :root { --primary: #fff; } }`);
    expect(imports).toEqual(["https://fonts.googleapis.com/css2?family=Lato"]);
    expect(rules.map((r) => r.selector)).toEqual([".card:hover", ".card .title", ".card", ":root"]);
    expect(rules[3]!.context).toEqual(["@media (prefers-color-scheme: dark)"]);
  });

  it("reads Google Fonts families from css and css2 URLs", () => {
    expect(googleFontsFamilies("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700&family=Sora&display=swap")).toEqual(["Plus Jakarta Sans", "Sora"]);
    expect(googleFontsFamilies("https://fonts.googleapis.com/css?family=Lato:400,700|Open+Sans")).toEqual(["Lato", "Open Sans"]);
  });

  it("lists linked stylesheets as absolute URLs", () => {
    expect(linkedStylesheets(fixture("saas.html"), "https://lumen.example/pricing")).toEqual([
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Sora:wght@600;700&display=swap",
      "https://lumen.example/assets/app.4f2c1.css",
      "https://cdn.other-vendor.io/widget.css",
    ]);
  });
});

describe("extractBrandFromHtml", () => {
  it("SaaS landing page: theme-color, CSS variables, Google Fonts, og tags", () => {
    const r = extractBrandFromHtml(fixture("saas.html"), [{ css: fixture("saas.css"), source: "app.css" }], "https://lumen.example/pricing");
    expect(r.brand.name).toBe("Lumen");
    expect(r.brand.colors).toEqual({ accent: "#4f46e5", accentDark: "#818cf8" });
    expect(r.brand.fonts).toEqual({ display: "Sora", body: "Plus Jakarta Sans", mono: "JetBrains Mono" });
    expect(r.brand.voice?.examples?.[0]?.do).toBe("Answers, not dashboards.");
    expect(r.brand.assets?.find((a) => a.use.startsWith("Logo"))?.path).toBe("https://lumen.example/img/lumen-logo.svg");
    const why = r.evidence.filter((e) => e.field === "colors.accent").map((e) => e.reason);
    expect(why[0]).toBe('<meta name="theme-color">');
    expect(why).toContain("--color-primary in app.css");
    expect(r.colours[0]!.hex).toBe("#4f46e5");
  });

  it("Shop theme: most-used non-neutral colour on buttons, @import fonts, sharp corners", () => {
    const r = extractBrandFromHtml(fixture("shop.html"), [fixture("shop.css")], "https://zeytinvekekik.com.tr/");
    expect(r.brand.name).toBe("Zeytin & Kekik");
    expect(r.brand.colors?.accent).toBe("#5b6b2f");
    expect(r.brand.fonts).toEqual({ display: "Playfair Display", body: "Lato" });
    expect(r.brand.theme).toEqual({ radius: "sharp" });
    // Neutrals (#2b2b2b text, #fbf8f1 background) are never accent candidates.
    expect(r.colours.map((c) => c.hex)).not.toContain("#2b2b2b");
    expect(r.evidence.some((e) => e.field === "fonts.body" && /not in the kit font catalog/.test(e.reason))).toBe(true);
  });

  it("Next.js app: HSL channel variables, next/font names, inline SVG logo, dark mode", () => {
    const r = extractBrandFromHtml(fixture("nextapp.html"), [{ css: fixture("nextapp.css"), source: "2c4b1e.css" }], "https://tidewater.app/");
    expect(r.brand.name).toBe("Tidewater");
    expect(r.brand.fonts?.body).toBe("Inter");
    expect(r.brand.fonts?.mono).toBeUndefined(); // ui-monospace/SFMono are system fonts
    expect(r.brand.theme?.dark).toBe(true);
    const accent = parseColor(r.brand.colors!.accent!)!;
    expect(accent.h).toBeGreaterThan(200);
    expect(accent.h).toBeLessThan(230);
    expect(r.brand.colors?.accentDark).toBeDefined();
    const why = r.evidence.filter((e) => e.field === "colors.accent").map((e) => e.reason);
    expect(why).toEqual(expect.arrayContaining(['<link rel="mask-icon" color>', "--primary in 2c4b1e.css", "fill in inline SVG logo"]));
  });

  it("keeps the brand's own logos and leaves out client and product logos", () => {
    const html = `<html><head><title>Web Tasarım | Vamos Dijital Ofis</title></head><body>
      <header><img src="/logo.png" alt="Vamos Dijital Ofis"><nav><img src="/logos/projeler/vtag-logo.png" alt=""></nav></header>
      <h1><span class="a">Web Tasarım</span><br/>için Vamos<span class="b">.</span></h1>
      <section><img src="/logos/referanslar/allianz-logo.svg" alt="Allianz"><img src="/logos/referanslar/igdas-logo.svg" alt="İGDAŞ"></section>
      <footer><img src="/logo-white.png" alt="Vamos"></footer></body></html>`;
    const r = extractBrandFromHtml(html, [], "https://vamos.ist/");
    const logos = (r.brand.assets ?? []).filter((a) => a.use.startsWith("Logo")).map((a) => a.path);
    expect(logos).toEqual(["https://vamos.ist/logo.png", "https://vamos.ist/logo-white.png"]);
    expect(r.brand.voice?.examples?.[0]?.do).toBe("Web Tasarım için Vamos.");
  });

  it("falls back to one unconfirmed header logo when none names the brand", () => {
    const html = `<html><body><header><img class="site-logo" src="/img/header-mark.svg" alt="Home"></header>
      <img class="client-logo" src="/c/nike.svg" alt="Nike"></body></html>`;
    const r = extractBrandFromHtml(html, [], "https://northpoint.example/");
    const logos = (r.brand.assets ?? []).filter((a) => a.use.startsWith("Logo"));
    expect(logos.map((a) => a.path)).toEqual(["https://northpoint.example/img/header-mark.svg"]);
    expect(logos[0]!.use).toMatch(/not confirmed/);
  });

  it("returns an empty draft for a page without brand signals", () => {
    const r = extractBrandFromHtml("<html><body><p style='color:#333'>hi</p></body></html>");
    expect(r.brand.colors).toBeUndefined();
    expect(r.colours).toEqual([]);
  });
});

/** Minimal PNG encoder for tests (RGBA 8-bit, filter 0, or palette). */
function png(width: number, height: number, pixel: (x: number, y: number) => [number, number, number, number]): Buffer {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf: Buffer) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff]! ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = y % 2 ? 2 : 0; // alternate None/Up filters (Up with zero deltas on odd rows is wrong, so encode properly)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixel(x, y);
      const o = y * (width * 4 + 1) + 1 + x * 4;
      if (y % 2) {
        const [pr, pg, pb, pa] = pixel(x, y - 1);
        raw[o] = (r - pr) & 0xff;
        raw[o + 1] = (g - pg) & 0xff;
        raw[o + 2] = (b - pb) & 0xff;
        raw[o + 3] = (a - pa) & 0xff;
      } else {
        raw[o] = r;
        raw[o + 1] = g;
        raw[o + 2] = b;
        raw[o + 3] = a;
      }
    }
  }
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

describe("PNG decoder", () => {
  it("decodes RGBA with filters and finds the dominant logo colour", () => {
    // Transparent background, a white margin, a big indigo mark and a small orange dot.
    const file = png(40, 30, (x, y) => {
      if (x < 4) return [0, 0, 0, 0];
      if (x < 8) return [255, 255, 255, 255];
      if (x > 34 && y < 5) return [249, 115, 22, 255];
      return [79, 70, 229, 255];
    });
    const img = decodePng(file);
    expect(img.width).toBe(40);
    expect([...img.data.subarray((3 * 40 + 20) * 4, (3 * 40 + 20) * 4 + 4)]).toEqual([79, 70, 229, 255]);
    const dom = dominantColour(img)!;
    expect(dom.hex).toBe("#4f46e5");
    expect(dom.neutral).toBe(false);
  });

  it("rejects non-PNG data", () => {
    expect(() => decodePng(Buffer.from("GIF89a"))).toThrow(/Not a PNG/);
  });
});

describe("pdfText", () => {
  it("reads text operators from compressed content streams", () => {
    const content = "BT /F1 12 Tf 72 720 Td (Primary colour: #0E7490) Tj T* [(Head)-20(ings: Fraunces)] TJ ET";
    const stream = deflateSync(Buffer.from(content, "latin1"));
    const pdf = Buffer.concat([Buffer.from("%PDF-1.4\n1 0 obj << /Length " + stream.length + " /Filter /FlateDecode >>\nstream\n", "latin1"), stream, Buffer.from("\nendstream\nendobj\n%%EOF", "latin1")]);
    const text = pdfText(pdf);
    expect(text).toContain("Primary colour: #0E7490");
    expect(text).toContain("Headings: Fraunces");
  });
});

describe("BRAND_JSON_SCHEMA", () => {
  it("covers every key the serializer writes", async () => {
    const { BRAND_JSON_SCHEMA } = await import("../src/brand");
    const written = JSON.parse(serializeBrand({ ...sample, source: { url: "https://x.test", importedAt: "2026-11-10" } }));
    for (const key of Object.keys(written)) expect(Object.keys(BRAND_JSON_SCHEMA.properties)).toContain(key);
    for (const key of Object.keys(written.colors)) expect(Object.keys(BRAND_JSON_SCHEMA.properties.colors.properties)).toContain(key);
  });
});

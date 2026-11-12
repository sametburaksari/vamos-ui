import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { run } from "../src/cli";
import { fixClassList, fixSource, type FixOptions } from "../src/brand";
import { verifySource } from "../src/verify";

const FIX = path.join(__dirname, "fixtures/update");
const ACCENT = { accent: "#4f46e5" };

describe("fixClassList", () => {
  const fix = (list: string, opts: FixOptions = ACCENT) => fixClassList(list, opts).value;

  it("maps neutral palette classes by role and shade", () => {
    expect(fix("bg-white text-slate-900 border border-zinc-200 p-4")).toBe("bg-surface text-fg border border-line p-4");
    expect(fix("text-gray-600 text-neutral-400 hover:bg-gray-100 bg-stone-50")).toBe("text-fg-muted text-fg-subtle hover:bg-hover bg-surface-2");
    expect(fix("divide-y divide-gray-200 placeholder-gray-400 border-gray-300")).toBe("divide-y divide-line placeholder-fg-subtle border-field-border");
  });

  it("maps the accent family (from the brand hue) and keeps variants, opacity and !important", () => {
    expect(fix("bg-indigo-600 hover:bg-indigo-700 text-white")).toBe("bg-accent hover:bg-accent/90 text-accent-fg");
    expect(fix("md:!bg-indigo-500/50 text-indigo-700 focus:ring-indigo-500")).toBe("md:!bg-accent/50 text-accent-ink focus:ring-ring");
    // A different brand hue: blue is no longer the accent, it is info.
    expect(fix("bg-blue-600 text-blue-700", { accent: "#16a34a" })).toBe("bg-info text-info");
    expect(fix("bg-green-600", { accent: "#16a34a" })).toBe("bg-accent");
    // Neutral text on the accent fill becomes accent-fg (text-fg would fail contrast on a dark brand colour).
    expect(fix("bg-indigo-600 text-gray-900 hover:text-gray-700")).toBe("bg-accent text-accent-fg hover:text-fg-muted");
    expect(fix("bg-indigo-600/10 text-gray-900")).toBe("bg-accent/10 text-fg");
  });

  it("maps status families and leaves unrelated hues alone", () => {
    expect(fix("bg-red-50 text-red-700 border-red-200")).toBe("bg-danger/10 text-danger border-danger/40");
    expect(fix("bg-red-600 text-white")).toBe("bg-danger-solid text-white");
    expect(fix("bg-amber-100 text-emerald-600")).toBe("bg-warning/10 text-success");
    expect(fix("text-pink-500 from-purple-500 bg-gray-800")).toBe("text-pink-500 from-purple-500 bg-gray-800");
  });

  it("removes dark: variants that mirror a token, keeps the rest", () => {
    expect(fix("bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100")).toBe("bg-surface text-fg");
    expect(fix("bg-surface dark:bg-surface-2")).toBe("bg-surface");
    expect(fix("bg-purple-100 dark:bg-purple-900")).toBe("bg-purple-100 dark:bg-purple-900");
    expect(fix("hover:bg-gray-100 dark:hover:bg-gray-800")).toBe("hover:bg-hover");
  });

  it("maps arbitrary colours and hard-coded fonts", () => {
    expect(fix("bg-[#4f46e5] border-[#e5e7eb]")).toBe("bg-accent border-line");
    expect(fix("text-[#111827] text-[#64748b]")).toBe("text-fg text-fg-muted");
    expect(fix("bg-[#4f46e5] text-[#111827]")).toBe("bg-accent text-accent-fg");
    expect(fix("text-[#ff00aa] bg-[rgb(10_20_30)]")).toBe("text-[#ff00aa] bg-[rgb(10_20_30)]");
    expect(fix("font-['Inter'] font-[Playfair_Display] font-['JetBrains_Mono'] font-[var(--font-x)]")).toBe("font-sans font-display font-mono font-[var(--font-x)]");
    expect(fix("font-['Brandface']", { accent: "#4f46e5", fonts: { display: "Brandface" } })).toBe("font-display");
  });

  it("leaves non-colour classes and dynamic parts untouched", () => {
    expect(fix("text-sm font-semibold rounded-xl ${tone} text-gray-500")).toBe("text-sm font-semibold rounded-xl ${tone} text-fg-muted");
  });
});

describe("fixSource", () => {
  it("fixes a React component and leaves only manual items", () => {
    const code = readFileSync(path.join(FIX, "PricingCard.tsx.txt"), "utf8");
    const { code: out, changes } = fixSource(code, "src/components/PricingCard.tsx", { ...ACCENT, fonts: { display: "Sora" } });
    expect(out).toContain(`"rounded-xl border border-accent bg-accent-soft" : "rounded-xl border border-line bg-surface"`);
    expect(out).toContain(`<h3 className="font-display text-fg">`);
    expect(out).toContain(`className="rounded-lg bg-accent px-4 py-2 text-accent-fg hover:bg-accent/90"`);
    expect(out).toContain(`style={{ color: "var(--fg)", fontFamily: "var(--font-ui)", padding: 4 }}`);
    expect(out).toContain(`<div className="bg-indigo-600 text-pink-500" />`); // vamos-ui-ignore line
    expect(changes.filter((c) => c.kind === "dark-variant").map((c) => c.from)).toEqual(["dark:bg-gray-900", "dark:border-gray-800", "dark:text-white", "dark:text-gray-400"]);
    const left = verifySource(out, "src/components/PricingCard.tsx");
    expect(left.map((i) => i.rule)).toEqual(["raw-color"]); // text-purple-600: no safe token
    expect(fixSource(out, "src/components/PricingCard.tsx", ACCENT).changes).toEqual([]); // idempotent
  });

  it("fixes CSS colours and font stacks by selector", () => {
    const { code: out } = fixSource(readFileSync(path.join(FIX, "site.css"), "utf8"), "src/site.css", ACCENT);
    expect(out).toContain(".hero h1 { font-family: var(--font-heading); color: var(--fg); }");
    expect(out).toContain(".cta { background: var(--accent); color: var(--accent-fg); border: 1px solid var(--line); }");
    expect(out).toContain("code { font-family: var(--font-code); }");
    expect(out).toContain("rgba(0, 0, 0, 0.04)"); // translucent: manual
    expect(out).toContain("--brand-raw: #4f46e5"); // token definitions are fine
    expect(out).toContain("/* marketing overrides */");
  });

  it("fixes HTML class and style attributes", () => {
    const { code: out } = fixSource(readFileSync(path.join(FIX, "landing.html"), "utf8"), "index.html", ACCENT);
    expect(out).toContain(`<body class="bg-surface text-fg">`);
    expect(out).toContain(`<a class="text-accent-ink underline" href="/docs">`);
    expect(out).toContain(`style="color: var(--fg-muted); font-family: var(--font-ui)"`);
  });

  it("skips ignored files, generated brand.css and comments", () => {
    expect(fixSource(`// vamos-ui-ignore-file\nconst a = "bg-white";`, "a.ts").changes).toEqual([]);
    expect(fixSource(`/* vamos-ui brand: X */\n.a { color: #111; }`, "brand.css").changes).toEqual([]);
    expect(fixSource(`/* .a { color: #111; } */`, "a.css").changes).toEqual([]);
    expect(fixSource(`// "bg-white"\nconst x = 1;`, "a.ts").changes).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// CLI: brand init / apply / check / import and update
// ---------------------------------------------------------------------------

let tmp: string;
let project: string;

async function cli(...argv: string[]): Promise<{ code: number; out: string }> {
  let out = "";
  const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array) => {
    out += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  });
  try {
    const code = await run(argv, { cwd: project, interactive: false, env: { ...process.env, CI: "1", NO_COLOR: "1" } });
    return { code, out };
  } finally {
    spy.mockRestore();
  }
}
const read = (rel: string) => readFileSync(path.join(project, rel), "utf8");
const write = (rel: string, text: string | Buffer) => {
  mkdirSync(path.dirname(path.join(project, rel)), { recursive: true });
  writeFileSync(path.join(project, rel), text);
};

beforeAll(() => {
  tmp = mkdtempSync(path.join(tmpdir(), "vamos-brand-"));
  project = path.join(tmp, "app");
  write("package.json", JSON.stringify({ name: "lumen-web", dependencies: { next: "16.0.0", react: "19.2.0" }, devDependencies: { tailwindcss: "^4.1.0" } }));
  write("vamos.json", JSON.stringify({ registry: "https://ui.vamos.ist/r", uiDir: "src/components/vamos", blocksDir: "src/components/blocks", css: "src/app/globals.css", importAlias: "@/components/vamos", tsx: true, theme: { accent: "ocean" } }));
  write("src/app/globals.css", `@import "tailwindcss";\n@import "../components/vamos/styles.css";\n\nbody { margin: 0; }\n`);
  write("src/components/vamos/styles.css", `/* kit */\n.x { color: #123456; }\n`);
});

afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("vamos-ui brand", () => {
  it("brand init needs an accent when not interactive", async () => {
    const { code } = await cli("brand", "init");
    expect(code).toBe(1);
    expect(existsSync(path.join(project, "vamos.brand.json"))).toBe(false);
  });

  it("brand init writes vamos.brand.json from flags", async () => {
    const { code, out } = await cli("brand", "init", "--accent", "#4f46e5", "--display", "sora", "--body", "Plus Jakarta Sans", "--radius", "round", "--tone", "Plain and confident", "--yes");
    expect(code).toBe(0);
    const brand = JSON.parse(read("vamos.brand.json"));
    expect(brand).toMatchObject({ name: "lumen-web", colors: { accent: "#4f46e5" }, fonts: { display: "Sora", body: "Plus Jakarta Sans" }, theme: { radius: "round" }, voice: { tone: "Plain and confident" } });
    expect(out).toMatch(/Fill\s+\[Button\]/);
    expect(out).toContain("Created src/components/vamos/brand.css"); // --yes also applies
  });

  it("brand apply is idempotent and wires CSS + vamos.json", async () => {
    const { code, out } = await cli("brand", "apply");
    expect(code).toBe(0);
    expect(out).toContain("brand.css is up to date");
    const css = read("src/app/globals.css");
    expect(css).toBe(`@import "tailwindcss";\n@import "../components/vamos/styles.css";\n@import "../components/vamos/brand.css";\n\nbody { margin: 0; }\n`);
    // Corners from brand.theme.radius become the data-radius axis, not CSS in brand.css.
    expect(JSON.parse(read("vamos.json")).theme).toEqual({ accent: "brand", font: "brand", radius: "round" });
    expect(read("src/components/vamos/brand.css")).toContain('[data-accent="brand"] {');
    expect(read("src/components/vamos/brand.css")).not.toContain("--radius");
    expect(out).toContain('import { Sora, Plus_Jakarta_Sans } from "next/font/google";');
    expect(out).toContain('data-accent="brand"');
    expect(out).toContain('data-radius="round"');
  });

  it("brand apply --dry-run writes nothing", async () => {
    write("vamos.brand.json", read("vamos.brand.json").replace("#4f46e5", "#0e7490"));
    const before = read("src/components/vamos/brand.css");
    const { code, out } = await cli("brand", "apply", "--dry-run");
    expect(code).toBe(0);
    expect(out).toContain("Dry run");
    expect(out).toMatch(/^-.*--accent-base/m);
    expect(read("src/components/vamos/brand.css")).toBe(before);
  });

  it("brand check reports a stale brand.css and hand-edited contrast failures", async () => {
    let r = await cli("brand", "check");
    expect(r.code).toBe(0);
    expect(r.out).toContain("does not match vamos.brand.json");
    await cli("brand", "apply");
    r = await cli("brand", "check", "--json");
    expect(JSON.parse(r.out)).toMatchObject({ ok: true, errors: 0 });
    write("src/components/vamos/brand.css", read("src/components/vamos/brand.css").replace(/--accent-fg: [^;]+;/, "--accent-fg: #7dd3fc;"));
    r = await cli("brand", "check");
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/--accent-fg on --accent-base is [\d.]+:1; text needs 4\.5:1/);
  });

  it("brand check warns when the root layout does not select the brand", async () => {
    await cli("brand", "apply");
    write("src/app/layout.tsx", `export default function L({ children }) {\n  return <html lang="en" data-accent="ocean"><body>{children}</body></html>;\n}\n`);
    let r = await cli("brand", "check", "--json");
    const issues = JSON.parse(r.out).issues as { severity: string; path: string; message: string }[];
    expect(issues).toEqual(expect.arrayContaining([expect.objectContaining({ severity: "warning", path: "src/app/layout.tsx", message: expect.stringContaining('data-accent="ocean"') })]));
    write("src/app/layout.tsx", `export default function L({ children }) {\n  return <html lang="en" className={\`\${a.variable} \${b.variable}\`} data-accent="brand" data-font="brand"><body>{children}</body></html>;\n}\n`);
    r = await cli("brand", "check", "--json");
    expect((JSON.parse(r.out).issues as { path: string }[]).filter((i) => i.path === "src/app/layout.tsx")).toEqual([]);
    rmSync(path.join(project, "src/app/layout.tsx"));
  });

  it("brand import reads a folder of brand files and accepts with --yes", async () => {
    write("brand-kit/logo.svg", `<svg xmlns="http://www.w3.org/2000/svg"><path fill="#C2410C" d="M0 0h10v10z"/><path fill="#fff" d="M2 2h2v2z"/></svg>`);
    write(
      "brand-kit/guidelines.md",
      `# Kiln Coffee Brand Guidelines\n\n## Colour\nPrimary: #C2410C (Ember)\nSecondary: #1C1917\n\n## Type\nHeadings: Fraunces\nBody text: Figtree\n\n## Voice\nWarm, plain-spoken, never salesy.\n- Use short sentences.\n- Say "we", not "the company".\n\nDo: Fresh beans every Monday.\nDon't: Experience our revolutionary coffee solutions!\n`,
    );
    const pngBytes = pngOf(8, 8, [194, 65, 12, 255]);
    write("brand-kit/logo-mark.png", pngBytes);
    rmSync(path.join(project, "vamos.brand.json"));
    const preview = await cli("brand", "import", "brand-kit");
    expect(preview.code).toBe(0);
    expect(preview.out).toContain("Re-run with --yes");
    expect(existsSync(path.join(project, "vamos.brand.json"))).toBe(false);

    const { code } = await cli("brand", "import", "brand-kit", "--yes");
    expect(code).toBe(0);
    const brand = JSON.parse(read("vamos.brand.json"));
    expect(brand.name).toBe("Kiln Coffee");
    expect(brand.colors.accent).toBe("#c2410c");
    expect(brand.fonts).toEqual({ display: "Fraunces", body: "Figtree" });
    expect(brand.voice.tone).toBe("Warm, plain-spoken, never salesy.");
    expect(brand.voice.rules).toEqual(["Use short sentences.", 'Say "we", not "the company".']);
    expect(brand.voice.examples).toEqual([{ do: "Fresh beans every Monday.", dont: "Experience our revolutionary coffee solutions!" }]);
    expect(brand.assets.map((a: { path: string }) => a.path)).toEqual(["brand-kit/guidelines.md", "brand-kit/logo-mark.png", "brand-kit/logo.svg"]);
  });
});

describe("vamos-ui update", () => {
  beforeAll(() => {
    copyFileSync(path.join(FIX, "PricingCard.tsx.txt"), path.join(project, "src/components/PricingCard.tsx"));
    copyFileSync(path.join(FIX, "site.css"), path.join(project, "src/site.css"));
    write("vamos.brand.json", JSON.stringify({ name: "Lumen", colors: { accent: "#4f46e5" }, fonts: { display: "Sora" } }));
  });

  it("without --fix reports and writes nothing", async () => {
    const before = read("src/components/PricingCard.tsx");
    const { code, out } = await cli("update");
    expect(code).toBe(1); // errors remain until fixed
    expect(out).toMatch(/Can fix \d+ issues in 2 files/);
    expect(out).toContain("brand.css is out of date");
    expect(out).toContain("update --fix");
    expect(read("src/components/PricingCard.tsx")).toBe(before);
  });

  it("--dry-run shows a diff and writes nothing", async () => {
    const before = read("src/site.css");
    const { out } = await cli("update", "--fix", "--dry-run");
    expect(out).toMatch(/^-\.cta \{ background: #4f46e5;/m);
    expect(out).toMatch(/^\+\.cta \{ background: var\(--accent\);/m);
    expect(read("src/site.css")).toBe(before);
  });

  it("--fix applies the fixes, regenerates brand.css and lists manual items", async () => {
    const { code, out } = await cli("update", "--fix");
    expect(out).toContain("Regenerated src/components/vamos/brand.css");
    expect(out).toMatch(/Fixed \d+ issues in 2 files/);
    expect(out).toMatch(/bg-white\s+→ bg-surface/);
    expect(out).toContain('text-purple-600');
    expect(code).toBe(1); // text-purple-600 is still an error
    expect(read("src/components/PricingCard.tsx")).toContain('"rounded-xl border border-line bg-surface"');
    expect(read("src/components/vamos/styles.css")).toContain("#123456"); // kit folder untouched
    expect(read("src/components/vamos/brand.css")).toContain("source #4f46e5");
  });

  it("is idempotent and exits 0 once the manual item is resolved", async () => {
    write("src/components/PricingCard.tsx", read("src/components/PricingCard.tsx").replace("text-purple-600", "text-accent-ink"));
    const { code, out } = await cli("update", "--fix", "--json");
    const report = JSON.parse(out);
    expect(report.changed).toEqual([]);
    expect(report.errors).toBe(0);
    expect(code).toBe(0);
  });

  it("upgrade still works under its own name", async () => {
    const { out } = await cli("--help");
    expect(out).toContain("upgrade [names...]");
    expect(out).toContain("update [paths...]");
  });
});

/** A solid-colour RGBA PNG. */
function pngOf(w: number, h: number, rgba: [number, number, number, number]): Buffer {
  const table = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (b: Buffer) => {
    let c = 0xffffffff;
    for (const x of b) c = table[(c ^ x) & 0xff]! ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (t: string, d: Buffer) => {
    const body = Buffer.concat([Buffer.from(t), d]);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(d.length);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) Buffer.from(rgba).copy(raw, y * (w * 4 + 1) + 1 + x * 4);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

describe("vamos-ui brand import <url>", () => {
  it("fetches the page and same-site stylesheets, skips other domains, downloads the logo", async () => {
    const http = await import("node:http");
    const fixtures = path.join(__dirname, "fixtures/brand");
    const logo = `<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#4f46e5" width="10" height="10"/></svg>`;
    const server = http.createServer((req, res) => {
      if (req.url === "/pricing") res.writeHead(200, { "content-type": "text/html" }).end(readFileSync(path.join(fixtures, "saas.html")));
      else if (req.url === "/assets/app.4f2c1.css") res.writeHead(200, { "content-type": "text/css" }).end(readFileSync(path.join(fixtures, "saas.css")));
      else if (req.url === "/img/lumen-logo.svg") res.writeHead(200, { "content-type": "image/svg+xml" }).end(logo);
      else res.writeHead(404).end();
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const port = (server.address() as { port: number }).port;
    try {
      rmSync(path.join(project, "vamos.brand.json"), { force: true });
      const { code, out } = await cli("brand", "import", `http://127.0.0.1:${port}/pricing`, "--yes", "--json");
      expect(code).toBe(0);
      const res = JSON.parse(out);
      expect(res.written).toBe(true);
      expect(res.log.read).toEqual([`http://127.0.0.1:${port}/pricing`, `http://127.0.0.1:${port}/assets/app.4f2c1.css`, `http://127.0.0.1:${port}/img/lumen-logo.svg`]);
      expect(res.log.skipped).toEqual([{ what: "https://cdn.other-vendor.io/widget.css", why: "other domain" }]);
      const brand = JSON.parse(read("vamos.brand.json"));
      expect(brand).toMatchObject({ name: "Lumen", colors: { accent: "#4f46e5", accentDark: "#818cf8" }, fonts: { display: "Sora", body: "Plus Jakarta Sans", mono: "JetBrains Mono" } });
      expect(brand.source.url).toBe(`http://127.0.0.1:${port}/pricing`);
      expect(brand.assets.find((a: { use: string }) => a.use.startsWith("Logo")).path).toBe("brand/lumen-logo.svg");
      expect(read("brand/lumen-logo.svg")).toBe(logo);
    } finally {
      server.close();
    }
  });

  it("fails cleanly on an unreachable page", async () => {
    const { code, out } = await cli("brand", "import", "http://127.0.0.1:9/", "--json");
    expect(code).toBe(1);
    expect(JSON.parse(out).error).toBeTruthy();
  });
});

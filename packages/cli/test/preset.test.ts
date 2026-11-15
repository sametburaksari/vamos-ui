import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { run } from "../src/cli";
import {
  decodePreset,
  describePreset,
  encodePreset,
  isPresetCode,
  normalizeHex,
  normalizePreset,
  presetAttributes,
  presetNeedsBrand,
  PresetError,
  PRESET_AXES,
  PRESET_DEFAULTS,
  PRESET_FAMILIES,
  getPresetFamily,
  tryDecodePreset,
  type Preset,
} from "../src/preset";
import { writeFixtureRegistry } from "./fixtures/registry";
import { fontPairings } from "../../ui/src/fonts/pairings";

describe("preset codec", () => {
  it("encodes the documented examples", () => {
    expect(encodePreset({ theme: "dark", material: "glass", accent: "ocean", density: "compact", font: "grotesk" })).toBe("v1dgokg");
    expect(encodePreset({ accent: "#4F46E5", font: "editorial" })).toBe("v1lsx4f46e5ce");
    expect(encodePreset({ theme: "dark", material: "glass", accent: "rose", density: "compact", font: "grotesk", radius: "sharp" })).toBe("v1dgrkgs");
    expect(encodePreset({})).toBe("v1lslcs"); // all defaults: light solid lime comfortable system
  });

  it("round-trips every combination of named values", () => {
    const seen = new Set<string>();
    for (const theme of PRESET_AXES.theme)
      for (const material of PRESET_AXES.material)
        for (const accent of PRESET_AXES.accent)
          for (const density of PRESET_AXES.density)
            for (const font of PRESET_AXES.font)
              for (const radius of PRESET_AXES.radius)
                for (const scene of PRESET_AXES.scene) {
                  const preset: Preset = { theme, material, accent, density, font, radius, scene };
                  const code = encodePreset(preset);
                  expect(decodePreset(code)).toEqual(preset);
                  seen.add(code);
                }
    // every combination has its own code
    expect(seen.size).toBe(2 * 2 * 5 * 3 * 24 * 5 * 4);
  });

  it("decodes every code an older vamos-ui wrote to the same preset (v1 only gained letters)", () => {
    // Every code the previous axes (4 fonts, 2 densities, 3 corners, no scene) could produce.
    const OLD = { density: ["comfortable", "compact"], font: ["system", "editorial", "grotesk", "corporate"], radius: ["default", "sharp", "round"] } as const;
    const L = { theme: { light: "l", dark: "d" }, material: { solid: "s", glass: "g" }, accent: { lime: "l", ocean: "o", ember: "e", rose: "r", graphite: "g" }, density: { comfortable: "c", compact: "k" }, font: { system: "s", editorial: "e", grotesk: "g", corporate: "c" }, radius: { default: "", sharp: "s", round: "r" } } as const;
    let n = 0;
    for (const theme of PRESET_AXES.theme)
      for (const material of PRESET_AXES.material)
        for (const accent of [...PRESET_AXES.accent, "#4f46e5"] as const)
          for (const density of OLD.density)
            for (const font of OLD.font)
              for (const radius of OLD.radius) {
                const a = accent.startsWith("#") ? "x" + accent.slice(1) : L.accent[accent as keyof typeof L.accent];
                const old = `v1${L.theme[theme]}${L.material[material]}${a}${L.density[density]}${L.font[font]}${L.radius[radius]}`;
                const preset = { theme, material, accent, density, font, radius, scene: "neutral" };
                expect(decodePreset(old), old).toEqual(preset);
                expect(encodePreset(preset), old).toBe(old);
                n++;
              }
    expect(n).toBe(2 * 2 * 6 * 2 * 4 * 3);
    // Documented examples from before.
    expect(decodePreset("v1dgokg")).toEqual({ theme: "dark", material: "glass", accent: "ocean", density: "compact", font: "grotesk", radius: "default", scene: "neutral" });
    expect(decodePreset("v1lsokcs")).toMatchObject({ accent: "ocean", density: "compact", font: "corporate", radius: "sharp", scene: "neutral" });
  });

  it("has one font letter per kit pairing, in the same order", () => {
    expect([...PRESET_AXES.font]).toEqual(fontPairings.map((p) => p.id).sort((a, b) => PRESET_AXES.font.indexOf(a as never) - PRESET_AXES.font.indexOf(b as never)));
    expect(new Set(PRESET_AXES.font)).toEqual(new Set(fontPairings.map((p) => p.id)));
  });

  it("writes the radius when a scene follows, and leaves both out at their defaults", () => {
    expect(encodePreset({ scene: "paper" })).toBe("v1lslcsdp");
    expect(encodePreset({ radius: "none", scene: "paper", font: "bookish" })).toBe("v1lslcbnp");
    expect(encodePreset({ radius: "pill" })).toBe("v1lslcsp");
    expect(encodePreset({ density: "spacious", font: "luxe" })).toBe("v1lslpu");
    expect(decodePreset("v1lslcsdp")).toMatchObject({ radius: "default", scene: "paper" });
  });

  it("every style family is a valid code, round-trips and has its own look", () => {
    expect(PRESET_FAMILIES).toHaveLength(13);
    const codes = new Set<string>();
    for (const f of PRESET_FAMILIES) {
      const p = decodePreset(f.code);
      expect(encodePreset(p), f.id).toBe(f.code);
      codes.add(f.code);
      if (f.accent2) expect(normalizeHex(f.accent2), f.id).toBe(f.accent2);
    }
    expect(codes.size).toBe(13);
    // no two families share a font pairing, except where the axis says otherwise
    expect(new Set(PRESET_FAMILIES.map((f) => decodePreset(f.code).font)).size).toBe(13);
    expect(getPresetFamily("Dark Neon")?.id).toBe("neon");
    expect(getPresetFamily("NEWSROOM")?.code).toBe("v1lsx7a1f2bcnsw");
    expect(getPresetFamily("nope")).toBeUndefined();
    expect(getPresetFamily("arabic")).toMatchObject({ dir: "rtl" });
    expect(decodePreset(getPresetFamily("arabic")!.code).font).toBe("naskh");
  });

  it("round-trips custom hex accents (3 and 6 digits, any case)", () => {
    expect(decodePreset(encodePreset({ accent: "#ABC" })).accent).toBe("#aabbcc");
    expect(decodePreset(encodePreset({ accent: "ff8800", radius: "round" }))).toEqual({ ...PRESET_DEFAULTS, accent: "#ff8800", radius: "round" });
    expect(normalizeHex("#12345")).toBeNull();
  });

  it("decodes case-insensitively and ignores separators", () => {
    expect(decodePreset("V1-DG-O-KG")).toEqual(decodePreset("v1dgokg"));
    expect(decodePreset(" v1.dg_okg ")).toEqual(decodePreset("v1dgokg"));
    expect(decodePreset("v1lsX4F46E5ce").accent).toBe("#4f46e5");
  });

  it("rejects bad codes with a message that names the problem", () => {
    expect(() => decodePreset("")).toThrow(PresetError);
    expect(() => decodePreset("dgokg")).toThrow(/start with "v1"/);
    expect(() => decodePreset("v2dgokg")).toThrow(/version "v2"/);
    expect(() => decodePreset("v1dgo")).toThrow(/density letter is missing/);
    expect(() => decodePreset("v1qgokg")).toThrow(/"q" is not a theme letter/);
    expect(() => decodePreset("v1dgzkg")).toThrow(/accent letter/);
    expect(() => decodePreset("v1dgx12kg")).toThrow(/6 hex digits/);
    expect(() => decodePreset("v1dgokgsz")).toThrow(/"z" is not a scene letter/);
    expect(() => decodePreset("v1dgokgsnz")).toThrow(/extra characters/);
    expect(() => decodePreset("v1lsecj")).toThrow(/"j" is not a font letter/);
    expect(tryDecodePreset("nope")).toMatchObject({ ok: false });
    expect(isPresetCode("v1dgokg")).toBe(true);
  });

  it("normalizes and validates partial presets", () => {
    expect(normalizePreset({ theme: "DARK" })).toEqual({ ...PRESET_DEFAULTS, theme: "dark" });
    expect(() => normalizePreset({ accent: "purple" })).toThrow(/Unknown accent/);
    expect(() => normalizePreset({ font: "comic" })).toThrow(/Unknown font/);
  });

  it("describes and maps to <html> attributes", () => {
    const p = decodePreset("v1dgokg");
    expect(describePreset(p)).toBe("dark · glass · ocean · compact · grotesk");
    expect(presetAttributes(p)).toEqual({ class: "dark", "data-material": "glass", "data-accent": "ocean", "data-density": "compact", "data-font": "grotesk" });
    expect(presetAttributes(decodePreset("v1lsx4f46e5ce"))["data-accent"]).toBe("brand");
    expect(describePreset(decodePreset("v1lslcsr"))).toContain("round corners");
    expect(describePreset(decodePreset("v1lslcbnp"))).toBe("light · solid · lime · comfortable · bookish · none corners · paper scene");
    expect(presetAttributes(decodePreset("v1dsx19e3c4kzpi"))).toEqual({ class: "dark", "data-material": "solid", "data-accent": "brand", "data-density": "compact", "data-font": "neon", "data-radius": "pill", "data-scene": "ink" });
  });

  it("maps corners to data-radius, independent of the accent", () => {
    const sharp = decodePreset("v1dgokgs");
    expect(presetAttributes(sharp)).toEqual({ class: "dark", "data-material": "glass", "data-accent": "ocean", "data-density": "compact", "data-font": "grotesk", "data-radius": "sharp" });
    expect(presetNeedsBrand(sharp)).toBe(false);
    expect(presetAttributes(decodePreset("v1lslcsr"))).toMatchObject({ "data-accent": "lime", "data-radius": "round" });
    expect(presetAttributes(decodePreset("v1dgokg"))).not.toHaveProperty("data-radius");
    const custom = decodePreset("v1lsx4f46e5ces");
    expect(presetNeedsBrand(custom)).toBe(true);
    expect(presetAttributes(custom)).toMatchObject({ "data-accent": "brand", "data-radius": "sharp" });
  });
});

// ---------------------------------------------------------------------------
// CLI: init --preset, theme --preset, preset
// ---------------------------------------------------------------------------

let tmp: string;
let registryDir: string;

async function cli(cwd: string, ...argv: string[]): Promise<{ code: number; out: string }> {
  let out = "";
  const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array) => {
    out += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  });
  try {
    const code = await run(argv, { cwd, interactive: false, env: { ...process.env, VAMOS_REGISTRY: registryDir, CI: "1" } });
    return { code, out };
  } finally {
    spy.mockRestore();
  }
}

function makeApp(name: string): string {
  const dir = path.join(tmp, name);
  mkdirSync(path.join(dir, "src/app"), { recursive: true });
  writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name, dependencies: { next: "16.0.0", react: "19.2.0" }, devDependencies: { tailwindcss: "^4.1.0" } }));
  writeFileSync(path.join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }));
  writeFileSync(path.join(dir, "src/app/globals.css"), `@import "tailwindcss";\n`);
  return dir;
}

beforeAll(() => {
  tmp = mkdtempSync(path.join(tmpdir(), "vamos-preset-"));
  registryDir = writeFixtureRegistry(path.join(tmp, "registry"));
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("vamos-ui preset (CLI)", () => {
  it("init --preset saves the axes in vamos.json and preset prints the same code", async () => {
    const app = makeApp("named");
    expect((await cli(app, "init", "--yes", "--no-install", "--preset", "v1dgokg")).code).toBe(0);
    const config = JSON.parse(readFileSync(path.join(app, "vamos.json"), "utf8"));
    expect(config.theme).toEqual({ theme: "dark", material: "glass", accent: "ocean", density: "compact", font: "grotesk" });
    const { code, out } = await cli(app, "preset");
    expect(code).toBe(0);
    expect(out.split("\n")[0]).toBe("v1dgokg");
    const json = JSON.parse((await cli(app, "preset", "--json")).out);
    expect(json.code).toBe("v1dgokg");
  });

  it("a custom accent writes vamos.brand.json + brand.css; corners go to theme.radius and read back", async () => {
    const app = makeApp("custom");
    expect((await cli(app, "init", "--yes", "--no-install", "--preset", "v1lsx4f46e5ces")).code).toBe(0);
    const config = JSON.parse(readFileSync(path.join(app, "vamos.json"), "utf8"));
    expect(config.theme).toMatchObject({ accent: "brand", font: "editorial", theme: "light", radius: "sharp" });
    const brand = JSON.parse(readFileSync(path.join(app, "vamos.brand.json"), "utf8"));
    expect(brand.colors.accent).toBe("#4f46e5");
    expect(brand.theme.radius).toBe("sharp");
    const css = readFileSync(path.join(app, "src/components/vamos/brand.css"), "utf8");
    expect(css).toContain(`[data-accent="brand"]`);
    expect(css).not.toContain("--radius");
    expect(readFileSync(path.join(app, "src/app/globals.css"), "utf8")).toContain("brand.css");
    expect((await cli(app, "preset")).out.split("\n")[0]).toBe("v1lsx4f46e5ces");
  });

  it("theme --preset applies to an existing project; a bad code fails cleanly", async () => {
    const app = makeApp("themed");
    await cli(app, "init", "--yes", "--no-install");
    const res = await cli(app, "theme", "--preset", "v1lsecj", "--json");
    expect(res.code).toBe(1); // "j" is not a font letter
    expect(JSON.parse(res.out).error).toMatch(/not a font letter/);
    const ok = await cli(app, "theme", "--preset", "v1lsekc", "--json");
    expect(ok.code).toBe(0);
    expect(JSON.parse(ok.out)).toMatchObject({ code: "v1lsekc", saved: true, attributes: { "data-accent": "ember", "data-density": "compact", "data-font": "corporate" } });
    expect(JSON.parse(readFileSync(path.join(app, "vamos.json"), "utf8")).theme.accent).toBe("ember");
  });

  it("a named accent with sharp corners needs no brand, also without a project", async () => {
    const app = makeApp("sharp");
    await cli(app, "init", "--yes", "--no-install");
    const res = await cli(app, "theme", "--preset", "v1dgokgs", "--json");
    expect(res.code).toBe(0);
    expect(JSON.parse(res.out)).toMatchObject({ code: "v1dgokgs", saved: true, attributes: { "data-accent": "ocean", "data-radius": "sharp" } });
    expect(JSON.parse(readFileSync(path.join(app, "vamos.json"), "utf8")).theme).toEqual({ theme: "dark", material: "glass", accent: "ocean", density: "compact", font: "grotesk", radius: "sharp" });
    expect(existsSync(path.join(app, "vamos.brand.json"))).toBe(false);
    expect((await cli(app, "preset")).out.split("\n")[0]).toBe("v1dgokgs");

    const bare = makeApp("bare-round");
    const loose = await cli(bare, "theme", "--preset", "v1lslcsr", "--json");
    expect(loose.code).toBe(0);
    expect(JSON.parse(loose.out)).toMatchObject({ saved: false, attributes: { "data-accent": "lime", "data-radius": "round" } });
    expect(existsSync(path.join(bare, "vamos.json"))).toBe(false);
  });

  it("theme --radius sets and clears data-radius", async () => {
    const app = makeApp("radius-flag");
    await cli(app, "init", "--yes", "--no-install");
    const r = await cli(app, "theme", "--radius", "round", "--json");
    expect(JSON.parse(r.out)).toMatchObject({ theme: { radius: "round" }, attributes: { "data-radius": "round" } });
    const d = await cli(app, "theme", "--radius", "default", "--json");
    expect(JSON.parse(d.out).attributes).not.toHaveProperty("data-radius");
    expect(JSON.parse(readFileSync(path.join(app, "vamos.json"), "utf8")).theme).not.toHaveProperty("radius");
  });

  it("theme --family applies a named family: preset, brand accent-2, dir and font loading", async () => {
    const app = makeApp("family");
    await cli(app, "init", "--yes", "--no-install");
    const res = await cli(app, "theme", "--family", "tabloid", "--json");
    expect(res.code).toBe(0);
    const json = JSON.parse(res.out);
    expect(json).toMatchObject({ code: "v1lsxe23b2ektn", family: "tabloid", saved: true, attributes: { "data-font": "tabloid", "data-radius": "none", "data-density": "compact", "data-accent": "brand", "data-motion": "full" } });
    expect(json.fonts).toContain('variable: "--ff-anton"');
    expect(json.fonts).toContain("Work_Sans");
    const brand = JSON.parse(readFileSync(path.join(app, "vamos.brand.json"), "utf8"));
    expect(brand.colors).toMatchObject({ accent: "#e23b2e", accent2: "#f5c400" });
    const css = readFileSync(path.join(app, "src/components/vamos/brand.css"), "utf8");
    expect(css).toMatch(/--accent-2-base: oklch\(/);
    expect(css).toContain("accent2 #f5c400");
    expect(JSON.parse(readFileSync(path.join(app, "vamos.json"), "utf8")).theme).toMatchObject({ font: "tabloid", radius: "none" });

    const rtl = await cli(app, "theme", "--family", "arabic", "--json");
    const r = JSON.parse(rtl.out);
    expect(r.attributes).toMatchObject({ dir: "rtl", "data-font": "naskh", "data-accent": "ocean" });
    expect(r.fonts).toContain('subsets: ["latin", "latin-ext", "arabic"]');

    const bad = await cli(app, "theme", "--family", "baroque", "--json");
    expect(bad.code).toBe(1);
    expect(JSON.parse(bad.out).error).toMatch(/Unknown style family/);

    const list = JSON.parse((await cli(app, "theme", "--families", "--json")).out);
    expect(list.families).toHaveLength(13);
    expect(list.families[0]).toMatchObject({ id: "portal", preset: { font: "portal" } });
  });

  it("theme --scene and --radius pill are stored and cleared like the other axes", async () => {
    const app = makeApp("scene-flag");
    await cli(app, "init", "--yes", "--no-install");
    const r = await cli(app, "theme", "--scene", "paper", "--radius", "pill", "--density", "spacious", "--json");
    expect(JSON.parse(r.out)).toMatchObject({ theme: { scene: "paper", radius: "pill", density: "spacious" }, attributes: { "data-scene": "paper", "data-radius": "pill", "data-density": "spacious" } });
    expect((await cli(app, "preset")).out.split("\n")[0]).toBe("v1lslpspp");
    const n = await cli(app, "theme", "--scene", "neutral", "--json");
    expect(JSON.parse(n.out).attributes).not.toHaveProperty("data-scene");
    expect(JSON.parse(readFileSync(path.join(app, "vamos.json"), "utf8")).theme).not.toHaveProperty("scene");
  });

  it("preset <code> explains a code without writing", async () => {
    const app = makeApp("explain");
    const { code, out } = await cli(app, "preset", "v1dgokg");
    expect(code).toBe(0);
    expect(out).toContain("dark · glass · ocean · compact · grotesk");
    expect(existsSync(path.join(app, "vamos.json"))).toBe(false);
  });
});

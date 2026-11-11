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
  PresetError,
  PRESET_AXES,
  PRESET_DEFAULTS,
  tryDecodePreset,
  type Preset,
} from "../src/preset";
import { writeFixtureRegistry } from "./fixtures/registry";

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
              for (const radius of PRESET_AXES.radius) {
                const preset: Preset = { theme, material, accent, density, font, radius };
                const code = encodePreset(preset);
                expect(decodePreset(code)).toEqual(preset);
                seen.add(code);
              }
    // every combination has its own code
    expect(seen.size).toBe(2 * 2 * 5 * 2 * 4 * 3);
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
    expect(() => decodePreset("v1dgokgsz")).toThrow(/extra characters/);
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

  it("a custom accent and radius write vamos.brand.json + brand.css and read back", async () => {
    const app = makeApp("custom");
    expect((await cli(app, "init", "--yes", "--no-install", "--preset", "v1lsx4f46e5ces")).code).toBe(0);
    const config = JSON.parse(readFileSync(path.join(app, "vamos.json"), "utf8"));
    expect(config.theme).toMatchObject({ accent: "brand", font: "editorial", theme: "light" });
    const brand = JSON.parse(readFileSync(path.join(app, "vamos.brand.json"), "utf8"));
    expect(brand.colors.accent).toBe("#4f46e5");
    expect(brand.theme.radius).toBe("sharp");
    const css = readFileSync(path.join(app, "src/components/vamos/brand.css"), "utf8");
    expect(css).toContain(`[data-accent="brand"]`);
    expect(css).toContain("--radius: 6px");
    expect(readFileSync(path.join(app, "src/app/globals.css"), "utf8")).toContain("brand.css");
    expect((await cli(app, "preset")).out.split("\n")[0]).toBe("v1lsx4f46e5ces");
  });

  it("theme --preset applies to an existing project; a bad code fails cleanly", async () => {
    const app = makeApp("themed");
    await cli(app, "init", "--yes", "--no-install");
    const res = await cli(app, "theme", "--preset", "v1lseck", "--json");
    expect(res.code).toBe(1); // "k" is not a font letter
    expect(JSON.parse(res.out).error).toMatch(/not a font letter/);
    const ok = await cli(app, "theme", "--preset", "v1lsekc", "--json");
    expect(ok.code).toBe(0);
    expect(JSON.parse(ok.out)).toMatchObject({ code: "v1lsekc", saved: true, attributes: { "data-accent": "ember", "data-density": "compact", "data-font": "corporate" } });
    expect(JSON.parse(readFileSync(path.join(app, "vamos.json"), "utf8")).theme.accent).toBe("ember");
  });

  it("preset <code> explains a code without writing", async () => {
    const app = makeApp("explain");
    const { code, out } = await cli(app, "preset", "v1dgokg");
    expect(code).toBe(0);
    expect(out).toContain("dark · glass · ocean · compact · grotesk");
    expect(existsSync(path.join(app, "vamos.json"))).toBe(false);
  });
});

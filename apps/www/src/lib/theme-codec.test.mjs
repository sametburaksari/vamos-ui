// Drift guard: apps/www/src/lib/theme-codec.ts is a copy of CLI code (see its header).
// Compares it with the CLI build. Run from the repo root (build the CLI first: pnpm -C packages/cli build):
//   node --test apps/www/src/lib/theme-codec.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import * as www from "./theme-codec.ts";
import * as cliPreset from "../../../../packages/cli/dist/preset.js";
import * as cliBrand from "../../../../packages/cli/dist/brand.js";

const COLOURS = ["#4f46e5", "#ffffff", "#000000", "#fafafa", "#d4f520", "#0f8a5f", "#d0303c", "#1d4ed8", "#ff6b00", "#777777", "#ffd400", "#0a0a23", "#e11d48", "#14b8a6", "#7c3aed", "#9ca3af"];

function* allPresets() {
  const A = www.PRESET_AXES;
  const accents = [...A.accent, "#4f46e5", "#0a0a23", "#ffd400"];
  for (const theme of A.theme) for (const material of A.material) for (const accent of accents) for (const density of A.density) for (const font of A.font) for (const radius of A.radius)
    yield { theme, material, accent, density, font, radius };
}

test("axes and defaults match", () => {
  assert.deepEqual(www.PRESET_AXES, cliPreset.PRESET_AXES);
  assert.deepEqual({ ...www.PRESET_DEFAULTS }, { ...cliPreset.PRESET_DEFAULTS });
  assert.equal(www.PRESET_VERSION, cliPreset.PRESET_VERSION);
});

test("encode / decode / attributes match for every preset", () => {
  for (const p of allPresets()) {
    const code = www.encodePreset(p);
    assert.equal(code, cliPreset.encodePreset(p));
    assert.deepEqual(www.decodePreset(code), cliPreset.decodePreset(code));
    assert.deepEqual(www.presetAttributes(p), cliPreset.presetAttributes(p));
    assert.equal(www.describePreset(p), cliPreset.describePreset(p));
  }
});

test("decode errors match", () => {
  for (const bad of ["", "v2dgokg", "hello", "v1dz", "v1dgx12", "v1dgokgsq", "v1d"]) {
    const a = www.tryDecodePreset(bad);
    let b;
    try {
      cliPreset.decodePreset(bad);
      b = { ok: true };
    } catch (e) {
      b = { ok: false, error: e.message };
    }
    assert.equal(a.ok, b.ok, bad);
    if (!a.ok) assert.equal(a.error, b.error);
  }
});

test("generateAccent matches", () => {
  for (const c of [...COLOURS, ...Object.values(www.KIT_ACCENT_BASE)]) assert.deepEqual(www.generateAccent(c), cliBrand.generateAccent(c), c);
});

test("brand.css matches brandCss for the preset's brand", () => {
  for (const accent of [...www.PRESET_AXES.accent, ...COLOURS]) {
    for (const radius of www.PRESET_AXES.radius) {
      const p = www.normalizePreset({ accent, radius });
      const css = www.presetBrandCss(p, "my-app");
      if (!cliPreset.presetNeedsBrand(p)) {
        assert.equal(css, null);
        continue;
      }
      const brand = { ...cliBrand.emptyBrand("my-app"), colors: { accent: www.presetAccentSource(p) }, theme: radius === "default" ? {} : { radius } };
      assert.equal(css, cliBrand.brandCss(brand), `${accent} ${radius}`);
    }
  }
});
